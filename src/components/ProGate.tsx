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

export function ProGate({ children, title = "This is a Pro feature", description = "Upgrade to unlock." }: Props) {
  const { user } = useAuth();
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading && user) return <div className="h-32" />;
  if (isPro) return <>{children}</>;

  return (
    <Card className="p-6 border-dashed text-center">
      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
        <Lock className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-heading font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
      <Button onClick={() => navigate("/pricing")}>
        <Sparkles className="h-4 w-4" /> Upgrade to Pro
      </Button>
    </Card>
  );
}