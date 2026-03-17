'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    ShopifyBuy: {
      buildClient: (config: { domain: string; storefrontAccessToken: string }) => unknown
      UI: {
        onReady: (client: unknown) => Promise<{
          createComponent: (type: string, options: Record<string, unknown>) => void
        }>
      }
    }
  }
}

const SCRIPT_URL =
  'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js'

export default function ShopifyBuyButton({ productId }: { productId: string }) {
  const nodeId = `shopify-buy-${productId}`

  useEffect(() => {
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
    if (!domain || !token) return

    function init() {
      const client = window.ShopifyBuy.buildClient({
        domain: domain!,
        storefrontAccessToken: token!,
      })
      window.ShopifyBuy.UI.onReady(client).then((ui) => {
        ui.createComponent('product', {
          id: productId,
          node: document.getElementById(nodeId),
          moneyFormat: '%24%7B%7Bamount%7D%7D',
          options: {
            product: {
              styles: {
                button: {
                  'background-color': '#ffffff',
                  color: '#000000',
                  'font-family': 'Inter, sans-serif',
                  'font-size': '11px',
                  'font-weight': '700',
                  'letter-spacing': '0.2em',
                  'text-transform': 'uppercase',
                  padding: '18px 40px',
                  'border-radius': '0',
                  ':hover': { 'background-color': '#e4e4e4' },
                  ':focus': { 'background-color': '#e4e4e4' },
                },
              },
              // Only render the button — we already show price/title/image
              contents: {
                img: false,
                title: false,
                price: false,
                description: false,
                button: true,
                buttonWithQuantity: false,
              },
              text: { button: 'Add to Cart' },
            },
            cart: {
              styles: {
                button: {
                  'background-color': '#ffffff',
                  color: '#000000',
                  'font-family': 'Inter, sans-serif',
                  'font-size': '11px',
                  'font-weight': '700',
                  'letter-spacing': '0.2em',
                  'text-transform': 'uppercase',
                  'border-radius': '0',
                  ':hover': { 'background-color': '#e4e4e4' },
                },
                cart: {
                  'background-color': '#111111',
                },
                header: { color: '#ffffff' },
                lineItems: { color: '#ffffff' },
                subtotalText: { color: '#a1a1aa' },
                subtotal: { color: '#ffffff' },
                notice: { color: '#71717a' },
                currency: { color: '#ffffff' },
                close: { color: '#ffffff', ':hover': { color: '#a1a1aa' } },
                empty: { color: '#a1a1aa' },
                noteDescription: { color: '#a1a1aa' },
                discountText: { color: '#a1a1aa' },
                discountIcon: { fill: '#a1a1aa' },
                discountAmount: { color: '#a1a1aa' },
              },
              text: { total: 'Subtotal', button: 'Checkout' },
            },
            toggle: {
              styles: {
                toggle: {
                  'background-color': '#ffffff',
                  ':hover': { 'background-color': '#e4e4e4' },
                },
                count: { color: '#000000', 'font-weight': '700' },
                iconPath: { fill: '#000000' },
              },
            },
          },
        })
      })
    }

    if (window.ShopifyBuy?.UI) {
      init()
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_URL}"]`
      )
      if (existing) {
        existing.addEventListener('load', init)
      } else {
        const script = document.createElement('script')
        script.async = true
        script.src = SCRIPT_URL
        script.onload = init
        document.head.appendChild(script)
      }
    }
  }, [productId, nodeId])

  return <div id={nodeId} />
}
