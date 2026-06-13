import { useRef } from 'react';

// Mouse-tracking 3D tilt wrapper with cursor glare + glow lift.
// `glow` is an "r,g,b" string used for the shadow/border accent.
export default function TiltCard({ children, className = '', max = 12, glow = '45,212,191' }) {
  const ref = useRef(null);
  const glareRef = useRef(null);
  const raf = useRef(null);
  const pos = useRef({ px: 0.5, py: 0.5 });

  const render = () => {
    raf.current = null;
    const el = ref.current;
    if (!el) return;
    const { px, py } = pos.current;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(12px) scale(1.03)`;
    el.style.boxShadow = `0 24px 48px -12px rgba(${glow},0.4), 0 0 0 1px rgba(${glow},0.4)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.22), transparent 50%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pos.current = { px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height };
    if (!raf.current) raf.current = requestAnimationFrame(render);
  };

  const onLeave = () => {
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
    const el = ref.current;
    if (el) { el.style.transform = ''; el.style.boxShadow = ''; }
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative rounded-xl ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.3s ease', transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
      <div ref={glareRef} className="pointer-events-none absolute inset-0 rounded-xl" style={{ opacity: 0, transition: 'opacity 0.25s', mixBlendMode: 'soft-light' }} />
    </div>
  );
}
