import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { pageHead } from '@/lib/seo-head';
export const Route = createFileRoute('/analytics')({ staticData: { sitemap: false }, head: () => pageHead({ path: '/analytics', title: 'Analytics Assistant — SiteScoper', description: 'Research your saved website reports and prepare promotional images with the SiteScoper Analytics assistant.', noindex: true }), component: () => <ProtectedRoute><Outlet /></ProtectedRoute> });