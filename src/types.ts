export type MenuItem = {
  id: string
  name: string
  price?: string
  imageUrl?: string | null
}

export type MenuCategory = {
  category: string
  items: MenuItem[]
}

export type CartItem = {
  id: string
  name: string
  priceLabel?: string
  unitPrice: number | null
  qty: number
}
