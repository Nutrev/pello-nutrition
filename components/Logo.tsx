// Pello wordmarks: cream lettering on a green block, with a band that tapers from
// a point on the left and sweeps off the bottom-right corner. No font is named, so
// the text uses the site font (DM Sans).
const GREEN = "#2D4A2D";
const CREAM = "#F5F0E8";

// Inline badge for the site nav. The text is centred on its letters' ink (x is
// nudged to allow for NUTRITION's trailing letter spacing).
export default function Logo() {
  return (
    <svg width="132" height="36" viewBox="0 0 366 100" role="img" className="w-[132px] h-auto" style={{ flexShrink: 0 }}>
      <title>Pello Nutrition</title>
      <rect width="366" height="100" rx="12" fill={GREEN} />
      <text x="184.1" y="56" textAnchor="middle" fill={CREAM}>
        <tspan fontSize="50" fontWeight="700">PELLO</tspan>
        <tspan dx="14" fontSize="24" fontWeight="900" letterSpacing="4">NUTRITION</tspan>
      </text>
      <path d="M3.7 76 C54.9 66 137.3 72 210.5 84 C274.5 94 329.4 88 366 76 L366 88 A12 12 0 0 1 354 100 L292.8 100 C201.3 98 91.5 86 3.7 76 Z" fill={CREAM} />
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
      <text x="100" y="60" textAnchor="middle" fontSize="54" fontWeight="700" fill={CREAM}>PELLO</text>
      <text x="20.27" y="88" fontSize="22" fontWeight="900" textLength="160.8" lengthAdjust="spacing" fill={CREAM}>NUTRITION</text>
      <path d="M4 108 C30 101 70 104 110 114 C140 121 175 116 200 106 L200 126 A10 10 0 0 1 190 136 L160 136 C110 132 50 118 4 108 Z" fill={CREAM} />
    </svg>
  );
}
