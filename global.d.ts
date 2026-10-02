export {};

declare module "react" {
  interface ImgHTMLAttributes<T> {
    description?: string
  }
}

declare global {
  interface Window {
    SeenShotAuth?: unknown;
    SeenShotNav?: { paint: () => Promise<void> | void };
    SeenShotCabinet?: { logActions: () => void };
    SeenShotShot?: { start: (shotId: string) => void };
    SeenShotScreenshotUpload?: {
      start: (publicId: string, imageUrl: string, pageUrl: string, progressUrl: string) => void;
    };
    SeenShotShareSocial?: { bind: () => void };
    SeenShotShareEmbed?: { bind: (imageUrl: string) => void };
    __seenshotPosthogStarted?: boolean;
    __seenshotSupportStarted?: boolean;
    posthog?: {
      init: (...args: unknown[]) => void;
      capture?: (...args: unknown[]) => void;
      get_distinct_id?: () => string;
      conversations?: { hide: () => void };
    };
    lucide?: {
      createIcons: (opts: { icons: Record<string, unknown> }) => void;
      Moon?: unknown;
      Sun?: unknown;
      Link?: unknown;
      Check?: unknown;
      icons?: Record<string, unknown>;
    };
  }
}
