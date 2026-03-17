'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Package } from 'lucide-react'
import { Product } from '@/types'
import { slugify } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface ProductFormProps {
  product?: Product
  mode: 'create' | 'edit'
}

const categories = ['protein', 'pre-workout', 'creatine', 'electrolytes', 'vitamins', 'other']

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    compare_at_price: product?.compare_at_price?.toString() ?? '',
    category: product?.category ?? '',
    stock_quantity: product?.stock_quantity?.toString() ?? '0',
    is_active: product?.is_active ?? true,
    image_url: product?.image_url ?? '',
    shopify_product_id: product?.shopify_product_id ?? '',
    nutrition_info: product?.nutrition_info
      ? JSON.stringify(product.nutrition_info, null, 2)
      : JSON.stringify(
          {
            servingSize: '1 scoop (30g)',
            servingsPerContainer: 30,
            calories: 120,
            protein: '25g',
            carbohydrates: '3g',
            fat: '2g',
            sodium: '150mg',
          },
          null,
          2
        ),
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? slugify(name) : prev.slug,
    }))
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { upsert: false })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filename)

      setForm((prev) => ({ ...prev, image_url: publicUrl }))
    } catch (err) {
      console.error('Image upload error:', err)
      setError('Image upload failed. Check storage bucket configuration.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let nutritionInfo = null
      if (form.nutrition_info.trim()) {
        try {
          nutritionInfo = JSON.parse(form.nutrition_info)
        } catch {
          setError('Nutrition info must be valid JSON.')
          setLoading(false)
          return
        }
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        category: form.category || null,
        stock_quantity: parseInt(form.stock_quantity, 10),
        is_active: form.is_active,
        image_url: form.image_url || null,
        shopify_product_id: form.shopify_product_id || null,
        nutrition_info: nutritionInfo,
      }

      const url =
        mode === 'edit'
          ? `/api/admin/products/${product!.id}`
          : '/api/admin/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            placeholder="HAVOK Whey Protein"
          />
        </div>

        {/* Slug */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            required
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
            placeholder="havok-whey-protein"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            required
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            placeholder="49.99"
          />
        </div>

        {/* Compare at price */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Compare at Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.compare_at_price}
            onChange={(e) =>
              setForm((p) => ({ ...p, compare_at_price: e.target.value }))
            }
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            placeholder="59.99"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock_quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, stock_quantity: e.target.value }))
            }
            required
            className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Description
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors resize-none"
          placeholder="Describe the product..."
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Product Image
        </label>

        {form.image_url && (
          <div className="relative inline-block mb-4">
            <div className="relative h-32 w-32 bg-zinc-900">
              <Image
                src={form.image_url}
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
              className="absolute -top-2 -right-2 bg-black border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 px-4 py-2.5 transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {uploadingImage ? 'Uploading...' : 'Upload Image'}
          </button>
          <span className="text-zinc-600 text-xs self-center">or</span>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            placeholder="Paste image URL"
            className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Shopify Variant ID */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Shopify Variant ID
        </label>
        <input
          type="text"
          value={form.shopify_product_id}
          onChange={(e) => setForm((p) => ({ ...p, shopify_product_id: e.target.value }))}
          className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
          placeholder="7941375688806"
        />
        <p className="text-xs text-zinc-600 mt-1">
          Required for the Buy Button. Find this in Shopify Admin → Products → click product → copy the numeric ID from the URL.
        </p>
      </div>

      {/* Nutrition Info */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Nutrition Info (JSON)
        </label>
        <textarea
          rows={10}
          value={form.nutrition_info}
          onChange={(e) => setForm((p) => ({ ...p, nutrition_info: e.target.value }))}
          className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors resize-none font-mono text-xs"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.is_active}
          onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
            form.is_active ? 'bg-white' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-200 ${
              form.is_active
                ? 'translate-x-7 bg-black'
                : 'translate-x-1 bg-zinc-400'
            }`}
          />
        </button>
        <label className="text-sm text-zinc-300">
          Product is <strong>{form.is_active ? 'active' : 'inactive'}</strong>
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-sm py-3 px-4 bg-red-950/20 border border-red-900">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-bold text-xs tracking-widest uppercase px-8 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Saving...'
            : mode === 'edit'
            ? 'Update Product'
            : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
