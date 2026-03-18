const STOREFRONT_API_VERSION = '2024-10'

function getEndpoint(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  if (!domain) throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set')
  return `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`
}

function getToken(): string {
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!token) throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set')
  return token
}

async function shopifyFetch(query: string, variables: Record<string, unknown>) {
  const res = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': getToken(),
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Shopify API responded with ${res.status}`)
  return res.json()
}

// Resolves numeric product IDs → first variant GID
// e.g. "8748602261694" → "gid://shopify/ProductVariant/45678..."
const PRODUCT_VARIANTS_QUERY = `
  query getVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        variants(first: 1) {
          edges { node { id } }
        }
      }
    }
  }
`

export async function resolveVariantIds(
  productIds: string[]
): Promise<Map<string, string>> {
  const gids = productIds.map((id) => `gid://shopify/Product/${id}`)
  const json = await shopifyFetch(PRODUCT_VARIANTS_QUERY, { ids: gids })
  const map = new Map<string, string>()
  for (const node of json.data?.nodes ?? []) {
    if (node?.variants?.edges?.[0]?.node?.id) {
      const numericProductId = (node.id as string).split('/').pop()!
      map.set(numericProductId, node.variants.edges[0].node.id as string)
    }
  }
  return map
}

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<{ cartId: string; checkoutUrl: string }> {
  const json = await shopifyFetch(CART_CREATE_MUTATION, { input: { lines } })
  const { cart, userErrors } = json.data?.cartCreate ?? {}

  if (userErrors?.length > 0) {
    throw new Error(userErrors[0].message)
  }

  if (!cart?.checkoutUrl) {
    throw new Error('No checkout URL returned from Shopify')
  }

  return { cartId: cart.id as string, checkoutUrl: cart.checkoutUrl as string }
}
