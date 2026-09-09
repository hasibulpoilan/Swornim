export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductRow = {
  id: string
  name: string
  price: number | null
  category: string
  is_visible: boolean
  sort_order: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: {
          id?: string
          name: string
          price?: number | null
          category: string
          is_visible?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number | null
          category?: string
          is_visible?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

