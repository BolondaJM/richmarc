/* ==========================================================================
   Richmarc admin panel
   Schema driven: every editable section of the site is described in SECTIONS,
   and the list + form UI is generated from it. Changes are kept locally until
   "Publish changes" sends the whole content document to the server.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Schema
     --------------------------------------------------------------------- */
  const STATUSES = ["For sale", "Under construction", "Coming soon", "Sold"];
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const SECTIONS = {
    properties: {
      label: "Homes",
      icon: "house-line",
      intro: "Homes shown on the listings page, the home page and their own detail pages.",
      itemName: "home",
      title: (p) => p.name || "Untitled home",
      sub: (p) => [p.location, p.price ? money.format(p.price) : ""].filter(Boolean).join(" · "),
      pill: (p) => p.status,
      thumb: (p) => p.cover && p.cover.src,
      blank: () => ({
        id: "", name: "", location: "", status: "For sale", price: 0, beds: 4, baths: 4, area: 0, lot: 0,
        year: new Date().getFullYear() + 1, energy: "", cover: { src: "", alt: "" }, gallery: [], summary: "", features: []
      }),
      groups: [
        { title: "Basics", fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "id", label: "URL id", type: "slug", from: "name", help: "Used in the link: property.html?id=…" },
          { key: "location", label: "Location", type: "text" },
          { key: "status", label: "Status", type: "select", options: STATUSES },
          { key: "price", label: "Price (USD)", type: "number" }
        ] },
        { title: "Specifications", fields: [
          { key: "beds", label: "Bedrooms", type: "number" },
          { key: "baths", label: "Bathrooms", type: "number" },
          { key: "area", label: "Interior (sq ft)", type: "number" },
          { key: "lot", label: "Lot (acres)", type: "number", step: "0.01" },
          { key: "year", label: "Completion year", type: "number" },
          { key: "energy", label: "Energy", type: "text" }
        ] },
        { title: "Description", fields: [
          { key: "summary", label: "Summary", type: "textarea", span: true },
          { key: "features", label: "Features", type: "strlist", span: true, addLabel: "Add feature" }
        ] },
        { title: "Photos", fields: [
          { key: "cover", label: "Cover photo", type: "image", span: true },
          { key: "gallery", label: "Gallery", type: "gallery", span: true }
        ] }
      ]
    },
    testimonials: {
      label: "Testimonials",
      icon: "quotes",
      intro: "Client quotes on the home page.",
      itemName: "testimonial",
      title: (t) => t.name || "Unnamed client",
      sub: (t) => t.quote,
      blank: () => ({ quote: "", name: "", role: "" }),
      groups: [{ title: "Testimonial", fields: [
        { key: "name", label: "Client name", type: "text", required: true },
        { key: "role", label: "Role / project", type: "text" },
        { key: "quote", label: "Quote", type: "textarea", span: true }
      ] }]
    },
    faqs: {
      label: "FAQs",
      icon: "question",
      intro: "Questions and answers on the home page.",
      itemName: "question",
      title: (f) => f.q || "New question",
      sub: (f) => f.a,
      blank: () => ({ q: "", a: "" }),
      groups: [{ title: "Question", fields: [
        { key: "q", label: "Question", type: "text", span: true, required: true },
        { key: "a", label: "Answer", type: "textarea", span: true }
      ] }]
    },
    stats: {
      label: "Stats",
      icon: "chart-bar",
      intro: "The animated numbers on the home page.",
      itemName: "stat",
      title: (s) => `${s.value ?? ""}${s.suffix || ""}`,
      sub: (s) => s.label,
      blank: () => ({ value: 0, suffix: "", decimals: 0, label: "" }),
      groups: [{ title: "Stat", fields: [
        { key: "value", label: "Value", type: "number", step: "any" },
        { key: "suffix", label: "Suffix", type: "text", help: "For example % or +" },
        { key: "decimals", label: "Decimal places", type: "number" },
        { key: "label", label: "Label", type: "text" }
      ] }]
    },
    buildTiers: {
      label: "Build tiers",
      icon: "stack",
      intro: "Finish levels in the custom build cost estimator.",
      itemName: "tier",
      title: (t) => t.label || "New tier",
      sub: (t) => `$${t.rate || 0} / ft² · ${t.note || ""}`,
      blank: () => ({ id: "", label: "", rate: 500, note: "" }),
      minItems: 1,
      groups: [{ title: "Tier", fields: [
        { key: "label", label: "Name", type: "text", required: true },
        { key: "id", label: "Id", type: "slug", from: "label" },
        { key: "rate", label: "Rate per ft² (USD)", type: "number" },
        { key: "note", label: "Description", type: "text", span: true }
      ] }]
    },
    buildExtras: {
      label: "Build extras",
      icon: "plus-square",
      intro: "Optional add-ons in the custom build cost estimator.",
      itemName: "extra",
      title: (x) => x.label || "New extra",
      sub: (x) => money.format(x.cost || 0),
      blank: () => ({ id: "", label: "", cost: 0 }),
      groups: [{ title: "Extra", fields: [
        { key: "label", label: "Name", type: "text", required: true },
        { key: "id", label: "Id", type: "slug", from: "label" },
        { key: "cost", label: "Cost (USD)", type: "number" }
      ] }]
    },
    settings: {
      label: "Site settings",
      icon: "gear-six",
      intro: "Contact details and links shown in the footer and on the contact page.",
      single: true,
      groups: [
        { title: "Contact", fields: [
          { key: "email", label: "Email", type: "text" },
          { key: "phone", label: "Phone (as displayed)", type: "text" },
          { key: "phoneHref", label: "Phone (for dialing)", type: "text", help: "Digits only, e.g. +15551234567" },
          { key: "address", label: "Studio address", type: "text", span: true },
          { key: "hours", label: "Opening hours", type: "text", span: true }
        ] },
        { title: "Footer", fields: [
          { key: "footerBlurb", label: "Footer description", type: "textarea", span: true },
          { key: "instagram", label: "Instagram URL", type: "text" },
          { key: "linkedin", label: "LinkedIn URL", type: "text" },
          { key: "pinterest", label: "Pinterest URL", type: "text" }
        ] }
      ]
    }
  };

  /* ---------------------------------------------------------------------
     State + helpers
     --------------------------------------------------------------------- */
  let content = null;
  let savedJSON = "";
  let user = null;
  const $ = (s, r = document) => r.querySelector(s);
  const contentEl = $("[data-content]");

  const slugify = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  const imgUrl = (src) => (!src ? "" : /^(https?:|data:|\/)/.test(src) ? src : "../" + src);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const icon = (name) => h("i", { class: `ph-light ph-${name}`, "aria-hidden": "true" });

  async function api(path, body) {
    const res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin"
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* empty */ }
    if (res.status === 401 && path !== "/api/login") {
      showLogin("Your session has ended. Sign in again.");
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  let toastTimer;
  function toast(msg, isError) {
    const t = $("[data-toast]");
    t.textContent = msg;
    t.classList.toggle("is-error", !!isError);
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3000);
  }

  function isDirty() { return content && JSON.stringify(content) !== savedJSON; }
  function markDirty() {
    const dirty = isDirty();
    $("[data-savebar]").classList.toggle("is-dirty", dirty);
    $("[data-save-status]").textContent = dirty ? "You have unpublished changes" : "All changes saved";
  }

  /* ---------------------------------------------------------------------
     Auth views
     --------------------------------------------------------------------- */
  function showLogin(msg) {
    user = null;
    $("[data-view=app]").hidden = true;
    $("[data-view=login]").hidden = false;
    $("[data-login-error]").textContent = msg || "";
    $("[data-login] [name=username]").focus();
  }

  async function showApp(session) {
    user = session.user;
    content = await api("/api/content");
    savedJSON = JSON.stringify(content);
    $("[data-view=login]").hidden = true;
    $("[data-view=app]").hidden = false;
    $("[data-user]").textContent = user;
    $("[data-default-banner]").hidden = !session.defaultPassword;
    markDirty();
    route();
  }

  $("[data-login]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const btn = f.querySelector("button");
    btn.disabled = true;
    try {
      const s = await api("/api/login", { username: f.username.value.trim(), password: f.password.value });
      f.password.value = "";
      await showApp(s);
    } catch (err) {
      $("[data-login-error]").textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $("[data-logout]").addEventListener("click", async () => {
    if (isDirty() && !confirm("You have unpublished changes. Sign out and lose them?")) return;
    await api("/api/logout", {}).catch(() => {});
    content = null;
    savedJSON = "";
    markDirtySafe();
    showLogin();
  });
  function markDirtySafe() { $("[data-savebar]").classList.remove("is-dirty"); }

  /* ---------------------------------------------------------------------
     Save / discard
     --------------------------------------------------------------------- */
  async function save() {
    const btn = $("[data-save]");
    btn.disabled = true;
    try {
      await api("/api/content", content);
      savedJSON = JSON.stringify(content);
      markDirty();
      toast("Published. The site now shows your changes.");
    } catch (err) {
      toast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  }
  $("[data-save]").addEventListener("click", save);
  $("[data-discard]").addEventListener("click", () => {
    if (!confirm("Discard all unpublished changes?")) return;
    content = JSON.parse(savedJSON);
    markDirty();
    route();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && content) {
      e.preventDefault();
      if (isDirty()) save();
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------------------------------------------------------------------
     Routing: #section or #section/index
     --------------------------------------------------------------------- */
  function go(hash) { location.hash = hash; }
  window.addEventListener("hashchange", () => content && route());
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section-link]");
    if (link) go(link.dataset.sectionLink);
  });

  function renderNav(active) {
    const nav = $("[data-nav]");
    nav.replaceChildren(
      ...Object.entries(SECTIONS).map(([key, s]) =>
        h("button", { class: "side__link", type: "button", "data-section-link": key, "aria-current": key === active ? "page" : null },
          icon(s.icon), s.label,
          s.single ? null : h("span", { class: "count" }, (content[key] || []).length))
      )
    );
  }

  function route() {
    const [section = "properties", idx] = location.hash.slice(1).split("/");
    window.scrollTo(0, 0);
    if (section === "account") { renderNav(null); return renderAccount(); }
    const s = SECTIONS[section];
    if (!s) return go("properties");
    renderNav(section);
    if (s.single) return renderForm(section, null);
    if (idx !== undefined && content[section][+idx]) return renderForm(section, +idx);
    renderList(section);
  }

  /* ---------------------------------------------------------------------
     List view
     --------------------------------------------------------------------- */
  function renderList(key) {
    const s = SECTIONS[key];
    const items = content[key];

    const add = () => {
      items.push(s.blank());
      markDirty();
      go(`${key}/${items.length - 1}`);
    };

    const move = (i, dir) => {
      const j = i + dir;
      [items[i], items[j]] = [items[j], items[i]];
      markDirty();
      renderList(key);
    };

    const remove = (i) => {
      if (s.minItems && items.length <= s.minItems) return toast(`Keep at least ${s.minItems} ${s.itemName}.`, true);
      if (!confirm(`Delete "${s.title(items[i])}"? This takes effect when you publish.`)) return;
      items.splice(i, 1);
      markDirty();
      renderNav(key);
      renderList(key);
    };

    const duplicate = (i) => {
      const copy = clone(items[i]);
      if ("name" in copy) copy.name += " (copy)";
      if ("id" in copy) {
        let base = (copy.id || "item") + "-copy", n = 1, id = base;
        while (items.some((x) => x.id === id)) id = `${base}-${++n}`;
        copy.id = id;
      }
      items.splice(i + 1, 0, copy);
      markDirty();
      go(`${key}/${i + 1}`);
    };

    const rows = items.map((item, i) => {
      const thumb = s.thumb ? s.thumb(item) : null;
      return h("div", { class: "row" },
        s.thumb ? h("img", { class: "row__thumb", src: imgUrl(thumb).replace("w=1600", "w=240") || null, alt: "", loading: "lazy" }) : null,
        h("button", { class: "row__main", type: "button", onclick: () => go(`${key}/${i}`) },
          h("span", { class: "row__title" }, s.title(item)),
          h("span", { class: "row__sub" }, s.sub ? s.sub(item) : "")),
        s.pill ? h("span", { class: "pill" }, s.pill(item)) : null,
        h("div", { class: "row__actions" },
          h("button", { class: "icon-btn", type: "button", title: "Move up", "aria-label": "Move up", disabled: i === 0, onclick: () => move(i, -1) }, icon("arrow-up")),
          h("button", { class: "icon-btn", type: "button", title: "Move down", "aria-label": "Move down", disabled: i === items.length - 1, onclick: () => move(i, 1) }, icon("arrow-down")),
          h("button", { class: "icon-btn", type: "button", title: "Edit", "aria-label": "Edit", onclick: () => go(`${key}/${i}`) }, icon("pencil-simple")),
          h("button", { class: "icon-btn", type: "button", title: "Duplicate", "aria-label": "Duplicate", onclick: () => duplicate(i) }, icon("copy")),
          h("button", { class: "icon-btn icon-btn--danger", type: "button", title: "Delete", "aria-label": "Delete", onclick: () => remove(i) }, icon("trash")))
      );
    });

    contentEl.replaceChildren(
      h("div", { class: "page-head" },
        h("div", {}, h("h1", {}, s.label), h("p", {}, s.intro)),
        h("button", { class: "btn btn--primary", type: "button", onclick: add }, icon("plus"), `Add ${s.itemName}`)),
      items.length ? h("div", { class: "list" }, rows) : h("p", { class: "empty" }, `No ${s.label.toLowerCase()} yet.`)
    );
  }

  /* ---------------------------------------------------------------------
     Form view
     --------------------------------------------------------------------- */
  function renderForm(key, index) {
    const s = SECTIONS[key];
    const item = s.single ? (content[key] = content[key] || {}) : content[key][index];

    const changed = () => {
      markDirty();
      if (!s.single) $(".page-head h1", contentEl).textContent = s.title(item);
    };

    const head = s.single
      ? h("div", { class: "page-head" }, h("div", {}, h("h1", {}, s.label), h("p", {}, s.intro)))
      : h("div", {},
          h("button", { class: "back", type: "button", onclick: () => go(key) }, icon("arrow-left"), `All ${s.label.toLowerCase()}`),
          h("div", { class: "page-head" },
            h("div", {}, h("h1", {}, s.title(item))),
            h("div", { style: "display:flex;gap:8px;flex-wrap:wrap" },
              key === "properties" && item.id
                ? h("a", { class: "btn btn--ghost btn--sm", href: `../property.html?id=${encodeURIComponent(item.id)}`, target: "_blank", rel: "noopener" }, icon("eye"), "View live")
                : null,
              h("button", { class: "btn btn--danger btn--sm", type: "button", onclick: () => {
                if (s.minItems && content[key].length <= s.minItems) return toast(`Keep at least ${s.minItems} ${s.itemName}.`, true);
                if (!confirm(`Delete "${s.title(item)}"? This takes effect when you publish.`)) return;
                content[key].splice(index, 1);
                markDirty();
                go(key);
              } }, icon("trash"), "Delete"),
              h("button", { class: "btn btn--primary btn--sm", type: "button", onclick: () => go(key) }, icon("check"), "Done"))));

    const groups = s.groups.map((g) =>
      h("section", { class: "card" },
        h("h2", {}, g.title),
        h("div", { class: "grid" }, g.fields.map((f) => fieldEl(item, f, changed, g.fields)))));

    contentEl.replaceChildren(h("div", { class: "editor" }, head, groups));
  }

  function fieldEl(item, f, changed, siblings) {
    const wrap = (control) =>
      h("label", { class: `field${f.span ? " span-all" : ""}` },
        h("span", {}, f.label, f.required ? " *" : ""), control, f.help ? h("small", {}, f.help) : null);
    const id = `f-${f.key}-${Math.random().toString(36).slice(2, 7)}`;

    switch (f.type) {
      case "text":
      case "slug": {
        const input = h("input", { id, value: item[f.key] ?? "", required: f.required || null, "data-key": f.key });
        input.addEventListener("input", () => {
          let v = input.value;
          if (f.type === "slug") { v = slugify(v); }
          // Keep a slug in step with its source field while they still match
          siblings.filter((o) => o.type === "slug" && o.from === f.key).forEach((o) => {
            const prev = slugify(item[f.key]);
            if (!item[o.key] || item[o.key] === prev) {
              item[o.key] = slugify(v);
              const other = input.closest(".grid").querySelector(`[data-key="${o.key}"]`);
              if (other) other.value = item[o.key];
            }
          });
          item[f.key] = v;
          changed();
        });
        if (f.type === "slug") input.addEventListener("blur", () => { input.value = item[f.key] = slugify(input.value); changed(); });
        return wrap(input);
      }
      case "textarea": {
        const ta = h("textarea", { id, rows: 4 });
        ta.value = item[f.key] ?? "";
        ta.addEventListener("input", () => { item[f.key] = ta.value; changed(); });
        return wrap(ta);
      }
      case "number": {
        const input = h("input", { id, type: "number", step: f.step || "1", value: item[f.key] ?? 0, inputmode: "decimal" });
        input.addEventListener("input", () => {
          const n = parseFloat(input.value);
          item[f.key] = Number.isFinite(n) ? n : 0;
          changed();
        });
        return wrap(input);
      }
      case "select": {
        const opts = f.options.includes(item[f.key]) || !item[f.key] ? f.options : [item[f.key], ...f.options];
        const sel = h("select", { id }, opts.map((o) => h("option", { value: o, selected: o === item[f.key] || null }, o)));
        sel.addEventListener("change", () => { item[f.key] = sel.value; changed(); });
        return wrap(sel);
      }
      case "strlist":
        return h("div", { class: `field${f.span ? " span-all" : ""}` }, h("span", {}, f.label), strList(item, f, changed));
      case "image":
        item[f.key] = item[f.key] || { src: "", alt: "" };
        return h("div", { class: `field${f.span ? " span-all" : ""}` }, h("span", {}, f.label), imageField(item[f.key], changed));
      case "gallery":
        item[f.key] = item[f.key] || [];
        return h("div", { class: `field${f.span ? " span-all" : ""}` }, h("span", {}, f.label), galleryField(item[f.key], changed));
    }
    return h("span");
  }

  function strList(item, f, changed) {
    item[f.key] = item[f.key] || [];
    const list = item[f.key];
    const box = h("div", { class: "strlist" });
    const draw = () => {
      box.replaceChildren(
        ...list.map((v, i) => {
          const input = h("input", { value: v, "aria-label": `${f.label} ${i + 1}` });
          input.addEventListener("input", () => { list[i] = input.value; changed(); });
          return h("div", { class: "strlist__item" }, input,
            h("button", { class: "icon-btn", type: "button", "aria-label": "Move up", disabled: i === 0, onclick: () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; changed(); draw(); } }, icon("arrow-up")),
            h("button", { class: "icon-btn icon-btn--danger", type: "button", "aria-label": "Remove", onclick: () => { list.splice(i, 1); changed(); draw(); } }, icon("x")));
        }),
        h("div", {}, h("button", { class: "btn btn--ghost btn--sm", type: "button", onclick: () => {
          list.push(""); changed(); draw();
          const inputs = box.querySelectorAll("input"); inputs[inputs.length - 1].focus();
        } }, icon("plus"), f.addLabel || "Add"))
      );
    };
    draw();
    return box;
  }

  function imageField(obj, changed) {
    const preview = h("img", { src: imgUrl(obj.src) || null, alt: "" });
    const src = h("input", { value: obj.src || "", placeholder: "https://… or upload a file", "aria-label": "Image URL" });
    const alt = h("input", { value: obj.alt || "", placeholder: "Describe the photo for screen readers", "aria-label": "Alt text" });
    const file = h("input", { type: "file", accept: "image/*", hidden: true });
    const uploadBtn = h("button", { class: "btn btn--ghost btn--sm", type: "button", onclick: () => file.click() }, icon("upload-simple"), "Upload");

    src.addEventListener("input", () => { obj.src = src.value.trim(); preview.src = imgUrl(obj.src); changed(); });
    alt.addEventListener("input", () => { obj.alt = alt.value; changed(); });
    file.addEventListener("change", async () => {
      const f = file.files[0];
      if (!f) return;
      if (f.size > 8 * 1024 * 1024) return toast("Images must be 8 MB or smaller.", true);
      uploadBtn.disabled = true;
      uploadBtn.lastChild.textContent = "Uploading…";
      try {
        const data = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = rej;
          r.readAsDataURL(f);
        });
        const out = await api("/api/upload", { name: f.name, data });
        obj.src = out.url;
        src.value = out.url;
        preview.src = imgUrl(out.url);
        changed();
        toast("Image uploaded.");
      } catch (err) {
        toast(err.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.lastChild.textContent = "Upload";
        file.value = "";
      }
    });

    return h("div", { class: "img-field" },
      h("div", { class: "img-field__preview" }, preview,
        h("div", { class: "img-field__inputs" },
          h("div", { class: "img-field__row" }, src, uploadBtn, file),
          alt)));
  }

  function galleryField(list, changed) {
    const box = h("div", { class: "strlist" });
    const draw = () => {
      box.replaceChildren(
        ...list.map((g, i) =>
          h("div", { class: "gallery-item" },
            h("div", { class: "gallery-item__head" }, `Photo ${i + 1}`,
              h("div", { class: "row__actions" },
                h("button", { class: "icon-btn", type: "button", "aria-label": "Move up", disabled: i === 0, onclick: () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; changed(); draw(); } }, icon("arrow-up")),
                h("button", { class: "icon-btn icon-btn--danger", type: "button", "aria-label": "Remove photo", onclick: () => { list.splice(i, 1); changed(); draw(); } }, icon("trash")))),
            imageField(g, changed))),
        h("div", {}, h("button", { class: "btn btn--ghost btn--sm", type: "button", onclick: () => { list.push({ src: "", alt: "" }); changed(); draw(); } }, icon("plus"), "Add photo"))
      );
    };
    draw();
    return box;
  }

  /* ---------------------------------------------------------------------
     Account
     --------------------------------------------------------------------- */
  function renderAccount() {
    const err = h("p", { class: "msg msg--error", role: "alert" });
    const form = h("form", { class: "card", style: "max-width:520px", novalidate: true },
      h("h2", {}, "Change login"),
      h("label", { class: "field" }, h("span", {}, "Username"), h("input", { name: "username", value: user, autocomplete: "username" })),
      h("label", { class: "field" }, h("span", {}, "Current password"), h("input", { name: "current", type: "password", autocomplete: "current-password", required: true })),
      h("label", { class: "field" }, h("span", {}, "New password"), h("input", { name: "password", type: "password", autocomplete: "new-password", minlength: "8", required: true }), h("small", {}, "At least 8 characters.")),
      h("label", { class: "field" }, h("span", {}, "Confirm new password"), h("input", { name: "confirm", type: "password", autocomplete: "new-password", required: true })),
      err,
      h("div", {}, h("button", { class: "btn btn--primary", type: "submit" }, "Update login")));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      if (form.password.value !== form.confirm.value) { err.textContent = "The new passwords don't match."; return; }
      try {
        const out = await api("/api/password", { username: form.username.value, current: form.current.value, password: form.password.value });
        user = out.user;
        $("[data-user]").textContent = user;
        $("[data-default-banner]").hidden = true;
        form.reset();
        form.username.value = user;
        toast("Login updated.");
      } catch (ex) {
        err.textContent = ex.message;
      }
    });

    contentEl.replaceChildren(
      h("div", { class: "page-head" }, h("div", {}, h("h1", {}, "Account"), h("p", {}, "Change the admin username and password."))),
      form);
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  api("/api/session")
    .then((s) => (s.user ? showApp(s) : showLogin()))
    .catch(() => {
      showLogin("Can't reach the admin server. Start it with: python server.py");
    });
})();
