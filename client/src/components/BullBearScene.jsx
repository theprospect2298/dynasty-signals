import { useEffect, useRef } from 'react';

// ── Deterministic RNG so the mesh is stable across renders ─────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = ['#2dd4bf', '#34d399', '#38bdf8', '#0d9488', '#155e75'];

// Jittered triangular lattice — the "low poly constellation" texture
function genMesh(x0, y0, w, h, seed, step = 46) {
  const rnd = mulberry32(seed);
  const cols = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / step) + 1;
  const pts = [];
  for (let j = 0; j < rows; j++) {
    const row = [];
    for (let i = 0; i < cols; i++) {
      row.push([
        x0 + i * step + (rnd() - 0.5) * step * 0.9,
        y0 + j * step + (rnd() - 0.5) * step * 0.9,
      ]);
    }
    pts.push(row);
  }
  const tris = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i], d = pts[j + 1][i + 1];
      tris.push({ p: [a, b, c], f: PALETTE[(rnd() * PALETTE.length) | 0], o: 0.05 + rnd() * 0.16 });
      tris.push({ p: [b, d, c], f: PALETTE[(rnd() * PALETTE.length) | 0], o: 0.05 + rnd() * 0.16 });
    }
  }
  for (const t of tris) if (rnd() < 0.08) t.o = 0.28 + rnd() * 0.22;
  const dots = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (rnd() < 0.5) {
        const p = pts[j][i];
        dots.push({ x: p[0], y: p[1], r: 0.8 + rnd() * 1.3, o: 0.35 + rnd() * 0.5, pulse: rnd() < 0.12 });
      }
    }
  }
  return { tris, dots };
}

const BULL_MESH = genMesh(80, 130, 420, 350, 7);
const BEAR_MESH = genMesh(680, 90, 440, 390, 13);

// Faceted ground strip
const GROUND = (() => {
  const rnd = mulberry32(99);
  const top = [], bottom = [];
  for (let x = 0; x <= 1240; x += 60) top.push([x + (rnd() - 0.5) * 30, 452 + (rnd() - 0.5) * 16]);
  for (let x = -30; x <= 1260; x += 60) bottom.push([x + (rnd() - 0.5) * 40, 522 + (rnd() - 0.5) * 22]);
  const tris = [];
  for (let i = 0; i < top.length - 1; i++) {
    const a = top[i], b = top[i + 1], c = bottom[i], d = bottom[i + 1];
    tris.push({ p: [a, b, c], o: 0.05 + rnd() * 0.1, f: rnd() < 0.5 ? '#0d9488' : '#1d4ed8' });
    tris.push({ p: [b, d, c], o: 0.04 + rnd() * 0.1, f: rnd() < 0.5 ? '#155e75' : '#0f766e' });
  }
  return tris;
})();

// Angular low-poly silhouettes
const BULL_PATH = `M 110 205 L 168 186 L 232 170 L 296 154 L 332 150
L 362 162 L 384 196 L 404 222 L 430 262 L 450 296 L 468 330
L 452 346 L 424 338 L 400 332 L 380 360 L 366 382
L 376 414 L 388 462 L 366 463 L 356 416 L 348 388
L 334 408 L 327 461 L 305 461 L 300 402 L 290 392
L 248 392 L 208 391 L 188 422 L 184 466 L 162 466 L 152 424 L 142 398
L 126 372 L 114 318 L 107 262 Z`;

const BEAR_PATH = `M 700 206 L 720 176 L 757 151 L 770 144
L 766 114 L 788 132 L 806 128 L 814 126 L 822 102 L 838 126
L 872 142 L 908 158 L 956 168 L 1004 174 L 1052 186
L 1078 214 L 1088 252 L 1093 318 L 1084 364 L 1096 424 L 1093 460
L 1044 460 L 1054 420 L 1034 376 L 1006 388 L 944 398 L 906 396
L 874 398 L 869 432 L 879 459 L 821 459 L 831 419 L 843 379
L 822 342 L 809 323 L 787 366 L 753 392 L 735 398
L 757 363 L 783 331 L 793 301 L 777 281 L 753 272 L 717 255
L 749 233 L 723 213 Z`;

const TICKERS = [
  { x: 170, y: 118, t: '▲ +40.66', c: '#4ade80', d: 0 },
  { x: 74, y: 300, t: '0.8384', c: '#5eead4', d: 1.2 },
  { x: 330, y: 92, t: '+0.32', c: '#5eead4', d: 2 },
  { x: 250, y: 345, t: '48,900', c: '#5eead4', d: 0.6 },
  { x: 540, y: 118, t: '5,190', c: '#5eead4', d: 1.8 },
  { x: 612, y: 158, t: '4,571.03', c: '#5eead4', d: 2.6 },
  { x: 1006, y: 118, t: '▼ -64.62', c: '#f87171', d: 0.9 },
  { x: 1098, y: 296, t: '[-16.24]', c: '#f87171', d: 1.5 },
  { x: 942, y: 88, t: '▲ +45.10', c: '#4ade80', d: 2.2 },
  { x: 1052, y: 208, t: '+41.81', c: '#4ade80', d: 0.3 },
];

const CROSSES = [[140, 215], [478, 168], [762, 122], [898, 332], [300, 418], [1138, 152], [528, 388]];

export default function BullBearScene() {
  const bullRef = useRef(null);
  const bearRef = useRef(null);
  const clashRef = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const update = () => {
      raf.current = null;
      const v = Math.min(1, Math.max(0, window.scrollY / 520));
      if (bullRef.current) bullRef.current.style.transform = `translate(${v * 85}px, ${v * 10}px) rotate(${v * 4.5}deg)`;
      if (bearRef.current) bearRef.current.style.transform = `translate(${-v * 85}px, ${v * 10}px) rotate(${-v * 4.5}deg)`;
      if (clashRef.current) {
        const c = Math.max(0, (v - 0.65) / 0.35);
        clashRef.current.style.opacity = c;
        clashRef.current.style.transform = `scale(${0.5 + c * 0.7})`;
      }
    };
    const onScroll = () => { if (!raf.current) raf.current = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 1200 560" className="w-full h-auto block" role="img" aria-label="Low-poly bull and bear charging toward each other" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2dd4bf" />
            <stop offset="0.45" stopColor="#0ea5a0" />
            <stop offset="1" stopColor="#0b3a52" />
          </linearGradient>
          <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="0.5" stopColor="#0e7490" />
            <stop offset="1" stopColor="#0a2540" />
          </linearGradient>
          <radialGradient id="aura" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.25" />
            <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="clashGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#d8fff7" stopOpacity="0.9" />
            <stop offset="0.4" stopColor="#2dd4bf" stopOpacity="0.45" />
            <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="horizGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2dd4bf" stopOpacity="0" />
            <stop offset="0.5" stopColor="#2dd4bf" stopOpacity="0.6" />
            <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
          </linearGradient>
          <filter id="glowF" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="bullClip"><path d={BULL_PATH} /></clipPath>
          <clipPath id="bearClip"><path d={BEAR_PATH} /></clipPath>
        </defs>

        {/* Aura glows behind each animal */}
        <ellipse cx="290" cy="310" rx="260" ry="180" fill="url(#aura)" />
        <ellipse cx="900" cy="290" rx="270" ry="190" fill="url(#aura)" />

        {/* Scatter crosses + dashed scan lines */}
        {CROSSES.map(([x, y], i) => (
          <g key={i} stroke="#5eead4" strokeOpacity="0.18" strokeWidth="1">
            <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
            <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
          </g>
        ))}
        <line x1="455" y1="295" x2="745" y2="295" stroke="#5eead4" strokeOpacity="0.12" strokeDasharray="3 9" />
        <line x1="600" y1="120" x2="600" y2="420" stroke="#5eead4" strokeOpacity="0.08" strokeDasharray="2 10" />

        {/* ── BULL (scroll-driven charge →) ── */}
        <g ref={bullRef} style={{ transformBox: 'fill-box', transformOrigin: '70% 80%', willChange: 'transform' }}>
          <g className="bob-a" style={{ transformBox: 'fill-box' }}>
            <path d={BULL_PATH} fill="url(#bullGrad)" opacity="0.5" />
            <g clipPath="url(#bullClip)">
              {BULL_MESH.tris.map((t, i) => (
                <polygon key={i} points={t.p.map(p => p.join(',')).join(' ')} fill={t.f} fillOpacity={t.o} stroke="#7df0dc" strokeOpacity="0.14" strokeWidth="0.7" />
              ))}
              {BULL_MESH.dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#7ff0dc" opacity={d.o} className={d.pulse ? 'node-pulse' : undefined} />
              ))}
            </g>
            <path d={BULL_PATH} fill="none" stroke="#5eead4" strokeOpacity="0.55" strokeWidth="1.4" strokeLinejoin="round" />
            {/* Horns */}
            <path d="M 400 214 C 418 188, 442 166, 466 148 C 452 172, 432 196, 414 224 Z" fill="#d8fff7" opacity="0.95" filter="url(#glowF)" />
            <path d="M 380 200 C 392 178, 408 158, 428 142 C 416 164, 402 184, 392 206 Z" fill="#aef5e8" opacity="0.5" />
            {/* Ear, tail */}
            <path d="M 372 196 L 348 180 L 362 206 Z" fill="#2dd4bf" opacity="0.6" />
            <path d="M 112 212 C 96 192, 84 174, 80 154 C 76 166, 80 190, 92 208 Z" fill="#0e7490" opacity="0.7" />
            <path d="M 80 154 L 70 134 L 88 146 Z" fill="#2dd4bf" opacity="0.7" />
            {/* Eye + nostril */}
            <circle cx="416" cy="254" r="3" fill="#d8fff7" filter="url(#glowF)" />
            <circle cx="452" cy="324" r="2" fill="#021018" opacity="0.85" />
          </g>
        </g>

        {/* ── BEAR (scroll-driven charge ←) ── */}
        <g ref={bearRef} style={{ transformBox: 'fill-box', transformOrigin: '30% 80%', willChange: 'transform' }}>
          <g className="bob-b" style={{ transformBox: 'fill-box' }}>
            <path d={BEAR_PATH} fill="url(#bearGrad)" opacity="0.5" />
            <g clipPath="url(#bearClip)">
              {BEAR_MESH.tris.map((t, i) => (
                <polygon key={i} points={t.p.map(p => p.join(',')).join(' ')} fill={t.f} fillOpacity={t.o} stroke="#7df0dc" strokeOpacity="0.14" strokeWidth="0.7" />
              ))}
              {BEAR_MESH.dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#7ff0dc" opacity={d.o} className={d.pulse ? 'node-pulse' : undefined} />
              ))}
            </g>
            <path d={BEAR_PATH} fill="none" stroke="#5eead4" strokeOpacity="0.55" strokeWidth="1.4" strokeLinejoin="round" />
            {/* Teeth */}
            <path d="M 712 211 L 717 224 L 723 213 Z" fill="#d8fff7" opacity="0.9" />
            <path d="M 726 216 L 731 227 L 736 218 Z" fill="#d8fff7" opacity="0.85" />
            <path d="M 724 250 L 729 238 L 735 249 Z" fill="#d8fff7" opacity="0.85" />
            {/* Claws — raised paw */}
            <path d="M 735 398 L 714 395 L 733 405 Z" fill="#d8fff7" opacity="0.9" />
            <path d="M 733 405 L 715 410 L 734 412 Z" fill="#d8fff7" opacity="0.85" />
            <path d="M 734 412 L 718 422 L 737 419 Z" fill="#d8fff7" opacity="0.8" />
            {/* Claws — planted paw */}
            <path d="M 824 459 L 808 464 L 826 466 Z" fill="#aef5e8" opacity="0.7" />
            <path d="M 836 459 L 822 466 L 840 466 Z" fill="#aef5e8" opacity="0.6" />
            {/* Eye + roar breath */}
            <circle cx="737" cy="196" r="3" fill="#d8fff7" filter="url(#glowF)" />
            <circle cx="686" cy="216" r="2" fill="#7ff0dc" opacity="0.4" className="tick" style={{ animationDelay: '0.4s' }} />
            <circle cx="672" cy="228" r="1.5" fill="#7ff0dc" opacity="0.3" className="tick" style={{ animationDelay: '1.6s' }} />
            <circle cx="664" cy="206" r="1" fill="#7ff0dc" opacity="0.3" className="tick" style={{ animationDelay: '2.4s' }} />
          </g>
        </g>

        {/* ── Clash spark (builds as they converge) ── */}
        <g ref={clashRef} style={{ opacity: 0, transformBox: 'fill-box', transformOrigin: 'center', willChange: 'transform, opacity' }}>
          <circle cx="600" cy="320" r="52" fill="url(#clashGrad)" />
          <path d="M 594 296 L 604 318 L 588 324 L 606 348" stroke="#d8fff7" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 616 304 L 602 322 L 618 330" stroke="#aef5e8" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ── Ground ── */}
        {GROUND.map((t, i) => (
          <polygon key={i} points={t.p.map(p => p.join(',')).join(' ')} fill={t.f} fillOpacity={t.o} stroke="#5eead4" strokeOpacity="0.16" strokeWidth="0.7" />
        ))}
        <line x1="0" y1="452" x2="1200" y2="452" stroke="url(#horizGrad)" strokeWidth="1.5" opacity="0.6" />

        {/* ── Floating tickers ── */}
        {TICKERS.map((tk, i) => (
          <text key={i} x={tk.x} y={tk.y} fill={tk.c} fontSize="12" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" opacity="0.55" className="tick" style={{ animationDelay: `${tk.d}s` }}>
            {tk.t}
          </text>
        ))}
        <text x="552" y="492" fill="#9be8da" fontSize="15" letterSpacing="1" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" opacity="0.7" className="tick" style={{ animationDelay: '1s' }}>
          62,901.36
        </text>
      </svg>
    </div>
  );
}
