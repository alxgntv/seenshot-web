import { handleRouteError } from "@/lib/http";
import { proxySparkleAppcastX86_64 } from "@/lib/site";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const url = new URL(request.url);
  console.log(
    "index: appcast-x86_64 route host=" + url.hostname +
      " path=" + url.pathname +
      " method=" + request.method,
  );
  try {
    return proxySparkleAppcastX86_64(request);
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
