import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/session";
import { getLang } from "@/lib/i18n-server";
import { productCopy } from "@/lib/i18n";
import { shopCopy } from "@/lib/shop-copy";
import { shopProduct } from "@/lib/shop-products";
import { readCart, priceCart } from "@/lib/cart";
import ProductCard from "@/components/shop/ProductCard";

export async function generateMetadata({ params }: { params: Promise<{id:string}> }) {
  const {id} = await params;
  const p = await prisma.product.findUnique({where: {id}, select: {name:true, description:true, imageUrl:true, active:true}});
  if (!p?.active) return {title:'Product not found', robots:{index:false}};
  return {title:p.name + ' | Tiny Threads', description:p.description?.slice(0,160), alternates:{canonical:'/catalog/' + id}, openGraph:{title:p.name, description:p.description?.slice(0,160), ...(p.imageUrl ? {images:[p.imageUrl]} : {})}};
}

export default async function ProductPage({ params }: PageProps<"/catalog/[id]">) {
  const { id } = await params;
  const [p, user, lang] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true, packs: true, priceBreaks: { orderBy: { minQty: "asc" } } } }), getUser(), getLang(),
  ]);
  if (!p || !p.active) notFound();
  const approved = !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  const priced = approved ? await priceCart(await readCart(), lang) : null;
  const c = shopCopy(lang);
  const product = shopProduct(p, lang, approved, priced?.lines.filter(l => l.productId === p.id).reduce((sum, l) => sum + l.units, 0));
  return <div className="mx-auto max-w-5xl"><Link href="/catalog" className="text-sm text-stone-500 hover:underline">&larr; {c.back}</Link><h1 className="mb-6 mt-4 text-3xl font-semibold">{product.name}</h1>
    <ProductCard detail product={product} lang={lang} accountHref={user ? "/pending" : "/login"} />
    <div className="mt-8 grid gap-8 border-t border-stone-200 pt-8 sm:grid-cols-2">
      <section>
        <h2 className="text-xl font-semibold">{c.description}</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{productCopy(lang, p).description}</p>
        {product.fabric && <>
          <h3 className="mt-5 font-medium">{c.fabricTitle}</h3>
          <p className="mt-1 text-sm text-stone-600">{product.fabric}</p>
        </>}
        <h3 className="mt-5 font-medium">{c.sizing}</h3>
        <p className="mt-1 text-sm text-stone-600">{[...new Set(p.variants.map(v => v.size))].join(" · ")}</p>
      </section>
      <section className="rounded-2xl bg-[#edf1ea] p-6">
        <h2 className="text-xl font-semibold">{c.ordering}</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{c.orderNote}</p>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{c.stockNote}</p>
        <p className="mt-4 text-sm font-medium">{c.moq}: {p.moq} {c.garments} &middot; {c.terms}</p>
      </section>
    </div>
  </div>;
}
