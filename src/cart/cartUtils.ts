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

export function isPastCutoffTime(): boolean {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return hours > 20 || (hours === 20 && minutes >= 30)
}

export function getTimeRemainingToCutoff(): { hrs: number; mins: number; secs: number } | null {
  const now = new Date()
  const target = new Date()
  target.setHours(20, 30, 0, 0)

  if (now > target) {
    return null
  }

  const diffMs = target.getTime() - now.getTime()
  const hrs = Math.floor(diffMs / (1000 * 60 * 60))
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000)
  
  return { hrs, mins, secs }
}

export type UserDetails = {
  name: string
  phone: string
  address: string
}

export function buildWhatsAppMessage(items: CartItem[], userDetails?: UserDetails): string {
  const pastCutoff = isPastCutoffTime()

  let sameDayItems: CartItem[] = []
  let nextDayItems: CartItem[] = []

  if (pastCutoff) {
    nextDayItems = items
  } else {
    sameDayItems = items.filter((i) => i.qty <= 10)
    nextDayItems = items.filter((i) => i.qty > 10)
  }

  const formatItemLine = (item: CartItem) => {
    if (item.unitPrice !== null && item.unitPrice > 0) {
      const lineTotal = item.unitPrice * item.qty
      return `- ${item.name} x ${item.qty} (${formatRs(item.unitPrice)} each) = ${formatRs(lineTotal)}`
    }
    return `- ${item.name} x ${item.qty} (Price on request)`
  }

  const messageLines = ['Hi Swornim Delicacies, I would like to order:']

  if (userDetails) {
    messageLines.push(
      '',
      'Customer Details:',
      `Name: ${userDetails.name}`,
      `Phone: ${userDetails.phone}`,
      `Address: ${userDetails.address}`
    )
  }

  if (sameDayItems.length > 0) {
    messageLines.push('', '--- Same-Day Delivery ---')
    messageLines.push(...sameDayItems.map(formatItemLine))
  }

  if (nextDayItems.length > 0) {
    messageLines.push('', "--- Tomorrow's Delivery ---")
    messageLines.push(...nextDayItems.map(formatItemLine))
  }

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
  const pricedTotal = cartSubtotal(items)
  const deliveryFee = 60
  const finalPayable = pricedTotal + deliveryFee
  const hasUnpriced = items.some((i) => i.unitPrice === null)

  const summaryLine = hasUnpriced
    ? `Total Items: ${totalQty} pcs\nSubtotal (priced items): ${formatRs(pricedTotal)}\nHandling & Delivery Fee: ${formatRs(deliveryFee)}\nFinal Payable: ${formatRs(finalPayable)}`
    : `Total Items: ${totalQty} pcs\nSubtotal: ${formatRs(pricedTotal)}\nHandling & Delivery Fee: ${formatRs(deliveryFee)}\nFinal Payable: ${formatRs(finalPayable)}`

  const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  
  messageLines.push('', summaryLine, '', `(Order generated at ${timeString})`, 'Please confirm.')

  return messageLines.join('\n')
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
