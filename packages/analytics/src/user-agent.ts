/**
 * Coarse user-agent categorization. Only categories are stored — never the
 * raw user-agent string — which keeps analytics useful while minimizing data.
 */
export interface UserAgentCategories {
  deviceType: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
  browser: string;
  os: string;
  isBot: boolean;
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|scrap|fetch|preview|monitor|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|python-urllib|aiohttp|httpx|go-http-client|java\/|okhttp|axios|node-fetch|undici|postman|insomnia|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|slackbot|twitterbot|linkedinbot|applebot|bingpreview|phantomjs|selenium|puppeteer|playwright/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_PATTERN.test(userAgent);
}

export function categorizeUserAgent(userAgent: string | null | undefined): UserAgentCategories {
  const ua = userAgent ?? "";
  if (isBotUserAgent(ua)) return { deviceType: "bot", browser: "bot", os: "other", isBot: true };

  const os = /windows nt/i.test(ua)
    ? "windows"
    : /iphone|ipad|ipod/i.test(ua)
      ? "ios"
      : /android/i.test(ua)
        ? "android"
        : /mac os x|macintosh/i.test(ua)
          ? "macos"
          : /cros/i.test(ua)
            ? "chromeos"
            : /linux/i.test(ua)
              ? "linux"
              : "other";

  const browser = /edg(e|a|ios)?\//i.test(ua)
    ? "edge"
    : /opr\/|opera/i.test(ua)
      ? "opera"
      : /samsungbrowser/i.test(ua)
        ? "samsung"
        : /yabrowser/i.test(ua)
          ? "yandex"
          : /firefox|fxios/i.test(ua)
            ? "firefox"
            : /chrome|crios|chromium/i.test(ua)
              ? "chrome"
              : /safari/i.test(ua)
                ? "safari"
                : "other";

  const deviceType = /ipad|tablet|(android(?!.*mobile))/i.test(ua)
    ? "tablet"
    : /mobi|iphone|ipod|android/i.test(ua)
      ? "mobile"
      : os === "other"
        ? "unknown"
        : "desktop";

  return { deviceType, browser, os, isBot: false };
}
