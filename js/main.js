/* ==========================================================================
   Richmarc — shared site behaviour
   Layout (nav + footer), motion, accordion, cookie consent, form validation.
   ========================================================================== */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "";

  /* ---------------------------------------------------------------------
     Shared layout
     --------------------------------------------------------------------- */
  const NAV = [
    { href: "listings.html", label: "Homes", id: "listings" },
    { href: "build.html", label: "Custom build", id: "build" },
    { href: "index.html#process", label: "Process", id: "process" },
    { href: "contact.html", label: "Contact", id: "contact" }
  ];

  const LOGO = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21V9.5L12 3l9 6.5V21" stroke="currentColor" stroke-width="1"/>
      <path d="M8 21v-7h8v7" stroke="#c9a96e" stroke-width="1"/>
      <path d="M12 3v18" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>
    </svg>`;

  function renderHeader() {
    const slot = document.querySelector("[data-header]");
    if (!slot) return;
    const links = NAV.map(
      (l) =>
        `<li><a class="nav__link title-4" href="${l.href}" ${l.id === page ? 'aria-current="page"' : ""}>${l.label}</a></li>`
    ).join("");
    const mobileLinks = NAV.map(
      (l) =>
        `<li><a class="heading-3" href="${l.href}" ${l.id === page ? 'aria-current="page"' : ""}>${l.label}</a></li>`
    ).join("");

    slot.outerHTML = `
      <a class="skip-link button-sm" href="#main">Skip to content</a>
      <header class="nav" data-nav>
        <a class="brand" href="index.html" aria-label="Richmarc home">${LOGO}<span>Richmarc</span></a>
        <nav aria-label="Primary"><ul class="nav__links">${links}</ul></nav>
        <a class="btn btn--primary button-sm nav__cta" href="contact.html">Book a consultation</a>
        <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" data-nav-toggle>
          <span></span><span></span>
        </button>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <nav aria-label="Mobile"><ul>${mobileLinks}</ul></nav>
        <a class="btn btn--primary btn--lg button-md" href="contact.html">Book a consultation <i class="ph-light ph-arrow-up-right"></i></a>
      </div>`;
  }

  function renderFooter() {
    const slot = document.querySelector("[data-footer]");
    if (!slot) return;
    const year = new Date().getFullYear();
    slot.outerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__grid">
            <div class="footer__col">
              <a class="brand" href="index.html">${LOGO}<span>Richmarc</span></a>
              <p class="body-6 text-2" style="max-width:320px;margin-top:var(--sp-200)">
                Luxury homes, designed and built in house. Buy one ready to move into or build one around the way you live.
              </p>
            </div>
            <div class="footer__col">
              <h3 class="caption-3 mono">Explore</h3>
              <a class="body-6" href="listings.html">Available homes</a>
              <a class="body-6" href="build.html">Custom build</a>
              <a class="body-6" href="index.html#process">Our process</a>
              <a class="body-6" href="index.html#faq">Questions</a>
            </div>
            <div class="footer__col">
              <h3 class="caption-3 mono">Studio</h3>
              <a class="body-6" href="contact.html">Book a consultation</a>
              <a class="body-6" href="mailto:hello@richmarchomes.com">hello@richmarchomes.com</a>
              <a class="body-6" href="tel:+10000000000">{{phone number}}</a>
            </div>
            <div class="footer__col">
              <h3 class="caption-3 mono">Follow</h3>
              <a class="body-6" href="https://www.instagram.com/" rel="noopener" target="_blank">Instagram</a>
              <a class="body-6" href="https://www.linkedin.com/" rel="noopener" target="_blank">LinkedIn</a>
              <a class="body-6" href="https://www.pinterest.com/" rel="noopener" target="_blank">Pinterest</a>
            </div>
          </div>
          <div class="footer__wordmark" aria-hidden="true">Richmarc</div>
          <div class="footer__bottom caption-5">
            <span>© ${year} Richmarc Homes. All rights reserved.</span>
            <div class="footer__legal">
              <a href="privacy.html">Privacy policy</a>
              <a href="terms.html">Terms</a>
              <button type="button" class="caption-5" data-cookie-open style="color:inherit">Cookie settings</button>
            </div>
          </div>
        </div>
      </footer>
      <div class="cookie" role="dialog" aria-live="polite" aria-label="Cookie consent" data-cookie>
        <p class="body-6 text-2">We use essential cookies to run this site. With your permission we also use analytics cookies to understand which homes people view.</p>
        <div class="cookie__actions">
          <button class="btn btn--light button-sm" type="button" data-cookie-choice="all">Accept analytics</button>
          <button class="btn btn--ghost button-sm" type="button" data-cookie-choice="essential">Essential only</button>
        </div>
      </div>`;
  }

  renderHeader();
  renderFooter();

  /* ---------------------------------------------------------------------
     Navigation: mobile menu + hide on scroll down
     --------------------------------------------------------------------- */
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    document.documentElement.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    const items = menu.querySelectorAll("li");
    const step = Math.min(60, 400 / Math.max(items.length, 1));
    items.forEach((li, i) => {
      li.style.transitionDelay = open ? `${120 + i * step}ms` : "0ms";
    });
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(!document.documentElement.classList.contains("nav-open")));
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.documentElement.classList.contains("nav-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const open = document.documentElement.classList.contains("nav-open");
          nav.classList.toggle("is-hidden", !open && y > 240 && y > lastY + 4);
          if (y < lastY - 4 || y < 240) nav.classList.remove("is-hidden");
          lastY = y;
          ticking = false;
        });
      },
      { passive: true }
    );
    nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));
  }

  /* ---------------------------------------------------------------------
     Scroll reveals (once)
     --------------------------------------------------------------------- */
  function observeReveals(root = document) {
    const els = root.querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
  }
  observeReveals();

  /* ---------------------------------------------------------------------
     Tagline reveal: words light up one at a time as they cross a line
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-tagline]").forEach((el) => {
    const accentWords = (el.dataset.accent || "").split(",").map((w) => w.trim().toLowerCase());
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines
      .map((line) =>
        line
          .trim()
          .split(/\s+/)
          .map((w) => {
            const clean = w.replace(/[^\w]/g, "").toLowerCase();
            const cls = accentWords.includes(clean) ? "word is-accent" : "word";
            return `<span class="${cls}">${w}</span>`;
          })
          .join(" ")
      )
      .join("<br>");

    const words = [...el.querySelectorAll(".word")];
    if (reduceMotion) {
      words.forEach((w) => w.classList.add("is-lit"));
      return;
    }

    let ticking = false;
    const update = () => {
      const trigger = window.innerHeight * 0.62;
      words.forEach((w) => {
        const r = w.getBoundingClientRect();
        if (r.top + r.height / 2 < trigger) w.classList.add("is-lit");
        else w.classList.remove("is-lit");
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  });

  /* ---------------------------------------------------------------------
     Count up numbers
     --------------------------------------------------------------------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = (target * ease(t)).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCounters(root = document) {
    const counters = root.querySelectorAll("[data-count]:not([data-counted])");
    counters.forEach((c) => c.setAttribute("data-counted", ""));
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            countUp(e.target);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.6 }
    );
    counters.forEach((c) => io.observe(c));
  }
  initCounters();

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  function initFaq(root = document) {
    root.querySelectorAll(".faq__q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq__item");
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------------------------------------------------------------------
     Cookie consent (stored per browser, safe if storage is blocked)
     --------------------------------------------------------------------- */
  const cookie = document.querySelector("[data-cookie]");
  const store = {
    get(k) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ }
    }
  };

  if (cookie) {
    if (!store.get("rm-consent")) setTimeout(() => cookie.classList.add("is-visible"), 1200);
    cookie.addEventListener("click", (e) => {
      const choice = e.target.closest("[data-cookie-choice]");
      if (!choice) return;
      store.set("rm-consent", choice.dataset.cookieChoice);
      cookie.classList.remove("is-visible");
    });
    document.querySelectorAll("[data-cookie-open]").forEach((b) =>
      b.addEventListener("click", () => cookie.classList.add("is-visible"))
    );
  }

  /* ---------------------------------------------------------------------
     Image fallback: keep layout composed if a photo fails to load
     --------------------------------------------------------------------- */
  function guardImages(root = document) {
    root.querySelectorAll("img").forEach((im) => {
      im.addEventListener(
        "error",
        () => {
          im.style.opacity = "0";
          im.parentElement && im.parentElement.classList.add("img-missing");
        },
        { once: true }
      );
    });
  }
  guardImages();

  /* ---------------------------------------------------------------------
     Form validation (inline, specific, no alerts)
     --------------------------------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(field) {
    const wrap = field.closest(".field");
    if (!wrap) return true;
    const err = wrap.querySelector(".field__error");
    const v = field.value.trim();
    let msg = "";
    if (field.required && !v)
      msg = field.dataset.requiredMsg || `${wrap.querySelector("label").textContent.replace("*", "").trim()} is required.`;
    else if (field.type === "email" && v && !EMAIL_RE.test(v)) msg = "Enter an email address like name@example.com.";
    else if (field.type === "tel" && v && v.replace(/\D/g, "").length < 7) msg = "Enter a phone number with at least 7 digits.";
    wrap.classList.toggle("has-error", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  }

  function initForms(root = document) {
  root.querySelectorAll("form[data-validate]:not([novalidate])").forEach((form) => {
    form.setAttribute("novalidate", "");
    const fields = form.querySelectorAll("input, select, textarea");
    fields.forEach((f) => {
      f.addEventListener("blur", () => validateField(f));
      f.addEventListener("input", () => {
        if (f.closest(".field.has-error")) validateField(f);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".form__status");
      let firstBad = null;
      fields.forEach((f) => {
        if (!validateField(f) && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        if (status) {
          status.className = "form__status is-visible is-error body-6";
          status.innerHTML = `<i class="ph-light ph-warning-circle"></i><span>Some details are missing. Check the highlighted fields and send again.</span>`;
        }
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      btn.classList.add("is-loading");
      btn.setAttribute("aria-busy", "true");

      /* Demo submit. Replace with a real endpoint (Formspree, Netlify Forms, your CRM). */
      setTimeout(() => {
        btn.classList.remove("is-loading");
        btn.removeAttribute("aria-busy");
        const name = (form.querySelector('[name="name"]') || {}).value || "";
        const email = (form.querySelector('[name="email"]') || {}).value || "";
        if (status) {
          status.className = "form__status is-visible is-success body-6";
          status.innerHTML = `<i class="ph-light ph-check-circle"></i><span>Thank you${name ? ", " + name.split(" ")[0] : ""}. Your request is with our studio and a confirmation is on its way to ${email}. We reply within one business day.</span>`;
        }
        form.reset();
        form.dispatchEvent(new Event("rm:sent"));
      }, 1100);
    });
  });
  }
  initForms();

  /* Expose helpers for page scripts that render content later */
  window.RM = { observeReveals, initFaq, guardImages, initCounters, initForms, reduceMotion };

  initFaq();
})();
