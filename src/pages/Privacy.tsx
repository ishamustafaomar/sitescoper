import { AppHeader } from "@/components/AppHeader";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy — SiteScoper</title>
        <meta name="description" content="How SiteScoper collects, uses, and protects your data when you analyze websites with our AI audit tool." />
        <link rel="canonical" href="https://sitescoper.com/privacy" />
        <meta property="og:title" content="Privacy Policy — SiteScoper" />
        <meta property="og:description" content="How SiteScoper handles your data." />
        <meta property="og:url" content="https://sitescoper.com/privacy" />
        <meta property="og:type" content="article" />
      </Helmet>
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-sm dark:prose-invert max-w-none font-body"
        >
          <h1 className="text-3xl font-heading font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">1. Information we collect</h2>
              <p>When you use SiteScoper, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Account information:</strong> email address, display name, and authentication data when you sign up.</li>
                <li><strong>Usage data:</strong> URLs you submit for analysis, the analysis results we generate, and timestamps.</li>
                <li><strong>Onboarding responses:</strong> optional information you provide such as role, company, and goals.</li>
                <li><strong>Technical data:</strong> browser type, IP address, and basic analytics needed to run the service.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">2. How we use your information</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Provide website analysis and store your history so you can revisit it.</li>
                <li>Authenticate you and protect your account.</li>
                <li>Improve the quality of the analyzer and the user experience.</li>
                <li>Communicate important account or service updates.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">3. Data retention</h2>
              <p>
                Analysis history is retained for as long as your account is active. You can delete your account and associated data at any time by clicking the profile icon and under "Your data (GDPR)" click "Delete my account".
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">4. Your rights</h2>
              <p>You have the right to access, correct, export, or delete your personal data.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">5. Cookies & local storage</h2>
              <p>We use cookies and browser local storage to keep you signed in and to track your free-analysis usage before signup. We do not use third-party advertising cookies.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">6. Security</h2>
              <p>Your data is stored on infrastructure protected by row-level security and modern encryption standards. No system is perfectly secure, but we follow industry best practices to safeguard your information.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">7. Children</h2>
              <p>SiteScoper is not intended for users under 13. We do not knowingly collect data from children.</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">8. Changes to this policy</h2>
              <p>We may update this policy from time to time. The "Last updated" date at the top reflects the most recent changes.</p>
            </div>

          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
