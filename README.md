# HAVOK — Premium Supplements E-Commerce

A production-ready e-commerce store for the HAVOK supplement brand. Built with Next.js 15, Supabase, Stripe, and TailwindCSS.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your environment variables (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Framework   | Next.js 15 (App Router) |
| Language    | TypeScript              |
| Styling     | TailwindCSS v3          |
| Database    | Supabase (PostgreSQL)   |
| Auth        | Supabase Auth           |
| Storage     | Supabase Storage        |
| Payments    | Stripe                  |
| Hosting     | Vercel                  |

## Features

**Storefront**
- Home page with hero and featured products
- Product listing with category filters
- Product detail page with nutrition facts
- Slide-in cart drawer with quantity management
- Stripe hosted checkout

**Admin Panel** (`/admin`)
- Secure login with Supabase Auth
- Create, edit, delete products
- Upload product images to Supabase Storage
- Manage stock and pricing
- View and update orders

## Environment Variables

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL |
| `ADMIN_EMAILS` | Comma-separated admin emails |

## Database Setup

1. Open your Supabase project → SQL Editor
2. Run `supabase/schema.sql`
3. Run `supabase/seed.sql` (optional example products)
4. Create a `product-images` storage bucket (Public: ON)

## Admin Setup

1. Create a user in Supabase Dashboard → Authentication → Users
2. Add their email to `ADMIN_EMAILS` in your environment variables
3. Visit `/admin/login` and sign in

## Stripe Setup

1. Copy your API keys from [dashboard.stripe.com](https://dashboard.stripe.com/apikeys)
2. For local webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. For production: Add webhook endpoint in Stripe Dashboard pointing to `/api/webhooks/stripe` for `checkout.session.completed`

## Deployment

See [AGENTS.md](./AGENTS.md) for detailed Vercel deployment instructions.

```bash
# Build check
npm run build
```

## Project Structure

See [AGENTS.md](./AGENTS.md) for full architecture documentation.

---

Built for those who train harder.
