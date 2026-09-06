import { getEnv } from "@/lib/env";
import { corsPreflight, handleRouteError, withCors } from "@/lib/http";
import { me } from "@/lib/site";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: Request) {
  console.log(`index: GET ${new URL(request.url).hostname} ${new URL(request.url).pathname}`);
  try {
    return withCors(await me(request, getEnv()));
  } catch (error) {
    return handleRouteError(error);
  }
}
