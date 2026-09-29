// Original flat-cartoon park scene: sun, clouds, rainbow, hills,
// and two kids on bikes. Placeholder until real photography exists.
export function HeroScene() {
  return (
    <svg
      viewBox="0 0 760 480"
      className="h-full w-full"
      role="img"
      aria-label="Two kids riding bikes in a sunny park"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd8f5" />
          <stop offset="1" stopColor="#eaf7fd" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93d47e" />
          <stop offset="1" stopColor="#6cbd5a" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect width="760" height="480" fill="url(#sky)" />

      {/* rainbow */}
      <g fill="none" strokeLinecap="round">
        <path d="M-40 480 A170 170 0 0 1 300 480" stroke="#ff6b57" strokeWidth="12" />
        <path d="M-24 480 A154 154 0 0 1 284 480" stroke="#ffb347" strokeWidth="12" />
        <path d="M-8 480 A138 138 0 0 1 268 480" stroke="#ffd93b" strokeWidth="12" />
        <path d="M8 480 A122 122 0 0 1 252 480" stroke="#7ec97a" strokeWidth="12" />
        <path d="M24 480 A106 106 0 0 1 236 480" stroke="#5aa9e6" strokeWidth="12" />
      </g>

      {/* sun */}
      <g transform="translate(650 82)">
        <g stroke="#ffd93b" strokeWidth="7" strokeLinecap="round">
          <line x1="0" y1="-68" x2="0" y2="-52" />
          <line x1="0" y1="52" x2="0" y2="68" />
          <line x1="-68" y1="0" x2="-52" y2="0" />
          <line x1="52" y1="0" x2="68" y2="0" />
          <line x1="-48" y1="-48" x2="-37" y2="-37" />
          <line x1="37" y1="37" x2="48" y2="48" />
          <line x1="48" y1="-48" x2="37" y2="-37" />
          <line x1="-37" y1="37" x2="-48" y2="48" />
        </g>
        <circle r="42" fill="#ffd93b" />
        <circle cx="-13" cy="-6" r="4" fill="#8a6d00" />
        <circle cx="13" cy="-6" r="4" fill="#8a6d00" />
        <path d="M-14 8 Q0 22 14 8" fill="none" stroke="#8a6d00" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* clouds */}
      <g fill="#ffffff" opacity="0.95">
        <g transform="translate(120 78)">
          <ellipse rx="42" ry="20" />
          <ellipse cx="30" cy="-10" rx="30" ry="16" />
          <ellipse cx="-32" cy="-6" rx="26" ry="14" />
        </g>
        <g transform="translate(360 52)">
          <ellipse rx="34" ry="16" />
          <ellipse cx="26" cy="-8" rx="24" ry="13" />
        </g>
        <g transform="translate(540 140)" opacity="0.8">
          <ellipse rx="28" ry="13" />
          <ellipse cx="20" cy="-7" rx="18" ry="10" />
        </g>
      </g>

      {/* paper plane with dashed trail */}
      <g transform="translate(210 150)">
        <path
          d="M-120 40 Q-70 70 -20 22"
          fill="none"
          stroke="#5aa9e6"
          strokeWidth="3"
          strokeDasharray="7 8"
          strokeLinecap="round"
        />
        <path d="M0 0 L46 14 L14 22 L10 38 Z" fill="#ffffff" stroke="#5aa9e6" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* hills */}
      <path d="M0 330 Q160 268 340 316 Q540 366 760 300 L760 480 L0 480 Z" fill="url(#grass)" />
      <path d="M0 396 Q220 350 430 396 Q600 430 760 392 L760 480 L0 480 Z" fill="#7ec96a" opacity="0.7" />

      {/* flowers */}
      <g>
        {[
          [70, 380],
          [180, 420],
          [640, 420],
          [710, 380],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="6" fill="#fde2ea" />
            <circle r="2.6" fill="#ffd93b" />
          </g>
        ))}
      </g>

      {/* path */}
      <ellipse cx="390" cy="452" rx="320" ry="34" fill="#f2e3c0" />

      {/* ---- kid 1: blue bike, yellow tee ---- */}
      <g transform="translate(270 322)">
        {/* wheels */}
        <g fill="none" stroke="#2f3a44" strokeWidth="5">
          <circle cx="-48" cy="86" r="30" />
          <circle cx="52" cy="86" r="30" />
        </g>
        <circle cx="-48" cy="86" r="5" fill="#2f3a44" />
        <circle cx="52" cy="86" r="5" fill="#2f3a44" />
        {/* frame */}
        <g fill="none" stroke="#1e88e5" strokeWidth="6" strokeLinecap="round">
          <path d="M-48 86 L-8 46 L52 86" />
          <path d="M-8 46 L-30 36" />
          <path d="M52 86 L44 34" />
          <path d="M-48 86 L-30 36" />
        </g>
        <line x1="-38" y1="32" x2="-22" y2="32" stroke="#2f3a44" strokeWidth="6" strokeLinecap="round" />
        <line x1="36" y1="30" x2="54" y2="30" stroke="#2f3a44" strokeWidth="6" strokeLinecap="round" />
        {/* legs */}
        <path d="M4 -2 L-4 40 L14 58" fill="none" stroke="#3d6bb3" strokeWidth="10" strokeLinecap="round" />
        {/* body */}
        <rect x="-14" y="-36" width="40" height="48" rx="16" fill="#ffd93b" />
        {/* arm */}
        <path d="M-6 -20 L-30 34" fill="none" stroke="#ffd93b" strokeWidth="10" strokeLinecap="round" />
        {/* head */}
        <circle cx="8" cy="-58" r="20" fill="#f6c9a0" />
        <path d="M-12 -62 Q4 -88 30 -60 Q20 -74 8 -74 Q-6 -74 -12 -62 Z" fill="#6b4a2f" />
        <rect x="-6" y="-64" width="28" height="9" rx="4.5" fill="#2f3a44" />
        <path d="M0 -46 Q8 -40 16 -46" fill="none" stroke="#8a5a33" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ---- kid 2: pink bike with basket ---- */}
      <g transform="translate(480 334)">
        <g fill="none" stroke="#2f3a44" strokeWidth="5">
          <circle cx="-46" cy="80" r="28" />
          <circle cx="50" cy="80" r="28" />
        </g>
        <circle cx="-46" cy="80" r="5" fill="#2f3a44" />
        <circle cx="50" cy="80" r="5" fill="#2f3a44" />
        <g fill="none" stroke="#f26d8d" strokeWidth="6" strokeLinecap="round">
          <path d="M-46 80 L-6 42 L50 80" />
          <path d="M-6 42 L-28 32" />
          <path d="M50 80 L42 30" />
          <path d="M-46 80 L-28 32" />
        </g>
        {/* basket with flower */}
        <rect x="-46" y="18" width="26" height="20" rx="4" fill="#f2b56b" />
        <circle cx="-33" cy="12" r="7" fill="#fde2ea" />
        <circle cx="-33" cy="12" r="3" fill="#ffd93b" />
        <line x1="34" y1="26" x2="52" y2="26" stroke="#2f3a44" strokeWidth="6" strokeLinecap="round" />
        {/* legs */}
        <path d="M2 -4 L-4 38 L12 54" fill="none" stroke="#e0a13f" strokeWidth="10" strokeLinecap="round" />
        {/* body */}
        <rect x="-14" y="-38" width="38" height="48" rx="16" fill="#f9a8c0" />
        <path d="M-6 -22 L-28 30" fill="none" stroke="#f9a8c0" strokeWidth="10" strokeLinecap="round" />
        {/* head */}
        <circle cx="6" cy="-58" r="19" fill="#f2b184" />
        <path d="M-14 -56 Q-16 -84 8 -76 Q30 -84 26 -54 Q28 -40 20 -36 Q26 -52 18 -62 Q6 -70 -6 -62 Q-12 -52 -8 -38 Q-16 -44 -14 -56 Z" fill="#3d2b1f" />
        <path d="M-8 -74 Q6 -84 22 -72 L14 -66 Q6 -72 -2 -66 Z" fill="#ffd93b" />
        <rect x="-7" y="-63" width="26" height="8" rx="4" fill="#2f3a44" />
        <path d="M-2 -46 Q6 -40 14 -46" fill="none" stroke="#8a5a33" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
