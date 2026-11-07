/* ==========================================================================
   Shared render helpers (property cards, formatting, skeletons)
   ========================================================================== */

(function () {
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat("en-US");

  function formatPrice(p) {
    return money.format(p);
  }

  function propertyCard(p, i = 0) {
    return `
      <article class="property-card reveal" style="--delay:${(i % 3) * 90}ms">
        <div class="property-card__media">
          <img src="${p.cover.src.replace("w=1600", "w=900")}" alt="${p.cover.alt}" loading="lazy" decoding="async" width="900" height="675">
          <span class="property-card__status caption-4" data-status="${p.status}">${p.status}</span>
        </div>
        <div class="property-card__body">
          <div class="property-card__row">
            <h3 class="title-2"><a class="property-card__link" href="property.html?id=${p.id}">${p.name}</a></h3>
            <i class="ph-light ph-arrow-up-right text-3" aria-hidden="true"></i>
          </div>
          <div class="property-card__row">
            <span class="body-6 text-3"><i class="ph-light ph-map-pin" aria-hidden="true"></i> ${p.location}</span>
            <span class="mono body-6">${formatPrice(p.price)}</span>
          </div>
          <div class="property-card__specs caption-2">
            <span><i class="ph-light ph-bed" aria-hidden="true"></i>${p.beds} beds</span>
            <span><i class="ph-light ph-bathtub" aria-hidden="true"></i>${p.baths} baths</span>
            <span><i class="ph-light ph-ruler" aria-hidden="true"></i>${num.format(p.area)} sq ft</span>
          </div>
        </div>
      </article>`;
  }

  function skeletonCard() {
    return `
      <div class="property-card skeleton" aria-hidden="true">
        <div class="property-card__media"></div>
        <div class="property-card__body">
          <div class="sk sk--line sk--mid"></div>
          <div class="sk sk--line sk--short"></div>
          <div class="sk sk--line"></div>
        </div>
      </div>`;
  }

  window.RMRender = { formatPrice, propertyCard, skeletonCard, num };
})();
