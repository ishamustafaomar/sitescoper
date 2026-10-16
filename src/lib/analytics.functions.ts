import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const listAnalyticsThreads = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('analytics_threads').select('id,title,updated_at').eq('user_id', context.userId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const createAnalyticsThread = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('analytics_threads').insert({ user_id: context.userId }).select('id').single();
  if (error) throw new Error(error.message);
  return data;
});
export const getAnalyticsThread = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  const { data: thread, error } = await context.supabase.from('analytics_threads').select('id,title,messages').eq('id', data.id).eq('user_id', context.userId).single();
  if (error) throw new Error(error.message);
  return thread;
});