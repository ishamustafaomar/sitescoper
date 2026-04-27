import { useEffect } from "react";

/**
 * Sets a <link rel="canonical"> tag in the document head.
 * Pass an absolute URL, or a path which will be resolved against window.location.origin.
 */
export function useCanonical(urlOrPath: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const href = urlOrPath.startsWith("http")
      ? urlOrPath
      : `${window.location.origin}${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const created = !link;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    const previous = link.getAttribute("href");
    link.setAttribute("href", href);

    return () => {
      if (created) {
        link?.parentNode?.removeChild(link);
      } else if (previous !== null) {
        link?.setAttribute("href", previous);
      }
    };
  }, [urlOrPath]);
}