import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CheckoutLineItem } from '@/types'
import { z } from 'zod'

const lineItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(99),
  imageUrl: z.string().url().nullable().optional(),
})

const bodySchema = z.object({
  items: z.array(lineItemSchema).min(1).max(50),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { items } = parsed.data as { items: CheckoutLineItem[] }

    // Verify products exist and prices match (prevent tampering)
    const supabase = await createSupabaseServerClient()
    const productIds = items.map((i) => i.productId)

    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, is_active')
      .in('id', productIds)
      .eq('is_active', true)

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to verify products' }, { status: 500 })
    }

    // Map DB products for fast lookup
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // Build validated line items
    const lineItems: {
      price_data: {
        currency: string
        product_data: { name: string; images?: string[] }
        unit_amount: number
      }
      quantity: number
    }[] = []

    for (const item of items) {
      const dbProduct = productMap.get(item.productId)
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or unavailable` },
          { status: 400 }
        )
      }
      if (dbProduct.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${dbProduct.name}` },
          { status: 400 }
        )
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbProduct.name,
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: Math.round(dbProduct.price * 100), // Always use DB price
        },
        quantity: item.quantity,
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/products`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: false },
      metadata: {
        product_ids: items.map((i) => i.productId).join(','),
        quantities: items.map((i) => i.quantity).join(','),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
