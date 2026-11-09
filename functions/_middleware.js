/* ==========================================================================
   Runs only for the paths listed in _routes.json (not for every page).
   - /js/content.js is served from KV once content has been published from
     the admin, so edits go live without a redeploy.
   - Repository files that aren't part of the website return the 404 page.
   ========================================================================== */

const BLOCKED = [
  /^\/data(\/|$)/,
  /^\/functions(\/|$)/,
  /^\/\.(git|claude|agents)(\/|$)/,
  /^\/(skills-lock\.json|README\.md|_routes\.json|\.gitignore)$/
];

async function notFound(ctx) {
  const page = await ctx.env.ASSETS.fetch(new URL("/404.html", ctx.request.url));
  return new Response(page.body, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function onRequest(ctx) {
  const { pathname } = new URL(ctx.request.url);

  if (BLOCKED.some((re) => re.test(pathname))) return notFound(ctx);

  if (pathname === "/js/content.js" && ctx.env.RICHMARC_KV) {
    const content = await ctx.env.RICHMARC_KV.get("content");
    if (content) {
      // "</" is escaped so text such as "</script>" can never end the script early
      const js =
        "/* Live content published from the admin panel. */\n" +
        `window.RICHMARC_CONTENT = ${content.replace(/<\//g, "<\\/")};\n`;
      return new Response(js, {
        headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-cache" }
      });
    }
  }

  return ctx.next();
}
