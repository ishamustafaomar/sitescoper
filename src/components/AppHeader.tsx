import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

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
          {user && location.pathname !== "/dashboard" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-xs font-body"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Button>
          )}
          {user && location.pathname === "/dashboard" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs font-body"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Analyzer
            </Button>
          )}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs font-heading bg-primary/10 text-primary">
                  {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-xs font-body">
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
