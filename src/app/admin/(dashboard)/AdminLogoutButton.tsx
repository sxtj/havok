'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-white transition-colors py-2 border border-zinc-800 hover:border-zinc-600"
    >
      <LogOut size={12} />
      Logout
    </button>
  )
}
