import React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const text = { color: '#1a1a1a', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const signoff = { color: '#1a1a1a', fontSize: '15px', lineHeight: '24px', margin: '24px 0 0' }

const Email = ({ name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>I've refunded and cancelled both of your SiteScoper subscriptions.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>Hi {name || 'there'},</Text>
        <Text style={text}>
          I'm the person who built SiteScoper. I was going through our accounts and noticed you
          have two active subscriptions under your name — I think a duplicate got created by
          accident when you signed up. That's a bug on our end, not something you did.
        </Text>
        <Text style={text}>
          I've refunded both and cancelled them, so you won't be charged again. Sorry about that.
        </Text>
        <Text style={text}>
          Since I have you: would you be willing to tell me why you didn't come back after the
          first audit? You mentioned wanting client reporting and competitive analysis when you
          signed up, and I'd guess we didn't deliver on one or both. I'm not trying to sell you
          anything — I'd just rather hear the honest version than guess.
        </Text>
        <Text style={text}>Even one sentence would help.</Text>
        <Text style={signoff}>
          Thanks,
          <br />
          Omar
          <br />
          SiteScoper
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'You have two SiteScoper subscriptions — refunding both',
  displayName: 'Founder refund note',
  fromName: 'Omar from SiteScoper',
  previewData: { name: 'Ann' },
} satisfies TemplateEntry
