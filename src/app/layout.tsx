import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/layout/CartSidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HAVOK — Premium Supplements',
    template: '%s | HAVOK',
  },
  description:
    'Premium supplements engineered for athletes who refuse to quit. Whey protein, pre-workout, creatine, and more.',
  keywords: ['supplements', 'protein', 'pre-workout', 'creatine', 'fitness', 'gym'],
  openGraph: {
    type: 'website',
    siteName: 'HAVOK',
    title: 'HAVOK — Premium Supplements',
    description: 'Premium supplements engineered for athletes who refuse to quit.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen bg-black text-white antialiased">
        <CartProvider>
          <Header />
          <CartSidebar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
