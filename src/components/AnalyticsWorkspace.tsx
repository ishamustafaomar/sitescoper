import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, type UIMessage } from 'ai';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowUpRight, BarChart3 } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { Button } from './ui/button';
import { Conversation, ConversationContent, ConversationScrollButton } from './ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from './ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from './ai-elements/prompt-input';
import { Tool, ToolHeader, ToolContent } from './ai-elements/tool';
import { Shimmer } from './ai-elements/shimmer';
import { SocialCardPanel } from './SocialCardPanel';
import { listAnalyticsThreads, createAnalyticsThread, getAnalyticsThread } from '@/lib/analytics.functions';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo-mark.png';
import type { ScrapeResult } from '@/lib/api';

export function AnalyticsWorkspace({ threadId }: { threadId?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const list = useServerFn(listAnalyticsThreads);
  const create = useServerFn(createAnalyticsThread);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const threads = useQuery({ queryKey: ['analytics-threads'], queryFn: () => list() });
  const newChat = async () => {
    setCreating(true); setError('');
    try { const row = await create(); await client.invalidateQueries({ queryKey: ['analytics-threads'] }); await navigate({ to: '/analytics/$threadId', params: { threadId: row.id } }); }
    catch (e) { setError(e instanceof Error ? e.message : t('analytics.failed')); }
    finally { setCreating(false); }
  };
  return <div className="min-h-screen bg-background text-foreground"><AppHeader />
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="flex items-center gap-3 font-heading text-3xl"><img src={logo} alt="" className="h-8 w-8" />{t('analytics.title')}</h1><Button onClick={newChat} disabled={creating}><Plus />{t('analytics.newChat')}</Button></div>
      {(error || threads.error) && <p role="alert" className="mb-4 text-sm text-destructive">{error || threads.error?.message}</p>}
      <div className="grid min-w-0 gap-6 md:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-border pb-4 md:border-b-0 md:border-r md:pr-4"><h2 className="mb-3 text-sm font-body font-medium">{t('analytics.conversations')}</h2><nav className="flex max-h-48 flex-col gap-1 overflow-y-auto md:max-h-[65vh]">{threads.data?.map(row => <Button asChild variant={threadId === row.id ? 'secondary' : 'ghost'} className="justify-start text-left" key={row.id}><Link to="/analytics/$threadId" params={{ threadId: row.id }} aria-current={threadId === row.id ? 'page' : undefined}><span className="line-clamp-2 break-words">{row.title}</span></Link></Button>)}</nav><div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground"><p className="font-medium">Muse · {t('analytics.notConnected')}</p><a className="mt-2 inline-flex items-center gap-1 underline" href="https://muse.ai/platform/docs" target="_blank" rel="noopener noreferrer">{t('analytics.museDocs')}<ArrowUpRight className="h-3 w-3" /></a></div></aside>
        {threadId ? <SavedChat key={threadId} threadId={threadId} /> : <section className="py-12"><BarChart3 className="mb-5 h-6 w-6 text-accent" /><h2 className="mb-6 font-heading text-2xl">{t('analytics.start')}</h2><Button variant="outline" onClick={newChat} disabled={creating}><Plus />{t('analytics.newChat')}</Button></section>}
      </div>
    </main></div>;
}
function SavedChat({ threadId }: { threadId: string }) {
  const get = useServerFn(getAnalyticsThread);
  const { t } = useTranslation();
  const thread = useQuery({ queryKey: ['analytics-thread',threadId], queryFn: () => get({ data: { id: threadId } }) });
  if (thread.error) return <p role="alert" className="text-destructive">{thread.error.message}</p>;
  if (!thread.data) return <p role="status">{t('analytics.loading')}</p>;
  return <ChatWindow threadId={threadId} initialMessages={thread.data.messages as unknown as UIMessage[]} />;
}
function ChatWindow({ threadId, initialMessages }: { threadId: string; initialMessages: UIMessage[] }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input,setInput] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/analytics-chat', body: { threadId }, headers: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error(t('analytics.signIn'));
    return { Authorization: `Bearer ${session.access_token}` };
  } }), [threadId,t]);
  const { messages,sendMessage,status,stop,error } = useChat({ id: threadId, messages: initialMessages, transport, onFinish: () => { void client.invalidateQueries({ queryKey: ['analytics-threads'] }); } });
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);
  const send = async (text: string) => { if (!text.trim() || busy) return; setInput(''); inputRef.current?.focus(); await sendMessage({ text }); };
  return <section className="min-w-0">
    <Conversation className="h-[55vh] min-h-80"><ConversationContent className="px-0">
      {messages.length === 0 && <div className="space-y-3 py-8"><h2 className="font-heading text-2xl">{t('analytics.start')}</h2><div className="flex flex-wrap gap-2">{['review','seo','instagram'].map(k => <Button key={k} variant="outline" onClick={() => void send(t(`analytics.prompt.${k}`))}>{t(`analytics.quick.${k}`)}</Button>)}</div></div>}
      {messages.map(message => <Message from={message.role} key={message.id}><MessageContent className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'w-full'}>{message.parts.map((part,index) => {
        if (part.type === 'text') return <MessageResponse key={index}>{part.text}</MessageResponse>;
        if (part.type === 'reasoning') return <details key={index} className="text-xs text-muted-foreground"><summary>{t('analytics.reasoning')}</summary><MessageResponse>{part.text}</MessageResponse></details>;
        if (isToolUIPart(part)) return <Tool key={index} defaultOpen={false}><ToolHeader type={part.type} state={part.state} title={t(`analytics.tool.${part.type.replace('tool-','')}`, { defaultValue: t('analytics.action') })} /><ToolContent>{part.state === 'output-error' ? <p role="alert" className="text-sm text-destructive">{part.errorText}</p> : part.state === 'output-available' ? <ToolResult output={part.output} /> : <p className="text-sm">{t('analytics.working')}</p>}</ToolContent></Tool>;
        return null;
      })}</MessageContent></Message>)}
      {status === 'submitted' && <Shimmer>{t('analytics.working')}</Shimmer>}
    </ConversationContent><ConversationScrollButton /></Conversation>
    {error && <p role="alert" className="my-3 break-words text-sm text-destructive">{error.message}</p>}
    <PromptInput className="mt-4" onSubmit={() => send(input)}><PromptInputTextarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} aria-label={t('analytics.message')} placeholder={t('analytics.placeholder')} /><PromptInputFooter className="justify-end"><PromptInputSubmit className="h-11 w-11" status={status} onStop={() => void stop()} disabled={!busy && !input.trim()} aria-label={t(busy ? 'analytics.stop' : 'analytics.send')} /></PromptInputFooter></PromptInput>
  </section>;
}
function ToolResult({ output }: { output: unknown }) {
  const { t } = useTranslation();
  if (!output || typeof output !== 'object') return null;
  if ('kind' in output && output.kind === 'promotion' && 'url' in output && typeof output.url === 'string') {
    return <SocialCardPanel url={output.url} scrapeData={'scrapeData' in output ? output.scrapeData as ScrapeResult : undefined} initialHeadline={'headline' in output ? String(output.headline) : ''} initialDetail={'detail' in output ? String(output.detail) : ''} initialFormat="story" />;
  }
  if ('link' in output && typeof output.link === 'string') return <Button asChild variant="outline"><a href={output.link}>{t('analytics.openReport')}<ArrowUpRight /></a></Button>;
  if ('reports' in output && Array.isArray(output.reports)) return <ul className="space-y-2 text-sm">{output.reports.map((r: { id: string; url: string }) => <li key={r.id}><a className="break-all underline" href={`/analysis/${encodeURIComponent(r.id)}`}>{r.url}</a></li>)}</ul>;
  return <p className="text-sm">{t('analytics.done')}</p>;
}