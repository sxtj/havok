import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).nullable().optional(),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  stock_quantity: z.number().int().min(0),
  is_active: z.boolean(),
  image_url: z.string().url().nullable().optional(),
  shopify_product_id: z.string().nullable().optional(),
  nutrition_info: z.record(z.unknown()).nullable().optional(),
})

async function verifyAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (!adminEmails.includes(user.email ?? '')) return null
  return user
}

export async function GET(request: NextRequest) {
  const user = await verifyAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', parsed.data.slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('products')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
