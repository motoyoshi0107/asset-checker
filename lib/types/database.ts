// =============================================
// Database Types - Generated from Supabase
// =============================================

export type Database = {
  public: {
    Tables: {
      assets_snapshots: {
        Row: {
          id: string
          user_id: string
          date: string // ISO date string
          asset_class: string
          sub_account: string | null
          amount: number
          created_at: string // ISO datetime string
          updated_at: string // ISO datetime string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          asset_class: string
          sub_account?: string | null
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          asset_class?: string
          sub_account?: string | null
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          date: string // ISO date string
          category: string
          memo: string | null
          amount: number
          created_at: string // ISO datetime string
          updated_at: string // ISO datetime string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          category: string
          memo?: string | null
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          category?: string
          memo?: string | null
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      monthly_settings: {
        Row: {
          id: string
          user_id: string
          annual_rate: number
          monthly_invest: number
          created_at: string // ISO datetime string
          updated_at: string // ISO datetime string
        }
        Insert: {
          id?: string
          user_id: string
          annual_rate?: number
          monthly_invest?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          annual_rate?: number
          monthly_invest?: number
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Type helpers for easier usage
export type AssetSnapshot = Database['public']['Tables']['assets_snapshots']['Row']
export type AssetSnapshotInsert = Database['public']['Tables']['assets_snapshots']['Insert']
export type AssetSnapshotUpdate = Database['public']['Tables']['assets_snapshots']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type MonthlySettings = Database['public']['Tables']['monthly_settings']['Row']
export type MonthlySettingsInsert = Database['public']['Tables']['monthly_settings']['Insert']
export type MonthlySettingsUpdate = Database['public']['Tables']['monthly_settings']['Update']

// Chart data types
export type ChartDataPoint = {
  date: string
  total: number
  stocks?: number
  bonds?: number
  cash?: number
  crypto?: number
}

export type AllocationData = {
  asset_class: string
  amount: number
  percentage: number
}

export type ForecastPoint = {
  month: number
  year: number
  age: number
  value: number
  currentAmount: number
  contributions: number
  gains: number
}