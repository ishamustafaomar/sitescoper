import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GOALS = [
  "Improve SEO rankings",
  "Boost page speed",
  "Fix accessibility issues",
  "Better UX/UI design",
  "Content optimization",
  "Competitive analysis",
  "Monitor multiple sites",
  "Client reporting",
];

const REFERRAL_SOURCES = [
  "Google Search",
  "Twitter / X",
  "LinkedIn",
  "YouTube",
  "Friend / Colleague",
  "Reddit",
  "Product Hunt",
  "Blog / Article",
  "Other",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to website optimization" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience with SEO/analytics" },
  { value: "advanced", label: "Advanced", desc: "Professional marketer or developer" },
  { value: "expert", label: "Expert", desc: "Agency owner or SEO specialist" },
];

const ROLES = [
  "Developer",
  "Designer",
  "Marketer",
  "Product Manager",
  "Founder / CEO",
  "Freelancer",
  "Student",
  "Other",
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  );
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const steps = [
    { title: "Welcome!", subtitle: "Let's personalize your experience" },
    { title: "About You", subtitle: "What do you do?" },
    { title: "Your Goals", subtitle: "What do you want to achieve?" },
    { title: "How'd You Find Us?", subtitle: "Help us improve" },
    { title: "All Set!", subtitle: "You're ready to go" },
  ];

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return displayName.trim().length > 0;
      case 1: return role.length > 0;
      case 2: return goals.length > 0;
      case 3: return referralSource.length > 0 && experienceLevel.length > 0;
      default: return true;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("onboarding_responses").insert({
        user_id: user.id,
        display_name: displayName,
        role,
        company,
        goals,
        referral_source: referralSource,
        experience_level: experienceLevel,
      } as any);

      await supabase
        .from("profiles")
        .update({ display_name: displayName, onboarding_completed: true } as any)
        .eq("user_id", user.id);

      toast({ title: "Welcome aboard! 🎉" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Onboarding — SiteScoper</title>
        <meta name="description" content="Complete your SiteScoper onboarding and personalize your website analysis dashboard." />
        <link rel="canonical" href="https://sitescoper.com/onboarding" />
        <meta property="og:title" content="Onboarding — SiteScoper" />
        <meta property="og:description" content="Complete your SiteScoper onboarding and personalize your website analysis dashboard." />
        <meta property="og:url" content="https://sitescoper.com/onboarding" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border border-border p-8 shadow-[var(--shadow-md)]"
          >
            <h1 className="font-heading font-bold text-2xl mb-1">{steps[currentStep].title}</h1>
            <p className="text-muted-foreground font-body text-sm mb-6">{steps[currentStep].subtitle}</p>

            {/* Step 0: Name */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-body font-medium mb-1.5 block">What should we call you?</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="font-body"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium mb-1.5 block">Company (optional)</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company or website"
                    className="font-body"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Role */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border text-sm font-body text-left transition-all ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <Badge
                    key={g}
                    variant={goals.includes(g) ? "default" : "outline"}
                    className={`cursor-pointer text-xs py-1.5 px-3 transition-all ${
                      goals.includes(g) ? "" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleGoal(g)}
                  >
                    {goals.includes(g) && <Check className="h-3 w-3 mr-1" />}
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            {/* Step 3: Referral + Experience */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-body font-medium mb-2 block">Where did you hear about us?</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {REFERRAL_SOURCES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setReferralSource(s)}
                        className={`p-2 rounded-lg border text-xs font-body transition-all ${
                          referralSource === s
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium mb-2 block">Experience level</label>
                  <div className="space-y-1.5">
                    {EXPERIENCE_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setExperienceLevel(l.value)}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          experienceLevel === l.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className={`text-sm font-body font-medium ${experienceLevel === l.value ? "text-primary" : ""}`}>
                          {l.label}
                        </span>
                        <span className="text-xs text-muted-foreground block">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Finish */}
            {currentStep === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="font-body text-muted-foreground">
                  You're all set, <span className="font-medium text-foreground">{displayName}</span>!
                  Let's start analyzing websites.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" size="sm" onClick={handleFinish} disabled={saving}>
                  {saving ? "Saving..." : "Go to Dashboard"} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
