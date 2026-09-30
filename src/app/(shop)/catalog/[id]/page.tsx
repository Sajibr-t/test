/**
 * Legacy product-detail URL.
 *
 * Individual product pages were removed once colour, size, prepack and
 * quantity moved onto the cards in the grid — buyers order without leaving the
 * listing. Old bookmarks, browser history and any links already shared still
 * point here, so instead of a dead 404 we send them to the catalogue.
 *
 * `permanentRedirect` (308) tells browsers and crawlers the move is permanent.
 * If product pages ever come back, delete this file and rebuild the route.
 */
import { permanentRedirect } from "next/navigation";

export default async function LegacyProductPage() {
  permanentRedirect("/catalog");
}
