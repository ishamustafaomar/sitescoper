import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How is this different from other SEO tools?",
    a: "Most SEO tools give you a checklist of technical issues. SiteScoper acts like a senior product strategist — it evaluates your messaging, positioning, value proposition, and trust signals alongside the technical stuff. Real, opinionated feedback you can actually use.",
  },
  {
    q: "Do you actually crawl my whole site?",
    a: "We crawl up to 8 of your most important pages — typically homepage, pricing, features, docs, about, and signup. This gives the AI enough context to understand your product, not just your front door.",
  },
  {
    q: "Is it really free?",
    a: "Yes — anyone can analyze a website.",
  },
  {
    q: "How accurate is the AI feedback?",
    a: "The AI is powered by frontier models (GPT-5 / Gemini Pro) with prompts tuned by experienced product designers. It's not perfect — but it consistently catches issues that even experienced founders miss.",
  },
  {
    q: "Can I export the analysis?",
    a: "Yes — every analysis can be exported as a clean, professional PDF. Great for sharing with teammates, clients, or stakeholders.",
  },
  {
    q: "What kind of websites does it work on?",
    a: "Anything publicly accessible — SaaS landing pages, ecommerce stores, portfolios, blogs, marketing sites, documentation. If it's on the web, we can analyze it.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body mb-4">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Questions founders ask
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <AccordionItem
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="font-heading font-semibold text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-body leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
