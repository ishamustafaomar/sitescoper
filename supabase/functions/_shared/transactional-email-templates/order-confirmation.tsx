/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Item { name: string; qty: number; price: string }
interface Props {
  name?: string
  orderId?: string
  items?: Item[]
  total?: string
}

const Email = ({
  name = 'there',
  orderId = 'ORD-0000',
  items = [{ name: 'Item', qty: 1, price: '$0.00' }],
  total = '$0.00',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order {orderId} confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Order confirmed</Heading>
        <Text style={text}>Hi {name}, thanks for your order. Here's your receipt:</Text>
        <Text style={meta}>Order #{orderId}</Text>
        <Hr style={hr} />
        <Section>
          {items.map((it, i) => (
            <Row key={i} style={{ marginBottom: '8px' }}>
              <Column style={cellLeft}>{it.qty}× {it.name}</Column>
              <Column style={cellRight}>{it.price}</Column>
            </Row>
          ))}
        </Section>
        <Hr style={hr} />
        <Row>
          <Column style={{ ...cellLeft, fontWeight: 'bold' }}>Total</Column>
          <Column style={{ ...cellRight, fontWeight: 'bold' }}>{total}</Column>
        </Row>
        <Text style={footer}>We'll email you again when anything changes.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => `Order ${d?.orderId ?? ''} confirmed`,
  displayName: 'Order confirmation',
  previewData: {
    name: 'Jane',
    orderId: 'ORD-1042',
    items: [
      { name: 'Pro plan (monthly)', qty: 1, price: '$29.00' },
      { name: 'Extra seat', qty: 2, price: '$10.00' },
    ],
    total: '$49.00',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(220, 25%, 10%)', margin: '0 0 12px' }
const text = { fontSize: '14px', color: 'hsl(220, 12%, 38%)', lineHeight: '1.5', margin: '0 0 8px' }
const meta = { fontSize: '13px', color: 'hsl(220, 12%, 50%)', margin: '0 0 12px' }
const hr = { borderColor: '#eee', margin: '16px 0' }
const cellLeft = { fontSize: '14px', color: 'hsl(220, 25%, 10%)' }
const cellRight = { fontSize: '14px', color: 'hsl(220, 25%, 10%)', textAlign: 'right' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }