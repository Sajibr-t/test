import { prisma } from "@/lib/db";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await prisma.productImage.findFirst({ where: { productId: id, product: { active: true } } });
  if (!image) return new Response("Not found", { status: 404 });
  const etag = `"${image.updatedAt.getTime()}"`;
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304 });
  return new Response(new Uint8Array(image.data), { headers: { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=60, must-revalidate", ETag: etag } });
}
