import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, LayoutDashboard, LogOut, LogIn, Shield, Home, Settings, Check, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="gradient-primary p-2 rounded-xl shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-none">SiteScoper</h1>
            <span className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">
              AI Website Analyzer
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {location.pathname !== "/" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs font-body"
            >
              <Home className="h-3.5 w-3.5" />
              {t("nav.home")}
            </Button>
          )}
          {user && location.pathname !== "/dashboard" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-xs font-body"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              {t("nav.dashboard")}
            </Button>
          )}
          {location.pathname !== "/compare" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/compare")}
              className="text-xs font-body"
            >
              <Swords className="h-3.5 w-3.5" />
              Compare
            </Button>
          )}
          {user && location.pathname !== "/admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="text-xs font-body"
            >
              <Shield className="h-3.5 w-3.5" />
              {t("nav.admin")}
            </Button>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/account")}
                className="rounded-full hover:ring-2 hover:ring-primary/40 transition"
                aria-label={t("nav.account")}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs font-heading bg-primary/10 text-primary">
                    {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-xs font-body">
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
        </div>
      </div>
    </header>
  );
}
