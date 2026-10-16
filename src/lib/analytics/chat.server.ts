import { createClient } from '@supabase/supabase-js';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, tool, stepCountIs, convertToModelMessages, validateUIMessages, type UIMessage } from 'ai';
import { z } from 'zod';
import { createLovableAiGatewayRunIdFetch, withLovableAiGatewayRunIdHeader } from './run-id.ts';
import { ANALYTICS_INSTRUCTIONS, ownedReportLink } from './policy';

export async function handleAnalyticsChat(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!key || !url || !apiKey) return Response.json({ error: 'Analytics is not configured.' }, { status: 503 });
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Sign in to use Analytics.' }, { status: 401 });
  const sb = createClient(url, key, { global: { headers: { Authorization: auth } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error: authError } = await sb.auth.getUser(auth.slice(7));
  if (authError || !identity.user) return Response.json({ error: 'Sign in to use Analytics.' }, { status: 401 });
  const userId = identity.user.id;
  let body;
  try { body = z.object({ threadId: z.string().uuid(), messages: z.array(z.unknown()), model: z.enum(['auto','chatgpt','claude','gemini']).optional() }).parse(await request.json()); } catch { return Response.json({ error: 'Invalid conversation.' }, { status: 400 }); }
  const { data: thread, error } = await sb.from('analytics_threads').select('id,ai_paused_reason').eq('id', body.threadId).eq('user_id', userId).single();
  if (error || !thread) return Response.json({ error: 'Conversation not found.' }, { status: 404 });
  if (thread.ai_paused_reason) return Response.json({ error: thread.ai_paused_reason }, { status: 403 });
  const tools = {
    listReports: tool({ description: 'Read the current user’s recent saved website audits. Health scores are not traffic metrics.', inputSchema: z.object({}), execute: async () => {
      const { data, error } = await sb.from('analysis_history').select('id,url,overall_score,summary,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
      if (error) throw new Error(error.message);
      return { reports: data ?? [], trafficAvailable: false };
    } }),
    readReport: tool({ description: 'Read findings from one saved audit owned by this user.', inputSchema: z.object({ reportId: z.string() }), execute: async ({ reportId }) => {
      const { data, error } = await sb.from('analysis_history').select('id,url,overall_score,summary,categories,created_at').eq('id', reportId).eq('user_id', userId).single();
      if (error || !data) throw new Error('Report not found.');
      return { ...data, link: ownedReportLink(data.id) };
    } }),
    preparePromotion: tool({ description: 'Open a real promotional image editor for an owned report. Does NOT generate, spend credits or post; the user reviews the wording and source photo.', inputSchema: z.object({ reportId: z.string(), headline: z.string(), detail: z.string() }), execute: async ({ reportId, headline, detail }) => {
      const { data, error } = await sb.from('analysis_history').select('id,url,scrape_data').eq('id', reportId).eq('user_id', userId).single();
      if (error || !data) throw new Error('Report not found.');
      return { kind: 'promotion', url: data.url, scrapeData: (() => { const sd = (data.scrape_data ?? {}) as { images?: unknown; markdown?: unknown; metadata?: unknown }; return { images: Array.isArray(sd.images) ? sd.images.slice(0, 12) : [], markdown: typeof sd.markdown === 'string' ? sd.markdown.slice(0, 4000) : '', metadata: sd.metadata ?? {} }; })(), headline: headline.slice(0,160), detail: detail.slice(0,240), postingConnected: false };
    } }),
  };
  let messages: UIMessage[];
  try { messages = await validateUIMessages({ messages: body.messages, tools }); } catch { return Response.json({ error: 'Invalid messages.' }, { status: 400 }); }
  const title = messages.find(m => m.role === 'user')?.parts.filter(p => p.type === 'text').map(p => p.text).join(' ').slice(0,80) || 'Analytics';
  const save = async (history: UIMessage[]) => {
    const { error } = await sb.from('analytics_threads').update({ messages: history, title, updated_at: new Date().toISOString() }).eq('id', body.threadId).eq('user_id', userId);
    if (error) throw new Error(`Conversation could not be saved: ${error.message}`);
  };
  await save(messages);
  let upstreamStatus = 0;
  let upstreamMessage = '';
  const run = createLovableAiGatewayRunIdFetch();
  const gatewayFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await run.fetch(input as RequestInfo, init);
    if (!response.ok) {
      upstreamStatus = response.status;
      const raw = await response.clone().text();
      try { const parsed = JSON.parse(raw); upstreamMessage = parsed.error?.message ?? parsed.message ?? 'AI request failed.'; } catch { upstreamMessage = 'AI request failed.'; }
      if (response.status === 402 || response.status === 403) {
        const { error } = await sb.from('analytics_threads').update({ ai_paused_reason: upstreamMessage }).eq('id', body.threadId).eq('user_id', userId);
        if (error) throw new Error('Could not pause blocked AI requests.');
      }
    }
    return response;
  };
  const choice = body.model && body.model !== 'auto' ? body.model : pickModel(messages);
  const model = choice === 'claude'
    ? createAnthropic({ baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey, headers: { 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: gatewayFetch })('anthropic/claude-sonnet-5')
    : choice === 'gemini'
      ? createOpenAICompatible({ name: 'lovable', baseURL: 'https://ai.gateway.lovable.dev/v1', headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: gatewayFetch })('google/gemini-3.8-flash')
      : createOpenAI({ baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey, headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: gatewayFetch }).responses('openai/gpt-6-astra');
  const result = streamText({ model, system: ANALYTICS_INSTRUCTIONS, messages: await convertToModelMessages(messages), tools, stopWhen: stepCountIs(50), maxRetries: 0, abortSignal: request.signal,
    providerOptions: choice !== 'chatgpt' ? {} : { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
  });
  const response = await withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true, onFinish: async ({ messages }) => { await save(messages); }, onError: error => upstreamMessage || (error instanceof Error ? error.message : 'Analytics failed.') }), run, { 'Cache-Control': 'no-store' });
  if (upstreamStatus) { await response.body?.cancel(); return Response.json({ error: upstreamMessage }, { status: upstreamStatus }); }
  return response;
}