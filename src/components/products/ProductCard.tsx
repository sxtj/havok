'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'
import { Product } from '@/types'
import { formatPriceDollars } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity: 1,
      slug: product.slug,
    })
  }

  const isOutOfStock = product.stock_quantity <= 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative bg-zinc-950 border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package size={48} className="text-zinc-700" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOutOfStock && (
              <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                Sold Out
              </span>
            )}
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                Sale
              </span>
            )}
          </div>

          {/* Add to cart overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full bg-white text-black text-xs font-bold tracking-widest uppercase py-3 hover:bg-zinc-200 active:bg-zinc-300 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={14} />
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">
              {product.category}
            </p>
          )}
          <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-zinc-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white font-bold">
              {formatPriceDollars(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-zinc-600 text-sm line-through">
                {formatPriceDollars(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
