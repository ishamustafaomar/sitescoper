import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ProGate({
  children,
  title = "This is a Pro feature",
  description = "Upgrade to SiteScoper Pro to unlock this.",
}: Props) {
  const { isPro, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (isPro) return <>{children}</>;

  return (
    <Card className="p-6 md:p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
        <Lock className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-5">
        {description}
      </p>
      <Button onClick={() => navigate(user ? "/pricing" : "/auth")} className="shadow-glow">
        <Sparkles className="h-4 w-4" /> Upgrade to Pro
      </Button>
    </Card>
  );
}