import type { ComponentType } from 'react'
import { template as founderRefundNote } from './founder-refund-note'
import { template as monitorDigest } from './monitor-digest'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
  /** Overrides the default site name in the From header. */
  fromName?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'founder-refund-note': founderRefundNote,
  'monitor-digest': monitorDigest,
}
