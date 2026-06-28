/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  title?: string
  message?: string
  actionUrl?: string
  actionLabel?: string
}

const Email = ({
  title = 'You have a new notification',
  message = '',
  actionUrl,
  actionLabel = 'Open SiteScoper',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{title}</Heading>
        {message ? <Text style={text}>{message}</Text> : null}
        {actionUrl ? (
          <Button style={button} href={actionUrl}>{actionLabel}</Button>
        ) : null}
        <Text style={footer}>You're getting this because you're signed up to SiteScoper.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => d?.title ?? 'New notification',
  displayName: 'Notification',
  previewData: {
    title: 'Your audit for example.com is ready',
    message: 'We found 12 issues, 3 critical. Open the report to review fixes.',
    actionUrl: 'https://sitescoper.com/dashboard',
    actionLabel: 'View report',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(220, 25%, 10%)', margin: '0 0 16px' }
const text = { fontSize: '14px', color: 'hsl(220, 12%, 38%)', lineHeight: '1.5', margin: '0 0 24px' }
const button = { backgroundColor: 'hsl(250, 65%, 55%)', color: '#ffffff', fontSize: '14px', borderRadius: '12px', padding: '12px 20px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }