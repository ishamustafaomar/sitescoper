import { ReactNode } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ProGate({
  children,
  title,
  description,
}: Props) {
  const { t } = useTranslation();
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
      <h3 className="font-heading font-bold text-lg mb-2">{title ?? t("proGate.defaultTitle")}</h3>
      <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-5">
        {description ?? t("proGate.defaultDesc")}
      </p>
      <Button onClick={() => navigate(user ? "/pricing" : "/auth")} className="shadow-glow">
        <Sparkles className="h-4 w-4" /> {t("proGate.upgradeBtn")}
      </Button>
    </Card>
  );
}
