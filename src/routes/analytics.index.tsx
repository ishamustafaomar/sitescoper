import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsWorkspace } from '@/components/AnalyticsWorkspace';
import { pageHead } from '@/lib/seo-head';
export const Route = createFileRoute('/analytics/')({ head: () => pageHead({ path: '/analytics', title: 'Your Analytics Workspace — SiteScoper', description: 'Start a saved conversation about your website’s SEO and marketing.', noindex: true }), component: () => <AnalyticsWorkspace /> });