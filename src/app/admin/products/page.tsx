import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Package } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { formatPriceDollars } from '@/lib/utils'
import DeleteProductButton from './DeleteProductButton'

async function getProducts() {
  const supabase = await createSupabaseAdminClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-widest uppercase text-white">
            Products
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-white text-black font-bold text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-zinc-200 transition-colors"
        >
          <Plus size={14} />
          New Product
        </Link>
      </div>

      <div className="bg-black border border-zinc-800">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm mb-4">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white border border-zinc-700 px-4 py-2 hover:border-zinc-500 transition-colors"
            >
              <Plus size={12} />
              Create First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-zinc-600"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors group"
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 bg-zinc-900 overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <Package size={14} className="text-zinc-700" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-zinc-600 font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-zinc-400 capitalize">
                      {product.category ?? '—'}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      {formatPriceDollars(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-bold ${
                          product.stock_quantity <= 0
                            ? 'text-red-400'
                            : product.stock_quantity <= 10
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm ${
                          product.is_active
                            ? 'text-green-400 bg-green-400/10'
                            : 'text-zinc-500 bg-zinc-800'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="Edit product"
                        >
                          <Edit size={16} />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
