import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsWorkspace } from '@/components/AnalyticsWorkspace';
import { pageHead } from '@/lib/seo-head';
export const Route = createFileRoute('/analytics/$threadId')({ staticData: { sitemap: false }, head: () => pageHead({ path: '/analytics', title: 'Analytics Conversation — SiteScoper', description: 'Your saved SEO research and website promotional conversation.', noindex: true }), component: Thread });
function Thread() { const { threadId } = Route.useParams(); return <AnalyticsWorkspace threadId={threadId} />; }