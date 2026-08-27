import { useNavigate, useLocation } from "@/lib/router-compat";
import { LayoutDashboard, LogOut, LogIn, Shield, Sparkles, Check, Swords, Crown, User as UserIcon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoMark from "@/assets/logo-mark.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChangelogBell } from "@/components/ChangelogBell";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const { isPro } = useSubscription();
  const { isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined" && i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage;
    }
  }, [i18n.resolvedLanguage]);
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const authPath = `/auth?redirect=${encodeURIComponent(currentPath)}`;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const path = location.pathname;
  const pillBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-body border-b-2 transition-colors";
  const pillActive = "border-foreground text-foreground";
  const pillIdle = "border-transparent text-muted-foreground hover:text-foreground";

  const initial = ((user?.user_metadata?.full_name || user?.email || "U") as string)[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
      <div className="max-w-6xl mx-auto h-[60px] px-4 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            if (location.pathname === "/") {
              window.location.assign("/");
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          aria-label="SiteScoper home"
        >
          <img
            src={logoMark}
            alt="SiteScoper logo"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
          />
          <div className="flex flex-col items-start gap-[1px]">
            <span className="font-heading font-bold text-base leading-none">SiteScoper</span>
            <span className="text-[8.5px] text-muted-foreground font-body tracking-[0.18em] uppercase">
              AI Website Analyzer
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={cn(pillBase, path === "/" ? pillActive : pillIdle)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("nav.analyze")}
          </button>
          {user && (
            <button
              onClick={() => navigate("/dashboard")}
              className={cn(pillBase, path.startsWith("/dashboard") ? pillActive : pillIdle)}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              {t("nav.dashboard")}
            </button>
          )}
          <button
            onClick={() => navigate("/compare")}
            className={cn(pillBase, path === "/compare" ? pillActive : pillIdle)}
          >
            <Swords className="h-3.5 w-3.5" />
            {t("nav.compare")}
            {!isPro && (
              <span className="ml-1 border border-accent/40 bg-accent/10 px-1.5 py-[1px] text-[9px] font-bold tracking-wider text-accent">
                PRO
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className={cn(pillBase, path === "/pricing" ? pillActive : pillIdle)}
          >
            {t("nav.pricing")}
          </button>
          {user && isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className={cn(pillBase, path.startsWith("/admin") ? pillActive : pillIdle)}
            >
              <Shield className="h-3.5 w-3.5" />
              {t("nav.admin")}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <ChangelogBell />
          {user && !isPro && location.pathname !== "/pricing" && (
            <Button
              size="sm"
              onClick={() => navigate("/pricing")}
              className="hidden sm:inline-flex text-xs font-body"
            >
              <Crown className="h-3.5 w-3.5" /> {t("nav.upgrade")}
            </Button>
          )}
          {user && isPro && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 border border-foreground text-foreground text-[11px] font-body font-semibold uppercase tracking-widest">
              <Crown className="h-3 w-3" /> Pro
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/account")}
                className="h-8 w-8 rounded-full overflow-hidden font-heading text-[13px] text-primary-foreground bg-primary flex items-center justify-center hover:opacity-80 transition"
                
                aria-label={t("nav.account")}
              >
                {user.user_metadata?.avatar_url ? (
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                  </Avatar>
                ) : (
                  initial
                )}
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut} aria-label={t("nav.signOut", { defaultValue: "Sign out" })}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => navigate(authPath)} className="text-xs font-body">
                  <LogIn className="h-3.5 w-3.5" />
                  {t("nav.signIn")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="max-w-[240px]">
                <p className="font-heading font-semibold text-xs mb-1.5">{t("signin.tooltipTitle")}</p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" />{t("signin.benefit1")}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" />{t("signin.benefit2")}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" />{t("signin.benefit3")}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" />{t("signin.benefit4")}</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px]">
              <SheetHeader>
                <SheetTitle className="font-heading">{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {[
                  { to: "/", label: t("nav.analyze"), icon: Sparkles, show: true },
                  { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, show: !!user },
                  { to: "/compare", label: t("nav.compare"), icon: Swords, show: true, pro: !isPro },
                  { to: "/pricing", label: t("nav.pricing"), show: true },
                  { to: "/admin", label: t("nav.admin"), icon: Shield, show: !!user && isAdmin },
                ]
                  .filter((i) => i.show)
                  .map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.to === "/"
                        ? path === "/"
                        : path.startsWith(item.to);
                    return (
                      <button
                        key={item.to}
                        onClick={() => {
                          setMobileOpen(false);
                          navigate(item.to);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-body text-left transition-colors",
                          active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                        {item.pro && (
                          <span className="ml-auto border border-accent/40 bg-accent/10 px-1.5 py-[1px] text-[9px] font-bold tracking-wider text-accent">
                            PRO
                          </span>
                        )}
                      </button>
                    );
                  })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
