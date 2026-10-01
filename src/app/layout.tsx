import { siteOrigin } from "@/lib/email";
import type { Metadata } from "next";
import { Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n-server";

const baloo = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...(siteOrigin() ? {metadataBase: new URL(siteOrigin()!)} : {}),
  title: "TinyThreads — Wholesale Baby & Kids Clothing",
  description:
    "Baby and kids’ clothing for independent retailers. Explore styles, prepacks and product minimums, then apply for wholesale ordering on Net 30 terms.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${baloo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
