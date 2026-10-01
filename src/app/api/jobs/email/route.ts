import { timingSafeEqual } from "node:crypto";
import { deliverEmails } from "@/lib/email";
export async function POST(request: Request) {
  const secret = process.env.JOBS_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const receivedBytes = Buffer.from(supplied), expectedBytes = Buffer.from(expected);
  if (!secret || secret.length < 32 || receivedBytes.length !== expectedBytes.length || !timingSafeEqual(receivedBytes, expectedBytes)) return new Response("Unauthorized", { status: 401 });
  return Response.json(await deliverEmails());
}
