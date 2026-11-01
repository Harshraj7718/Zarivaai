import { ZARIVA_MAP } from './company-data';

/** Starts the company map inside the page. Returns a cleanup function. */
export function initCompanyMap() {
  let alive = true;
  const DATA = ZARIVA_MAP;
  const DEPTS = DATA.departments;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = $('#map'), gNodes = $('#nodes'), gEdges = $('#edges'), gPulses = $('#pulses'), stage = $('.stage'), side = $('#side');
  const DEPT_GLYPH = { saas: '</>', ai: '✦', growth: '↗', crm: '⇄', web: '▢', ops: '◎' };
  const MODE_TEXT = { runs: 'Runs and reports', approve: 'Person approves', person: 'Person leads' };
  const MODE_LONG = { runs: 'An AI agent runs it and reports back.', approve: 'An AI agent drafts it. A person approves.', person: 'A person leads it.' };
  const pad2 = n => String(n).padStart(2, '0');
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.append(e); return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Build graph ---------- */
  const nodes = {}, edges = [];
  const deptTools = DEPTS.map(d => [...new Set(d.jobs.flatMap(j => j.tools))]);

  function addNode(id, type, o) {
    const n = { id, type, r: 8, glyph: '', person: false, x: 0, y: 0, ...o };
    const g = el('g', { class: `node t-${type}${n.person ? ' person' : ''}`, tabindex: -1, role: 'button', 'aria-label': `${n.name}, ${n.kind}` }, gNodes);
    if (type === 'hub') {
      const o1 = el('g', { class: 'orbit' }, g), o2 = el('g', { class: 'orbit r2' }, g);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; el('circle', { cx: Math.cos(a) * 36, cy: Math.sin(a) * 36, r: i % 3 ? 1.2 : 2, class: i % 4 ? '' : 'o' }, o1); }
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + .2; el('circle', { cx: Math.cos(a) * 46, cy: Math.sin(a) * 46, r: i % 5 ? 1 : 1.8, class: i % 3 ? '' : 'o' }, o2); }
    }
    el('circle', { class: 'ring', r: n.r }, g);
    const gl = el('text', { class: 'glyph', y: type === 'hub' ? -1 : 0 }, g); gl.textContent = n.glyph;
    if (type === 'hub') el('circle', { class: 'hubdot', cx: 9, cy: -12, r: 3.5 }, g);
    if (type === 'job') { gl.remove(); el('rect', { x: -2.5, y: -2.5, width: 5, height: 5, fill: 'currentColor', class: 'glyph' }, g); }
    n.lbl = el('text', { class: 'lbl' }, g); n.lbl.textContent = n.label || n.name;
    n.g = g;
    g.addEventListener('click', () => onNodeClick(n));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(n); } });
    g.addEventListener('pointerenter', () => onHover(n, true));
    g.addEventListener('pointerleave', () => onHover(n, false));
    g.addEventListener('focus', () => onHover(n, true));
    g.addEventListener('blur', () => onHover(n, false));
    nodes[id] = n;
    return n;
  }
  const addEdge = (key, a, b, kind, person) => {
    const e = { key, a, b, kind, el: el('path', { class: `edge${person ? ' person' : ''}` }, gEdges) };
    edges.push(e); edges[key] = e; return e;
  };

  addNode('hub', 'hub', { r: 25, glyph: 'z', name: 'Company memory', label: 'COMPANY MEMORY', kind: 'Shared by every job' });
  DEPTS.forEach((d, di) => {
    addNode(`d:${di}`, 'dept', { d: di, r: 18, glyph: DEPT_GLYPH[d.id] || '•', name: d.name, kind: `Department · ${d.owner}` });
    addNode(`o:${di}`, 'owner', { d: di, r: 12, glyph: '●', person: true, name: d.owner, label: `${d.owner} owns ${d.name}`, kind: `Owner · ${d.name}` });
    addEdge(`hd:${di}`, 'hub', `d:${di}`, 'hd');
    addEdge(`od:${di}`, `o:${di}`, `d:${di}`, 'od', true);
    deptTools[di].forEach(t => addNode(`t:${di}:${t}`, 'tool', { d: di, r: 7, glyph: '·', name: t, kind: `Tool · ${DATA.tools[t] || ''}` }));
    d.jobs.forEach((j, k) => {
      const person = j.worker.mode === 'person';
      addNode(`j:${di}:${k}`, 'job', { d: di, k, r: 8, name: j.title, label: j.short, kind: `Job · ${d.name}` });
      addNode(`w:${di}:${k}`, 'worker', { d: di, k, r: 10, glyph: person ? '●' : 'AI', person, name: j.worker.name, kind: `${person ? 'Person' : 'AI agent'} · ${MODE_TEXT[j.worker.mode]}` });
      addEdge(`dj:${di}:${k}`, `d:${di}`, `j:${di}:${k}`, 'dj');
      addEdge(`jw:${di}:${k}`, `j:${di}:${k}`, `w:${di}:${k}`, 'jw', person);
      addEdge(`jo:${di}:${k}`, `j:${di}:${k}`, `o:${di}`, 'jo');
      j.tools.forEach(t => addEdge(`wt:${di}:${k}:${t}`, `w:${di}:${k}`, `t:${di}:${t}`, 'wt'));
    });
  });
  // departments and the core draw above everything so their labels stay readable
  Object.values(nodes).filter(n => n.type === 'dept').forEach(n => gNodes.append(n.g));
  gNodes.append(nodes.hub.g);
  // tiny glyph sizing
  Object.values(nodes).forEach(n => { if (n.type === 'worker' && !n.person) n.g.querySelector('.glyph').style.fontSize = '8px'; if (n.type === 'dept' && n.glyph.length > 1) n.g.querySelector('.glyph').style.fontSize = '9px'; });

  /* ---------- Brain silhouette (side view, frontal lobe on the right) ---------- */
  const CEREBRUM = [[330, 40], [352, -25], [338, -110], [290, -182], [205, -236], [92, -262], [-28, -266], [-140, -242], [-240, -192], [-312, -122], [-348, -32], [-342, 58], [-302, 118], [-232, 142], [-150, 130], [-88, 150], [-8, 166], [92, 160], [182, 140], [252, 116], [302, 84]];
  const CEREBELLUM = { cx: -190, cy: 182, rx: 108, ry: 54 };
  const STEM = [[-112, 140], [-58, 140], [-38, 292], [-82, 298]];
  const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const inBrain = (x, y) => inPoly(x, y, CEREBRUM) || ((x - CEREBELLUM.cx) / CEREBELLUM.rx) ** 2 + ((y - CEREBELLUM.cy) / CEREBELLUM.ry) ** 2 <= 1 || inPoly(x, y, STEM);
  // pull a point toward an anchor until it sits inside the brain
  const clampIn = ([x, y], [ax, ay]) => { for (let t = 0; t <= 1; t += .08) { const px = x + (ax - x) * t, py = y + (ay - y) * t; if (inBrain(px, py)) return [px, py]; } return [ax, ay]; };
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Lobe for each department (index order matches DEPTS) and the core
  const LOBES = [[222, -40], [66, -172], [-128, -160], [-252, -28], [70, 74], [-190, 180]];
  const LOBE_SCALE = [1, 1, 1, .95, .9, .62];
  const CORE = [-18, -26];

  function buildMesh() {
    const g = $('#mesh'), pts = [];
    // contour neurons along the outline
    const rim = (P, step) => { for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step)); for (let k = 0; k < n; k++) pts.push({ x: x1 + (x2 - x1) * k / n + (rnd() - .5) * 6, y: y1 + (y2 - y1) * k / n + (rnd() - .5) * 6, rim: true }); } };
    rim(CEREBRUM, 26);
    for (let a = 0; a < 360; a += 16) pts.push({ x: CEREBELLUM.cx + Math.cos(rad(a)) * CEREBELLUM.rx, y: CEREBELLUM.cy + Math.sin(rad(a)) * CEREBELLUM.ry, rim: true });
    // interior neurons, denser toward the frontal lobe like a real scan
    let tries = 0;
    while (pts.length < 380 && tries++ < 20000) {
      const x = -350 + rnd() * 705, y = -270 + rnd() * 570;
      if (!inBrain(x, y)) continue;
      const dense = Math.exp(-(((x - 150) / 180) ** 2 + ((y + 60) / 150) ** 2));
      if (rnd() > .35 + .65 * dense) continue;
      pts.push({ x, y });
    }
    // connect each neuron to its nearest neighbours
    const seen = new Set(), frag = document.createDocumentFragment();
    pts.forEach((p, i) => {
      const near = pts.map((q, j) => [j, Math.hypot(q.x - p.x, q.y - p.y)]).filter(([j, d]) => j !== i && d < 78).sort((a, b) => a[1] - b[1]).slice(0, p.rim ? 2 : 3);
      near.forEach(([j]) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`; if (seen.has(k)) return; seen.add(k);
        const q = pts[j], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
        if (!inBrain(mx, my)) return; // keep lines inside the silhouette
        frag.append(el('line', { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: q.x.toFixed(1), y2: q.y.toFixed(1), class: p.rim && q.rim ? 'rim' : '' }));
      });
    });
    pts.forEach((p, i) => {
      const r = rnd(), big = r > .9;
      const c = el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: big ? 2.4 : 1.3 + rnd() * .6, class: `${big ? 'big' : ''} ${r < .06 ? 'lime' : ''} ${r > .7 && r < .85 ? 'tw' : ''}` });
      if (r > .7) c.style.animationDelay = `${(rnd() * 3).toFixed(2)}s`;
      frag.append(c);
    });
    // a few "firing" neurons
    for (let i = 0; i < 14; i++) { const p = pts[Math.floor(rnd() * pts.length)]; const s = el('circle', { cx: p.x, cy: p.y, r: 1, class: 'spark' }); s.style.animationDelay = `${(rnd() * 2.6).toFixed(2)}s`; s.style.animationDuration = `${(2 + rnd() * 2).toFixed(2)}s`; frag.append(s); }
    g.append(frag);
  }

  /* ---------- Layouts ---------- */
  const rad = a => a * Math.PI / 180;
  const polar = (deg, r) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];

  function layout(view) {
    const L = { pos: {}, cls: {}, lbl: {}, edge: {}, box: null, pulses: [] };
    const set = (id, p, cls = '', lbl = null) => { L.pos[id] = p; L.cls[id] = cls; L.lbl[id] = lbl; };
    if (view.level === 'company') {
      L.box = { cx: 0, cy: 12, w: 760, h: 620 };
      set('hub', CORE, 'label', 'below');
      DEPTS.forEach((d, di) => {
        const dp = LOBES[di % LOBES.length], s = LOBE_SCALE[di % LOBE_SCALE.length];
        const off = di * 37; // vary each cluster's rotation so lobes don't look stamped
        const at = (deg, r) => clampIn([dp[0] + Math.cos(rad(deg)) * r * s, dp[1] + Math.sin(rad(deg)) * r * s * .82], dp);
        set(`d:${di}`, dp, 'label', 'dept');
        set(`o:${di}`, dp, 'gone');
        const nj = d.jobs.length;
        d.jobs.forEach((j, k) => {
          const a = off + k * 360 / nj;
          set(`j:${di}:${k}`, at(a, 52));
          set(`w:${di}:${k}`, at(a + 14, 92));
        });
        const ts = deptTools[di], m = ts.length;
        ts.forEach((t, i) => set(`t:${di}:${t}`, at(off + 20 + i * 360 / m, 128 + (i % 2 ? 10 : -6))));
        L.edge[`hd:${di}`] = 'show'; L.edge[`od:${di}`] = 'gone';
        d.jobs.forEach((j, k) => {
          L.edge[`dj:${di}:${k}`] = 'show'; L.edge[`jw:${di}:${k}`] = 'show'; L.edge[`jo:${di}:${k}`] = 'gone';
          j.tools.forEach(t => L.edge[`wt:${di}:${k}:${t}`] = 'show');
        });
        L.pulses.push({ e: `hd:${di}`, rev: false, dur: 2600, off: di / 6 });
      });
      return L;
    }
    // department & job views
    const di = view.d, d = DEPTS[di], n = DEPTS.length;
    const prev = (di + n - 1) % n, next = (di + 1) % n;
    L.box = { cx: 0, cy: 0, w: 820, h: 740 }; // extra room at the bottom for the switcher
    const HUB = [0, 220];
    set('hub', HUB, 'label', 'below');
    DEPTS.forEach((dd, x) => {
      if (x === di) return;
      const side = x === prev ? [-310, 175] : x === next ? [310, 175] : null;
      set(`d:${x}`, side || HUB, side ? 'label' : 'gone', 'below');
      const anchor = side || HUB;
      set(`o:${x}`, anchor, 'gone');
      dd.jobs.forEach((j, k) => { set(`j:${x}:${k}`, anchor, 'gone'); set(`w:${x}:${k}`, anchor, 'gone'); });
      deptTools[x].forEach(t => set(`t:${x}:${t}`, anchor, 'gone'));
      L.edge[`hd:${x}`] = side ? 'show' : 'gone'; L.edge[`od:${x}`] = 'gone';
      dd.jobs.forEach((j, k) => { L.edge[`dj:${x}:${k}`] = L.edge[`jw:${x}:${k}`] = L.edge[`jo:${x}:${k}`] = 'gone'; j.tools.forEach(t => L.edge[`wt:${x}:${k}:${t}`] = 'gone'); });
    });
    const job = view.level === 'job' ? view.k : null;
    const jobTools = job != null ? new Set(d.jobs[job].tools) : null;
    set(`d:${di}`, [0, 128], 'label sel', 'right');
    set(`o:${di}`, [0, 30], 'label' + (job != null ? ' hi' : ''), 'right');
    L.edge[`hd:${di}`] = job != null ? 'hi' : 'show';
    L.edge[`od:${di}`] = job != null ? 'hi' : 'show';
    const ts = deptTools[di], m = ts.length;
    ts.forEach((t, i) => {
      const x = m > 1 ? -330 + i * (660 / (m - 1)) : 0;
      const inJob = jobTools ? jobTools.has(t) : false;
      set(`t:${di}:${t}`, [x, -305], 'label' + (jobTools ? (inJob ? ' hi' : ' dim') : ''), 'above');
    });
    d.jobs.forEach((j, k) => {
      const x = -290 + k * 145;
      const on = job === k, dim = job != null && !on;
      set(`w:${di}:${k}`, [x, -190], 'label' + (on ? ' sel' : dim ? ' dim' : ''), 'right');
      set(`j:${di}:${k}`, [x, -88], 'label' + (on ? ' sel' : dim ? ' dim' : ''), 'right');
      L.edge[`dj:${di}:${k}`] = 'gone';
      L.edge[`jw:${di}:${k}`] = on ? 'hi' : dim ? 'dim' : 'show';
      L.edge[`jo:${di}:${k}`] = on ? 'hi dash' : dim ? 'dim dash' : 'dash';
      j.tools.forEach(t => L.edge[`wt:${di}:${k}:${t}`] = on ? 'hi' : dim ? 'dim' : 'show');
      if (job == null) L.pulses.push({ e: `jo:${di}:${k}`, rev: false, dur: 2200, off: k / 5 });
    });
    if (job != null) {
      d.jobs[job].tools.forEach((t, i) => L.pulses.push({ e: `wt:${di}:${job}:${t}`, rev: true, dur: 1600, off: i / 3 }));
      L.pulses.push({ e: `jw:${di}:${job}`, rev: true, dur: 1400, off: .5 });
      L.pulses.push({ e: `jo:${di}:${job}`, rev: false, dur: 1800, off: 0 });
    }
    L.pulses.push({ e: `od:${di}`, rev: false, dur: 1600, off: .3 }, { e: `hd:${di}`, rev: true, dur: 1600, off: .7 });
    return L;
  }

  /* ---------- Rendering & transitions ---------- */
  let view = { level: 'company' }, current = null, anim = null, hoverDept = null;
  const box = { cx: 0, cy: 0, w: 820, h: 820 };

  function placeLabel(n, where) {
    const t = n.lbl, r = n.r;
    const p = { below: [0, r + 15, 'middle'], above: [0, -r - 9, 'middle'], right: [r + 8, 4, 'start'], dept: [0, -r - 9, 'middle'] }[where || 'below'];
    t.setAttribute('x', p[0]); t.setAttribute('y', p[1]); t.setAttribute('text-anchor', p[2]);
  }

  function applyClasses(L) {
    for (const id in nodes) {
      const n = nodes[id];
      let c = L.cls[id] || '';
      if (view.level === 'company' && hoverDept != null && id !== 'hub') c += n.d === hoverDept ? ' hi' : ' dim';
      n.g.setAttribute('class', `node t-${n.type}${n.person ? ' person' : ''} ${c}`);
      n.g.setAttribute('tabindex', /gone/.test(c) || n.type === 'tool' && view.level === 'company' ? -1 : 0);
      if (L.lbl[id]) placeLabel(n, L.lbl[id]);
    }
    for (const e of edges) {
      let s = L.edge[e.key] || 'gone';
      if (view.level === 'company' && hoverDept != null) s = nodes[e.b].d === hoverDept ? 'hi' : 'dim';
      e.el.setAttribute('class', `edge${e.el.classList.contains('person') ? ' person' : ''} ${s === 'show' ? '' : s}`);
      e.el.style.opacity = s === 'gone' ? 0 : '';
      e.state = s;
    }
  }

  function edgePath(e) {
    const a = nodes[e.a], b = nodes[e.b];
    if (view.level === 'company' || e.kind === 'hd') return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    const ym = (a.y + b.y) / 2;
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}C${a.x.toFixed(1)} ${ym.toFixed(1)} ${b.x.toFixed(1)} ${ym.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  function draw() {
    for (const id in nodes) { const n = nodes[id]; n.g.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`); }
    for (const e of edges) e.el.setAttribute('d', edgePath(e));
    setViewBox();
  }
  function setViewBox() {
    const W = svg.clientWidth || 1, H = svg.clientHeight || 1;
    const s = Math.min(W / box.w, H / box.h);
    const vw = W / s, vh = H / s;
    svg.setAttribute('viewBox', `${box.cx - vw / 2} ${box.cy - vh / 2} ${vw} ${vh}`);
    $('#glowDisc').setAttribute('cx', nodes.hub.x); $('#glowDisc').setAttribute('cy', nodes.hub.y);
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function transitionTo(L) {
    applyClasses(L);
    const from = {}; for (const id in nodes) from[id] = [nodes[id].x, nodes[id].y];
    const fromBox = { ...box };
    const t0 = performance.now(), dur = current && !reduce ? 750 : 0;
    current = L;
    anim = now => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1, k = ease(t);
      for (const id in nodes) { const [fx, fy] = from[id], [tx, ty] = L.pos[id]; nodes[id].x = fx + (tx - fx) * k; nodes[id].y = fy + (ty - fy) * k; }
      for (const p in fromBox) box[p] = fromBox[p] + (L.box[p] - fromBox[p]) * k;
      draw();
      if (t >= 1) anim = null;
    };
    setupPulses(L.pulses);
  }

  /* ---------- Pulses ---------- */
  let pulses = [];
  function setupPulses(list) {
    gPulses.innerHTML = '';
    pulses = reduce ? [] : list.map(p => ({ ...p, c: el('circle', { r: 2.6, class: 'pulse' }, gPulses) }));
    pulses.forEach(p => { const e = edges[p.e]; if (e && e.kind !== 'hd' && nodes[e.a].person !== nodes[e.b].person) p.c.style.fill = 'var(--orange)'; });
  }
  function tickPulses(now) {
    for (const p of pulses) {
      const e = edges[p.e]; if (!e || e.state === 'gone') { p.c.style.opacity = 0; continue; }
      let t = ((now / p.dur) + p.off) % 1; if (p.rev) t = 1 - t;
      const len = e.el.getTotalLength(); if (!len) continue;
      const pt = e.el.getPointAtLength(t * len);
      p.c.setAttribute('cx', pt.x); p.c.setAttribute('cy', pt.y);
      p.c.style.opacity = anim ? 0 : Math.sin(Math.PI * (p.rev ? 1 - t : t)) * .95;
    }
  }
  const loop = now => { if (!alive) return; anim && anim(now); tickPulses(now); requestAnimationFrame(loop); };

  /* ---------- Tooltip & hover ---------- */
  const tip = $('#tip');
  function onHover(n, on) {
    if (view.level === 'company' && n.d != null) { hoverDept = on ? n.d : null; applyClasses(current); }
    if (!on || /gone/.test(n.g.getAttribute('class'))) { tip.hidden = true; return; }
    const r = n.g.getBoundingClientRect(), s = stage.getBoundingClientRect();
    $('#tipName').textContent = n.name; $('#tipType').textContent = n.kind;
    tip.style.left = (r.left + r.width / 2 - s.left) + 'px'; tip.style.top = (r.top - s.top) + 'px';
    tip.hidden = false;
  }

  /* ---------- Navigation ---------- */
  function onNodeClick(n) {
    tip.hidden = true;
    if (n.type === 'hub') return openMemory();
    if (n.type === 'dept' || n.type === 'owner') return go({ level: 'dept', d: n.d });
    if (n.type === 'job' || n.type === 'worker') return go(view.level === 'company' ? { level: 'dept', d: n.d } : { level: 'job', d: n.d, k: n.k });
    if (n.type === 'tool') {
      if (view.level === 'company') return go({ level: 'dept', d: n.d });
      const k = DEPTS[n.d].jobs.findIndex(j => j.tools.includes(n.name));
      return go({ level: 'job', d: n.d, k });
    }
  }
  const toHash = v => v.level === 'company' ? '' : v.level === 'dept' ? `#${DEPTS[v.d].id}` : `#${DEPTS[v.d].id}/${v.k + 1}`;
  function parseHash() {
    const [slug, k] = location.hash.slice(1).split('/');
    const d = DEPTS.findIndex(x => x.id === slug);
    if (d < 0) return { level: 'company' };
    const ki = parseInt(k, 10) - 1;
    return ki >= 0 && ki < DEPTS[d].jobs.length ? { level: 'job', d, k: ki } : { level: 'dept', d };
  }
  function go(v) {
    const h = toHash(v);
    if (h === location.hash || (!h && !location.hash)) return render(v);
    if (h) location.hash = h; else history.pushState(null, '', location.pathname + location.search), render(v);
  }
  const onNav = () => render(parseHash());
  addEventListener('hashchange', onNav);
  addEventListener('popstate', onNav);

  function render(v) {
    view = v; hoverDept = null;
    svg.dataset.level = v.level;
    transitionTo(layout(v));
    renderSide(v);
    // chrome
    const step = v.level === 'company' ? 1 : v.level === 'dept' ? 2 : 3;
    document.querySelectorAll('#stepper li').forEach(li => { const s = +li.dataset.s; li.className = s === step ? 'on' : s < step ? 'done' : ''; });
    $('#hint').style.opacity = v.level === 'company' ? 1 : 0;
    $('#wholeBtn').hidden = v.level === 'company';
    $('#switcher').hidden = v.level === 'company';
    if (v.level !== 'company') $('#switchName').textContent = DEPTS[v.d].name;
    document.title = (v.level === 'company' ? 'Company map' : v.level === 'dept' ? DEPTS[v.d].name : DEPTS[v.d].jobs[v.k].title) + ' · Zariva.AI';
  }

  /* ---------- Side panel ---------- */
  const agentCount = DEPTS.reduce((a, d) => a + d.jobs.filter(j => j.worker.mode !== 'person').length, 0);
  const jobCount = DEPTS.reduce((a, d) => a + d.jobs.length, 0);
  const peopleCount = new Set(DEPTS.flatMap(d => [d.owner, ...d.jobs.filter(j => j.worker.mode === 'person').map(j => j.worker.name)])).size;
  const toolCount = Object.keys(DATA.tools).length;
  const ico = (shape) => ({
    dept: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="#fff" stroke="#0d240d" stroke-width="1.6"/></svg>',
    person: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="7" fill="#fff" stroke="#e07b00" stroke-width="1.6"/><circle cx="11" cy="11" r="2.5" fill="#e07b00"/></svg>',
    job: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="6" fill="#e4f3cc" stroke="#0d240d" stroke-width="1.3"/><rect x="9" y="9" width="4" height="4" fill="#0d240d"/></svg>',
    agent: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="7" fill="#fff" stroke="#3d7400" stroke-width="1.5"/><text x="11" y="13.5" text-anchor="middle" font-size="6.5" font-family="monospace" font-weight="700" fill="#3d7400">AI</text></svg>',
    tool: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="5" fill="#fff" stroke="#7a8876" stroke-width="1.2"/></svg>',
    hub: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="#002200" stroke="#79D900" stroke-width="1.3"/><circle cx="15" cy="6" r="2" fill="#FF9100"/></svg>'
  }[shape]);
  const foot = '<p class="foot mono">Sample data. Names, counts and outputs are illustrative.</p>';

  function renderSide(v) {
    if (v.level === 'company') {
      side.innerHTML = `
        <p class="kick mono">Company map</p>
        <h1>How Zariva.AI runs</h1>
        <p class="lede">Six practices. Every job has one owner, written rules and a set point where a person approves.</p>
        <div class="stats"><div class="stat"><b>${jobCount}</b><span class="mono">Jobs</span></div><div class="stat"><b>${agentCount}</b><span class="mono">AI agents</span></div></div>
        <p class="sec-h mono">Departments</p>
        <ul class="list">${DEPTS.map((d, i) => `<li><button class="row" data-dept="${i}"><span class="num">${pad2(i + 1)}</span><span><b>${esc(d.name)}</b><small>${esc(d.owner)} · ${d.jobs.length} jobs</small></span><span class="chev">›</span></button></li>`).join('')}</ul>
        <p class="sec-h mono">Reading the map</p>
        <ul class="legend">
          <li>${ico('dept')}<span>Departments</span><span>${DEPTS.length}</span></li>
          <li>${ico('person')}<span>People. Orange marks where a person decides.</span><span>${peopleCount}</span></li>
          <li>${ico('job')}<span>Jobs</span><span>${jobCount}</span></li>
          <li>${ico('agent')}<span>AI agents</span><span>${agentCount}</span></li>
          <li>${ico('tool')}<span>Tools</span><span>${toolCount}</span></li>
          <li>${ico('hub')}<span><button class="memBtn" data-memory>Open company memory</button></span><span></span></li>
        </ul>${foot}`;
    } else if (v.level === 'dept') {
      const d = DEPTS[v.d];
      side.innerHTML = `
        <button class="back" data-home>← Whole company</button>
        <p class="kick mono">Department ${pad2(v.d + 1)} of ${pad2(DEPTS.length)}</p>
        <h1>${esc(d.name)}</h1>
        <p class="lede">${esc(d.desc)}</p>
        <div class="stats">${d.stats.map(([n, l]) => `<div class="stat"><b>${esc(n)}</b><span class="mono">${esc(l)}</span></div>`).join('')}</div>
        <p class="week mono">A sample week</p>
        <p class="sec-h mono">Owner</p>
        <div class="owner">${ico('person')}<div><b>${esc(d.owner)}</b><p>${esc(d.ownerNote)}</p></div></div>
        <p class="sec-h mono">Jobs</p>
        <ul class="list">${d.jobs.map((j, k) => `<li><button class="row" data-job="${k}"><span class="ico ${j.worker.mode === 'person' ? 'person' : 'agent'}">${j.worker.mode === 'person' ? '●' : 'AI'}</span><span><b>${esc(j.title)}</b><small>${esc(j.worker.name)} · ${MODE_TEXT[j.worker.mode]}</small></span><span class="chev">›</span></button></li>`).join('')}</ul>${foot}`;
    } else {
      const d = DEPTS[v.d], j = d.jobs[v.k], person = j.worker.mode === 'person';
      const nextK = v.k + 1 < d.jobs.length ? v.k + 1 : null;
      side.innerHTML = `
        <button class="back" data-dept="${v.d}">← ${esc(d.name)}</button>
        <p class="kick mono">${esc(d.name)} · Job ${pad2(v.k + 1)} of ${pad2(d.jobs.length)}</p>
        <h1 class="sm">${esc(j.title)}</h1>
        <p class="sec-h mono">Who does it</p>
        <span class="mode ${j.worker.mode}">${MODE_TEXT[j.worker.mode]}</span>
        <div class="who">${ico(person ? 'person' : 'agent')}<div><b>${esc(j.worker.name)}</b><small>${MODE_LONG[j.worker.mode]}</small></div></div>
        <p class="sec-h mono">The rules it follows</p>
        <ol class="rules">${j.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <p class="sec-h mono">Tools</p>
        <ul class="tools">${j.tools.map(t => `<li>${ico('tool')}<span><b>${esc(t)}</b><small>${esc(DATA.tools[t] || '')}</small></span></li>`).join('')}</ul>
        <p class="sec-h mono">What it produces</p>
        <p class="produces">${esc(j.produces)}</p>
        <p class="sec-h mono">Hands off to</p>
        ${nextK != null
          ? `<button class="row" data-job="${nextK}"><span class="num">${pad2(nextK + 1)}</span><span><b>${esc(d.jobs[nextK].title)}</b><small>${esc(d.name)}</small></span><span class="chev">›</span></button>`
          : `<button class="row" data-memory><span class="num">◎</span><span><b>Company memory</b><small>Logged for every other department</small></span><span class="chev">›</span></button>`}
        <div class="stats" style="margin-top:22px"><div class="stat"><b>${j.runs.toLocaleString('en-IN')}</b><span class="mono">Runs this week</span></div><div class="stat"><b>${j.held.toLocaleString('en-IN')}</b><span class="mono">${person ? 'Led by a person' : 'Held for approval'}</span></div></div>
        <p class="week mono">A sample week</p>${foot}`;
    }
    side.scrollTop = 0;
  }
  side.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.home != null) go({ level: 'company' });
    else if (b.dataset.memory != null) openMemory();
    else if (b.dataset.job != null) go({ level: 'job', d: view.d, k: +b.dataset.job });
    else if (b.dataset.dept != null) go({ level: 'dept', d: +b.dataset.dept });
  });
  side.addEventListener('pointerover', e => {
    const b = e.target.closest('[data-dept]');
    if (view.level === 'company') { const d = b ? +b.dataset.dept : null; if (d !== hoverDept) { hoverDept = d; applyClasses(current); } }
  });
  side.addEventListener('pointerleave', () => { if (view.level === 'company' && hoverDept != null) { hoverDept = null; applyClasses(current); } });

  $('#wholeBtn').addEventListener('click', () => go({ level: 'company' }));
  $('#prevDept').addEventListener('click', () => go({ level: 'dept', d: (view.d + DEPTS.length - 1) % DEPTS.length }));
  $('#nextDept').addEventListener('click', () => go({ level: 'dept', d: (view.d + 1) % DEPTS.length }));
  const onKey = e => {
    if (e.key === 'Escape' && !$('#memory').open && view.level !== 'company') go(view.level === 'job' ? { level: 'dept', d: view.d } : { level: 'company' });
  };
  document.addEventListener('keydown', onKey);

  /* ---------- Memory dialog ---------- */
  $('#memList').innerHTML = DATA.memory.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('');
  function openMemory() { const m = $('#memory'); if (m.showModal) m.showModal(); else m.setAttribute('open', ''); }
  $('#memClose').addEventListener('click', () => $('#memory').close());
  $('#memory').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  /* ---------- Start ---------- */
  buildMesh();
  // start collapsed at the core, then bloom into the first view
  for (const id in nodes) { nodes[id].x = CORE[0]; nodes[id].y = CORE[1]; }
  current = { pos: {} }; // non-null so the first render animates
  render(parseHash());
  const ro = new ResizeObserver(() => { setViewBox(); });
  ro.observe(svg);
  requestAnimationFrame(loop);

  return () => {
    alive = false;
    ro.disconnect();
    removeEventListener('hashchange', onNav);
    removeEventListener('popstate', onNav);
    document.removeEventListener('keydown', onKey);
    gNodes.innerHTML = ''; gEdges.innerHTML = ''; gPulses.innerHTML = ''; $('#mesh').innerHTML = '';
  };
}
