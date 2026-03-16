import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800">

      {/* Giant HAVOK watermark */}
      <div className="border-b border-zinc-800 overflow-hidden">
        <p className="text-[clamp(5rem,18vw,14rem)] font-black tracking-[0.15em] uppercase text-zinc-950 leading-none px-4 select-none whitespace-nowrap">
          HAVOK
        </p>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="relative h-9 w-9">
                <Image src="/logo.jpg" alt="HAVOK" fill className="object-contain" />
              </div>
              <span className="font-black text-base tracking-[0.2em] uppercase text-white">
                HAVOK
              </span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
              Premium supplements engineered for athletes who refuse to quit.
              No fillers. No compromises. Just results.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.35em] uppercase text-zinc-500 mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/products?category=protein', label: 'Protein' },
                { href: '/products?category=pre-workout', label: 'Pre-Workout' },
                { href: '/products?category=creatine', label: 'Creatine' },
                { href: '/products?category=electrolytes', label: 'Electrolytes' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.35em] uppercase text-zinc-500 mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { href: '#', label: 'Contact Us' },
                { href: '#', label: 'Shipping Policy' },
                { href: '#', label: 'Returns' },
                { href: '#', label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-zinc-700 tracking-wider">
            &copy; {new Date().getFullYear()} HAVOK. All rights reserved.
          </p>
          <p className="text-[11px] text-zinc-700 tracking-wider">
            Built for those who train harder.
          </p>
        </div>
      </div>
    </footer>
  )
}
