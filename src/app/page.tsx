import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PILLARS = [
  {
    num: '01',
    title: 'Pure Formulas',
    description:
      'No proprietary blends. Every ingredient, every dose — fully disclosed on the label.',
  },
  {
    num: '02',
    title: 'Tested Quality',
    description:
      'Third-party lab tested for purity and potency. What\'s on the label is in the tub.',
  },
  {
    num: '03',
    title: 'Real Results',
    description:
      'Formulated by athletes for athletes. Performance you can actually feel.',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />

      {/* Brand pillars — editorial numbered layout */}
      <section className="bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border border-zinc-800">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.num}
                className="relative p-10 group hover:bg-black transition-colors duration-300 overflow-hidden"
              >
                {/* Large ghost number */}
                <span className="absolute -bottom-4 -right-2 text-[7rem] font-black text-zinc-900 leading-none select-none group-hover:text-zinc-800 transition-colors duration-300 pointer-events-none">
                  {pillar.num}
                </span>

                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-600 mb-5">
                  {pillar.num}
                </p>
                <div className="h-px w-8 bg-white mb-6" />
                <h3 className="text-base font-black tracking-widest uppercase text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed relative z-10 max-w-xs">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — editorial split layout, white section */}
      <section className="bg-white relative overflow-hidden">
        {/* Ghost "H" watermark */}
        <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-[22rem] font-black text-zinc-100 leading-none select-none pointer-events-none">
          H
        </span>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
            {/* Left — big type */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 mb-5">
                Built Different
              </p>
              <h2 className="text-[clamp(3.5rem,9vw,8rem)] font-black uppercase text-black leading-[0.88] tracking-tight">
                FUEL<br />YOUR<br />RAGE
              </h2>
            </div>

            {/* Right — copy + CTA */}
            <div className="lg:max-w-xs space-y-6">
              <p className="text-zinc-500 text-base leading-relaxed">
                Every scoop. Every rep. Every second in the gym.{' '}
                <span className="text-black font-semibold">HAVOK is there.</span>
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-black text-white font-bold text-xs tracking-[0.3em] uppercase px-8 py-4 hover:bg-zinc-900 transition-colors group"
              >
                Shop the Full Line
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
