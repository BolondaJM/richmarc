/* ==========================================================================
   Custom build estimator
   ========================================================================== */

(function () {
  const { buildRates } = window.RICHMARC;
  const { formatPrice, num } = window.RMRender;
  const root = document.querySelector("[data-estimator]");
  if (!root) return;

  const sizeEl = root.querySelector("[data-size]");
  const sizeOut = root.querySelector("[data-size-out]");
  const tiersEl = root.querySelector("[data-tiers]");
  const extrasEl = root.querySelector("[data-extras]");
  const valueEl = document.querySelector("[data-estimate]");
  const breakdownEl = document.querySelector("[data-breakdown]");
  const ctaEl = document.querySelector("[data-estimate-cta]");

  let tier = buildRates.tiers[1].id;

  tiersEl.innerHTML = buildRates.tiers
    .map(
      (t) => `
      <button class="tier" type="button" role="radio" aria-checked="${t.id === tier}" data-tier="${t.id}" tabindex="${t.id === tier ? 0 : -1}">
        <span class="title-3">${t.label}</span>
        <span class="mono caption-4 text-accent">$${t.rate} / ft²</span>
        <span class="caption-5">${t.note}</span>
      </button>`
    )
    .join("");

  extrasEl.innerHTML = buildRates.extras
    .map(
      (x) => `
      <label class="extra">
        <span class="extra__label"><input type="checkbox" value="${x.id}"><span class="body-5">${x.label}</span></span>
        <span class="mono caption-4 text-3">+${formatPrice(x.cost)}</span>
      </label>`
    )
    .join("");

  /* Animated number */
  let shown = 0;
  let anim = null;
  function animateTo(target, render) {
    cancelAnimationFrame(anim);
    if (window.RM.reduceMotion) {
      shown = target;
      render(target);
      return;
    }
    const from = shown;
    const start = performance.now();
    const dur = 600;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 4);
      shown = from + (target - from) * e;
      render(shown);
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function update() {
    const size = parseInt(sizeEl.value, 10);
    const t = buildRates.tiers.find((x) => x.id === tier);
    const picked = [...extrasEl.querySelectorAll("input:checked")].map((i) => buildRates.extras.find((x) => x.id === i.value));
    const base = size * t.rate;
    const extras = picked.reduce((s, x) => s + x.cost, 0);
    const total = base + extras;

    sizeOut.textContent = `${num.format(size)} ft²`;
    const pct = ((size - sizeEl.min) / (sizeEl.max - sizeEl.min)) * 100;
    sizeEl.style.setProperty("--pct", `${pct}%`);

    animateTo(total, (v) => {
      const low = Math.round((v * 0.94) / 1000) * 1000;
      const high = Math.round((v * 1.08) / 1000) * 1000;
      valueEl.textContent = `${formatPrice(low)} to ${formatPrice(high)}`;
    });

    breakdownEl.innerHTML = `
      <div><span>${t.label} finish, ${num.format(size)} ft²</span><span class="mono">${formatPrice(base)}</span></div>
      ${picked.map((x) => `<div><span>${x.label}</span><span class="mono">${formatPrice(x.cost)}</span></div>`).join("")}
      ${picked.length ? "" : `<div><span class="text-3">No features added yet</span><span></span></div>`}`;

    ctaEl.href = `contact.html?interest=build&size=${size}&tier=${tier}`;
  }

  tiersEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tier]");
    if (!b) return;
    tier = b.dataset.tier;
    tiersEl.querySelectorAll("[data-tier]").forEach((x) => {
      const on = x === b;
      x.setAttribute("aria-checked", String(on));
      x.tabIndex = on ? 0 : -1;
    });
    update();
  });

  /* Arrow keys move between radio tiers */
  tiersEl.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const btns = [...tiersEl.querySelectorAll("[data-tier]")];
    const i = btns.findIndex((b) => b.dataset.tier === tier);
    const next = btns[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : btns.length - 1)) % btns.length];
    next.click();
    next.focus();
  });

  sizeEl.addEventListener("input", update);
  extrasEl.addEventListener("change", update);
  update();
})();
