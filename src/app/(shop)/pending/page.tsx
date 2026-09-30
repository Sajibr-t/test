import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function PendingPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN" || user.status === "APPROVED") redirect("/catalog");
  const lang = await getLang();

  return (
    <div className="mx-auto max-w-md text-center">
      {user.status === "REJECTED" ? (
        <>
          <h1 className="font-display text-2xl font-bold text-brand">
            {t(lang, "pending.rejectedTitle")}
          </h1>
          <p className="mt-3 text-stone-600">
            {t(lang, "pending.rejectedBody")}
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-brand">
            {t(lang, "pending.title")}
          </h1>
          <p className="mt-3 text-stone-600">
            {t(lang, "pending.thanks")}, {user.contactName}!{" "}
            {t(lang, "pending.applicationFor")}{" "}
            <strong>{user.businessName}</strong>{" "}
            {t(lang, "pending.underReview")}
          </p>
        </>
      )}
    </div>
  );
}
