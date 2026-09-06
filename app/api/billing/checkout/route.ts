import { getEnv } from "@/lib/env";
import { corsPreflight, handleRouteError, withCors } from "@/lib/http";
import { billingCheckout } from "@/lib/site";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  console.log(`index: POST ${new URL(request.url).hostname} ${new URL(request.url).pathname}`);
  try {
    return withCors(await billingCheckout(request, getEnv()));
  } catch (error) {
    return handleRouteError(error);
  }
}
