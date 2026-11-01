// Zariva.AI doodle footer — the logo stamped in dry-brush ink with a hand-drawn crew living on the letters.
// Scroll it into view: the ground draws, letters stamp down, the crew arrives, doodles drift, the tagline and buttons rise.
// Then it stays alive: eyes follow the pointer and blink, lines boil, letters wobble on hover,
// clicking a character makes it hop and talk, and doodles scatter from the pointer and pop when caught.
/** Starts the doodle footer inside `root` (the <footer class="zf">). Returns a cleanup function. */
export function initFooter(root) {
  let alive = true;
  const $id = id => root.querySelector('#' + id);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $id('zfSvg'), world = $id('zfWorld');
  const bubbles = $id('zfBubbles'), doodleBox = $id('zfDoodles');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // next/font gives the brand face a generated family name, exposed as --font-outfit
  const OUTFIT = getComputedStyle(document.documentElement).getPropertyValue('--font-outfit').trim() || '"Outfit"';
  const FS = 200, FONT = `${OUTFIT}, system-ui, sans-serif`;
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const f1 = n => n.toFixed(1);

  /* ---------------- The crew (each drawn in its own units: base centre at 0,0, up is negative) ---------------- */
  const ART = {
    // Bolt — a small robot, the AI agent
    bolt: {
      box: { l: -48, r: 50, t: -130, b: 6 }, k: 1.02,
      eyes: [{ x: -9, y: -86, r: 5.2, p: 2.6, m: 2 }, { x: 9, y: -86, r: 5.2, p: 2.6, m: 2 }],
      body: () => `
        <ellipse class="zf-shadow" cx="0" cy="2" rx="40" ry="4"/>
        <path d="M-24 0 h16 v-7 h-16 Z M8 0 h16 v-7 h-16 Z"/>
        <path class="n thick" d="M-16 -7 v-16 M16 -7 v-16"/>
        <rect x="-26" y="-62" width="52" height="40" rx="9"/>
        <path d="M14 -60 C24 -58 26 -40 24 -24 L14 -22 Z" fill="url(#zf-hatch)" stroke="none"/>
        <circle class="l" cx="0" cy="-45" r="6.5"/>
        <path class="n thin" d="M-17 -31 h9 M8 -31 h9"/>
        <path class="n thick" d="M-26 -56 C-40 -52 -42 -40 -38 -31"/><circle cx="-38" cy="-28" r="5"/>
        <g class="zf-wave"><path class="n thick" d="M26 -56 C40 -62 44 -76 40 -88"/><circle cx="40" cy="-91" r="5"/></g>
        <path class="n" d="M-6 -62 v-6 M6 -62 v-6"/>
        <rect x="-35" y="-94" width="6" height="14" rx="2.5"/><rect x="29" y="-94" width="6" height="14" rx="2.5"/>
        <rect x="-30" y="-106" width="60" height="38" rx="11"/>
        <rect class="s" x="-23" y="-99" width="46" height="25" rx="7"/>
        <path class="ln" d="M-5 -79.5 C-2 -77 2 -77 5 -79.5"/>
        <path class="n" d="M0 -106 v-13"/><circle class="o" cx="0" cy="-123" r="5.5"/>`
    },
    // Dot — the orange dot from the logo, alive
    dot: {
      box: { l: -22, r: 22, t: -36, b: 2 }, k: 1, idle: 'zf-bob',
      eyes: [{ x: -5.5, y: -18, r: 0, p: 2.4, m: 1.4 }, { x: 5.5, y: -18, r: 0, p: 2.4, m: 1.4 }],
      body: () => `
        <circle class="o" cx="0" cy="-17" r="17"/>
        <path d="M8 -29 C13 -26 16 -21 16 -15" class="n thin" style="stroke:#fff;opacity:.8"/>
        <path class="n" d="M-4 -10 C-2 -8 2 -8 4 -10"/>
        <path class="n thin" d="M-24 -30 l-4 -3 M-25 -20 l-5 0 M24 -30 l4 -3 M25 -20 l5 0"/>`
    },
    // Sprout — a lime seedling for growth, peeking over a letter
    sprout: {
      box: { l: -30, r: 30, t: -78, b: 0 }, k: 1.15, idle: 'zf-sway',
      eyes: [{ x: -7.5, y: -40, r: 6, p: 3, m: 2.6 }, { x: 8, y: -40, r: 6, p: 3, m: 2.6 }],
      body: () => `
        <path class="n" d="M0 -58 v-7"/>
        <path class="l" d="M0 -64 C-4 -74 -16 -80 -27 -76 C-23 -66 -11 -62 0 -64 Z"/>
        <path class="l" d="M0 -64 C5 -76 18 -80 28 -75 C23 -64 11 -61 0 -64 Z"/>
        <path class="n thin" d="M-3 -66 C-9 -70 -15 -72 -20 -73 M3 -66 C9 -70 15 -72 21 -73"/>
        <path class="l" d="M-22 -14 L-22 -40 C-22 -54 -12 -60 0 -60 C12 -60 22 -54 22 -40 L22 -14 C12 -10 -12 -10 -22 -14 Z"/>
        <path d="M12 -56 C20 -50 22 -42 22 -34 L22 -15 L15 -13 L15 -34 C15 -42 15 -50 12 -56 Z" fill="url(#zf-hatch)" stroke="none"/>
        <path class="k" d="M-4 -30 C-2 -25 3 -25 5 -30 Z"/>
        <path class="n thin" d="M-17 -32 l3 -2 M-14 -31 l3 -2 M14 -32 l3 -2 M17 -31 l3 -2"/>`,
      front: () => `
        <path class="l" d="M-25 -31 C-27 -37 -21 -41 -17 -37 C-15 -41 -10 -40 -10 -35 L-11 -29 C-15 -27 -22 -27 -25 -31 Z"/>
        <path class="l" d="M25 -31 C27 -37 21 -41 17 -37 C15 -41 10 -40 10 -35 L11 -29 C15 -27 22 -27 25 -31 Z"/>`
    },
    // Byte — a laptop sitting on a letter, legs dangling
    byte: {
      box: { l: -32, r: 32, t: -56, b: 34 }, k: 1.12,
      eyes: [{ x: -8, y: -34, r: 5, p: 2.5, m: 1.8 }, { x: 8, y: -34, r: 5, p: 2.5, m: 1.8 }],
      body: () => `
        <path class="n thick" d="M-12 0 C-13 10 -12 18 -10 26 M12 0 C13 10 12 18 10 26"/>
        <ellipse class="k" cx="-11" cy="29" rx="6" ry="3.6"/><ellipse class="k" cx="12" cy="29" rx="6" ry="3.6"/>
        <path d="M-30 0 L30 0 L25 -9 L-25 -9 Z"/>
        <path class="n thin" d="M-18 -4.5 h4 M-10 -4.5 h4 M-2 -4.5 h4 M6 -4.5 h4 M14 -4.5 h4"/>
        <rect x="-25" y="-54" width="50" height="45" rx="5"/>
        <rect class="s" x="-20" y="-49" width="40" height="34" rx="3"/>
        <path class="ln" d="M-7 -24 l-4 3 l4 3 M7 -24 l4 3 l-4 3 M2 -26 l-4 10"/>
        <path class="n thick" d="M-25 -20 C-36 -18 -38 -8 -34 -2 M25 -20 C36 -18 38 -8 34 -2"/>`
    }
  };
  const CREW = [
    { kind: 'bolt', letter: 0, seat: 'front', offset: -.62, name: 'Bolt', says: 'Beep! I draft. You approve.' },
    { kind: 'dot', letter: 2, seat: 'dot', name: 'Dot', says: 'I’m the dot in zariva. Small, but I hold it all together.' },
    { kind: 'sprout', letter: 3, seat: 'behind', offset: .02, name: 'Sprout', says: 'Growth takes time. Mine took three sprints.' },
    { kind: 'byte', letter: 4, seat: 'top', offset: .08, name: 'Byte', says: 'Ship it! (After the tests pass.)' }
  ];

  /* ---------------- Doodles (32-unit box centred on 0,0) ---------------- */
  const DOODLE = {
    leaf: `<path fill="#79D900" d="M-10 10 C-12 -4 -2 -12 11 -12 C12 2 4 11 -10 10 Z"/><path fill="none" d="M-10 10 C-4 4 2 -2 8 -9"/>`,
    dot: `<circle fill="#FF9100" r="9"/><circle fill="#fff" stroke="none" cx="-3" cy="-3" r="2.4"/>`,
    star: `<path fill="#FF9100" d="M0 -12 L3.4 -4 L12 -3.6 L5.4 2 L7.6 11 L0 6 L-7.6 11 L-5.4 2 L-12 -3.6 L-3.4 -4 Z"/>`,
    bolt: `<path fill="#79D900" d="M3 -13 L-8 2 L-1 2 L-4 13 L8 -3 L1 -3 Z"/>`,
    code: `<path fill="none" stroke-width="2.6" d="M-6 -8 L-12 0 L-6 8 M6 -8 L12 0 L6 8 M3 -10 L-3 10"/>`,
    chart: `<path fill="none" d="M-12 -12 V10 H12"/><path fill="none" stroke="#3d7400" stroke-width="2.6" d="M-8 4 L-2 -2 L3 2 L10 -7 M5 -7 H10 V-2"/>`,
    sparkle: `<path fill="#79D900" d="M0 -12 C1 -4 4 -1 12 0 C4 1 1 4 0 12 C-1 4 -4 1 -12 0 C-4 -1 -1 -4 0 -12 Z"/>`,
    cog: `<path fill="#F1F1E9" d="M-2 -12 h4 l1 4 l3.5 1.5 l3.5 -2 l3 3 l-2 3.5 l1.5 3.5 l4 1 v4 l-4 1 l-1.5 3.5 l2 3.5 l-3 3 l-3.5 -2 l-3.5 1.5 l-1 4 h-4 l-1 -4 l-3.5 -1.5 l-3.5 2 l-3 -3 l2 -3.5 l-1.5 -3.5 l-4 -1 v-4 l4 -1 l1.5 -3.5 l-2 -3.5 l3 -3 l3.5 2 l3.5 -1.5 Z" transform="scale(.82)"/><circle fill="none" r="3.4"/>`
  };
  const DOODLE_LIST = ['leaf', 'dot', 'code', 'star', 'chart', 'sparkle', 'bolt', 'cog', 'dot', 'leaf', 'code', 'star'];

  /* ---------------- The lime "ri" from the logo, drawn for an x-height of 106 ---------------- */
  const RI = { w: 126, d: 'M0 -104 L0 0 M0 -56 C9 -96 36 -106 56 -96 C79 -84 103 -132 97 -160 C92 -184 64 -170 60 -116 C57 -60 54 22 80 44 C91 52 104 47 112 38', dot: [104, -186] };

  /* ---------------- Build ---------------- */
  const el = (tag, attrs, html) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; };
  const S = { floaters: [], w: 0, h: 0, px: NaN, py: NaN, inside: false, visible: false, gaze: [], seed: 7, start: 0, play: false };
  let placed = [], eyeRefs = [], layers = [], view = null, tl = null;

  function metrics() {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `800 ${FS}px ${FONT}`;
    const widths = {};
    for (const ch of 'zav') widths[ch] = c.measureText(ch).width; // measure before the font changes below
    const m = c.measureText('zava');
    const xh = m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent : .52 * FS;
    c.font = `500 64px ${FONT}`;
    return { adv: ch => widths[ch] ?? .6 * FS, xh, aiW: c.measureText('ai').width };
  }

  function build() {
    const { adv, xh, aiW } = metrics();
    const s = xh / 106; // scale for the hand-drawn "ri"
    const glyphs = [{ ch: 'z' }, { ch: 'a' }, { ri: true }, { ch: 'v' }, { ch: 'a' }];
    const gap = -0.012 * FS;
    let at = 0;
    glyphs.forEach((g, i) => { g.w = g.ri ? RI.w * s : adv(g.ch); g.x = at + (g.ri ? 10 * s : 0); at += g.w + (g.ri ? 22 * s : 0) + gap; });
    const wordW = at;
    const ai = { x: wordW + 6, w: aiW };

    // crew placement
    placed = CREW.map((m, i) => {
      const art = ART[m.kind], g = glyphs[m.letter];
      const scale = s * art.k;
      let x = g.x + g.w * (.5 + (m.offset || 0)), y = 0;
      if (m.seat === 'top') y = -xh;
      if (m.seat === 'behind') y = -xh + 30 * scale;
      if (m.seat === 'dot') { x = g.x + RI.dot[0] * s; y = RI.dot[1] * s + 17 * scale; }
      return { i, m, art, seat: m.seat === 'dot' ? 'top' : m.seat, scale, x, y };
    });

    // viewBox hugs the word, crew and ground
    let l = 0, r = ai.x + ai.w, t = -xh, b = 50 * s + 16;
    t = Math.min(t, RI.dot[1] * s - 10);
    placed.forEach(p => { l = Math.min(l, p.x + p.art.box.l * p.scale); r = Math.max(r, p.x + p.art.box.r * p.scale); t = Math.min(t, p.y + p.art.box.t * p.scale); b = Math.max(b, p.y + p.art.box.b * p.scale); });
    const pad = 22;
    view = { x: l - pad, y: t - pad, w: r - l + pad * 2, h: b - t + pad * 2 };
    svg.setAttribute('viewBox', `${f1(view.x)} ${f1(view.y)} ${f1(view.w)} ${f1(view.h)}`);

    // storyboard
    const words = [...root.querySelectorAll('#zfTagline .zf-word')].length;
    const L = glyphs.length + 1, C = placed.length;
    const letter = i => 160 + i * 90;
    const crewStart = letter(L - 1) + 420;
    tl = { ground: 60, letter, crewStart, member: j => crewStart + j * 140, doodles: crewStart + 200, word: k => crewStart + 260 + k * 45 };
    tl.action = k => tl.word(words) + 120 + k * 110;
    root.querySelectorAll('#zfTagline .zf-word').forEach((w, k) => w.style.setProperty('--d', tl.word(k) + 'ms'));
    root.querySelectorAll('.zf-btn').forEach((bt, k) => bt.style.setProperty('--d', tl.action(k) + 'ms'));

    // ground
    const x0 = view.x + 6, x1 = view.x + view.w - 6, n = 14;
    let gd = `M${f1(x0)} 6`;
    for (let k = 1; k <= n; k++) { const x = x0 + (x1 - x0) * k / n; gd += ` Q${f1(x - (x1 - x0) / n / 2)} ${f1(6 + (hash(k * 3.1) - .5) * 5)} ${f1(x)} ${f1(6 + (hash(k * 7.7) - .5) * 2)}`; }
    let tufts = '';
    for (let k = 0; k < 22; k++) { const x = x0 + 20 + hash(k * 11.3) * (x1 - x0 - 40), q = .7 + hash(k * 5.9) * .6; tufts += `M${f1(x)} 6 l${f1(2 * q)} ${f1(-9 * q)} M${f1(x + 3 * q)} 6 l${f1(q)} ${f1(-12 * q)} M${f1(x + 6 * q)} 6 l${f1(-q)} ${f1(-7 * q)} `; }
    const pebbles = Array.from({ length: 9 }, (_, k) => `<ellipse class="zf-pebble zf-fade" style="--d:${tl.ground + 600}ms" cx="${f1(x0 + 40 + hash(k * 17.1) * (x1 - x0 - 80))}" cy="${f1(14 + hash(k * 2.3) * 8)}" rx="${f1((2 + hash(k * 9.4) * 2.6) * 1.5)}" ry="${f1(2 + hash(k * 9.4) * 2.6)}"/>`).join('');

    const defs = `<defs>
      <pattern id="zf-hatch" width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="4.6" style="stroke:var(--zf-ink)" stroke-width="1.25"/></pattern>
      ${[0, 1, 2].map(k => `<filter id="zf-boil${k}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${k * 7 + 3}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('')}
      <filter id="zf-ink" x="-6%" y="-8%" width="112%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="11" result="edge"/>
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough"/>
        <feTurbulence type="fractalNoise" baseFrequency=".018 .32" numOctaves="2" seed="4" result="streak"/>
        <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 5.6" result="streakA"/>
        <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="9" result="speck"/>
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -24 7" result="speckA"/>
        <feComposite in="streakA" in2="speckA" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="holes"/>
        <feComposite in="rough" in2="holes" operator="out"/>
      </filter></defs>`;

    const letterG = (g, i) => {
      const dust = `<path class="zf-dust" d="M${f1(g.x - 6)} -6 l-16 -6 M${f1(g.x - 4)} -16 l-12 -12 M${f1(g.x + g.w + 6)} -6 l16 -6 M${f1(g.x + g.w + 4)} -16 l12 -12"/>`;
      const glyph = g.ri
        ? `<path class="zf-ri" d="${RI.d}" transform="translate(${f1(g.x)} 0) scale(${s.toFixed(4)})" filter="url(#zf-ink)"/>`
        : `<text x="${f1(g.x)}" y="0" font-size="${FS}" font-weight="800" filter="url(#zf-ink)">${g.ch}</text>`;
      return `<g class="zf-letter" style="--d:${tl.letter(i)}ms;--r:${((hash(i * 2.3) - .5) * 9).toFixed(2)}deg"><g class="zf-glyph">${glyph}</g>${dust}</g>`;
    };
    const crewG = (p, part) => {
      const inner = part === 'body' ? p.art.body() + p.art.eyes.map((e, k) => `<g class="zf-blink" data-c="${p.i}" data-e="${k}">${e.r ? `<circle cx="${e.x}" cy="${e.y}" r="${e.r}"/>` : ''}<g class="zf-pupil"><circle class="k" cx="${e.x}" cy="${e.y}" r="${e.p}"/><circle class="zf-glint" cx="${f1(e.x + e.p * .35)}" cy="${f1(e.y - e.p * .4)}" r="${f1(e.p * .32)}"/></g></g>`).join('') : (p.art.front ? p.art.front() : '');
      return `<g transform="translate(${f1(p.x)} ${f1(p.y)}) scale(${p.scale.toFixed(4)})"><g class="zf-arrive zf-arrive-${p.seat}" style="--d:${tl.member(p.i)}ms"><g class="zf-hopper" data-hop="${p.i}"><g class="zf-art ${p.art.idle || ''}">${inner}</g></g></g></g>`;
    };

    svg.innerHTML = defs +
      `<g class="zf-layer"><g class="zf-ground"><path class="zf-draw" pathLength="1" style="--d:${tl.ground}ms" d="${gd}"/><path class="zf-tufts zf-fade" style="--d:${tl.ground + 500}ms" d="${tufts}"/>${pebbles}</g>${placed.filter(p => p.seat === 'behind').map(p => crewG(p, 'body')).join('')}</g>` +
      glyphs.map(letterG).join('') +
      `<g class="zf-letter zf-ai" style="--d:${tl.letter(glyphs.length)}ms;--r:-4deg"><g class="zf-glyph"><text x="${f1(ai.x)}" y="0" font-size="64" font-weight="500">ai</text></g></g>` +
      `<g class="zf-layer">${placed.filter(p => p.seat === 'behind').map(p => crewG(p, 'front')).join('')}${placed.filter(p => p.seat !== 'behind').map(p => crewG(p, 'body')).join('')}</g>` +
      placed.map(p => `<rect class="zf-hit" data-poke="${p.i}" x="${f1(p.x + p.art.box.l * p.scale)}" y="${f1(p.y + p.art.box.t * p.scale)}" width="${f1((p.art.box.r - p.art.box.l) * p.scale)}" height="${f1(((p.seat === 'behind' ? -30 : p.art.box.b) - p.art.box.t) * p.scale)}" rx="12" role="button" tabindex="0" aria-label="${p.m.name}: ${p.m.says.replace(/"/g, '&quot;')}"/>`).join('');

    layers = [...svg.querySelectorAll('.zf-layer')];
    eyeRefs = placed.map(() => []);
    svg.querySelectorAll('.zf-blink').forEach(b => { eyeRefs[+b.dataset.c][+b.dataset.e] = { blink: b, pupil: b.querySelector('.zf-pupil') }; });
    svg.querySelectorAll('.zf-hit').forEach(h => {
      h.addEventListener('click', () => poke(+h.dataset.poke));
      h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(+h.dataset.poke); } });
    });
  }

  /* ---------------- Talk & hop ---------------- */
  let talkTimer = 0;
  function poke(i) {
    const p = placed[i]; if (!p) return;
    const hop = svg.querySelector(`[data-hop="${i}"]`);
    hop.classList.remove('is-hop'); void hop.getBBox(); hop.classList.add('is-hop');
    const left = p.x > view.x + view.w * .72;
    bubbles.innerHTML = `<div class="zf-bubble${left ? ' is-left' : ''}" style="left:${((p.x - view.x) / view.w * 100).toFixed(2)}%;top:${((p.y + p.art.box.t * p.scale - 6 - view.y) / view.h * 100).toFixed(2)}%">${p.m.says}</div>`;
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => { bubbles.innerHTML = ''; hop.classList.remove('is-hop'); }, 2600);
  }

  /* ---------------- Doodles ---------------- */
  const doodleEls = DOODLE_LIST.map((kind, k) => {
    const size = 22 + hash(k * 4.7) * 14;
    const d = document.createElement('div');
    d.className = 'zf-doodle';
    Object.assign(d.style, { width: size + 'px', height: size + 'px', marginLeft: -size / 2 + 'px', marginTop: -size / 2 + 'px' });
    d.innerHTML = `<span class="zf-doodle-in" style="--d:0ms"><svg viewBox="-16 -16 32 32" width="${size}" height="${size}">${DOODLE[kind]}</svg></span>`;
    d.addEventListener('pointerdown', () => { const f = S.floaters[k]; if (f && f.pop <= 0) { f.pop = 1.4; paint(); } });
    doodleBox.append(d);
    return d;
  });
  function layoutDoodles() {
    const r = world.getBoundingClientRect(), ow = S.w, oh = S.h;
    S.w = r.width; S.h = r.height;
    if (!S.floaters.length) {
      S.floaters = DOODLE_LIST.map((_, k) => ({ x: (.04 + .92 * ((k + hash(k * 9.1) * .8) / DOODLE_LIST.length)) * r.width, y: (.02 + hash(k * 3.3) * .56) * r.height, vx: 0, vy: 0, rot: (hash(k * 1.7) - .5) * 50, vr: (hash(k * 6.1) - .5) * 30, fall: 9 + hash(k * 2.9) * 16, phase: hash(k * 8.3) * Math.PI * 2, pop: 0 }));
    } else if (ow && oh) S.floaters.forEach(f => { f.x *= r.width / ow; f.y *= r.height / oh; });
    paint();
  }
  const rand = () => { S.seed = (S.seed * 16807) % 2147483647; return S.seed / 2147483647; };
  function stepFloater(f, dt, t, px, py) {
    const m = 40, w = S.w, h = S.h;
    if (f.pop > 0) { f.pop -= dt; if (f.pop <= 0) { f.pop = 0; f.x = rand() * w; f.y = -m; f.vx = 0; f.vy = f.fall; } return; }
    const sway = Math.sin(t * .7 + f.phase) * 14;
    if (Number.isFinite(px)) {
      const dx = f.x - px, dy = f.y - py, d = Math.hypot(dx, dy), R = 110;
      if (d < R && d > .01) { const k = (1 - d / R) ** 2 * 2400; f.vx += dx / d * k * dt; f.vy += dy / d * k * dt; f.vr += (dx > 0 ? 1 : -1) * k * .004 * dt; }
    }
    const e = Math.min(1, dt * 2.4);
    f.vx += (sway - f.vx) * e; f.vy += (f.fall - f.vy) * e;
    f.vr += (Math.sin(f.phase * 3) * 18 - f.vr) * Math.min(1, dt * .8);
    f.x += f.vx * dt; f.y += f.vy * dt; f.rot = (f.rot + f.vr * dt) % 360;
    if (f.y > h + m) { f.y = -m; f.x = rand() * w; } else if (f.y < -m * 3) f.y = h + m;
    if (f.x < -m) f.x = w + m; else if (f.x > w + m) f.x = -m;
  }
  function paint() {
    const k = clamp(S.w / 1100, .55, 1);
    S.floaters.forEach((f, i) => {
      let sc = k, op = 1;
      if (f.pop > 0) { const age = 1.4 - f.pop; sc = k * (1 + Math.min(1, age / .3) * .7); op = Math.max(0, 1 - age / .3); }
      doodleEls[i].style.transform = `translate3d(${f1(f.x)}px,${f1(f.y)}px,0) rotate(${f1(f.rot)}deg) scale(${sc.toFixed(3)})`;
      doodleEls[i].style.opacity = op;
    });
  }

  /* ---------------- Living loop: eyes, blinks, doodles, line boil ---------------- */
  function lookAt(ex, ey, tx, ty, max, reach) {
    const dx = tx - ex, dy = ty - ey, d = Math.hypot(dx, dy);
    if (!(d > 1e-6) || max <= 0) return { x: 0, y: 0 };
    const k = max * Math.min(1, d / reach) / d;
    return { x: dx * k, y: dy * k };
  }
  let last = performance.now(), boilAt = 0, boil = 0;
  function frame(now) {
    if (!alive) return;
    requestAnimationFrame(frame);
    if (!S.visible || document.hidden || !view) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    let target = null;
    if (S.inside) { const m = svg.getScreenCTM(); if (m) { const inv = m.inverse(); target = { x: inv.a * S.px + inv.c * S.py + inv.e, y: inv.b * S.px + inv.d * S.py + inv.f }; } }
    placed.forEach((p, c) => {
      const g = S.gaze[c] || (S.gaze[c] = { tx: 0, ty: 0, next: 0, blinkAt: t + 1 + hash(c * 3.7) * 3, blink: 0, o: [] });
      if (!target && t > g.next) {
        const other = placed[(c + 1 + Math.floor(rand() * (placed.length - 1))) % placed.length];
        if (other && rand() < .45) { g.tx = other.x; g.ty = other.y - 50 * other.scale; }
        else { g.tx = p.x + (rand() - .5) * 900; g.ty = p.y - 80 * p.scale + (rand() - .5) * 500; }
        g.next = t + 1.4 + rand() * 2.6;
      }
      if (t > g.blinkAt) { g.blink = .16; g.blinkAt = t + 2.2 + rand() * 4; }
      g.blink = Math.max(0, g.blink - dt);
      const lid = g.blink > 0 ? .12 + Math.abs(g.blink - .08) / .08 * .88 : 1;
      p.art.eyes.forEach((eye, e) => {
        const ref = eyeRefs[c][e]; if (!ref) return;
        const o = lookAt(p.x + eye.x * p.scale, p.y + eye.y * p.scale, target ? target.x : g.tx, target ? target.y : g.ty, eye.m, 220);
        const prev = g.o[e] || { x: 0, y: 0 }, ease = Math.min(1, dt * (target ? 14 : 6));
        const nx = prev.x + (o.x - prev.x) * ease, ny = prev.y + (o.y - prev.y) * ease;
        g.o[e] = { x: nx, y: ny };
        ref.pupil.setAttribute('transform', `translate(${nx.toFixed(2)} ${ny.toFixed(2)})`);
        ref.blink.setAttribute('transform', `translate(0 ${(eye.y * (1 - lid)).toFixed(2)}) scale(1 ${lid.toFixed(3)})`);
      });
    });
    if (S.play && (reduced || now - S.start > tl.doodles)) {
      if (!reduced) {
        const r = world.getBoundingClientRect();
        const px = S.inside ? S.px - r.left : NaN, py = S.inside ? S.py - r.top : NaN;
        S.floaters.forEach(f => stepFloater(f, dt, t, px, py));
      }
      paint();
    }
    if (!reduced && now - boilAt > 125) { boilAt = now; boil = (boil + 1) % 3; layers.forEach(l => l.setAttribute('filter', `url(#zf-boil${boil})`)); }
  }

  /* ---------------- Wire up ---------------- */
  // tagline words for the word-by-word rise
  const tag = $id('zfTagline');
  if (!tag.querySelector('.zf-word')) tag.innerHTML = tag.textContent.trim().split(/\s+/).map(w => `<span class="zf-word">${w} </span>`).join('');
  // squiggle underline on every footer link
  root.querySelectorAll('.zf-link').forEach(a => { if (!a.querySelector('.zf-squiggle')) a.insertAdjacentHTML('beforeend', '<svg class="zf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg>'); });

  const onMove = e => { S.px = e.clientX; S.py = e.clientY; S.inside = true; };
  const onLeave = () => { S.inside = false; };
  const toTop = () => window.__lenis ? window.__lenis.scrollTo(0, { immediate: reduced }) : scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerdown', onMove);
  root.addEventListener('pointerleave', onLeave);
  $id('zfTop').addEventListener('click', toTop);

  let ro = null, io = null;
  const start = () => {
    if (!alive) return;
    build();
    layoutDoodles();
    ro = new ResizeObserver(layoutDoodles); ro.observe(world);
    io = new IntersectionObserver(es => es.forEach(e => {
      S.visible = e.isIntersecting;
      if (e.isIntersecting && e.intersectionRatio > .12 && !S.play) { S.play = true; S.start = performance.now(); root.dataset.play = '1'; }
    }), { threshold: [0, .12, .3] });
    io.observe(root);
    if (reduced) root.dataset.play = '1';
    requestAnimationFrame(frame);
  };
  // measure with the real brand font once it has loaded (fall back after a short wait)
  let started = false;
  const go = () => { if (!started) { started = true; start(); } };
  if (document.fonts && document.fonts.load) Promise.race([document.fonts.load(`800 ${FS}px ${OUTFIT}`), new Promise(r => setTimeout(r, 1500))]).then(go, go);
  else go();

  return () => {
    alive = false;
    ro?.disconnect(); io?.disconnect();
    clearTimeout(talkTimer);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerdown', onMove);
    root.removeEventListener('pointerleave', onLeave);
    $id('zfTop')?.removeEventListener('click', toTop);
    doodleBox.innerHTML = '';
  };
}
