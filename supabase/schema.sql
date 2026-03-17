-- ============================================================
-- HAVOK E-Commerce Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  price            DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= 0),
  image_url        TEXT,
  category         TEXT,
  stock_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  nutrition_info   JSONB,
  shopify_product_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products (is_active);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id         TEXT UNIQUE,
  stripe_payment_intent_id  TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  customer_email            TEXT NOT NULL,
  customer_name             TEXT,
  shipping_address          JSONB,
  subtotal                  DECIMAL(10, 2),
  total                     DECIMAL(10, 2),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders (stripe_session_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products (id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DECREMENT STOCK FUNCTION (used by webhook)
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Products: public read, admin write (handled via service role in API)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can do anything on products"
  ON products FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Orders: service role only (webhook creates orders, admin reads via service role)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything on orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Order items: service role only
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything on order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run this to create the product images bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies (run after creating bucket):
-- CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
--
-- CREATE POLICY "Service role upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'service_role');
--
-- CREATE POLICY "Authenticated upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Authenticated delete product images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
