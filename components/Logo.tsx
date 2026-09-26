// Pello wordmarks: cream lettering on a green block, with a band that tapers from
// a point on the left and sweeps off the bottom-right corner. No font is named, so
// the text uses the site font (DM Sans).
const GREEN = "#2D4A2D";
const CREAM = "#F5F0E8";

// Inline badge for the site nav.
export default function Logo() {
  return (
    <svg width="144" height="36" viewBox="0 0 400 100" role="img" className="w-36 h-auto" style={{ flexShrink: 0 }}>
      <title>Pello Nutrition</title>
      <rect width="400" height="100" rx="12" fill={GREEN} />
      <text x="200" y="56" textAnchor="middle" fill={CREAM}>
        <tspan fontSize="50" fontWeight="800" letterSpacing="5">PELLO</tspan>
        <tspan dx="14" fontSize="24" fontWeight="800" letterSpacing="4">NUTRITION</tspan>
      </text>
      <path d="M4 76 C60 66 150 72 230 84 C300 94 360 88 400 76 L400 88 A12 12 0 0 1 388 100 L320 100 C220 98 100 86 4 76 Z" fill={CREAM} />
    </svg>
  );
}

// Stacked badge for compact spots such as the footer. NUTRITION is positioned and
// stretched so its letters line up with PELLO's on both edges. The numbers allow for
// the letters' built-in side spacing in DM Sans, so they need rechecking if the
// font, sizes or weights change.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="200" height="136" viewBox="0 0 200 136" role="img" className={className}>
      <title>Pello Nutrition</title>
      <rect width="200" height="136" rx="10" fill={GREEN} />
      <text x="100" y="60" textAnchor="middle" fontSize="54" fontWeight="800" fill={CREAM}>PELLO</text>
      <text x="19.85" y="88" fontSize="22" fontWeight="800" textLength="161.6" lengthAdjust="spacing" fill={CREAM}>NUTRITION</text>
      <path d="M4 108 C30 101 70 104 110 114 C140 121 175 116 200 106 L200 126 A10 10 0 0 1 190 136 L160 136 C110 132 50 118 4 108 Z" fill={CREAM} />
    </svg>
  );
}
