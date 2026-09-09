import type { CartItem, MenuItem } from '../types'

export function parsePrice(price?: string | number | null): number | null {
  if (price === null || price === undefined) return null
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : null
  }
  const cleaned = String(price).replace(/rs\.?/gi, '').replace(/,/g, '').trim()
  const match = cleaned.match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

export function formatRs(amount: number): string {
  if (!Number.isFinite(amount)) return 'Rs. 0'
  const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
  return `Rs. ${rounded}`
}

export function cartLineTotal(item: CartItem): number | null {
  if (item.unitPrice === null) return null
  return item.unitPrice * item.qty
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const line = cartLineTotal(item)
    return line === null ? sum : sum + line
  }, 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map((item) => {
    if (item.unitPrice !== null && item.unitPrice > 0) {
      const lineTotal = item.unitPrice * item.qty
      return `- ${item.name} x ${item.qty} (${formatRs(item.unitPrice)} each) = ${formatRs(lineTotal)}`
    }
    return `- ${item.name} x ${item.qty} (Price on request)`
  })

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
  const pricedTotal = cartSubtotal(items)
  const hasUnpriced = items.some((i) => i.unitPrice === null)

  const summaryLine = hasUnpriced
    ? `Total Items: ${totalQty} pcs\nTotal Amount (priced items): ${formatRs(pricedTotal)}`
    : `Total Items: ${totalQty} pcs\nTotal Amount: ${formatRs(pricedTotal)}`

  return [
    'Hi Swornim Delicacies, I would like to order:',
    ...lines,
    '',
    summaryLine,
    'Please confirm.',
  ].join('\n')
}

export function toCartItem(item: MenuItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    priceLabel: item.price,
    unitPrice: parsePrice(item.price),
    qty: 1,
  }
}
