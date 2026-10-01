import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto max-w-lg p-10"><h1 className="text-3xl">Page not found</h1><p className="mt-4">This page or product is no longer available.</p><Link href="/catalog" className="shop-button mt-6">Browse the catalogue</Link></main>;
}
