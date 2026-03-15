'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const isOutOfStock = product.stock_quantity <= 0

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Quantity */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
            Qty
          </span>
          <div className="flex items-center border border-zinc-700">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              −
            </button>
            <span className="px-4 py-2 text-white font-bold min-w-[3rem] text-center border-x border-zinc-700">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity(Math.min(product.stock_quantity, quantity + 1))
              }
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock || added}
        className={`w-full flex items-center justify-center gap-3 py-4 font-bold text-sm tracking-widest uppercase transition-all duration-200 ${
          isOutOfStock
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-white text-black hover:bg-zinc-200 active:bg-zinc-300'
        }`}
      >
        {added ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : (
          <>
            <ShoppingCart size={18} />
            Add to Cart
          </>
        )}
      </button>
    </div>
  )
}
