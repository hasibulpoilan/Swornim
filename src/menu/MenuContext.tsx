import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MENU } from '../data/menu'
import type { MenuCategory } from '../types'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchVisibleProducts, productsToMenu } from '../lib/products'

type MenuContextValue = {
  menu: MenuCategory[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  fromDatabase: boolean
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuCategory[]>(MENU)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [fromDatabase, setFromDatabase] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setMenu(MENU)
      setFromDatabase(false)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchVisibleProducts()
      setMenu(productsToMenu(rows))
      setFromDatabase(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load menu')
      setMenu(MENU)
      setFromDatabase(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ menu, loading, error, refresh, fromDatabase }),
    [menu, loading, error, refresh, fromDatabase],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used within MenuProvider')
  return ctx
}
