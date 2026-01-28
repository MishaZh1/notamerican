import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, StripePriceKey } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { priceKey } = await request.json() as { priceKey: StripePriceKey }

        if (!priceKey || !STRIPE_PRICES[priceKey]) {
            return NextResponse.json(
                { error: 'Invalid price key' },
                { status: 400 }
            )
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get or create Stripe customer
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single()

        let customerId = userData?.stripe_customer_id

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email || userData?.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            })
            customerId = customer.id

            // Save customer ID to database
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id)
        }

        const priceConfig = STRIPE_PRICES[priceKey]
        const isSubscription = 'interval' in priceConfig

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: isSubscription ? 'subscription' : 'payment',
            line_items: [
                {
                    price: priceConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/checkout/cancel`,
            metadata: {
                user_id: user.id,
                price_key: priceKey,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
