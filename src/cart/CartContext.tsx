import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, MenuItem } from '../types'
import {
  buildWhatsAppMessage,
  cartItemCount,
  cartSubtotal,
  parsePrice,
  toCartItem,
} from './cartUtils'
import { WHATSAPP_NUMBER } from '../data/menu'

const STORAGE_KEY = 'swornim-cart'

type CartContextValue = {
  /** Cart page items (Add to cart) */
  items: CartItem[]
  count: number
  subtotal: number
  selectedSubtotal: number
  addItem: (item: MenuItem) => void
  setQty: (id: string, qty: number) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  removeItem: (id: string) => void
  clear: () => void
  getQty: (id: string) => number
  sendCartWhatsApp: (userDetails: { name: string; phone: string; address: string }) => void

  /** Checkbox quick-order (original WhatsApp flow) */
  selected: MenuItem[]
  isSelected: (id: string) => boolean
  toggleSelect: (item: MenuItem) => void
  sendSelectedWhatsApp: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    // Re-parse prices so old buggy values (e.g. Rs. 80 → 0.8) get fixed
    return parsed.map((item) => ({
      ...item,
      unitPrice: parsePrice(item.priceLabel),
    }))
  } catch {
    return []
  }
}

function openWhatsApp(text: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [selected, setSelected] = useState<MenuItem[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p,
        )
      }
      return [...prev, toCartItem(item)]
    })
  }, [])

  const toggleSelect = useCallback((item: MenuItem) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === item.id)
      if (exists) return prev.filter((p) => p.id !== item.id)
      return [...prev, item]
    })
  }, [])

  const isSelected = useCallback(
    (id: string) => selected.some((p) => p.id === id),
    [selected],
  )

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((p) => p.id !== id)
      return prev.map((p) => (p.id === id ? { ...p, qty } : p))
    })
  }, [])

  const increment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)),
    )
  }, [])

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = useMemo(() => cartItemCount(items), [items])
  const subtotal = useMemo(() => cartSubtotal(items), [items])
  const selectedSubtotal = useMemo(() => {
    return cartSubtotal(selected.map(toCartItem))
  }, [selected])

  const getQty = useCallback(
    (id: string) => items.find((p) => p.id === id)?.qty ?? 0,
    [items],
  )

  const sendCartWhatsApp = useCallback((userDetails: { name: string; phone: string; address: string }) => {
    if (items.length === 0) return
    openWhatsApp(buildWhatsAppMessage(items, userDetails))
  }, [items])

  /** Quick Order via checkbox selection — names only */
  const sendSelectedWhatsApp = useCallback(() => {
    if (selected.length === 0) return
    const cartItems = selected.map(toCartItem)
    openWhatsApp(buildWhatsAppMessage(cartItems))
  }, [selected])

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      selectedSubtotal,
      addItem,
      setQty,
      increment,
      decrement,
      removeItem,
      clear,
      getQty,
      sendCartWhatsApp,
      selected,
      isSelected,
      toggleSelect,
      sendSelectedWhatsApp,
    }),
    [
      items,
      count,
      subtotal,
      selectedSubtotal,
      addItem,
      setQty,
      increment,
      decrement,
      removeItem,
      clear,
      getQty,
      sendCartWhatsApp,
      selected,
      isSelected,
      toggleSelect,
      sendSelectedWhatsApp,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
