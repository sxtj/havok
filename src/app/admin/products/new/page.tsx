import { Metadata } from 'next'
import ProductForm from '../ProductForm'

export const metadata: Metadata = { title: 'New Product — Admin' }

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-white">
          New Product
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Add a new supplement to the store.</p>
      </div>
      <ProductForm mode="create" />
    </div>
  )
}
