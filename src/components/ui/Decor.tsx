/**
 * Decorative pieces drawn from garment construction.
 *
 *   <PicotEdge>  a scalloped hem where a coloured band meets the page
 *
 * Decorative only: hidden from screen readers, ignores pointer events, and
 * never carries meaning.
 */

/**
 * Scalloped picot hem — the looped trim you find on the edge of a baby
 * dress or bib. Used to finish a coloured band softly instead of cutting
 * it off with a hard straight line.
 *
 * `flip` puts the scallops along the top edge instead of the bottom.
 */
export function PicotEdge({
  color = "#FFFFFF",
  flip = false,
  className = "",
}: {
  color?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`block w-full ${className}`}
      style={{ height: 22, transform: flip ? "rotate(180deg)" : undefined }}
      viewBox="0 0 1200 22"
      preserveAspectRatio="none"
    >
      {/* a row of half-circles, like looped picot trim */}
      <path
        fill={color}
        d="M0 22h1200V11a11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0 11 11 0 0 1-22 0 11 11 0 0 0-22 0Z"
      />
    </svg>
  );
}
