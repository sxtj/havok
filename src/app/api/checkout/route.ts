import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createShopifyCart, resolveVariantIds } from '@/lib/shopify'
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

    const { items } = parsed.data

    // Verify products exist and retrieve Shopify variant IDs
    const supabase = await createSupabaseServerClient()
    const productIds = items.map((i) => i.productId)

    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_active, shopify_product_id')
      .in('id', productIds)
      .eq('is_active', true)

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to verify products' }, { status: 500 })
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // Validate all items and collect Shopify product IDs
    const shopifyProductIds: string[] = []
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
      if (!dbProduct.shopify_product_id) {
        return NextResponse.json(
          { error: `Product "${dbProduct.name}" is not configured for checkout` },
          { status: 400 }
        )
      }
      shopifyProductIds.push(dbProduct.shopify_product_id as string)
    }

    // Resolve product IDs → variant GIDs (cartCreate requires variant IDs)
    const variantMap = await resolveVariantIds(shopifyProductIds)

    const cartLines: { merchandiseId: string; quantity: number }[] = []
    for (const item of items) {
      const dbProduct = productMap.get(item.productId)!
      const variantId = variantMap.get(dbProduct.shopify_product_id as string)
      if (!variantId) {
        return NextResponse.json(
          { error: `Could not resolve variant for "${dbProduct.name}"` },
          { status: 400 }
        )
      }
      cartLines.push({ merchandiseId: variantId, quantity: item.quantity })
    }

    const { checkoutUrl } = await createShopifyCart(cartLines)
    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
