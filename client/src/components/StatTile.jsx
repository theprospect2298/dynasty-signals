import { useState, useEffect, useRef } from 'react';
import TiltCard from './TiltCard';

// Animated count-up from 0 → target with cubic ease-out
function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const num = Number(target) || 0;
    let start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(num * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// `value` + `format` → animated count-up. Or pass `display` for a static
// (non-numeric / combined) value that still tilts and glows.
export default function StatTile({ label, value, format, display, color = 'text-white', glow = '45,212,191', icon, hint }) {
  const animated = useCountUp(display != null ? 0 : value);
  return (
    <TiltCard glow={glow} className="bg-dark-700 border border-gray-800 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, rgb(${glow}), transparent)`, opacity: 0.85 }} />
      <div className="p-4" title={hint || ''}>
        <div className="flex items-start justify-between gap-2">
          <p className={`${display != null ? 'text-xl' : 'text-2xl'} font-black ${color}`} style={{ textShadow: `0 0 18px rgba(${glow},0.5)` }}>
            {display != null ? display : format(animated)}
          </p>
          {icon && (
            <span className="text-lg opacity-70 shrink-0" style={{ filter: `drop-shadow(0 0 6px rgba(${glow},0.6))` }}>{icon}</span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 uppercase tracking-[0.15em] font-mono mt-1 leading-tight">{label}</p>
      </div>
    </TiltCard>
  );
}
