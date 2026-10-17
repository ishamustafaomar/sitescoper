import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getMarketingAttribution = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ grain: z.enum(['day', 'week']).default('day'), days: z.number().int().min(1).max(366).default(30) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !allowed) throw new Error('Forbidden');
    const { data: summary, error } = await context.supabase.rpc('marketing_attribution_summary', { p_grain: data.grain, p_days: data.days });
    if (error) throw new Error('Marketing summary unavailable');
    return summary;
  });