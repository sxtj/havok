'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPriceDollars } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } =
    useCart()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (items.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
        }),
      })

      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      router.push(url)
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckingOut(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-white" />
            <span className="font-bold text-white tracking-wider uppercase text-sm">
              Cart
            </span>
            {itemCount > 0 && (
              <span className="bg-white text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-zinc-700" />
              <div>
                <p className="text-white font-semibold mb-1">Your cart is empty</p>
                <p className="text-zinc-500 text-sm">
                  Add some supplements to get started.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={closeCart}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-zinc-800 last:border-0"
                >
                  {/* Product image */}
                  <div className="relative h-20 w-20 flex-shrink-0 bg-zinc-900 rounded overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-700">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {formatPriceDollars(item.price)}
                    </p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-zinc-700 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-medium text-white min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-sm font-semibold text-white whitespace-nowrap">
                    {formatPriceDollars(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-zinc-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Subtotal</span>
              <span className="text-white font-bold text-lg">
                {formatPriceDollars(subtotal)}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Shipping and taxes calculated at checkout.
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              loading={checkingOut}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
