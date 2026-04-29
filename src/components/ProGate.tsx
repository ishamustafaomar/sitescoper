import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  feature: string;
  description: string;
  children: ReactNode;
  /** When true, show a small inline preview blurred behind the gate */
  preview?: ReactNode;
}

export function ProGate({ feature, description, children, preview }: Props) {
  const { user } = useAuth();
  const { subscribed, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading && user) {
    return <div className="h-32 rounded-xl bg-muted/30 animate-pulse" />;
  }

  if (subscribed) return <>{children}</>;

  return (
    <Card className="p-6 relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      {preview && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 blur-sm pointer-events-none"
        >
          {preview}
        </div>
      )}
      <div className="relative text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-lg mb-1 flex items-center justify-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          {feature}
        </h3>
        <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-4">
          {description}
        </p>
        <Button
          className="gradient-primary"
          onClick={() => navigate(user ? "/pricing" : "/auth?redirect=/pricing")}
        >
          <Crown className="h-3.5 w-3.5" />
          {user ? "Upgrade to Pro" : "Sign in to upgrade"}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-2">
          From $15/month · Cancel anytime
        </p>
      </div>
    </Card>
  );
}