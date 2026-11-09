/* ==========================================================================
   Richmarc — site content adapter
   ----------------------------------------------------------------------------
   Content lives in data/content.json and is edited from the admin panel
   (/admin/). On every save the server regenerates js/content.js, which sets
   window.RICHMARC_CONTENT. This file shapes it for the page scripts.
   ========================================================================== */

(function () {
  const raw = window.RICHMARC_CONTENT || {};

  /* Page scripts insert content as HTML, so every string is escaped once here.
     Use window.RICHMARC.raw for plain text contexts (document.title, JSON-LD). */
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const escapeDeep = (v) =>
    typeof v === "string"
      ? v.replace(/[&<>"']/g, (ch) => ESC[ch])
      : Array.isArray(v)
        ? v.map(escapeDeep)
        : v && typeof v === "object"
          ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, escapeDeep(x)]))
          : v;
  const c = escapeDeep(raw);
  const img = (id, w = 1600) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

  const properties = (c.properties || []).map((p) => ({
    gallery: [],
    features: [],
    ...p,
    cover: p.cover || { src: "", alt: "" }
  }));

  window.RICHMARC = {
    raw,
    settings: c.settings || {},
    properties,
    stats: c.stats || [],
    testimonials: c.testimonials || [],
    faqs: c.faqs || [],
    buildRates: { tiers: c.buildTiers || [], extras: c.buildExtras || [] },
    img
  };
})();
