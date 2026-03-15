import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role client for webhooks (bypasses RLS)
function getAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err)
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getAdminSupabaseClient()

  // Avoid duplicate order creation
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existing) return

  // Build shipping address
  const shipping = session.shipping_details?.address
  const shippingAddress = shipping
    ? {
        line1: shipping.line1 ?? '',
        line2: shipping.line2 ?? undefined,
        city: shipping.city ?? '',
        state: shipping.state ?? '',
        postal_code: shipping.postal_code ?? '',
        country: shipping.country ?? '',
      }
    : null

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'paid',
      customer_email: session.customer_details?.email ?? '',
      customer_name: session.customer_details?.name ?? null,
      shipping_address: shippingAddress,
      subtotal: (session.amount_subtotal ?? 0) / 100,
      total: (session.amount_total ?? 0) / 100,
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`)
  }

  // Retrieve line items from Stripe
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  })

  // Parse product IDs and quantities from metadata
  const productIds = (session.metadata?.product_ids ?? '').split(',').filter(Boolean)
  const quantities = (session.metadata?.quantities ?? '').split(',').map(Number)

  // Create order items
  const orderItems = lineItems.data.map((item, idx) => ({
    order_id: order.id,
    product_id: productIds[idx] ?? null,
    product_name: item.description ?? 'Unknown Product',
    product_price: (item.amount_total ?? 0) / 100 / (item.quantity ?? 1),
    quantity: quantities[idx] ?? item.quantity ?? 1,
  }))

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
    }
  }

  // Decrement stock
  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i]
    const qty = quantities[i]
    if (productId && qty) {
      await supabase.rpc('decrement_stock', {
        product_id: productId,
        qty,
      })
    }
  }
}
