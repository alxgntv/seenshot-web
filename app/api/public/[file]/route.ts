import { getEnv } from "@/lib/env";
import { handleRouteError } from "@/lib/http";
import { allowScreenshotTraffic, publicPng } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log(`index: GET ${url.hostname} ${url.pathname}`);
  try {
    const env = getEnv();
    const limited = await allowScreenshotTraffic(request, env);
    if (limited) {
      return limited;
    }
    return publicPng(request, env);
  } catch (error) {
    return handleRouteError(error);
  }
}
