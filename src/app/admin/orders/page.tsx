import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { formatPriceDollars, formatDate } from '@/lib/utils'
import { Order } from '@/types'
import OrderStatusUpdater from './OrderStatusUpdater'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

async function getOrders(status?: string): Promise<Order[]> {
  const supabase = await createSupabaseAdminClient()

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) console.error(error)
  return data ?? []
}

const statusColors: Record<string, string> = {
  paid: 'text-green-400 bg-green-400/10 border-green-900',
  fulfilled: 'text-blue-400 bg-blue-400/10 border-blue-900',
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-900',
  cancelled: 'text-red-400 bg-red-400/10 border-red-900',
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const orders = await getOrders(status)

  const statuses = ['all', 'pending', 'paid', 'fulfilled', 'cancelled']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase text-white">
          Orders
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{orders.length} orders</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {statuses.map((s) => (
          <a
            key={s}
            href={s === 'all' ? '/admin/orders' : `/admin/orders?status=${s}`}
            className={`text-xs font-bold tracking-widest uppercase px-4 py-2 border transition-colors ${
              (s === 'all' && !status) || s === status
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-white'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="bg-black border border-zinc-800">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-500 text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-zinc-950 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Order info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-sm font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 border ${
                          statusColors[order.status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm font-medium">
                      {order.customer_name || 'Unknown'}
                    </p>
                    <p className="text-zinc-500 text-xs">{order.customer_email}</p>
                    <p className="text-zinc-600 text-xs">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Order items summary */}
                  <div className="flex-1 md:mx-8">
                    {order.order_items && order.order_items.length > 0 && (
                      <ul className="space-y-1">
                        {order.order_items.map((item) => (
                          <li key={item.id} className="text-xs text-zinc-400">
                            {item.quantity}x {item.product_name} —{' '}
                            <span className="text-zinc-300">
                              {formatPriceDollars(item.product_price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Total + actions */}
                  <div className="flex flex-col items-end gap-3">
                    <p className="text-white font-black text-lg">
                      {formatPriceDollars(order.total)}
                    </p>
                    {order.shipping_address && (
                      <p className="text-xs text-zinc-600 text-right max-w-[150px]">
                        {[
                          order.shipping_address.line1,
                          order.shipping_address.city,
                          order.shipping_address.state,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
