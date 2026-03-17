import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Product } from '@/types'
import { formatPriceDollars } from '@/lib/utils'
import type { Metadata } from 'next'
import AddToCartButton from './AddToCartButton'
import ShopifyBuyButton from '@/components/shopify/BuyButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description ?? undefined,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const isOutOfStock = product.stock_quantity <= 0

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="relative aspect-square bg-zinc-950 border border-zinc-800">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package size={80} className="text-zinc-700" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500 mb-3">
                {product.category}
              </p>
            )}
            <h1 className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-white leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-white">
                {formatPriceDollars(product.price)}
              </span>
              {product.compare_at_price &&
                product.compare_at_price > product.price && (
                  <>
                    <span className="text-xl text-zinc-600 line-through">
                      {formatPriceDollars(product.compare_at_price)}
                    </span>
                    <span className="bg-white text-black text-xs font-bold tracking-widest uppercase px-2 py-1">
                      Save{' '}
                      {Math.round(
                        (1 - product.price / product.compare_at_price) * 100
                      )}
                      %
                    </span>
                  </>
                )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-zinc-400 text-base leading-relaxed mb-8 border-t border-zinc-800 pt-6">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <p
              className={`text-sm font-bold tracking-widest uppercase mb-6 ${
                isOutOfStock ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : `In Stock — ${product.stock_quantity} units`}
            </p>

            {/* Add to Cart */}
            {product.shopify_product_id ? (
              <ShopifyBuyButton productId={product.shopify_product_id} />
            ) : (
              <AddToCartButton product={product} />
            )}
          </div>
        </div>

        {/* Nutrition Info */}
        {product.nutrition_info && (
          <div className="mt-20 border-t border-zinc-800 pt-16">
            <h2 className="text-2xl font-black tracking-widest uppercase text-white mb-8">
              Nutrition Facts
            </h2>
            <div className="max-w-sm border border-zinc-800 p-6">
              <div className="border-b-4 border-white pb-2 mb-2">
                <p className="text-2xl font-black text-white">Nutrition Facts</p>
                <p className="text-sm text-zinc-400">
                  Serving Size: {product.nutrition_info.servingSize}
                </p>
              </div>
              <p className="text-sm text-zinc-400 border-b border-zinc-700 pb-2 mb-3">
                {product.nutrition_info.servingsPerContainer} servings per container
              </p>

              <div className="border-b-4 border-white pb-2 mb-3 flex justify-between items-baseline">
                <span className="font-black text-white text-sm uppercase tracking-wider">
                  Calories
                </span>
                <span className="font-black text-white text-3xl">
                  {product.nutrition_info.calories}
                </span>
              </div>

              {Object.entries(product.nutrition_info)
                .filter(
                  (entry) =>
                    !['servingSize', 'servingsPerContainer', 'calories'].includes(
                      entry[0]
                    )
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-1.5 border-b border-zinc-800 text-sm"
                  >
                    <span className="text-zinc-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
