import { AppHeader } from "@/components/AppHeader";
import { motion } from "framer-motion";
import { useCanonical } from "@/hooks/useCanonical";

const Terms = () => {
  useCanonical("/terms");
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-sm dark:prose-invert max-w-none font-body"
        >
          <h1 className="text-3xl font-heading font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">1. Acceptance of terms</h2>
              <p>By using SiteScoper, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">2. The service</h2>
              <p>SiteScoper is an AI-powered tool that crawls publicly available websites and generates analysis and recommendations. The analysis is provided "as is" and is intended as guidance, not professional advice.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">3. Acceptable use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Use SiteScoper to analyze sites you do not have permission to crawl.</li>
                <li>Attempt to circumvent rate limits, abuse the analyzer, or harm the service.</li>
                <li>Use the analyzer for illegal purposes or to violate the rights of others.</li>
                <li>Reverse engineer, scrape, or resell the service without permission.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">4. Accounts</h2>
              <p>You are responsible for keeping your account credentials secure and for all activity under your account. Notify us immediately of any unauthorized access.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">5. AI-generated content</h2>
              <p>Analyses are produced by AI models and may contain inaccuracies, omissions, or opinionated takes. You should validate any findings before acting on them. We are not liable for decisions made based on AI output.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">6. Intellectual property</h2>
              <p>You retain ownership of any content you submit. SiteScoper retains ownership of the platform, its design, and its underlying technology. Analyses generated for you are yours to use.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">7. Service availability</h2>
              <p>We aim for high uptime but do not guarantee uninterrupted access. The service may be modified, suspended, or discontinued at any time.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">8. Limitation of liability</h2>
              <p>To the maximum extent permitted by law, SiteScoper and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">9. Termination</h2>
              <p>We may suspend or terminate your access if you violate these terms. You may stop using the service and request account deletion at any time.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">10. Changes to terms</h2>
              <p>We may update these terms periodically. Continued use of SiteScoper after changes constitutes acceptance of the updated terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">11. Contact</h2>
              <p>Questions about these terms? Reach out via the support email listed on our site.</p>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
