export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  image_url: string | null
  category: string | null
  stock_quantity: number
  is_active: boolean
  nutrition_info: NutritionInfo | null
  created_at: string
  updated_at: string
}

export interface NutritionInfo {
  servingSize: string
  servingsPerContainer: number
  calories: number
  protein: string
  carbohydrates: string
  fat: string
  sodium?: string
  sugar?: string
  fiber?: string
  [key: string]: string | number | undefined
}

export interface Order {
  id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  customer_email: string
  customer_name: string | null
  shipping_address: ShippingAddress | null
  subtotal: number
  total: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  created_at: string
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  slug: string
}

export interface CheckoutLineItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null
}
