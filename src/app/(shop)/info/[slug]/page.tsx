import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/store-settings";
import { getLang } from "@/lib/i18n-server";
const pages = {
  contact: { en: "Contact us", ms: "Hubungi kami", key: null },
  delivery: { en: "Delivery information", ms: "Maklumat penghantaran", key: "deliveryPolicy" },
  returns: { en: "Returns policy", ms: "Polisi pemulangan", key: "returnsPolicy" },
  privacy: { en: "Privacy policy", ms: "Dasar privasi", key: "privacyPolicy" },
  terms: { en: "Terms of trade", ms: "Terma perdagangan", key: "terms" },
} as const;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = Object.hasOwn(pages, slug) ? pages[slug as keyof typeof pages] : undefined;
  if (!page) return {};
  const settings = await getStoreSettings();
  return { title: page.en + " | Tiny Threads", robots: { index: page.key ? Boolean(settings[page.key]) : Boolean(settings.supportEmail) }, alternates: { canonical: `/info/${slug}` } };
}
export default async function InformationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = Object.hasOwn(pages, slug) ? pages[slug as keyof typeof pages] : undefined;
  if (!page) notFound();
  const [settings, lang] = await Promise.all([getStoreSettings(), getLang()]);
  const text = page.key ? settings[page.key] : null;
  return <article className="mx-auto max-w-2xl"><h1 className="text-3xl">{page[lang]}</h1>
    {page.key ? <p className="mt-6 whitespace-pre-line leading-relaxed">{text || (lang === 'ms' ? 'Maklumat ini sedang disediakan. Sila hubungi kami sebelum membuat pesanan.' : 'This information is being prepared. Please contact us before ordering.')}</p> : <div className="mt-6 space-y-4"><h2 className="text-xl">{settings.businessName}</h2>{settings.businessAddress && <p className="whitespace-pre-line">{settings.businessAddress}</p>}{!settings.supportEmail && !settings.supportPhone && <p>{lang === 'ms' ? 'Maklumat hubungan akan tersedia tidak lama lagi.' : 'Contact information will be available soon.'}</p>}</div>}
    {settings.supportEmail && <p className="mt-6"><a className="underline" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a></p>}
    {settings.supportPhone && <p className="mt-2">{settings.supportPhone}</p>}
  </article>;
}
