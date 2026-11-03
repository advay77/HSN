import 'server-only'

// Pluggable membership payments. Membership is free today (PAYMENT_PROVIDER unset or "none").
// To start charging, set PAYMENT_PROVIDER=razorpay or stripe plus that provider's keys in .env;
// the Membership page then shows "Join and pay" (the design's pricingLive state) and sends people to checkout.

export type Tier = 'student' | 'individual' | 'institutional'

export type CheckoutRequest = {
  applicationId: string | number
  tier: Tier
  region: string
  email: string
  name: string
  returnUrl: string
}

export type CheckoutResult =
  | { kind: 'free' } // nothing to pay, membership is active straight away
  | { kind: 'redirect'; url: string; reference: string } // hosted checkout page

export interface PaymentProvider {
  id: 'none' | 'razorpay' | 'stripe'
  /** True when people must pay to join. */
  live: boolean
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>
  /** Verifies a webhook call and returns the paid reference, or null if it is not a successful payment. */
  verifyWebhook(rawBody: string, headers: Headers): Promise<{ reference: string } | null>
}

const freeProvider: PaymentProvider = {
  id: 'none',
  live: false,
  async createCheckout() {
    return { kind: 'free' }
  },
  async verifyWebhook() {
    return null
  },
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  switch ((process.env.PAYMENT_PROVIDER || 'none').toLowerCase()) {
    case 'razorpay':
      return (await import('./razorpay')).razorpayProvider
    case 'stripe':
      return (await import('./stripe')).stripeProvider
    default:
      return freeProvider
  }
}

/** Price per tier and region, from env as JSON, e.g. MEMBERSHIP_PRICES={"individual":{"IN":{"amount":99900,"currency":"INR"}}} (amount in the smallest unit). */
export function getPrice(tier: Tier, region: string): { amount: number; currency: string } | null {
  try {
    const table = JSON.parse(process.env.MEMBERSHIP_PRICES || '{}')
    return table?.[tier]?.[region] ?? table?.[tier]?.INTL ?? null
  } catch {
    return null
  }
}
