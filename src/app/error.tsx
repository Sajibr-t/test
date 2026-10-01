"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="mx-auto max-w-lg p-8"><h1 className="text-3xl">Something went wrong</h1><p className="mt-4">Please try again. If you were placing an order, check your order history before submitting another order.</p><div className="mt-6 flex flex-wrap gap-4"><button onClick={reset} className="shop-button">Try again</button><Link href="/orders" className="underline">View orders</Link></div></section>;
}
