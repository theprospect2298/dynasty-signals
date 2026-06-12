export default function Logo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Dynasty Signals logo">
      <defs>
        <linearGradient id="lgBull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="lgBear" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* Bull head — left, charging right */}
      <path d="M3 16 L14 12 L20 22 L16 32 L7 28 Z" fill="url(#lgBull)" opacity="0.92" />
      <path d="M14 12 L20 22 L22 15 Z" fill="#2dd4bf" opacity="0.7" />
      <path d="M3 16 L7 28 L1 23 Z" fill="#0f766e" opacity="0.85" />
      <path d="M12 12 L7 3 L17 9 Z" fill="#d8fff7" />
      {/* Bear head — right, charging left */}
      <path d="M45 16 L34 12 L28 22 L32 32 L41 28 Z" fill="url(#lgBear)" opacity="0.92" />
      <path d="M34 12 L28 22 L26 15 Z" fill="#38bdf8" opacity="0.7" />
      <path d="M45 16 L41 28 L47 23 Z" fill="#1e40af" opacity="0.85" />
      <path d="M36 12 L41 3 L31 9 Z" fill="#bae6fd" />
      {/* Clash spark between them */}
      <circle cx="24" cy="22" r="2.2" fill="#eafff9" />
      <path d="M24 15 L24 10 M24 29 L24 34" stroke="#5eead4" strokeWidth="1.4" strokeLinecap="round" />
      {/* Chart baseline */}
      <path d="M6 41 L14 36 L22 41 L31 35 L42 40" stroke="#2dd4bf" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}
