import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ShareView } from "@/components/share/ShareView";
import { getEnv } from "@/lib/env";
import { safeId } from "@/lib/http";
import { loadShare } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uploading?: string }>;
};

async function shareRequest(id: string, uploading: boolean): Promise<Request> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "seenshot.app";
  const proto = headerList.get("x-forwarded-proto") || "https";
  const origin = proto + "://" + host;
  const suffix = uploading ? "?uploading=1" : "";
  const requestHeaders = new Headers();
  headerList.forEach((value, key) => {
    requestHeaders.set(key, value);
  });
  const url = origin + "/screenshot/" + id + suffix;
  console.log("index: screenshot page request url=" + url);
  return new Request(url, { headers: requestHeaders });
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  if (!safeId(id)) {
    return { title: "SeenShot", robots: { index: false, follow: false } };
  }
  const request = await shareRequest(id, sp.uploading === "1");
  const loaded = await loadShare(request, getEnv(), "/screenshot/");
  if (loaded instanceof Response) {
    return { title: "SeenShot", robots: { index: false, follow: false } };
  }
  const live = loaded.live;
  return {
    title: "SeenShot",
    robots: { index: false, follow: false },
    openGraph: live
      ? {
          title: "SeenShot",
          images: [{ url: loaded.imageUrl }],
        }
      : undefined,
    twitter: live
      ? { card: "summary_large_image", images: [loaded.imageUrl] }
      : undefined,
  };
}

export default async function ScreenshotPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  if (!safeId(id)) {
    notFound();
  }
  const request = await shareRequest(id, sp.uploading === "1");
  const loaded = await loadShare(request, getEnv(), "/screenshot/");
  if (loaded instanceof Response) {
    notFound();
  }
  if (loaded.missing && !loaded.uploading && !loaded.unavailable) {
    notFound();
  }
  return <ShareView {...loaded} />;
}
