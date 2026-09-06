export const dynamic = "force-dynamic";

export function GET() {
  console.log("index: GET /health");
  return Response.json({ ok: true });
}
