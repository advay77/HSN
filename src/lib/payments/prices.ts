import 'server-only'

import { getPrice, type Tier } from './index'

export type PriceTable = Partial<Record<Tier, Record<string, string>>>

const REGIONS = ['IN', 'AE', 'SA', 'OM', 'QA', 'KW', 'BH', 'INTL']

/** Formatted yearly price per tier and region (from MEMBERSHIP_PRICES), for the Membership page cards. */
export function priceTable(locale = 'en-US'): PriceTable {
  const out: PriceTable = {}
  for (const tier of ['student', 'individual', 'institutional'] as Tier[]) {
    for (const region of REGIONS) {
      const p = getPrice(tier, region)
      if (!p) continue
      const digits = ['KWD', 'BHD', 'OMR'].includes(p.currency.toUpperCase()) ? 3 : 2
      const value = new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(p.amount / 10 ** digits)
      ;(out[tier] ??= {})[region] = value
    }
  }
  return out
}
