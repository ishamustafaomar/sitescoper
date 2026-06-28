/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  siteUrl?: string
}

const Email = ({ name = 'there', siteUrl = 'https://sitescoper.com' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to SiteScoper — let's audit your first site</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome, {name} 👋</Heading>
        <Text style={text}>
          Thanks for joining SiteScoper. You can now run AI-powered website
          audits and get prioritized, actionable fixes in minutes.
        </Text>
        <Button style={button} href={`${siteUrl}/dashboard`}>Run your first audit</Button>
        <Text style={footer}>
          Questions? Just reply to this email.{' '}
          <Link href={siteUrl} style={link}>sitescoper.com</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Welcome to SiteScoper',
  displayName: 'Welcome',
  previewData: { name: 'Jane', siteUrl: 'https://sitescoper.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(220, 25%, 10%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(220, 12%, 38%)', lineHeight: '1.5', margin: '0 0 25px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(250, 65%, 55%)', color: '#ffffff', fontSize: '14px', borderRadius: '12px', padding: '12px 20px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }