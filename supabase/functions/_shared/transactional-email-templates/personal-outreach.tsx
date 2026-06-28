/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  body?: string
  signature?: string
  preview?: string
}

const Email = ({
  name = 'there',
  body = '',
  signature = '— Sebastian, SiteScoper',
  preview,
}: Props) => {
  const paragraphs = (body || '').split(/\n\s*\n/).filter(Boolean)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview || (paragraphs[0] ?? '').slice(0, 90)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Hi {name},</Text>
          {paragraphs.map((p, i) => (
            <Text key={i} style={text}>{p}</Text>
          ))}
          <Text style={text}>{signature}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => (d as any)?.subject ?? 'Quick note',
  displayName: 'Personal outreach',
  replyTo: 'omarmlaptop@gmail.com',
  previewData: {
    name: 'Alex',
    body: "I built SiteScoper — an AI website auditor that gives you prioritized fixes in minutes.\n\nThought you might find it useful. Free during early access: https://sitescoper.com",
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px' }
const text = { fontSize: '15px', color: 'hsl(220, 25%, 15%)', lineHeight: '1.55', margin: '0 0 16px' }