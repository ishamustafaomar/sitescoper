import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface DigestSite {
  label: string
  url: string
  kind: 'self' | 'competitor'
  severity: 'info' | 'warning' | 'critical'
  items: string[]
}

interface Props {
  period?: string
  sites?: DigestSite[]
  quiet?: boolean
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 26px', maxWidth: '600px' }
const h1 = { color: '#0d0d0d', fontSize: '22px', lineHeight: '30px', margin: '0 0 6px' }
const sub = { color: '#5c5a55', fontSize: '13px', lineHeight: '20px', margin: '0 0 22px' }
const siteName = { color: '#0d0d0d', fontSize: '15px', fontWeight: 700 as const, margin: '0 0 2px' }
const siteUrl = { color: '#8a877f', fontSize: '12px', margin: '0 0 8px' }
const item = { color: '#1a1a1a', fontSize: '14px', lineHeight: '21px', margin: '0 0 6px' }
const rule = { borderColor: '#e7e3da', margin: '18px 0' }
const button = {
  backgroundColor: '#c65a3e',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700 as const,
  padding: '11px 20px',
  textDecoration: 'none',
  display: 'inline-block',
}

const tag = (severity: DigestSite['severity']) => ({
  color:
    severity === 'critical' ? '#b4331c' : severity === 'warning' ? '#8a5a12' : '#5c5a55',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  fontWeight: 700 as const,
  margin: '0 0 6px',
})

const label = (severity: DigestSite['severity']) =>
  severity === 'critical' ? 'Needs attention' : severity === 'warning' ? 'Worth a look' : 'Changed'

const Email = ({ period = 'this week', sites = [], quiet = false }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {quiet
        ? `Nothing broke on your sites ${period}.`
        : `${sites.length} site${sites.length === 1 ? '' : 's'} changed ${period}.`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your SiteScoper watch report</Heading>
        <Text style={sub}>What changed {period}.</Text>

        {quiet ? (
          <Text style={item}>
            Good news — nothing changed on the pages you are watching. Your headlines, prices,
            search tags and share cards are all still where you left them.
          </Text>
        ) : (
          sites.map((site) => (
            <Section key={site.url}>
              <Text style={tag(site.severity)}>
                {site.kind === 'competitor' ? `Competitor · ${label(site.severity)}` : label(site.severity)}
              </Text>
              <Text style={siteName}>{site.label}</Text>
              <Text style={siteUrl}>{site.url}</Text>
              {site.items.map((line, i) => (
                <Text key={i} style={item}>
                  • {line}
                </Text>
              ))}
              <Hr style={rule} />
            </Section>
          ))
        )}

        <Button style={button} href="https://sitescoper.com/monitoring">
          Open your watch list
        </Button>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data?.quiet
      ? 'All quiet on your websites'
      : `${(data?.sites?.length ?? 0) || 'Some'} of your watched pages changed`,
  displayName: 'Monitoring digest',
  previewData: {
    period: 'this week',
    quiet: false,
    sites: [
      {
        label: 'yoursite.com',
        url: 'https://yoursite.com',
        kind: 'self',
        severity: 'critical',
        items: ['Search description was removed', 'Main headline changed'],
      },
      {
        label: 'competitor.com',
        url: 'https://competitor.com',
        kind: 'competitor',
        severity: 'warning',
        items: ['Prices on the page changed: $19/mo → $12/mo'],
      },
    ],
  },
} satisfies TemplateEntry
