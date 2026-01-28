import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

const key = process.env.STRIPE_SANDBOX_SECRET_KEY || process.env.STRIPE_SECRET_KEY

if (!key) {
    console.error('❌ No Stripe Secret Key found in .env.local')
    console.error('Please ensure STRIPE_SANDBOX_SECRET_KEY is set.')
    process.exit(1)
}

const stripe = new Stripe(key, {
    apiVersion: '2024-12-18.acacia', // Updated to match client.ts
})

const PRODUCTS = [
    {
        key: 'STRIPE_PRICE_PREMIUM_MONTHLY',
        name: 'Premium Monthly',
        description: 'Unlimited hearts, no ads, premium badge',
        amount: 499, // $4.99
        interval: 'month',
    },
    {
        key: 'STRIPE_PRICE_PREMIUM_YEARLY',
        name: 'Premium Yearly',
        description: 'Unlimited hearts, no ads, save 17%',
        amount: 4999, // $49.99
        interval: 'year',
    },
    {
        key: 'STRIPE_PRICE_HEART_PACK_5',
        name: '5 Heart Pack',
        description: 'Get 5 extra hearts',
        amount: 99, // $0.99
        type: 'one_time',
    },
    {
        key: 'STRIPE_PRICE_HEART_PACK_20',
        name: '20 Heart Pack',
        description: 'Get 20 extra hearts (Best Value)',
        amount: 299, // $2.99
        type: 'one_time',
    },
]

async function main() {
    console.log('🚀 Setting up Stripe Products...')

    const newEnvLines: string[] = []

    for (const productDef of PRODUCTS) {
        console.log(`\nChecking product: ${productDef.name}...`)

        // Search for existing product
        const search = await stripe.products.search({
            query: `name:'${productDef.name}'`,
        })

        let productId: string
        let priceId: string

        if (search.data.length > 0) {
            console.log(`✅ Found existing product: ${search.data[0].id}`)
            productId = search.data[0].id
            // Find its price
            const prices = await stripe.prices.list({ product: productId, active: true })
            if (prices.data.length > 0) {
                priceId = prices.data[0].id
                console.log(`✅ Found existing price: ${priceId}`)
            } else {
                console.log('⚠️ Product exists but has no price. Creating price...')
                const price = await createPrice(productId, productDef)
                priceId = price.id
            }
        } else {
            console.log('➕ Creating new product...')
            const product = await stripe.products.create({
                name: productDef.name,
                description: productDef.description,
            })
            productId = product.id
            const price = await createPrice(productId, productDef)
            priceId = price.id
            console.log(`✅ Created product ${productId} and price ${priceId}`)
        }

        newEnvLines.push(`${productDef.key}=${priceId}`)
    }

    console.log('\n\n🎉 Setup Complete! Add these lines to your .env.local file:\n')
    console.log('----------------------------------------------------')
    console.log(newEnvLines.join('\n'))
    console.log('----------------------------------------------------')
}

async function createPrice(productId: string, def: any) {
    const priceData: any = {
        product: productId,
        unit_amount: def.amount,
        currency: 'usd',
    }

    if (def.interval) {
        priceData.recurring = { interval: def.interval }
    }

    return await stripe.prices.create(priceData)
}

main().catch(console.error)
