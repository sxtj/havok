import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Product } from '@/types'
import ProductGrid from '@/components/products/ProductGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse all HAVOK premium supplements.',
}

async function getProducts(category?: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data ?? []
}

interface SearchParams {
  category?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const products = await getProducts(category)

  const categories = ['protein', 'pre-workout', 'creatine', 'electrolytes']

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500 mb-2">
            The Full Line
          </p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-widest uppercase text-white">
            Products
          </h1>
          <p className="text-zinc-500 mt-3 text-sm">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {category ? ` in ${category}` : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <a
            href="/products"
            className={`text-xs font-bold tracking-widest uppercase px-4 py-2 border transition-colors ${
              !category
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-400 hover:text-white'
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/products?category=${cat}`}
              className={`text-xs font-bold tracking-widest uppercase px-4 py-2 border transition-colors ${
                category === cat
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  )
}
