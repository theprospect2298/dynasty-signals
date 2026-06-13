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

export default function StatTile({ label, value, format, color = 'text-white', glow = '45,212,191', icon }) {
  const animated = useCountUp(value);
  return (
    <TiltCard glow={glow} className="bg-dark-700 border border-gray-800 overflow-hidden">
      {/* glowing top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, rgb(${glow}), transparent)`, opacity: 0.85 }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-2xl font-black ${color}`} style={{ textShadow: `0 0 18px rgba(${glow},0.5)` }}>
            {format(animated)}
          </p>
          {icon && (
            <span className="text-lg opacity-70 shrink-0" style={{ filter: `drop-shadow(0 0 6px rgba(${glow},0.6))` }}>{icon}</span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 uppercase tracking-[0.15em] font-mono mt-1">{label}</p>
      </div>
    </TiltCard>
  );
}
