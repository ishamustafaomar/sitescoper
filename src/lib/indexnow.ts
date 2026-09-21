/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver and (via their shared endpoint)
 * every other IndexNow participant that a URL changed, so it is re-crawled in
 * minutes instead of weeks. Google does not use IndexNow; it is nudged through
 * the sitemap's <lastmod> instead.
 *
 * The key is intentionally public: the protocol proves ownership by serving
 * the same key at https://<host>/<key>.txt (see public/<key>.txt).
 */
export const INDEXNOW_KEY = "7cca543a6273ef3a140c41aa08994559";
export const SITE_ORIGIN = "https://sitescoper.com";

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  detail?: string;
}

export async function pingIndexNow(paths: string[]): Promise<IndexNowResult> {
  const urlList = Array.from(new Set(paths.map((p) => (p.startsWith("http") ? p : `${SITE_ORIGIN}${p.startsWith("/") ? p : `/${p}`}`)))).slice(0, 10_000);
  if (urlList.length === 0) return { ok: true, status: 204, submitted: 0 };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_ORIGIN).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(8000),
    });
    // 200 = ok, 202 = accepted (key not validated yet). Anything else is a real error.
    const ok = res.status === 200 || res.status === 202;
    return { ok, status: res.status, submitted: urlList.length, detail: ok ? undefined : (await res.text()).slice(0, 300) };
  } catch (err) {
    return { ok: false, status: 0, submitted: urlList.length, detail: err instanceof Error ? err.message : String(err) };
  }
}
