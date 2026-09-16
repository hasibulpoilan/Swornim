import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://gmonlxwjckffyzollmxi.supabase.co'

const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtb25seHdqY2tmZnl6b2xsbXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzU2MDUsImV4cCI6MjEwNDUxMTYwNX0.tFtOAo0Zzy4KGXKZruT83Sk1pY0wRg1Xs37j61fgWUA'

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !anonKey.includes('paste_your_anon_key') &&
    anonKey.length > 20,
)

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url, anonKey)
  : null
