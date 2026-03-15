# AGENTS.md — HAVOK E-Commerce Technical Reference

## Architecture Overview

HAVOK is a full-stack Next.js 15 e-commerce application built on the App Router with TypeScript. It uses a server-first architecture: data fetching happens in React Server Components wherever possible, minimizing client-side JavaScript. The cart is the only stateful client-side concern, managed via React Context and persisted to `localStorage`.

```
Browser ──► Next.js (Vercel Edge/Node)
                │
                ├── Server Components ──► Supabase (read)
                ├── API Routes ──────────► Supabase (write) + Stripe
                └── Middleware ──────────► Supabase Auth (session refresh)

Stripe ──► /api/webhooks/stripe ──► Supabase (orders)
```

---

## Folder Structure

```
havok/
├── public/
│   └── logo.jpg                         # Brand logo
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (CartProvider, Header, Footer)
│   │   ├── globals.css                  # Tailwind base styles
│   │   ├── page.tsx                     # Home page (Hero + Featured Products)
│   │   ├── products/
│   │   │   ├── page.tsx                 # Product listing with category filter
│   │   │   └── [slug]/
│   │   │       ├── page.tsx             # Product detail page (SSR)
│   │   │       └── AddToCartButton.tsx  # Client component for cart interaction
│   │   ├── checkout/
│   │   │   └── success/
│   │   │       └── page.tsx             # Post-payment confirmation
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin layout (auth check + sidebar)
│   │   │   ├── AdminLogoutButton.tsx    # Client component for sign out
│   │   │   ├── page.tsx                 # Admin dashboard (stats + recent orders)
│   │   │   ├── login/page.tsx           # Admin login (Supabase Auth)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # Product management table
│   │   │   │   ├── ProductForm.tsx      # Shared create/edit form (client)
│   │   │   │   ├── DeleteProductButton.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx        # Edit product
│   │   │   └── orders/
│   │   │       ├── page.tsx             # Orders table with status filter
│   │   │       └── OrderStatusUpdater.tsx
│   │   └── api/
│   │       ├── checkout/route.ts        # POST — create Stripe session
│   │       ├── webhooks/stripe/route.ts # POST — handle Stripe events
│   │       └── admin/
│   │           ├── products/route.ts            # GET all, POST create
│   │           ├── products/[id]/route.ts        # GET, PUT, DELETE
│   │           ├── orders/route.ts               # GET all
│   │           └── orders/[id]/route.ts          # PATCH status
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Sticky header with cart icon
│   │   │   ├── Footer.tsx               # Site footer with links
│   │   │   └── CartSidebar.tsx          # Slide-in cart drawer
│   │   ├── home/
│   │   │   ├── Hero.tsx                 # Full-screen hero (server)
│   │   │   └── FeaturedProducts.tsx     # Featured products (async server)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx          # Product card with add-to-cart (client)
│   │   │   └── ProductGrid.tsx          # Responsive product grid
│   │   └── ui/
│   │       ├── Button.tsx               # Reusable button component
│   │       └── LoadingSpinner.tsx
│   ├── context/
│   │   └── CartContext.tsx              # Cart state, localStorage persistence
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser Supabase client
│   │   │   └── server.ts                # Server Supabase client (anon + admin)
│   │   ├── stripe.ts                    # Stripe SDK instance
│   │   └── utils.ts                     # Formatters, slugify, cn
│   ├── middleware.ts                    # Auth session refresh + admin route guard
│   └── types/
│       └── index.ts                     # Shared TypeScript types
├── supabase/
│   ├── schema.sql                       # Database schema + RLS policies
│   └── seed.sql                         # Example product data
├── .env.local.example                   # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── AGENTS.md                            # This file
└── README.md
```

---

## Database Schema

### `products`
| Column            | Type          | Notes                        |
|-------------------|---------------|------------------------------|
| `id`              | UUID (PK)     | Auto-generated               |
| `name`            | TEXT          | Required                     |
| `slug`            | TEXT (UNIQUE) | URL-safe identifier          |
| `description`     | TEXT          | Nullable                     |
| `price`           | DECIMAL(10,2) | In dollars                   |
| `compare_at_price`| DECIMAL(10,2) | Original price for sale UI   |
| `image_url`       | TEXT          | Supabase Storage public URL  |
| `category`        | TEXT          | protein/pre-workout/etc.     |
| `stock_quantity`  | INTEGER       | >= 0, decremented on purchase|
| `is_active`       | BOOLEAN       | Controls storefront visibility|
| `nutrition_info`  | JSONB         | Flexible nutrition data      |
| `created_at`      | TIMESTAMPTZ   | Auto                         |
| `updated_at`      | TIMESTAMPTZ   | Auto via trigger             |

### `orders`
| Column                     | Type        | Notes                     |
|----------------------------|-------------|---------------------------|
| `id`                       | UUID (PK)   |                           |
| `stripe_session_id`        | TEXT UNIQUE | Prevents duplicate orders |
| `stripe_payment_intent_id` | TEXT        |                           |
| `status`                   | TEXT        | pending/paid/fulfilled/cancelled |
| `customer_email`           | TEXT        |                           |
| `customer_name`            | TEXT        | From Stripe               |
| `shipping_address`         | JSONB       | From Stripe               |
| `subtotal`                 | DECIMAL     |                           |
| `total`                    | DECIMAL     |                           |
| `created_at`               | TIMESTAMPTZ |                           |
| `updated_at`               | TIMESTAMPTZ |                           |

### `order_items`
| Column          | Type        | Notes                          |
|-----------------|-------------|--------------------------------|
| `id`            | UUID (PK)   |                                |
| `order_id`      | UUID (FK)   | → orders.id, CASCADE delete    |
| `product_id`    | UUID (FK)   | → products.id, SET NULL        |
| `product_name`  | TEXT        | Snapshotted at purchase time   |
| `product_price` | DECIMAL     | Snapshotted at purchase time   |
| `quantity`      | INTEGER     |                                |
| `created_at`    | TIMESTAMPTZ |                                |

---

## Stripe Payment Flow

```
1. Customer clicks "Checkout" in the cart drawer
2. CartSidebar.tsx POSTs to /api/checkout with cart items
3. /api/checkout/route.ts:
   a. Validates cart items with Zod
   b. Looks up products in Supabase (verifies prices, stock)
   c. Creates a Stripe Checkout Session with server-side prices
   d. Returns { url: string } — the Stripe hosted checkout URL
4. Client redirects to Stripe's hosted checkout page
5. Customer completes payment on Stripe
6. Stripe redirects to /checkout/success?session_id=xxx
7. Success page clears the cart and shows confirmation
8. Simultaneously, Stripe POSTs to /api/webhooks/stripe
9. Webhook handler:
   a. Verifies the Stripe signature (STRIPE_WEBHOOK_SECRET)
   b. Handles checkout.session.completed event
   c. Checks for duplicate (idempotency via stripe_session_id)
   d. Creates order + order_items in Supabase
   e. Decrements stock via decrement_stock() SQL function
```

**Security:** Prices are always read from the database on the server — the client-submitted price is ignored, preventing price tampering.

---

## Supabase Integration

### Client types
- **`createSupabaseBrowserClient()`** — Used in Client Components. Uses the anon key.
- **`createSupabaseServerClient()`** — Used in Server Components and API routes. Uses the anon key + cookie-based session from `@supabase/ssr`.
- **`createSupabaseAdminClient()`** — Used in admin API routes and webhook. Uses the `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS. Never exposed client-side.

### Auth
- Admin authentication uses Supabase Auth (email + password).
- After sign-in, `@supabase/ssr` stores the session in secure HTTP-only cookies.
- Middleware (`src/middleware.ts`) refreshes the session on every request and enforces admin route protection.
- Admin authorization is checked by verifying `user.email` is in the `ADMIN_EMAILS` environment variable.

### Storage
- Product images are stored in the `product-images` Supabase Storage bucket (public).
- Admins upload images directly from the browser using the anon/authenticated client.
- The public URL is stored in `products.image_url`.

### Row Level Security
- `products`: Public SELECT (active only), service role all operations.
- `orders`: Service role only (webhook + admin panel).
- `order_items`: Service role only.

---

## Environment Variables

| Variable                           | Required | Description                                |
|------------------------------------|----------|--------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`         | ✅        | Your Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | ✅        | Supabase anon/public key                   |
| `SUPABASE_SERVICE_ROLE_KEY`        | ✅        | Supabase service role key (server only)    |
| `STRIPE_SECRET_KEY`                | ✅        | Stripe secret key (server only)            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅      | Stripe publishable key                     |
| `STRIPE_WEBHOOK_SECRET`            | ✅        | Stripe webhook signing secret              |
| `NEXT_PUBLIC_APP_URL`              | ✅        | Your deployment URL (for Stripe redirects) |
| `ADMIN_EMAILS`                     | ✅        | Comma-separated admin email addresses      |

---

## Vercel Deployment Steps

1. **Push to GitHub** — Create a repository and push your code.

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
   - Framework: Next.js (auto-detected)
   - Root directory: `/` (default)

3. **Set environment variables** in Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ADMIN_EMAILS=your@email.com
   ```

4. **Deploy** — Click "Deploy". Vercel will build and deploy automatically.

5. **Set up Stripe webhook** (after deployment):
   - Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-project.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`
   - Copy the "Signing secret" → set as `STRIPE_WEBHOOK_SECRET` in Vercel

6. **Redeploy** — After adding the webhook secret, trigger a redeploy.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- A Supabase project
- A Stripe account (test mode)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Fill in .env.local with your credentials

# 4. Set up the database
# Open Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run
# Then paste supabase/seed.sql → Run

# 5. Set up Supabase Storage
# Dashboard → Storage → New bucket
# Name: "product-images", Public: ON
# Add policies from the comments in schema.sql

# 6. Create admin user
# Supabase Dashboard → Authentication → Users → Add user
# Email: your admin email (must match ADMIN_EMAILS in .env.local)

# 7. Start development server
npm run dev
# → http://localhost:3000

# 8. Set up Stripe webhook for local testing
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in .env.local
```

### Test Stripe payments
Use card number: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Admin Panel

Access at `/admin`. Default admin actions:

| Action              | Route                           |
|---------------------|---------------------------------|
| Dashboard           | `/admin`                        |
| Products list       | `/admin/products`               |
| Create product      | `/admin/products/new`           |
| Edit product        | `/admin/products/[id]`          |
| Orders              | `/admin/orders`                 |
| Login               | `/admin/login`                  |
