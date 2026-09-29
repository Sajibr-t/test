import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN" || user.status === "APPROVED") redirect("/catalog");

  return (
    <div className="mx-auto max-w-md text-center">
      {user.status === "REJECTED" ? (
        <>
          <h1 className="font-display text-2xl font-bold text-brand">Application not approved</h1>
          <p className="mt-3 text-stone-600">
            Unfortunately your trade account application was not approved.
            Contact us if you believe this is a mistake.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-brand">Application received ✓</h1>
          <p className="mt-3 text-stone-600">
            Thanks, {user.contactName}! Your application for{" "}
            <strong>{user.businessName}</strong> is being reviewed. You&apos;ll
            get access to wholesale pricing once it&apos;s approved.
          </p>
        </>
      )}
    </div>
  );
}
