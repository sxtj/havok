import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-white">
          Edit Product
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} mode="edit" />
    </div>
  )
}
