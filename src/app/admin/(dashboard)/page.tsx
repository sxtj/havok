import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { formatPriceDollars, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react'

async function getStats() {
  const supabase = await createSupabaseAdminClient()

  const [productsRes, ordersRes, revenueRes, pendingRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total').in('status', ['paid', 'fulfilled']),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid'),
  ])

  const revenue =
    revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  return {
    products: productsRes.count ?? 0,
    orders: ordersRes.count ?? 0,
    revenue,
    pending: pendingRes.count ?? 0,
  }
}

async function getRecentOrders() {
  const supabase = await createSupabaseAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

const statusColors: Record<string, string> = {
  paid: 'text-green-400 bg-green-400/10',
  fulfilled: 'text-blue-400 bg-blue-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  const statCards = [
    {
      label: 'Total Products',
      value: stats.products,
      icon: Package,
      href: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      icon: ShoppingBag,
      href: '/admin/orders',
    },
    {
      label: 'Revenue',
      value: formatPriceDollars(stats.revenue),
      icon: DollarSign,
      href: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: stats.pending,
      icon: Clock,
      href: '/admin/orders',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-white">
          Dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Welcome back, admin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-black border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl font-black text-white mb-1">{card.value}</p>
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-black border border-zinc-800">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest uppercase text-white">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-zinc-500 hover:text-white transition-colors tracking-wider uppercase font-bold"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-600 text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Order', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-zinc-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      <div>{order.customer_name || '—'}</div>
                      <div className="text-xs text-zinc-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      {formatPriceDollars(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm ${
                          statusColors[order.status] ?? 'text-zinc-400 bg-zinc-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
