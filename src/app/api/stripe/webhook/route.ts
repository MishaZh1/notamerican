import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { recordTransaction } from '@/app/actions-hearts'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature')!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error('Webhook signature verification failed:', err)
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(session)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionUpdated(subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionDeleted(subscription)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const priceKey = session.metadata?.price_key

    if (!userId) {
        console.error('No user_id in session metadata')
        return
    }

    const supabase = await createClient()

    // Determine transaction type
    let transactionType: 'subscription_monthly' | 'subscription_yearly' | 'heart_pack_5' | 'heart_pack_20'
    let subscriptionTier: 'free' | 'premium_monthly' | 'premium_yearly' = 'free'
    let heartPacksToAdd = 0

    switch (priceKey) {
        case 'PREMIUM_MONTHLY':
            transactionType = 'subscription_monthly'
            subscriptionTier = 'premium_monthly'
            break
        case 'PREMIUM_YEARLY':
            transactionType = 'subscription_yearly'
            subscriptionTier = 'premium_yearly'
            break
        case 'HEART_PACK_5':
            transactionType = 'heart_pack_5'
            heartPacksToAdd = 1
            break
        case 'HEART_PACK_20':
            transactionType = 'heart_pack_20'
            heartPacksToAdd = 4 // 20 hearts = 4 packs of 5
            break
        default:
            console.error('Unknown price key:', priceKey)
            return
    }

    // Record transaction
    await recordTransaction(
        userId,
        transactionType,
        session.amount_total || 0,
        session.payment_intent as string,
        session.id
    )

    // Update user subscription or heart packs
    if (subscriptionTier !== 'free') {
        // Calculate expiration date
        const expiresAt = new Date()
        if (subscriptionTier === 'premium_monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        }

        await supabase
            .from('users')
            .update({
                subscription_tier: subscriptionTier,
                subscription_expires_at: expiresAt.toISOString(),
            })
            .eq('id', userId)
    } else if (heartPacksToAdd > 0) {
        // Add heart packs
        await supabase.rpc('add_heart_packs', {
            user_id_param: userId,
            packs_to_add: heartPacksToAdd,
        })
    }

    console.log(`✅ Checkout completed for user ${userId}: ${priceKey}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id

    if (!userId) {
        console.error('No user_id in subscription metadata')
        return
    }

    const supabase = await createClient()

    // Update subscription status
    const isActive = subscription.status === 'active'
    const expiresAt = new Date(subscription.current_period_end * 1000)

    await supabase
        .from('users')
        .update({
            subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId)

    console.log(`✅ Subscription updated for user ${userId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id

    if (!userId) {
        console.error('No user_id in subscription metadata')
        return
    }

    const supabase = await createClient()

    // Downgrade to free tier
    await supabase
        .from('users')
        .update({
            subscription_tier: 'free',
            subscription_expires_at: null,
        })
        .eq('id', userId)

    console.log(`✅ Subscription cancelled for user ${userId}`)
}
