/* ==========================================================================
   Richmarc admin API — Cloudflare Pages Function (handles every /api/* path)
   ----------------------------------------------------------------------------
   Storage: one KV namespace bound as RICHMARC_KV.
     users              { [username]: { role, salt, hash, default, created, lastLogin } }
     content            the site content document (seeded from data/content.json)
     backup:<iso time>  previous content versions, kept 30 days
     session:<token>    { user }, expires after 8 hours
     fails:<ip>         failed login count, expires after 5 minutes
     upload:<file>      uploaded image bytes (metadata: content type)

   Roles: "admin" manages users and content, "editor" manages content only.
   First run seeds the test account admin / admin (role admin).
   ========================================================================== */

const SESSION_COOKIE = "rm_admin";
const SESSION_TTL = 8 * 60 * 60;
const PBKDF2_ITERATIONS = 100000; // the Workers runtime maximum
const MAX_UPLOAD = 8 * 1024 * 1024;
const IMAGE_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" };
const ROLES = ["admin", "editor"];
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

/* ---------------------------------------------------------------------------
   Small helpers
   --------------------------------------------------------------------------- */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

const b64encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const b64decode = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

function randomToken(bytes = 32) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return b64encode(a).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hashPassword(password, saltB64) {
  const salt = saltB64 ? b64decode(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return { salt: b64encode(salt), hash: b64encode(bits) };
}

function checkPasswordRules(password) {
  if (typeof password !== "string" || password.length < 8) throw new HttpError(400, "Use at least 8 characters for the password.");
}

/* ---------------------------------------------------------------------------
   Users + sessions
   --------------------------------------------------------------------------- */

async function getUsers(env) {
  let users = await env.RICHMARC_KV.get("users", "json");
  if (!users || !Object.keys(users).length) {
    const { salt, hash } = await hashPassword("admin");
    users = { admin: { role: "admin", salt, hash, default: true, created: new Date().toISOString(), lastLogin: null } };
    await env.RICHMARC_KV.put("users", JSON.stringify(users));
  }
  return users;
}

const saveUsers = (env, users) => env.RICHMARC_KV.put("users", JSON.stringify(users));
const adminCount = (users) => Object.values(users).filter((u) => u.role === "admin").length;

function publicUser(name, u) {
  return { username: name, role: u.role, created: u.created, lastLogin: u.lastLogin, defaultPassword: !!u.default };
}

function sessionToken(request) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([A-Za-z0-9_-]+)`));
  return m ? m[1] : null;
}

async function currentUser(request, env) {
  const token = sessionToken(request);
  if (!token) return null;
  const s = await env.RICHMARC_KV.get(`session:${token}`, "json");
  if (!s) return null;
  const users = await getUsers(env);
  const u = users[s.user];
  if (!u) return null; // user was deleted
  return { name: s.user, ...u, token, users };
}

function requireUser(user) {
  if (!user) throw new HttpError(401, "Your session has ended. Sign in again.");
  return user;
}

function requireAdmin(user) {
  requireUser(user);
  if (user.role !== "admin") throw new HttpError(403, "Only admins can manage users.");
  return user;
}

function cookie(token, maxAge, secure) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

/* ---------------------------------------------------------------------------
   Content
   --------------------------------------------------------------------------- */

async function readContent(env, request) {
  const stored = await env.RICHMARC_KV.get("content", "json");
  if (stored) return stored;
  // Not edited yet: start from the content file in the repository
  const res = await env.ASSETS.fetch(new URL("/data/content.json", request.url));
  if (!res.ok) throw new HttpError(500, "data/content.json is missing from the deployment.");
  return res.json();
}

function validateContent(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) return "Content must be an object.";
  for (const key of ["properties", "stats", "testimonials", "faqs", "buildTiers", "buildExtras"]) {
    if (!Array.isArray(c[key])) return `'${key}' must be a list.`;
  }
  if (!c.settings || typeof c.settings !== "object") return "'settings' must be an object.";
  const ids = new Set();
  for (const p of c.properties) {
    const id = p && p.id;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || "")) return `Home id '${id || ""}' must be lowercase letters, numbers and dashes.`;
    if (ids.has(id)) return `Two homes share the id '${id}'.`;
    ids.add(id);
    if (!p.name) return `Home '${id}' needs a name.`;
  }
  if (!c.buildTiers.length) return "Keep at least one build tier for the estimator.";
  return null;
}

/* ---------------------------------------------------------------------------
   Route handlers
   --------------------------------------------------------------------------- */

async function login(request, env, body) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const failKey = `fails:${ip}`;
  const fails = parseInt((await env.RICHMARC_KV.get(failKey)) || "0", 10);
  if (fails >= 8) throw new HttpError(429, "Too many attempts. Wait five minutes and try again.");

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  const users = await getUsers(env);
  const u = users[username];
  // Hash even when the user does not exist so timing does not reveal valid usernames
  const { hash } = await hashPassword(password, u ? u.salt : undefined);
  if (!u || !safeEqual(hash, u.hash)) {
    await env.RICHMARC_KV.put(failKey, String(fails + 1), { expirationTtl: 300 });
    throw new HttpError(401, "That username and password don't match.");
  }

  await env.RICHMARC_KV.delete(failKey);
  u.lastLogin = new Date().toISOString();
  await saveUsers(env, users);
  const token = randomToken();
  await env.RICHMARC_KV.put(`session:${token}`, JSON.stringify({ user: username }), { expirationTtl: SESSION_TTL });
  const secure = new URL(request.url).protocol === "https:";
  return json(200, { user: username, role: u.role, defaultPassword: !!u.default }, { "set-cookie": cookie(token, SESSION_TTL, secure) });
}

async function changeOwnPassword(env, user, body) {
  const { hash } = await hashPassword(String(body.current || ""), user.salt);
  if (!safeEqual(hash, user.hash)) throw new HttpError(400, "Current password is incorrect.");
  checkPasswordRules(body.password);
  const users = user.users;
  Object.assign(users[user.name], await hashPassword(body.password), { default: false });
  await saveUsers(env, users);
  return json(200, { ok: true });
}

async function createUser(env, admin, body) {
  const users = admin.users;
  const username = String(body.username || "").trim().toLowerCase();
  const role = String(body.role || "editor");
  if (!USERNAME_RE.test(username)) throw new HttpError(400, "Usernames are 3 to 32 characters: letters, numbers, dot, dash or underscore.");
  if (users[username]) throw new HttpError(400, `The user '${username}' already exists.`);
  if (!ROLES.includes(role)) throw new HttpError(400, "Role must be admin or editor.");
  checkPasswordRules(body.password);
  users[username] = { role, ...(await hashPassword(body.password)), default: false, created: new Date().toISOString(), lastLogin: null };
  await saveUsers(env, users);
  return json(200, { ok: true, user: publicUser(username, users[username]) });
}

async function setRole(env, admin, body) {
  const users = admin.users;
  const username = String(body.username || "");
  const role = String(body.role || "");
  if (!users[username]) throw new HttpError(404, "User not found.");
  if (!ROLES.includes(role)) throw new HttpError(400, "Role must be admin or editor.");
  if (users[username].role === "admin" && role !== "admin" && adminCount(users) <= 1) {
    throw new HttpError(400, "Keep at least one admin. Make someone else an admin first.");
  }
  users[username].role = role;
  await saveUsers(env, users);
  return json(200, { ok: true });
}

async function resetPassword(env, admin, body) {
  const users = admin.users;
  const username = String(body.username || "");
  if (!users[username]) throw new HttpError(404, "User not found.");
  checkPasswordRules(body.password);
  Object.assign(users[username], await hashPassword(body.password), { default: false });
  await saveUsers(env, users);
  return json(200, { ok: true });
}

async function deleteUser(env, admin, body) {
  const users = admin.users;
  const username = String(body.username || "");
  if (!users[username]) throw new HttpError(404, "User not found.");
  if (username === admin.name) throw new HttpError(400, "You can't delete your own account.");
  if (users[username].role === "admin" && adminCount(users) <= 1) throw new HttpError(400, "Keep at least one admin.");
  delete users[username];
  await saveUsers(env, users);
  return json(200, { ok: true });
}

async function upload(env, body) {
  const name = String(body.name || "image");
  const m = String(body.data || "").match(/^data:image\/[\w.+-]+;base64,(.+)$/s);
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (!m || !IMAGE_TYPES[ext]) throw new HttpError(400, "Upload a JPG, PNG, WebP, GIF or AVIF image.");
  const bytes = b64decode(m[1]);
  if (bytes.length > MAX_UPLOAD) throw new HttpError(400, "Images must be 8 MB or smaller.");
  const stem = name.slice(0, -(ext.length + 1)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
  const file = `${stem}-${randomToken(4).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6)}.${ext}`;
  await env.RICHMARC_KV.put(`upload:${file}`, bytes, { metadata: { type: IMAGE_TYPES[ext] } });
  return json(200, { url: `api/uploads/${file}` });
}

async function serveUpload(env, file) {
  const { value, metadata } = await env.RICHMARC_KV.getWithMetadata(`upload:${file}`, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, {
    headers: {
      "content-type": (metadata && metadata.type) || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff"
    }
  });
}

/* ---------------------------------------------------------------------------
   Router
   --------------------------------------------------------------------------- */

export async function onRequest({ request, env, params }) {
  if (!env.RICHMARC_KV) {
    return json(500, { error: "The RICHMARC_KV binding is missing. Add a KV namespace binding named RICHMARC_KV to the Pages project, then redeploy." });
  }
  try {
    // "await" so errors thrown inside any handler are caught below
    return await handle(request, env, (params.path || []).join("/"));
  } catch (e) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error(e);
    return json(500, { error: "Something went wrong on the server." });
  }
}

async function handle(request, env, route) {
  const method = request.method;
  {
    if (method === "GET" && route.startsWith("uploads/")) return serveUpload(env, route.slice(8));

    if (method === "GET") {
      const user = await currentUser(request, env);
      if (route === "session") {
        return json(200, user ? { user: user.name, role: user.role, defaultPassword: !!user.default } : { user: null });
      }
      if (route === "content") {
        requireUser(user);
        return json(200, await readContent(env, request));
      }
      if (route === "users") {
        requireAdmin(user);
        return json(200, { users: Object.entries(user.users).map(([n, u]) => publicUser(n, u)).sort((a, b) => a.username.localeCompare(b.username)) });
      }
      throw new HttpError(404, "Not found.");
    }

    if (method !== "POST") throw new HttpError(405, "Method not allowed.");

    // Block cross-site requests (CSRF)
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) throw new HttpError(403, "Cross-site request blocked.");

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      throw new HttpError(400, "Invalid JSON.");
    }

    if (route === "login") return login(request, env, body);
    if (route === "logout") {
      const token = sessionToken(request);
      if (token) await env.RICHMARC_KV.delete(`session:${token}`);
      return json(200, { ok: true }, { "set-cookie": cookie("", 0, new URL(request.url).protocol === "https:") });
    }

    const user = await currentUser(request, env);
    requireUser(user);

    switch (route) {
      case "content": {
        const err = validateContent(body);
        if (err) throw new HttpError(400, err);
        const previous = await env.RICHMARC_KV.get("content");
        if (previous) await env.RICHMARC_KV.put(`backup:${new Date().toISOString()}`, previous, { expirationTtl: 30 * 24 * 60 * 60 });
        await env.RICHMARC_KV.put("content", JSON.stringify(body));
        return json(200, { ok: true });
      }
      case "password":
        return changeOwnPassword(env, user, body);
      case "upload":
        return upload(env, body);
      case "users/create":
        return createUser(env, requireAdmin(user), body);
      case "users/role":
        return setRole(env, requireAdmin(user), body);
      case "users/password":
        return resetPassword(env, requireAdmin(user), body);
      case "users/delete":
        return deleteUser(env, requireAdmin(user), body);
    }
    throw new HttpError(404, "Not found.");
  }
}
