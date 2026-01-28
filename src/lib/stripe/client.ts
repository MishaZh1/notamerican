import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SANDBOX_SECRET_KEY

if (!apiKey) {
    console.warn('⚠️ STRIPE_SANDBOX_SECRET_KEY is not set. Using dummy key for build/development only.')
    // This allows the build to pass but will fail at runtime if not set
}

export const stripe = new Stripe(apiKey || 'sk_test_dummy', {
    apiVersion: '2025-12-15.clover',
    typescript: true,
})

// Stripe pricing configuration
export const STRIPE_PRICES = {
    PREMIUM_MONTHLY: {
        priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
        amount: 499, // $4.99
        name: 'Premium Monthly',
        description: 'Unlimited hearts, no ads',
        interval: 'month' as const,
    },
    PREMIUM_YEARLY: {
        priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
        amount: 4999, // $49.99
        name: 'Premium Yearly',
        description: 'Unlimited hearts, no ads - Save 17%!',
        interval: 'year' as const,
    },
    HEART_PACK_5: {
        priceId: process.env.STRIPE_PRICE_HEART_PACK_5 || '',
        amount: 99, // $0.99
        name: '5 Heart Pack',
        description: 'Get 5 extra hearts',
        type: 'one_time' as const,
    },
    HEART_PACK_20: {
        priceId: process.env.STRIPE_PRICE_HEART_PACK_20 || '',
        amount: 299, // $2.99
        name: '20 Heart Pack',
        description: 'Get 20 extra hearts - Best value!',
        type: 'one_time' as const,
    },
} as const

export type StripePriceKey = keyof typeof STRIPE_PRICES
