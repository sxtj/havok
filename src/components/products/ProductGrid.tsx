import { Product } from '@/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  title?: string
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-500 text-lg">No products found.</p>
      </div>
    )
  }

  return (
    <section>
      {title && (
        <h2 className="text-3xl font-black tracking-widest uppercase text-white mb-8">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zinc-800">
        {products.map((product, index) => (
          <div key={product.id} className="bg-black">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  )
}
