/* ==========================================================================
   Property detail page (property.html?id=...)
   ========================================================================== */

(function () {
  const { properties } = window.RICHMARC;
  const { formatPrice, propertyCard, num } = window.RMRender;
  const root = document.querySelector("[data-property]");

  const id = new URLSearchParams(location.search).get("id");
  const p = properties.find((x) => x.id === id);

  if (!p) {
    document.title = "Residence not found | Richmarc Homes";
    root.innerHTML = `
      <section class="notfound">
        <div class="grid-lines" aria-hidden="true"></div>
        <div class="notfound__inner">
          <span class="caption-3 mono text-accent">Residence not found</span>
          <h1 class="heading-2 gradient-text">This home is no longer listed</h1>
          <p class="body-3 text-2">It may have sold or the link may be incomplete. Browse the homes available today, or ask us about upcoming releases.</p>
          <div style="display:flex;gap:var(--sp-75);flex-wrap:wrap;justify-content:center">
            <a class="btn btn--primary button-md" href="listings.html">View available homes</a>
            <a class="btn btn--ghost button-md" href="contact.html">Contact the studio</a>
          </div>
        </div>
      </section>`;
    return;
  }

  const rp = (window.RICHMARC.raw.properties || []).find((x) => x.id === p.id) || p;
  document.title = `${rp.name} | Richmarc Homes`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", `${rp.name} in ${rp.location}. ${p.beds} bedrooms, ${p.baths} bathrooms, ${num.format(p.area)} sq ft. ${rp.summary}`);

  const ctaLabel = p.status === "Coming soon" ? "Register interest" : "Request a private viewing";
  const related = properties.filter((x) => x.id !== p.id).slice(0, 3);

  root.innerHTML = `
    <section class="property-hero">
      <div class="container">
        <nav class="breadcrumb caption-5 mono" aria-label="Breadcrumb" style="margin-bottom:var(--sp-300)">
          <a href="index.html">Home</a><span aria-hidden="true">/</span>
          <a href="listings.html">Homes</a><span aria-hidden="true">/</span>
          <span aria-current="page">${p.name}</span>
        </nav>

        <div class="property-head">
          <div style="display:grid;gap:var(--sp-200)">
            <span class="eyebrow caption-3 mono">${p.status}</span>
            <h1 class="heading-1 gradient-text reveal">${p.name}</h1>
            <p class="body-3 text-2"><i class="ph-light ph-map-pin" aria-hidden="true"></i> ${p.location}</p>
          </div>
          <div class="property-head__price">
            <span class="caption-5 mono text-3">Asking price</span>
            <span class="heading-4 mono">${formatPrice(p.price)}</span>
          </div>
        </div>

        <div class="gallery reveal">
          <figure><img src="${p.cover.src}" alt="${p.cover.alt}" width="1600" height="1100" fetchpriority="high"></figure>
          ${p.gallery.map((g) => `<figure><img src="${g.src.replace("w=1600", "w=1000")}" alt="${g.alt}" width="1000" height="700" loading="lazy"></figure>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container property-layout">
        <div style="display:grid;gap:var(--sp-600)">
          <div class="reveal" style="display:grid;gap:var(--sp-200)">
            <h2 class="heading-4">About this residence</h2>
            <p class="body-3 text-2">${p.summary}</p>
          </div>

          <div class="spec-grid reveal" aria-label="Specifications">
            <div class="spec"><span class="caption-5 mono">Bedrooms</span><span class="heading-5 mono">${p.beds}</span></div>
            <div class="spec"><span class="caption-5 mono">Bathrooms</span><span class="heading-5 mono">${p.baths}</span></div>
            <div class="spec"><span class="caption-5 mono">Interior</span><span class="heading-5 mono">${num.format(p.area)} ft²</span></div>
            <div class="spec"><span class="caption-5 mono">Lot</span><span class="heading-5 mono">${p.lot} ac</span></div>
            <div class="spec"><span class="caption-5 mono">Completion</span><span class="heading-5 mono">${p.year}</span></div>
            <div class="spec"><span class="caption-5 mono">Energy</span><span class="title-2">${p.energy}</span></div>
          </div>

          <div class="reveal" style="display:grid;gap:var(--sp-300)">
            <h2 class="heading-4">Features</h2>
            <ul class="feature-list body-6">
              ${p.features.map((f) => `<li><i class="ph-light ph-check" aria-hidden="true"></i>${f}</li>`).join("")}
            </ul>
          </div>
        </div>

        <aside class="panel sticky-card" aria-labelledby="enquire-title">
          <form class="form" data-validate>
            <div style="display:grid;gap:var(--sp-75)">
              <h2 id="enquire-title" class="heading-6">${ctaLabel}</h2>
              <p class="body-6 text-2">Viewings run seven days a week, in person or by live video walkthrough.</p>
            </div>
            <input type="hidden" name="property" value="${p.name}">
            <div class="field">
              <label class="caption-1" for="pv-name">Full name *</label>
              <input id="pv-name" name="name" type="text" autocomplete="name" required placeholder="Alex Morgan">
              <span class="field__error caption-5" role="alert"></span>
            </div>
            <div class="field">
              <label class="caption-1" for="pv-email">Email *</label>
              <input id="pv-email" name="email" type="email" autocomplete="email" required placeholder="alex@example.com">
              <span class="field__error caption-5" role="alert"></span>
            </div>
            <div class="field">
              <label class="caption-1" for="pv-phone">Phone</label>
              <input id="pv-phone" name="phone" type="tel" autocomplete="tel" placeholder="Optional">
              <span class="field__error caption-5" role="alert"></span>
            </div>
            <div class="field">
              <label class="caption-1" for="pv-type">Viewing type</label>
              <select id="pv-type" name="type">
                <option>In person</option>
                <option>Live video walkthrough</option>
              </select>
            </div>
            <button class="btn btn--primary btn--lg button-md" type="submit"><span class="btn__label">${ctaLabel}</span></button>
            <div class="form__status" role="status"></div>
            <p class="form__fine caption-5">We only use your details to arrange this viewing. See our <a href="privacy.html">privacy policy</a>.</p>
          </form>
        </aside>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head section-head--split">
          <h2 class="heading-3">More residences</h2>
          <a class="btn btn--ghost button-sm" href="listings.html">All homes <i class="ph-light ph-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="property-grid">${related.map(propertyCard).join("")}</div>
      </div>
    </section>`;

  window.RM.initForms(root);
  window.RM.guardImages(root);
  window.RM.observeReveals(root);
})();
