import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500 mb-2">
              Best Sellers
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-widest uppercase text-white">
              Featured
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-bold tracking-widest uppercase transition-colors group"
          >
            View All
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800">
          {products.map((product) => (
            <div key={product.id} className="bg-black">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
