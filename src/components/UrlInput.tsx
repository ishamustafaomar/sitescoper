import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;
    onSubmit(normalized);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex gap-3 items-center bg-card rounded-2xl p-2 shadow-[var(--shadow-md)] border border-border">
        <div className="flex items-center gap-2 pl-3 text-muted-foreground">
          <Globe className="h-5 w-5" />
        </div>
        <Input
          type="text"
          placeholder="Enter a website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base font-body"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="hero"
          size="lg"
          disabled={isLoading || !url.trim()}
          className="rounded-xl px-6"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Analyze
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
