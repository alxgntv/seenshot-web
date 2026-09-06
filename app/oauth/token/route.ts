import { getEnv } from "@/lib/env";
import { handleRouteError } from "@/lib/http";
import { handleTokenPost } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  console.log(`index: POST ${new URL(request.url).hostname} ${new URL(request.url).pathname}`);
  try {
    return handleTokenPost(request, getEnv());
  } catch (error) {
    return handleRouteError(error);
  }
}
