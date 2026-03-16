'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete product')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-bold tracking-wider uppercase text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-zinc-600 hover:text-red-400 transition-colors"
      title={`Delete ${productName}`}
    >
      <Trash2 size={16} />
    </button>
  )
}
