// Zariva.AI cursor trail — a chain of dots that follows the pointer, lime fading to orange.
// Mouse and trackpad only; skipped on touch screens and when reduced motion is on.

/** Starts the cursor trail. Returns a cleanup function. */
export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const COUNT = 15;
  const LIME = [121, 217, 0], ORANGE = [255, 145, 0];
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '9999' });
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1, alive = true;
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; };
  resize();

  const pts = Array.from({ length: COUNT }, () => ({ x: -100, y: -100 }));
  let mx = -100, my = -100, shown = false, hover = 0, hoverTarget = 0, press = 0, running = false;
  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#0d240d';
  let inkColor = ink();
  const themeObs = new MutationObserver(() => inkColor = ink());
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const onMove = e => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    mx = e.clientX; my = e.clientY;
    if (!shown) { pts.forEach(p => { p.x = mx; p.y = my; }); shown = true; }
    hoverTarget = e.target.closest?.('a, button, [role="tab"], [role="button"], input, select, textarea, label, .node, .swiper-slide') ? 1 : 0;
    start();
  };
  const hide = () => { shown = false; start(); };
  const onDown = () => { press = 1; start(); };
  addEventListener('resize', resize);
  addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', hide);
  addEventListener('blur', hide);
  addEventListener('pointerdown', onDown);

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  function start() { if (!running && alive) { running = true; requestAnimationFrame(frame); } }
  function frame() {
    if (!alive) return;
    // head chases the pointer; every dot chases the one ahead of it
    pts[0].x += (mx - pts[0].x) * .42; pts[0].y += (my - pts[0].y) * .42;
    for (let i = 1; i < COUNT; i++) { pts[i].x += (pts[i - 1].x - pts[i].x) * .38; pts[i].y += (pts[i - 1].y - pts[i].y) * .38; }
    hover += (hoverTarget - hover) * .2;
    press *= .86;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (shown) {
      for (let i = COUNT - 1; i >= 1; i--) {
        const t = i / (COUNT - 1), c = mix(LIME, ORANGE, t);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(1 - t) * .85})`;
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 5.5 * (1 - t) + 1, 0, 7); ctx.fill();
      }
      // head: a dot that opens into a ring over anything clickable
      const r = 4 + hover * 14 - press * 3;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(121,217,0,${.35 + hover * .6})`;
      ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, Math.max(2, r + 4), 0, 7); ctx.stroke();
      ctx.fillStyle = inkColor;
      ctx.globalAlpha = 1 - hover * .65;
      ctx.beginPath(); ctx.arc(mx, my, 3.2, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // stop drawing once everything has settled on the pointer
    const tail = pts[COUNT - 1], settled = Math.hypot(tail.x - mx, tail.y - my) < .3 && Math.abs(hover - hoverTarget) < .01 && press < .01;
    if (settled) running = false; // the last frame stays on screen until the pointer moves again
    else requestAnimationFrame(frame);
  }

  return () => {
    alive = false;
    themeObs.disconnect();
    removeEventListener('resize', resize);
    removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', hide);
    removeEventListener('blur', hide);
    removeEventListener('pointerdown', onDown);
    canvas.remove();
  };
}
