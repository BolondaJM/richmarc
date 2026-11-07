/* ==========================================================================
   Listings page: filter, sort, skeleton loading and empty state
   ========================================================================== */

(function () {
  const { properties } = window.RICHMARC;
  const { propertyCard, skeletonCard } = window.RMRender;

  const grid = document.querySelector("[data-listings]");
  const label = document.querySelector("[data-count-label]");
  const statusWrap = document.querySelector("[data-status-filter]");
  const bedsEl = document.querySelector("[data-beds]");
  const sortEl = document.querySelector("[data-sort]");

  const params = new URLSearchParams(location.search);
  const state = {
    status: params.get("status") || "all",
    beds: parseInt(params.get("beds") || "0", 10),
    sort: params.get("sort") || "featured"
  };

  bedsEl.value = String(state.beds);
  sortEl.value = state.sort;
  statusWrap.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.value === state.status)));

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.status !== "all") p.set("status", state.status);
    if (state.beds) p.set("beds", state.beds);
    if (state.sort !== "featured") p.set("sort", state.sort);
    const q = p.toString();
    history.replaceState(null, "", q ? `?${q}` : location.pathname);
  }

  function render() {
    let list = properties.filter(
      (p) => (state.status === "all" || p.status === state.status) && p.beds >= state.beds
    );
    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === "area-desc") list = [...list].sort((a, b) => b.area - a.area);

    label.textContent = `${list.length} ${list.length === 1 ? "home" : "homes"}`;

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="ph-light ph-house-line" aria-hidden="true"></i>
          <h2 class="heading-6">No homes match these filters yet</h2>
          <p class="body-6 text-2">Try fewer bedrooms or a different status. New residences are released every few months, and registered clients see them first.</p>
          <div style="display:flex;gap:var(--sp-75);flex-wrap:wrap;justify-content:center">
            <button class="btn btn--ghost button-sm" type="button" data-reset>Clear filters</button>
            <a class="btn btn--primary button-sm" href="contact.html">Register your brief</a>
          </div>
        </div>`;
      grid.querySelector("[data-reset]").addEventListener("click", reset);
      return;
    }

    grid.innerHTML = list.map(propertyCard).join("");
    window.RM.guardImages(grid);
    window.RM.observeReveals(grid);
  }

  function reset() {
    state.status = "all";
    state.beds = 0;
    state.sort = "featured";
    bedsEl.value = "0";
    sortEl.value = "featured";
    statusWrap.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.value === "all")));
    syncUrl();
    render();
  }

  statusWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.status = chip.dataset.value;
    statusWrap.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    syncUrl();
    render();
  });

  bedsEl.addEventListener("change", () => {
    state.beds = parseInt(bedsEl.value, 10);
    syncUrl();
    render();
  });

  sortEl.addEventListener("change", () => {
    state.sort = sortEl.value;
    syncUrl();
    render();
  });

  /* Skeleton first, as if fetching from a CMS, then real cards */
  grid.innerHTML = Array.from({ length: 6 }, skeletonCard).join("");
  setTimeout(render, 450);
})();
