import type { MenuCategory, MenuItem } from '../types'
import type { ProductRow } from './database.types'
import { supabase } from './supabase'

export function formatProductPrice(price: number | null): string | undefined {
  if (price === null || price === undefined) return undefined
  const n = Number(price)
  if (!Number.isFinite(n)) return undefined
  return Number.isInteger(n) ? `Rs. ${n}` : `Rs. ${n.toFixed(2)}`
}

export function productsToMenu(products: ProductRow[]): MenuCategory[] {
  const map = new Map<string, MenuItem[]>()
  for (const p of products) {
    const list = map.get(p.category) ?? []
    list.push({
      id: p.id,
      name: p.name,
      price: formatProductPrice(p.price),
    })
    map.set(p.category, list)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}

export async function fetchVisibleProducts(): Promise<ProductRow[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchAllProducts(): Promise<ProductRow[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createProduct(input: {
  name: string
  price: number | null
  category: string
  is_visible?: boolean
}): Promise<ProductRow> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name.trim(),
      price: input.price,
      category: input.category.trim(),
      is_visible: input.is_visible ?? true,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  input: {
    name: string
    price: number | null
    category: string
    is_visible: boolean
  },
): Promise<ProductRow> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name.trim(),
      price: input.price,
      category: input.category.trim(),
      is_visible: input.is_visible,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
