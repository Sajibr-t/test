import Catalogue from "@/components/shop/Catalogue";

export default async function ShopPage({ searchParams }: PageProps<"/baby">) {
  return <Catalogue query={await searchParams} path="/baby" />;
}
