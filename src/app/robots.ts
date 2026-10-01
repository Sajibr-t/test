import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/email";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/orders', '/cart', '/login', '/register', '/pending', '/forgot-password', '/reset-password', '/verify-email', '/api/'] }, ...(origin ? { sitemap: origin + '/sitemap.xml' } : {}) };
}
