/* ==========================================================================
   Home page: featured homes, stats, testimonials, FAQ
   ========================================================================== */

(function () {
  const { properties, stats, testimonials, faqs } = window.RICHMARC;
  const { propertyCard } = window.RMRender;

  /* Featured homes: first three for sale or under construction */
  const featured = document.querySelector("[data-featured]");
  if (featured) {
    featured.innerHTML = properties
      .filter((p) => p.status !== "Coming soon")
      .slice(0, 3)
      .map(propertyCard)
      .join("");
  }

  /* Stats */
  const statsEl = document.querySelector("[data-stats]");
  if (statsEl) {
    statsEl.innerHTML = stats
      .map(
        (s) => `
        <div class="stat">
          <span class="stat__value" data-count="${s.value}" data-decimals="${s.decimals || 0}" data-suffix="${s.suffix}">0${s.suffix}</span>
          <span class="caption-2 text-3">${s.label}</span>
        </div>`
      )
      .join("");
  }

  /* Testimonials */
  const quotesEl = document.querySelector("[data-quotes]");
  if (quotesEl) {
    quotesEl.innerHTML = testimonials
      .map((t, i) => {
        const initials = t.name
          .split(/\s+/)
          .filter((w) => /^[A-Z]/.test(w) && w !== "and")
          .map((w) => w[0])
          .slice(0, 2)
          .join("");
        return `
        <figure class="quote reveal" style="--delay:${i * 90}ms">
          <i class="ph-light ph-quotes" aria-hidden="true"></i>
          <blockquote class="body-3">${t.quote}</blockquote>
          <figcaption>
            <span class="quote__initials caption-3">${initials}</span>
            <span><span class="title-4" style="display:block">${t.name}</span><span class="caption-5 text-3">${t.role}</span></span>
          </figcaption>
        </figure>`;
      })
      .join("");
  }

  /* FAQ + structured data */
  const faqEl = document.querySelector("[data-faq]");
  if (faqEl) {
    faqEl.innerHTML = faqs
      .map(
        (f, i) => `
        <div class="faq__item${i === 0 ? " is-open" : ""}">
          <h3>
            <button class="faq__q title-2" type="button" aria-expanded="${i === 0}" aria-controls="faq-${i}" id="faq-q-${i}">
              <span>${f.q}</span><span class="faq__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq__a" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}"><div><p class="body-3">${f.a}</p></div></div>
        </div>`
      )
      .join("");
    window.RM.initFaq(faqEl);

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    });
    document.head.appendChild(ld);
  }

  window.RM.observeReveals();
  window.RM.guardImages();
  window.RM.initCounters();
})();
