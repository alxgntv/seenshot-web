import { getEnv } from "@/lib/env";
import { handleRouteError } from "@/lib/http";
import { serveLatestMacDmg } from "@/lib/site";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const url = new URL(request.url);
  console.log(
    "index: download arch route host=" + url.hostname +
      " path=" + url.pathname +
      " method=" + request.method,
  );
  try {
    return serveLatestMacDmg(request, getEnv());
  } catch (error) {
    return handleRouteError(error);
  }
}

export function GET(request: Request) {
  return handle(request);
}

export function HEAD(request: Request) {
  return handle(request);
}
