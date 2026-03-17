'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

function SuccessContent() {
  const { clearCart } = useCart()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    clearCart()
    setLoaded(true)
  }, [clearCart])

  if (!loaded) return null

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-slide-up">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-2 border-white flex items-center justify-center">
              <Check size={40} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 rounded-full border border-white/20 scale-110" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative h-12 w-12">
            <Image src="/logo.jpg" alt="HAVOK" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-widest uppercase text-white mb-3">
          Order Confirmed
        </h1>
        <p className="text-zinc-400 text-base mb-2">
          Your order has been placed successfully.
        </p>
        <p className="text-zinc-600 text-sm mb-10">
          A confirmation email will be sent to you shortly.
        </p>

        {/* Separator */}
        <div className="h-px bg-zinc-800 mb-10" />

        <div className="space-y-4">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold text-sm tracking-widest uppercase py-4 hover:bg-zinc-200 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-transparent text-zinc-400 hover:text-white font-bold text-sm tracking-widest uppercase py-4 border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-zinc-500">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
