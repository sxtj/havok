import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-10 w-10">
                <Image src="/logo.jpg" alt="HAVOK" fill className="object-contain" />
              </div>
              <span className="font-black text-xl tracking-[0.15em] uppercase text-white">
                HAVOK
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Premium supplements engineered for athletes who refuse to quit. No fillers.
              No compromises. Just results.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
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
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { href: '#', label: 'Contact Us' },
                { href: '#', label: 'Shipping Policy' },
                { href: '#', label: 'Returns' },
                { href: '#', label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} HAVOK. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built for those who train harder.
          </p>
        </div>
      </div>
    </footer>
  )
}
