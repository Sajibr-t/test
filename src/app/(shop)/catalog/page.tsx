import Catalogue from "@/components/shop/Catalogue";

export default async function ShopPage({ searchParams }: PageProps<"/catalog">) {
  return <Catalogue query={await searchParams} path="/catalog" />;
}
