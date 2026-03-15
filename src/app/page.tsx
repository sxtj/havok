import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />

      {/* Brand pillars */}
      <section className="bg-zinc-950 border-y border-zinc-800 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800">
            {[
              {
                title: 'Pure Formulas',
                description:
                  'No proprietary blends. Every ingredient, every dose — fully disclosed.',
              },
              {
                title: 'Tested Quality',
                description:
                  'Third-party lab tested for purity and potency. What\'s on the label is in the tub.',
              },
              {
                title: 'Real Results',
                description:
                  'Formulated by athletes for athletes. Performance you can actually feel.',
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-zinc-950 p-10 text-center group hover:bg-black transition-colors"
              >
                <div className="h-px w-8 bg-white mx-auto mb-6" />
                <h3 className="text-lg font-black tracking-widest uppercase text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-black tracking-[0.2em] uppercase text-black leading-tight mb-6">
            FUEL YOUR RAGE
          </h2>
          <p className="text-zinc-600 text-lg mb-10 max-w-xl mx-auto">
            Every scoop. Every rep. Every second in the gym. HAVOK is there.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold text-sm tracking-widest uppercase px-12 py-4 hover:bg-zinc-900 active:bg-zinc-800 transition-colors"
          >
            Shop the Full Line
          </Link>
        </div>
      </section>
    </>
  )
}
