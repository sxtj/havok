const STOREFRONT_API_VERSION = '2024-10'

function getEndpoint(): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  if (!domain) throw new Error('SHOPIFY_STORE_DOMAIN is not set')
  return `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`
}

function getToken(): string {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!token) throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set')
  return token
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
  const res = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': getToken(),
    },
    body: JSON.stringify({
      query: CART_CREATE_MUTATION,
      variables: { input: { lines } },
    }),
  })

  if (!res.ok) {
    throw new Error(`Shopify API responded with ${res.status}`)
  }

  const json = await res.json()
  const { cart, userErrors } = json.data?.cartCreate ?? {}

  if (userErrors?.length > 0) {
    throw new Error(userErrors[0].message)
  }

  if (!cart?.checkoutUrl) {
    throw new Error('No checkout URL returned from Shopify')
  }

  return { cartId: cart.id as string, checkoutUrl: cart.checkoutUrl as string }
}
