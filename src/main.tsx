import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Recover from stale chunk references after a redeploy: if a dynamic
// import fails (old index.html points at a chunk hash that no longer
// exists), reload once to fetch the new index.html + asset graph.
const RELOAD_KEY = "__chunk_reload__";
function handleChunkError(message: string) {
  if (!/Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError/i.test(message)) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
}
window.addEventListener("error", (e) => handleChunkError(e.message || ""));
window.addEventListener("unhandledrejection", (e) => handleChunkError(String(e.reason?.message || e.reason || "")));
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Clear the guard on a clean load so future stale-chunk events can retry.
    setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 5000);
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
