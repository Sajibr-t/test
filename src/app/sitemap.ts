import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/email";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  if (!origin) return [];
  const products = await prisma.product.findMany({ where: { active: true }, select: { id: true } });
  return ['/', '/catalog', '/baby', '/info/contact', ...products.map(p => '/catalog/' + p.id)].map(path => ({ url: origin + path }));
}
