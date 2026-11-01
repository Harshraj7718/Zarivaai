// Zariva.AI global reach — a wireframe dotted globe (d3 orthographic projection on canvas).
// Ocean disc, graticule, land outlines and halftone land dots, plus Zariva's city markers and routes.
// Drag to rotate, Ctrl/⌘ + scroll (or pinch, or the +/− buttons) to zoom. Regions in the side list spin it into place.
import * as d3 from 'd3';
import { feature as topoFeature } from 'topojson-client';

/** Starts the globe on a canvas. Returns { focus(regionId), destroy() }. */
export function initGlobe(canvas, { zoomIn, zoomOut } = {}) {
  let alive = true;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Regions, cities and routes ---------- */
  const REGIONS = [
    { id: 'usa', lat: 39, lon: -96, cities: [['New York', 40.7, -74], ['San Francisco', 37.8, -122.4], ['Austin', 30.3, -97.7], ['Chicago', 41.9, -87.6], ['Toronto', 43.65, -79.4]] },
    { id: 'eu', lat: 50, lon: 9, cities: [['London', 51.5, -.1], ['Berlin', 52.5, 13.4], ['Amsterdam', 52.4, 4.9], ['Paris', 48.9, 2.35], ['Stockholm', 59.3, 18.1]] },
    { id: 'me', lat: 25, lon: 50, cities: [['Dubai', 25.2, 55.3], ['Riyadh', 24.7, 46.7], ['Doha', 25.3, 51.5]] },
    { id: 'apac', lat: 12, lon: 95, cities: [['Bengaluru', 12.97, 77.6], ['Mumbai', 19.1, 72.9], ['Singapore', 1.35, 103.8], ['Sydney', -33.9, 151.2]] },
    { id: 'world', lat: 5, lon: 10, cities: [['São Paulo', -23.5, -46.6], ['Johannesburg', -26.2, 28], ['Lagos', 6.5, 3.4]] }
  ];
  const ARCS = [['New York', 'London'], ['San Francisco', 'Bengaluru'], ['London', 'Dubai'], ['Dubai', 'Bengaluru'], ['Bengaluru', 'Singapore'], ['Singapore', 'Sydney'], ['Berlin', 'Toronto'], ['Austin', 'São Paulo'], ['Paris', 'Lagos'], ['Mumbai', 'Johannesburg']];
  const CITY = {};
  REGIONS.forEach(r => r.cities.forEach(([name, lat, lon]) => CITY[name] = { name, region: r.id, ll: [lon, lat] }));
  const ROUTES = ARCS.map(([a, b]) => ({ a: CITY[a], b: CITY[b], interp: d3.geoInterpolate(CITY[a].ll, CITY[b].ll) }));

  /* ---------- Colours (brand) ---------- */
  const OCEAN = '#002200';
  let C = {};
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
    C = { line: '#F1F1E9', dot: 'rgba(241,241,233,.55)', lime: v('--lime') || '#79D900', orange: v('--orange') || '#FF9100', paper: v('--paper') || '#fff', ink: v('--ink') || '#0d240d' };
  };
  readColors();
  const themeObs = new MutationObserver(readColors);
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Projection ---------- */
  let W = 0, H = 0, R = 0, dpr = 1, zoom = 1;
  const projection = d3.geoOrthographic().clipAngle(90).precision(.4);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const rotation = [96, -22, 0]; // start over the Americas
  projection.rotate(rotation);

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    R = Math.min(W, H) / 2.35;
    projection.translate([W / 2, H / 2]).scale(R * zoom);
    dirty = true;
  }

  /* ---------- Land: outlines + halftone dots ---------- */
  let land = null, dots = [];
  const inRing = ([x, y], ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const inPolygon = (pt, rings) => inRing(pt, rings[0]) && !rings.slice(1).some(h => inRing(pt, h));
  function dotsFor(feature, step) {
    const g = feature.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const out = [];
    polys.forEach(rings => {
      let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
      rings[0].forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
      // align to a global grid so neighbouring polygons share the same halftone pattern
      for (let lat = Math.ceil(y0 / step) * step; lat <= y1; lat += step) {
        const s = step / Math.max(.25, Math.cos(lat * Math.PI / 180));
        for (let lng = Math.ceil(x0 / s) * s; lng <= x1; lng += s) if (inPolygon([lng, lat], rings)) out.push([lng, lat]);
      }
    });
    return out;
  }
  async function loadLand() {
    try {
      const topo = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
      const fc = topoFeature(topo, topo.objects.land);
      land = fc.type === 'FeatureCollection' ? fc : { type: 'FeatureCollection', features: [fc] };
      dots = land.features.flatMap(f => dotsFor(f, 1.35)).filter(([, lat]) => lat > -62);
    } catch (e) {
      land = null; dots = []; // the ocean, graticule and markers still draw
    }
    dirty = true;
  }

  /* ---------- Render ---------- */
  let active = 'usa', dirty = true;
  const placed = [];
  const hits = b => placed.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  const visible = ll => d3.geoDistance(ll, [-rotation[0], -rotation[1]]) < Math.PI / 2 - .02;

  function render(now) {
    const sc = projection.scale(), k = sc / R, [cx, cy] = projection.translate();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ocean + rim
    ctx.beginPath(); ctx.arc(cx, cy, sc, 0, Math.PI * 2);
    ctx.fillStyle = OCEAN; ctx.fill();
    ctx.lineWidth = 2 * Math.min(k, 1.6); ctx.strokeStyle = C.line; ctx.stroke();

    // graticule
    ctx.beginPath(); path(graticule);
    ctx.lineWidth = .8; ctx.strokeStyle = C.line; ctx.globalAlpha = .18; ctx.stroke(); ctx.globalAlpha = 1;

    if (land) {
      // land outlines
      ctx.beginPath(); land.features.forEach(f => path(f));
      ctx.lineWidth = Math.min(1.2, .9 * k); ctx.strokeStyle = C.line; ctx.globalAlpha = .85; ctx.stroke(); ctx.globalAlpha = 1;
      // halftone dots on the visible hemisphere
      ctx.fillStyle = C.dot;
      const r = 1.15 * Math.min(k, 2);
      const center = [-rotation[0], -rotation[1]];
      ctx.beginPath();
      for (const d of dots) {
        if (d3.geoDistance(d, center) > Math.PI / 2) continue;
        const p = projection(d);
        ctx.moveTo(p[0] + r, p[1]); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // routes: faint full arc, plus a bright travelling segment
    ROUTES.forEach((rt, i) => {
      const hi = rt.a.region === active || rt.b.region === active;
      ctx.beginPath(); path({ type: 'LineString', coordinates: [rt.a.ll, rt.b.ll] });
      ctx.lineWidth = hi ? 1.6 : 1; ctx.strokeStyle = C.lime; ctx.globalAlpha = hi ? .75 : .3; ctx.stroke(); ctx.globalAlpha = 1;
      if (!reduce) {
        const t = ((now / 2800) + i * .17) % 1, t0 = Math.max(0, t - .12);
        const seg = d3.range(0, 9).map(j => rt.interp(t0 + (t - t0) * j / 8));
        ctx.beginPath(); path({ type: 'LineString', coordinates: seg });
        ctx.lineWidth = 2.4; ctx.strokeStyle = C.orange; ctx.stroke();
      }
    });

    // city markers
    placed.length = 0;
    const pulse = reduce ? .4 : (now / 1600) % 1, fs = Math.max(11, Math.min(14, R / 20));
    ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`;
    for (const name in CITY) {
      const c = CITY[name];
      if (!visible(c.ll)) continue;
      const [x, y] = projection(c.ll), on = c.region === active;
      const col = on ? C.orange : C.lime;
      ctx.strokeStyle = col; ctx.globalAlpha = (1 - pulse) * .9; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, y, 3 + pulse * (on ? 14 : 9), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = OCEAN; ctx.beginPath(); ctx.arc(x, y, on ? 5.5 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, on ? 3.8 : 2.6, 0, Math.PI * 2); ctx.fill();
      if (on) {
        const bw = ctx.measureText(name).width + 12, bh = fs + 9;
        const box = [[9, -bh - 4], [9, 6], [-bw - 9, -bh - 4], [-bw - 9, 6]].map(([dx, dy]) => ({ x: x + dx, y: y + dy, w: bw, h: bh })).find(b => !hits(b));
        if (box) {
          placed.push(box);
          ctx.fillStyle = C.paper; ctx.fillRect(box.x, box.y, bw, bh);
          ctx.strokeStyle = C.orange; ctx.lineWidth = 1; ctx.strokeRect(box.x + .5, box.y + .5, bw - 1, bh - 1);
          ctx.fillStyle = C.ink; ctx.fillText(name, box.x + 6, box.y + bh - 6);
        }
      }
    }
  }

  /* ---------- Motion: auto-rotate, focus tween, drag, zoom ---------- */
  let dragging = false, lastInteract = -1e9, tween = null, inView = true, last = performance.now();
  const setRotation = (l, p) => { rotation[0] = l; rotation[1] = Math.max(-80, Math.min(80, p)); projection.rotate(rotation); dirty = true; };

  function frame(now) {
    if (!alive) return;
    requestAnimationFrame(frame);
    const dt = Math.min(50, now - last); last = now;
    if (!inView || document.hidden) return;
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur), e = d3.easeCubicInOut(t);
      setRotation(tween.from[0] + tween.dl * e, tween.from[1] + (tween.to[1] - tween.from[1]) * e);
      if (t >= 1) tween = null;
    } else if (!dragging && now - lastInteract > 2200 && !reduce) {
      setRotation(rotation[0] + dt * .006, rotation[1]);
    }
    render(now); // markers pulse and routes travel every frame
  }

  let start = null;
  canvas.addEventListener('pointerdown', e => {
    dragging = true; tween = null;
    start = { x: e.clientX, y: e.clientY, r: [rotation[0], rotation[1]] };
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('grab');
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const s = 75 / projection.scale(); // keep drag speed natural at any zoom
    setRotation(start.r[0] + (e.clientX - start.x) * s, start.r[1] - (e.clientY - start.y) * s);
    lastInteract = performance.now();
    if (reduce) render(lastInteract);
  });
  const endDrag = () => { dragging = false; lastInteract = performance.now(); canvas.classList.remove('grab'); };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

  const setZoom = z => { zoom = Math.max(.6, Math.min(2.6, z)); projection.scale(R * zoom); lastInteract = performance.now(); if (reduce) render(lastInteract); };
  // only zoom on Ctrl/⌘ + scroll (and trackpad pinch), so the page still scrolls normally over the globe
  canvas.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(zoom * (e.deltaY > 0 ? .9 : 1.1)); }, { passive: false });
  const zin = () => setZoom(zoom * 1.25), zout = () => setZoom(zoom / 1.25);
  zoomIn?.addEventListener('click', zin);
  zoomOut?.addEventListener('click', zout);

  const ro = new ResizeObserver(() => { resize(); if (reduce) render(performance.now()); });
  ro.observe(canvas);
  const io = new IntersectionObserver(es => es.forEach(e => inView = e.isIntersecting));
  io.observe(canvas);

  const api = {
    focus(id) {
      const r = REGIONS.find(x => x.id === id); if (!r) return;
      active = id;
      const to = [-r.lon, -r.lat * .75];
      const dl = ((to[0] - rotation[0]) % 360 + 540) % 360 - 180; // shortest way round
      tween = { from: [rotation[0], rotation[1]], to, dl, t0: performance.now(), dur: reduce ? 1 : 1100 };
      lastInteract = performance.now();
      if (reduce) { setRotation(to[0], to[1]); tween = null; render(performance.now()); }
    },
    destroy() {
      alive = false;
      ro.disconnect(); io.disconnect(); themeObs.disconnect();
      zoomIn?.removeEventListener('click', zin); zoomOut?.removeEventListener('click', zout);
    }
  };

  resize();
  loadLand().then(() => alive && reduce && render(performance.now()));
  requestAnimationFrame(frame);
  return api;
}
