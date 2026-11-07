/* ==========================================================================
   Hero canvas — a slowly rotating wireframe residence.
   Pure canvas 2D with a tiny perspective projection. No dependencies.
   ========================================================================== */

(function () {
  const canvas = document.querySelector("[data-hero-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WHITE = "255,255,255";
  const GOLD = "201,169,110";

  /* ---- Geometry helpers ---- */
  const edges = [];
  function box(x, y, z, w, h, d, color = WHITE, weight = 1) {
    const v = [
      [x, y, z], [x + w, y, z], [x + w, y, z + d], [x, y, z + d],
      [x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + d], [x, y + h, z + d]
    ];
    const idx = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    idx.forEach(([a, b]) => edges.push({ a: v[a], b: v[b], color, weight }));
  }
  function line(a, b, color = WHITE, weight = 1) {
    edges.push({ a, b, color, weight });
  }

  /* ---- A modern two storey residence (units are arbitrary) ---- */
  // Ground floor volume
  box(-3, 0, -1.6, 5.2, 1.4, 3.2);
  // Upper floor, cantilevered out to the right
  box(-1.6, 1.4, -1.4, 5.6, 1.3, 2.8);
  // Roof slab (thin, overhanging)
  box(-1.9, 2.7, -1.7, 6.2, 0.12, 3.4, GOLD, 1.2);
  // Ground slab / terrace
  box(-4, -0.08, -2.4, 9, 0.08, 4.8, WHITE, 0.6);
  // Pool
  box(1.2, -0.08, 1.7, 3.4, 0.02, 1.1, GOLD, 1);
  // Glazing mullions on the ground floor front
  for (let i = 0; i <= 6; i++) {
    const x = -3 + (5.2 / 6) * i;
    line([x, 0, 1.6], [x, 1.4, 1.6], WHITE, 0.5);
  }
  // Glazing ribbon on the upper floor front
  line([-1.6, 1.85, 1.4], [4, 1.85, 1.4], WHITE, 0.5);
  line([-1.6, 2.35, 1.4], [4, 2.35, 1.4], WHITE, 0.5);
  for (let i = 0; i <= 8; i++) {
    const x = -1.6 + (5.6 / 8) * i;
    line([x, 1.85, 1.4], [x, 2.35, 1.4], WHITE, 0.4);
  }
  // Support column under the cantilever
  line([3.6, 0, 1.2], [3.6, 1.4, 1.2], GOLD, 1);
  line([3.6, 0, -1.2], [3.6, 1.4, -1.2], GOLD, 1);
  // Floor grid
  for (let i = -6; i <= 6; i++) {
    line([i, -0.1, -4], [i, -0.1, 4], WHITE, 0.15);
  }
  for (let j = -4; j <= 4; j++) {
    line([-6, -0.1, j], [6, -0.1, j], WHITE, 0.15);
  }

  /* ---- Floating particles ---- */
  const particles = Array.from({ length: 60 }, () => ({
    x: (Math.random() - 0.5) * 14,
    y: Math.random() * 5,
    z: (Math.random() - 0.5) * 10,
    s: Math.random() * 0.004 + 0.001
  }));

  /* ---- State ---- */
  let w = 0, h = 0, dpr = 1;
  let rotY = -0.65;
  let targetTiltX = 0, targetTiltY = 0, tiltX = 0, tiltY = 0;
  let build = reduce ? 1 : 0; // draw-in progress
  let visible = true;
  let raf = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(p, cosY, sinY, cosX, sinX) {
    // rotate Y
    let x = p[0] * cosY - p[2] * sinY;
    let z = p[0] * sinY + p[2] * cosY;
    let y = p[1] - 1.2;
    // rotate X
    const y2 = y * cosX - z * sinX;
    const z2 = y * sinX + z * cosX;
    const camera = 11;
    const scale = Math.min(w, h * 1.3) * 0.088;
    const f = camera / (camera + z2);
    const cy = w < 600 ? 0.66 : 0.56;
    return { x: w / 2 + x * scale * f, y: h * cy - y2 * scale * f, z: z2, f };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    if (!reduce) rotY += 0.0016;
    tiltX += (targetTiltX - tiltX) * 0.05;
    tiltY += (targetTiltY - tiltY) * 0.05;
    if (build < 1) build = Math.min(1, build + 0.008);

    const ry = rotY + tiltY;
    const rx = 0.32 + tiltX;
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosX = Math.cos(rx), sinX = Math.sin(rx);

    const eased = 1 - Math.pow(1 - build, 3);
    const count = Math.floor(edges.length * eased);

    for (let i = 0; i < count; i++) {
      const e = edges[i];
      const a = project(e.a, cosY, sinY, cosX, sinX);
      const b = project(e.b, cosY, sinY, cosX, sinX);
      const depth = Math.max(0.12, Math.min(1, 0.75 - (a.z + b.z) / 24));
      ctx.strokeStyle = `rgba(${e.color},${(e.color === GOLD ? 0.85 : 0.55) * depth})`;
      ctx.lineWidth = e.weight;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // vertex nodes on the roof slab corners
    if (build >= 1) {
      const t = performance.now() / 1000;
      [[-1.9, 2.82, -1.7], [4.3, 2.82, -1.7], [4.3, 2.82, 1.7], [-1.9, 2.82, 1.7]].forEach((p, i) => {
        const q = project(p, cosY, sinY, cosX, sinX);
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i);
        ctx.fillStyle = `rgba(${GOLD},${0.4 + pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    particles.forEach((p) => {
      if (!reduce) {
        p.y += p.s * 6;
        if (p.y > 5) p.y = 0;
      }
      const q = project([p.x, p.y, p.z], cosY, sinY, cosX, sinX);
      ctx.fillStyle = `rgba(${WHITE},${0.25 * q.f})`;
      ctx.fillRect(q.x, q.y, 1.2, 1.2);
    });

    if (visible && !reduce) raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduce) frame();
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * 0.18;
    },
    { passive: true }
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !reduce) start();
    }).observe(canvas);
  }

  resize();
  start();
})();
