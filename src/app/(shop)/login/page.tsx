import Link from "next/link";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-bold text-brand">Log in</h1>
      {params.error && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Invalid email or password.
        </p>
      )}
      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <button className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light">
          Log in
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-500">
        No account?{" "}
        <Link href="/register" className="underline">
          Apply for a trade account
        </Link>
      </p>
    </div>
  );
}
