// =============================================
// Zod Validation Schemas
// =============================================

import { z } from 'zod'

// Asset snapshot validation
export const AssetSnapshotSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  asset_class: z.enum(['stocks', 'bonds', 'cash', 'crypto']),
  sub_account: z.string().min(1).optional().nullable(),
  amount: z.number().min(0).max(999999999.99),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const AssetSnapshotInsertSchema = AssetSnapshotSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const AssetSnapshotUpdateSchema = AssetSnapshotSchema.partial()

// Expense validation
export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  category: z.enum([
    'food',
    'transport',
    'entertainment',
    'utilities',
    'healthcare',
    'shopping',
    'education',
    'other'
  ]),
  memo: z.string().max(500).optional().nullable(),
  amount: z.number().min(0).max(9999999.99),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const ExpenseInsertSchema = ExpenseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const ExpenseUpdateSchema = ExpenseSchema.partial()

// Monthly settings validation
export const MonthlySettingsSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  annual_rate: z.number().min(0).max(1), // 0-100% as decimal
  monthly_invest: z.number().min(0).max(999999.99),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const MonthlySettingsInsertSchema = MonthlySettingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const MonthlySettingsUpdateSchema = MonthlySettingsSchema.partial()

// Form validation schemas
export const AddAssetSnapshotFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  asset_class: z.enum(['stocks', 'bonds', 'cash', 'crypto']),
  sub_account: z.string().min(1).optional(),
  amount: z.number().min(0.01).max(999999999.99)
})

export const AddExpenseFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  category: z.enum([
    'food',
    'transport',
    'entertainment',
    'utilities',
    'healthcare',
    'shopping',
    'education',
    'other'
  ]),
  memo: z.string().max(500).optional(),
  amount: z.number().min(0.01).max(9999999.99)
})

export const UpdateSettingsFormSchema = z.object({
  annual_rate: z.number().min(0).max(1),
  monthly_invest: z.number().min(0).max(999999.99)
})

// Chart data validation
export const ChartDataPointSchema = z.object({
  date: z.string(),
  total: z.number(),
  stocks: z.number().optional(),
  bonds: z.number().optional(),
  cash: z.number().optional(),
  crypto: z.number().optional()
})

export const AllocationDataSchema = z.object({
  asset_class: z.string(),
  amount: z.number(),
  percentage: z.number()
})

export const ForecastPointSchema = z.object({
  month: z.number(),
  year: z.number(),
  value: z.number(),
  contributions: z.number(),
  gains: z.number()
})

// Type exports
export type AssetSnapshotFormData = z.infer<typeof AddAssetSnapshotFormSchema>
export type ExpenseFormData = z.infer<typeof AddExpenseFormSchema>
export type SettingsFormData = z.infer<typeof UpdateSettingsFormSchema>