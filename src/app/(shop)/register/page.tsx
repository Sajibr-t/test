import { register } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold text-brand">Apply for a trade account</h1>
      <p className="mt-2 text-sm text-stone-500">
        Wholesale pricing is only visible to approved businesses. We review
        every application.
      </p>
      {params.error === "exists" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          An account with that email already exists — try logging in.
        </p>
      )}
      {params.error === "invalid" && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Please fill in all required fields (password at least 8 characters).
        </p>
      )}
      <form action={register} className="mt-6 space-y-4">
        <label className="block text-sm">
          Business name *
          <input
            name="businessName"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Contact name *
          <input
            name="contactName"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Email *
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password * <span className="text-stone-400">(min 8 characters)</span>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Phone
          <input
            name="phone"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Business address
          <textarea
            name="address"
            rows={2}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Tax / business registration ID
          <input
            name="taxId"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </label>
        <button className="w-full rounded bg-brand py-2 font-medium text-white hover:bg-brand-light">
          Submit application
        </button>
      </form>
    </div>
  );
}
