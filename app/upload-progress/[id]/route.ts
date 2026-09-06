import { getEnv } from "@/lib/env";
import { handleRouteError } from "@/lib/http";
import { uploadProgress } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  console.log(`index: GET ${new URL(request.url).hostname} ${new URL(request.url).pathname}`);
  try {
    return uploadProgress(request, getEnv());
  } catch (error) {
    return handleRouteError(error);
  }
}
