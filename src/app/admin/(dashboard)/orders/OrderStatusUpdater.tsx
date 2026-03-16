'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface Props {
  orderId: string
  currentStatus: string
}

const nextStatus: Record<string, string> = {
  pending: 'paid',
  paid: 'fulfilled',
}

const statusLabels: Record<string, string> = {
  paid: 'Mark Fulfilled',
  pending: 'Mark Paid',
}

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const next = nextStatus[currentStatus]
  if (!next) return null

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase border border-zinc-700 text-zinc-400 hover:border-white hover:text-white px-3 py-1.5 transition-colors disabled:opacity-50"
    >
      <Check size={10} />
      {loading ? 'Updating...' : statusLabels[currentStatus]}
    </button>
  )
}
