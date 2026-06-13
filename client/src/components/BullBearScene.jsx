import { useEffect, useRef, useState } from 'react';

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

// Particle "dissolve" field — bits of the animals breaking away
function genParticles(x0, y0, w, h, seed, count = 36) {
  const rnd = mulberry32(seed);
  const dots = [], tris = [];
  for (let i = 0; i < count; i++) {
    dots.push({ x: x0 + rnd() * w, y: y0 + rnd() * h, r: 0.6 + rnd() * 1.4, o: 0.15 + rnd() * 0.5, d: (rnd() * 4).toFixed(1) });
  }
  for (let i = 0; i < 7; i++) {
    const x = x0 + rnd() * w, y = y0 + rnd() * h, s = 3 + rnd() * 6;
    tris.push({ pts: `${x},${y} ${x + s},${y + s * 0.6} ${x - s * 0.4},${y + s}`, o: 0.12 + rnd() * 0.25, d: (rnd() * 4).toFixed(1) });
  }
  return { dots, tris };
}

const BULL_MESH = genMesh(95, 140, 410, 330, 7);
const BEAR_MESH = genMesh(640, 110, 430, 344, 13);
const BULL_PARTS = genParticles(105, 105, 300, 95, 21);
const BEAR_PARTS = genParticles(700, 78, 340, 110, 31);

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

const BULL_PATH = `M 100 170
L 122 196 L 148 224
L 205 208 L 280 184 L 345 162
L 392 196 L 414 232 L 424 252
L 452 300 L 478 348 L 484 376 L 462 392
L 434 380 L 420 360 L 414 348
L 422 382 L 430 396
L 446 452 L 424 454 L 414 404
L 402 392
L 388 420 L 376 432 L 340 424 L 334 410 L 356 398 L 368 382
L 318 374 L 262 368
L 246 394 L 226 412 L 196 452 L 176 452 L 204 404 L 218 370
L 196 376 L 162 414 L 136 452 L 118 450 L 148 396 L 160 348
L 146 298 L 140 250 Z`;

const BEAR_PATH = `M 664 158
L 686 142
L 712 132 L 720 114 L 734 130
L 744 130
L 752 128 L 764 114 L 776 130
L 794 140
L 844 152 L 922 192 L 1000 242
L 1042 292 L 1054 342
L 1062 402 L 1052 450
L 1002 452 L 1012 408 L 988 364
L 962 370 L 954 412 L 944 450
L 902 452 L 920 402 L 934 366
L 904 374
L 876 396 L 820 388
L 800 420 L 794 452
L 756 454 L 770 408 L 776 378
L 770 372
L 736 388 L 700 398 L 672 404
L 664 388
L 690 376 L 724 348 L 756 322
L 738 290 L 722 262
L 690 252 L 672 236
L 734 210
L 668 174 Z`;

const TICKERS = [
  { x: 165, y: 112, t: '▲ +40.66', c: '#4ade80', d: 0 },
  { x: 70, y: 300, t: '0.8384', c: '#5eead4', d: 1.2 },
  { x: 320, y: 86, t: '+0.32', c: '#5eead4', d: 2 },
  { x: 235, y: 330, t: '48,900', c: '#5eead4', d: 0.6 },
  { x: 540, y: 110, t: '5,190', c: '#5eead4', d: 1.8 },
  { x: 596, y: 152, t: '4,571.03', c: '#5eead4', d: 2.6 },
  { x: 1010, y: 112, t: '▼ -64.62', c: '#f87171', d: 0.9 },
  { x: 1096, y: 296, t: '[-16.24]', c: '#f87171', d: 1.5 },
  { x: 936, y: 84, t: '▲ +45.10', c: '#4ade80', d: 2.2 },
  { x: 1080, y: 206, t: '+41.81', c: '#4ade80', d: 0.3 },
];

const CROSSES = [[138, 215], [500, 200], [770, 70], [905, 320], [296, 416], [1140, 152], [560, 372]];

const VIEW = '0 0 1200 560';
const POP_EASE = 'transform 0.55s cubic-bezier(0.18, 0.9, 0.22, 1.35), opacity 0.35s ease, filter 0.35s ease';

export default function BullBearScene() {
  const [hovered, setHovered] = useState(null); // 'bull' | 'bear' | null
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const bullRef = useRef(null);
  const bearRef = useRef(null);
  const clashRef = useRef(null);
  const raf = useRef(null);

  // Scroll-driven charge (unchanged)
  useEffect(() => {
    const update = () => {
      raf.current = null;
      const v = Math.min(1, Math.max(0, window.scrollY / 520));
      if (bullRef.current) bullRef.current.style.transform = `translate(${v * 60}px, ${v * 8}px) rotate(${v * 4}deg)`;
      if (bearRef.current) bearRef.current.style.transform = `translate(${-v * 60}px, ${v * 8}px) rotate(${-v * 4}deg)`;
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

  // Mouse-tracking parallax tilt — the whole diorama leans with the cursor
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    let tiltRaf = null;
    let last = null;

    const apply = () => {
      tiltRaf = null;
      if (!last) return;
      stage.style.transform = `rotateY(${last.nx * 5}deg) rotateX(${last.ny * -3.5}deg)`;
    };
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      last = {
        nx: ((e.clientX - r.left) / r.width) * 2 - 1,
        ny: ((e.clientY - r.top) / r.height) * 2 - 1,
      };
      if (!tiltRaf) tiltRaf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      stage.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
    };
  }, []);

  // Per-layer 3D pop styling
  const animalLayer = (which) => {
    const isHovered = hovered === which;
    const otherHovered = hovered && hovered !== which;
    return {
      position: 'absolute',
      inset: 0,
      transformStyle: 'preserve-3d',
      transformOrigin: which === 'bull' ? '30% 62%' : '74% 58%',
      transform: isHovered
        ? `translateZ(150px) scale(1.08) rotateY(${which === 'bull' ? 9 : -9}deg) rotateX(4deg)`
        : otherHovered
          ? 'translateZ(-35px) scale(0.985)'
          : 'translateZ(0px)',
      opacity: otherHovered ? 0.7 : 1,
      filter: isHovered
        ? 'drop-shadow(0 30px 46px rgba(45, 212, 191, 0.45)) brightness(1.18)'
        : 'none',
      transition: POP_EASE,
      willChange: 'transform, filter',
      pointerEvents: 'none',
      zIndex: isHovered ? 3 : 1,
    };
  };

  const bgLayer = {
    position: 'absolute',
    inset: 0,
    transform: hovered ? 'translateZ(-80px) scale(1.03)' : 'translateZ(-40px) scale(1.02)',
    filter: hovered ? 'brightness(0.75)' : 'none',
    transition: POP_EASE,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none z-10"
      style={{ aspectRatio: '1200 / 560', perspective: '1100px', perspectiveOrigin: '50% 42%' }}
      role="img"
      aria-label="Low-poly bull and bear charging toward each other"
    >
      <div ref={stageRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out', willChange: 'transform' }}>

        {/* ── LAYER 1: background (auras, scan lines, clash, ground, tickers) ── */}
        <svg viewBox={VIEW} className="w-full h-full block" style={bgLayer} xmlns="http://www.w3.org/2000/svg">
          <defs>
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
          </defs>

          <ellipse cx="300" cy="310" rx="260" ry="180" fill="url(#aura)" />
          <ellipse cx="870" cy="290" rx="270" ry="185" fill="url(#aura)" />

          {CROSSES.map(([x, y], i) => (
            <g key={i} stroke="#5eead4" strokeOpacity="0.18" strokeWidth="1">
              <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
              <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
            </g>
          ))}
          <line x1="500" y1="280" x2="650" y2="280" stroke="#5eead4" strokeOpacity="0.12" strokeDasharray="3 9" />
          <line x1="575" y1="120" x2="575" y2="420" stroke="#5eead4" strokeOpacity="0.08" strokeDasharray="2 10" />

          <g ref={clashRef} style={{ opacity: 0, transformBox: 'fill-box', transformOrigin: 'center', willChange: 'transform, opacity' }}>
            <circle cx="575" cy="278" r="52" fill="url(#clashGrad)" />
            <path d="M 569 254 L 579 276 L 563 282 L 581 306" stroke="#d8fff7" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 591 262 L 577 280 L 593 288" stroke="#aef5e8" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {GROUND.map((t, i) => (
            <polygon key={i} points={t.p.map(p => p.join(',')).join(' ')} fill={t.f} fillOpacity={t.o} stroke="#5eead4" strokeOpacity="0.16" strokeWidth="0.7" />
          ))}
          <line x1="0" y1="452" x2="1200" y2="452" stroke="url(#horizGrad)" strokeWidth="1.5" opacity="0.6" />

          {TICKERS.map((tk, i) => (
            <text key={i} x={tk.x} y={tk.y} fill={tk.c} fontSize="12" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" opacity="0.55" className="tick" style={{ animationDelay: `${tk.d}s` }}>
              {tk.t}
            </text>
          ))}
          <text x="552" y="492" fill="#9be8da" fontSize="15" letterSpacing="1" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" opacity="0.7" className="tick" style={{ animationDelay: '1s' }}>
            62,901.36
          </text>
        </svg>

        {/* ── LAYER 2: BULL (3D pop on hover) ── */}
        <svg viewBox={VIEW} className="w-full h-full block" style={animalLayer('bull')} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2dd4bf" />
              <stop offset="0.45" stopColor="#0ea5a0" />
              <stop offset="1" stopColor="#0b3a52" />
            </linearGradient>
            <filter id="glowFb" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="bullClip"><path d={BULL_PATH} /></clipPath>
          </defs>

          <g
            ref={bullRef}
            id="bull-hit"
            style={{ transformBox: 'fill-box', transformOrigin: '70% 80%', willChange: 'transform', pointerEvents: 'auto', cursor: 'pointer' }}
            onMouseEnter={() => setHovered('bull')}
            onMouseLeave={() => setHovered(h => (h === 'bull' ? null : h))}
          >
            <g className="bob-a" style={{ transformBox: 'fill-box' }}>
              {BULL_PARTS.dots.map((p, i) => (
                <circle key={'p' + i} cx={p.x} cy={p.y} r={p.r} fill="#7ff0dc" opacity={p.o} className="tick" style={{ animationDelay: `${p.d}s` }} />
              ))}
              {BULL_PARTS.tris.map((t, i) => (
                <polygon key={'t' + i} points={t.pts} fill="none" stroke="#5eead4" strokeOpacity={t.o} strokeWidth="0.8" className="tick" style={{ animationDelay: `${t.d}s` }} />
              ))}
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
              <path d="M 408 244 C 446 220, 482 200, 500 172 C 506 162, 504 150, 496 142 C 500 156, 494 170, 482 184 C 462 206, 438 228, 430 256 Z" fill="#d8fff7" opacity="0.95" filter="url(#glowFb)" />
              <path d="M 388 234 C 414 208, 440 190, 454 166 C 458 156, 456 146, 450 140 C 452 154, 446 166, 436 178 C 420 196, 402 216, 392 240 Z" fill="#aef5e8" opacity="0.5" />
              <path d="M 386 244 L 360 230 L 374 260 Z" fill="#2dd4bf" opacity="0.6" />
              <path d="M 100 170 L 84 142 L 114 150 Z" fill="#2dd4bf" opacity="0.75" />
              <path d="M 334 410 L 318 416 L 338 424 Z" fill="#aef5e8" opacity="0.8" />
              <circle cx="430" cy="288" r="3" fill="#d8fff7" filter="url(#glowFb)" />
              <circle cx="470" cy="368" r="2" fill="#021018" opacity="0.85" />
            </g>
          </g>
        </svg>

        {/* ── LAYER 3: BEAR (3D pop on hover) ── */}
        <svg viewBox={VIEW} className="w-full h-full block" style={animalLayer('bear')} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5eead4" />
              <stop offset="0.5" stopColor="#0e7490" />
              <stop offset="1" stopColor="#0a2540" />
            </linearGradient>
            <filter id="glowFr" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="bearClip"><path d={BEAR_PATH} /></clipPath>
          </defs>

          <g
            ref={bearRef}
            id="bear-hit"
            style={{ transformBox: 'fill-box', transformOrigin: '30% 80%', willChange: 'transform', pointerEvents: 'auto', cursor: 'pointer' }}
            onMouseEnter={() => setHovered('bear')}
            onMouseLeave={() => setHovered(h => (h === 'bear' ? null : h))}
          >
            <g className="bob-b" style={{ transformBox: 'fill-box' }}>
              {BEAR_PARTS.dots.map((p, i) => (
                <circle key={'p' + i} cx={p.x} cy={p.y} r={p.r} fill="#7ff0dc" opacity={p.o} className="tick" style={{ animationDelay: `${p.d}s` }} />
              ))}
              {BEAR_PARTS.tris.map((t, i) => (
                <polygon key={'t' + i} points={t.pts} fill="none" stroke="#5eead4" strokeOpacity={t.o} strokeWidth="0.8" className="tick" style={{ animationDelay: `${t.d}s` }} />
              ))}
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
              <path d="M 696 190 L 702 204 L 710 193 Z" fill="#d8fff7" opacity="0.9" />
              <path d="M 714 199 L 720 212 L 727 202 Z" fill="#d8fff7" opacity="0.85" />
              <path d="M 686 227 L 694 215 L 700 226 Z" fill="#d8fff7" opacity="0.85" />
              <path d="M 664 388 L 646 392 L 666 398 Z" fill="#d8fff7" opacity="0.9" filter="url(#glowFr)" />
              <path d="M 672 404 L 654 410 L 674 412 Z" fill="#d8fff7" opacity="0.85" />
              <path d="M 756 454 L 740 458 L 757 461 Z" fill="#aef5e8" opacity="0.7" />
              <path d="M 902 452 L 887 455 L 903 458 Z" fill="#aef5e8" opacity="0.7" />
              <path d="M 1002 452 L 987 455 L 1003 458 Z" fill="#aef5e8" opacity="0.7" />
              <circle cx="696" cy="170" r="3" fill="#d8fff7" filter="url(#glowFr)" />
              <circle cx="668" cy="164" r="2" fill="#021018" opacity="0.85" />
              <circle cx="646" cy="148" r="2" fill="#7ff0dc" opacity="0.4" className="tick" style={{ animationDelay: '0.4s' }} />
              <circle cx="634" cy="136" r="1.5" fill="#7ff0dc" opacity="0.3" className="tick" style={{ animationDelay: '1.6s' }} />
              <circle cx="630" cy="240" r="1" fill="#7ff0dc" opacity="0.3" className="tick" style={{ animationDelay: '2.4s' }} />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
