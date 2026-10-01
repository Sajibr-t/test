/** Small code-drawn decorations, kept out of the accessibility tree. */
export function BearMark({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 80 76" aria-hidden="true" className={className} fill="none">
    <circle cx="17" cy="18" r="14" fill="#DFB68D" />
    <circle cx="63" cy="18" r="14" fill="#DFB68D" />
    <circle cx="17" cy="18" r="8" fill="#F8DCC8" />
    <circle cx="63" cy="18" r="8" fill="#F8DCC8" />
    <rect x="7" y="13" width="66" height="59" rx="29" fill="#EDC9A2" />
    <ellipse cx="40" cy="49" rx="18" ry="15" fill="#FFF1DD" />
    <circle cx="26" cy="37" r="3" fill="#654746" /><circle cx="54" cy="37" r="3" fill="#654746" />
    <ellipse cx="19" cy="47" rx="7" ry="4" fill="#ECA5AC" /><ellipse cx="61" cy="47" rx="7" ry="4" fill="#ECA5AC" />
    <path d="M35 44Q40 40 45 44Q45 49 40 50Q35 49 35 44Z" fill="#654746" />
    <path d="M40 50V54M32 54Q36 60 40 54Q44 60 48 54" stroke="#654746" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

export function RainbowDoodle() {
  return <svg viewBox="0 0 150 105" aria-hidden="true" className="shop-rainbow" fill="none">
    <path d="M20 88V70a55 55 0 01110 0v18" stroke="#EFACC0" strokeWidth="13" strokeLinecap="round" />
    <path d="M35 88V70a40 40 0 0180 0v18" stroke="#F7D79B" strokeWidth="11" strokeLinecap="round" />
    <path d="M49 88V70a26 26 0 0152 0v18" stroke="#AACECB" strokeWidth="10" strokeLinecap="round" />
    <path d="M63 88V70a12 12 0 0124 0v18" stroke="#CAB9E7" strokeWidth="9" strokeLinecap="round" />
    <path d="M3 88Q3 78 14 80Q15 67 28 70Q39 71 38 81Q49 78 50 90Q50 99 38 99H14Q3 100 3 88M103 88Q103 78 114 80Q115 67 128 70Q139 71 138 81Q149 78 150 90Q150 99 138 99H114Q103 100 103 88" fill="#fff" />
  </svg>;
}
