import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AdminLogoutButton from './AdminLogoutButton'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (!adminEmails.includes(user.email ?? '')) redirect('/admin/login')

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-black border-r border-zinc-800 flex flex-col fixed h-full">
        {/* Brand */}
        <div className="p-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8">
              <Image src="/logo.jpg" alt="HAVOK" fill className="object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-widest uppercase">
                HAVOK
              </p>
              <p className="text-zinc-600 text-[10px] tracking-widest uppercase">
                Admin
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              label={item.label}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs truncate mb-3">{user.email}</p>
          <AdminLogoutButton />
          <Link
            href="/"
            className="mt-2 block text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
          >
            ← View Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60">
        <div className="max-w-6xl mx-auto px-8 py-10">{children}</div>
      </div>
    </div>
  )
}

// Client nav link with active state
function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2.5 text-sm font-medium tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all duration-150 rounded-sm group"
    >
      {label}
    </Link>
  )
}
