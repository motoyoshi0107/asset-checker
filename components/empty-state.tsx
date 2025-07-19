'use client'

// =============================================
// 空状態表示コンポーネント
// =============================================

import { Plus, TrendingUp, PieChart, BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  onAddAsset: () => void
  onAddExpense: () => void
}

export function EmptyState({ onAddAsset, onAddExpense }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">資産管理を始めましょう</h2>
        <p className="text-muted-foreground mb-6">
          まずは資産と支出を登録して、あなたの財務状況を見える化しましょう。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onAddAsset}
            className="p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <PieChart className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">資産を追加</h3>
            <p className="text-sm text-muted-foreground">
              銀行口座、NISA、iDeCoなど
            </p>
          </button>
          
          <button
            onClick={onAddExpense}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium mb-1">支出を追加</h3>
            <p className="text-sm text-muted-foreground">
              日々の支出を記録
            </p>
          </button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>💡 データはブラウザに安全に保存されます</p>
        </div>
      </div>
    </div>
  )
}