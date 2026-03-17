import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ghost logo — large, slow counter-rotation for depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div
          style={{
            position: 'relative',
            width: 'min(130vw, 1100px)',
            height: 'min(130vw, 1100px)',
            mixBlendMode: 'screen',
            opacity: 0.07,
            animation: 'logo-ghost-spin 140s linear infinite',
          }}
        >
          <Image src="/logo-black.png" alt="" fill className="object-contain" aria-hidden="true" />
        </div>
      </div>

      {/* Pulse ring — expands outward from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div
          style={{
            width: 'min(95vw, 900px)',
            height: 'min(95vw, 900px)',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'logo-ring-pulse 6s ease-out infinite',
          }}
        />
      </div>

      {/* Main logo — breathing pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div
          style={{
            position: 'relative',
            width: 'min(95vw, 900px)',
            height: 'min(95vw, 900px)',
            mixBlendMode: 'screen',
            animation: 'logo-breathe 8s ease-in-out infinite',
          }}
        >
          <Image
            src="/logo-black.png"
            alt=""
            fill
            className="object-contain"
            priority
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Vignette — darkens edges so logo fades into black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.85)_100%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-slide-up">
        {/* Brand name — sits directly over the logo */}
        <h1 className="text-[clamp(5rem,18vw,14rem)] font-black tracking-[0.25em] text-white leading-none uppercase drop-shadow-[0_0_80px_rgba(255,255,255,0.08)]">
          HAVOK
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px w-16 sm:w-32 bg-white/20" />
          <span className="text-zinc-400 text-xs font-bold tracking-[0.4em] uppercase">
            Premium Supplements
          </span>
          <div className="h-px w-16 sm:w-32 bg-white/20" />
        </div>

        {/* Tagline */}
        <p className="text-zinc-400 text-lg sm:text-xl font-light tracking-wider max-w-lg mx-auto">
          Engineered for athletes who refuse to quit.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-sm tracking-widest uppercase px-10 py-4 hover:bg-zinc-200 active:bg-zinc-300 transition-colors duration-200"
          >
            Shop Now
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-bold text-sm tracking-widest uppercase px-10 py-4 border border-white/30 hover:border-white hover:bg-white/5 transition-all duration-200"
          >
            View All Products
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
          {[
            { value: '4', label: 'Products' },
            { value: '100%', label: 'Pure' },
            { value: '0', label: 'Fillers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
        <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-zinc-600 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
