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
  // Everything is free during the early-access period — render children unconditionally.
  void title; void description;
  return <>{children}</>;
}