import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !anonKey.includes('paste_your_anon_key') &&
    anonKey.length > 20,
)

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!)
  : null
