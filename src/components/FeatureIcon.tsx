/* Thin line icons for feature lists and value props (Kyte-style, stroke inherits currentColor) */

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FeatureIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "box": // package
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...common}>
          <path d="M20 5 L34 12 V28 L20 35 L6 28 V12 Z" />
          <path d="M6 12 L20 19 L34 12 M20 19 V35" />
        </svg>
      );
    case "shield": // safe materials
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...common}>
          <path d="M20 4 L33 9 V19 Q33 30 20 36 Q7 30 7 19 V9 Z" />
          <path d="M14 19.5 L18.5 24 L27 15" />
        </svg>
      );
    case "check": // quality tick
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...common}>
          <circle cx="20" cy="20" r="14" />
          <path d="M13.5 20.5 L18 25 L27 15.5" />
        </svg>
      );
    case "truck": // delivery
      return (
        <svg width="44" height="40" viewBox="0 0 46 40" {...common}>
          <rect x="4" y="12" width="24" height="16" rx="1.5" />
          <path d="M28 17 H36 L41 22 V28 H28" />
          <circle cx="12" cy="31" r="3" />
          <circle cx="34" cy="31" r="3" />
        </svg>
      );
    case "return": // exchange
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...common}>
          <path d="M13 12 H27 Q33 12 33 19 Q33 26 27 26 H9" />
          <path d="M14 20 L8 26 L14 32" />
        </svg>
      );
    case "pay": // payment terms
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...common}>
          <circle cx="20" cy="20" r="14" />
          <path d="M20 11 V29 M25 14.5 Q20 11.5 16.5 14.5 Q13.5 17.5 17 19.5 L23 21.5 Q26.5 23.5 23.5 26.5 Q20 29 15 25.5" />
        </svg>
      );
    default:
      return null;
  }
}

/* Small garment line icons for category captions */
export function GarmentIcon({ kind }: { kind: string }) {
  const g = { ...common, strokeWidth: 1.8 };
  switch (kind) {
    case "onesie":
      return (
        <svg width="30" height="28" viewBox="0 0 46 44" {...g}>
          <path d="M14 4 H32 L42 12 L37 20 L32 16 V30 Q32 38 23 38 Q14 38 14 30 V16 L9 20 L4 12 Z" />
        </svg>
      );
    case "bottle":
      return (
        <svg width="20" height="30" viewBox="0 0 30 52" {...g}>
          <rect x="8" y="16" width="14" height="30" rx="6" />
          <rect x="10" y="10" width="10" height="6" rx="2" />
          <path d="M15 3 Q18.5 5.5 15 10 Q11.5 5.5 15 3 Z" />
          <path d="M11 27 H19 M11 34 H19" />
        </svg>
      );
    case "tshirt":
      return (
        <svg width="28" height="26" viewBox="0 0 36 32" {...g}>
          <path d="M7 6 L13 2 H23 L29 6 L25 12 L22 9 V28 H14 V9 L11 12 Z" />
          <path d="M14 4 Q18 7 22 4" />
        </svg>
      );
    case "dress":
      return (
        <svg width="26" height="28" viewBox="0 0 36 36" {...g}>
          <path d="M13 3 V8 M23 3 V8" />
          <path d="M13 8 H23 V13 L29 30 Q18 34 7 30 L13 13 Z" />
        </svg>
      );
    case "cap":
      return (
        <svg width="30" height="24" viewBox="0 0 40 30" {...g}>
          <path d="M6 20 A14 14 0 0 1 34 20" />
          <path d="M6 20 H34 M34 20 Q39 20 38 16" />
          <path d="M20 6 V20" />
        </svg>
      );
    default:
      return null;
  }
}
