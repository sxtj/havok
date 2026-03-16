import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import Marquee from '@/components/ui/Marquee'

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

  const [first, ...rest] = products

  return (
    <>
      {/* Marquee strip — inverted (white) for contrast coming off the black hero */}
      <Marquee inverted />

      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-600 mb-2">
                Best Sellers
              </p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-widest uppercase text-white leading-none">
                Featured
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors group"
            >
              View All
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Asymmetric grid: first item wide, rest fill right */}
          {products.length >= 4 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-zinc-800">
              {/* First — spans 2 cols */}
              <div className="lg:col-span-2 bg-black">
                <ProductCard product={first} index={0} />
              </div>

              {/* Second */}
              <div className="bg-black">
                <ProductCard product={rest[0]} index={1} />
              </div>

              {/* Third */}
              <div className="bg-black">
                <ProductCard product={rest[1]} index={2} />
              </div>

              {/* Fourth — spans 2 cols (mirrors first) */}
              <div className="lg:col-span-2 bg-black">
                <ProductCard product={rest[2]} index={3} />
              </div>
            </div>
          ) : (
            /* Fallback: even grid for < 4 products */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
              {products.map((product, i) => (
                <div key={product.id} className="bg-black">
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          )}

          {/* Mobile "view all" */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors"
            >
              View All Products <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Dark marquee strip */}
      <Marquee />
    </>
  )
}
