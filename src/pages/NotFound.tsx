import { useLocation } from "@/lib/router-compat";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
    <main className="flex min-h-dvh items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.heading")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.returnHome")}
        </a>
      </div>
    </main>
    </>
  );
};

export default NotFound;
