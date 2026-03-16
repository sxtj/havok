'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'
import { Product } from '@/types'
import { formatPriceDollars } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const seqNum = String(index + 1).padStart(2, '0')
  const isOutOfStock = product.stock_quantity <= 0

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

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      {/* Portrait card — image fills, info overlays at bottom */}
      <div className="relative overflow-hidden bg-zinc-950 w-full" style={{ aspectRatio: '3/4' }}>

        {/* Image */}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <Package size={48} className="text-zinc-700" />
          </div>
        )}

        {/* Permanent dark scrim at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Sequence number — top left */}
        <div className="absolute top-4 left-4 z-10">
          <span className="font-mono text-[11px] font-bold text-white/20 tracking-widest tabular-nums">
            {seqNum}
          </span>
        </div>

        {/* Badges — top right */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[9px] font-black tracking-[0.2em] uppercase bg-white text-black px-2 py-0.5">
              SALE
            </span>
          )}
          {product.category && (
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/40 bg-black/40 backdrop-blur-sm px-2 py-0.5">
              {product.category}
            </span>
          )}
        </div>

        {/* Info overlay — always visible at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-16">
          <h3 className="text-sm font-bold tracking-wide uppercase text-white leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2.5">
            <span className="text-white font-black text-sm">
              {formatPriceDollars(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-zinc-500 text-xs line-through">
                {formatPriceDollars(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Add to cart — expands on hover */}
          {!isOutOfStock && (
            <div className="overflow-hidden max-h-0 group-hover:max-h-14 transition-[max-height] duration-300 ease-out">
              <button
                onClick={handleAddToCart}
                className="mt-3 w-full bg-white text-black text-[10px] font-black tracking-[0.25em] uppercase py-3 flex items-center justify-center gap-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
              >
                <ShoppingCart size={11} strokeWidth={2.5} />
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 border border-zinc-700 px-4 py-2">
              Sold Out
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
