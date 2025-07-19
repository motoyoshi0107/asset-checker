'use client'

// =============================================
// 資産一覧コンポーネント
// =============================================

import { useState } from 'react'
import { Edit2, Trash2, Plus, X } from 'lucide-react'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  memo?: string
}

interface AssetListProps {
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

// 日本の投資カテゴリ
const ASSET_CATEGORIES = {
  'cash': {
    label: '現金・預金',
    subcategories: [
      { value: 'bank_ordinary', label: '普通預金' },
      { value: 'bank_time', label: '定期預金' },
      { value: 'bank_savings', label: '貯蓄預金' },
      { value: 'postal_savings', label: 'ゆうちょ貯金' }
    ]
  },
  'securities': {
    label: '証券口座',
    subcategories: [
      { value: 'securities_general', label: '一般口座' },
      { value: 'securities_specific', label: '特定口座' }
    ]
  },
  'nisa': {
    label: 'NISA',
    subcategories: [
      { value: 'nisa_general', label: '一般NISA' },
      { value: 'nisa_tsumitate', label: 'つみたてNISA' },
      { value: 'nisa_junior', label: 'ジュニアNISA' }
    ]
  },
  'ideco': {
    label: 'iDeCo',
    subcategories: [
      { value: 'ideco_deposit', label: '元本確保型' },
      { value: 'ideco_investment', label: '投資信託' }
    ]
  },
  'pension': {
    label: '企業年金',
    subcategories: [
      { value: 'pension_corporate', label: '企業型DC' },
      { value: 'pension_defined', label: '確定給付年金' }
    ]
  },
  'crypto': {
    label: '仮想通貨',
    subcategories: [
      { value: 'crypto_btc', label: 'ビットコイン' },
      { value: 'crypto_eth', label: 'イーサリアム' },
      { value: 'crypto_other', label: 'その他' }
    ]
  },
  'other': {
    label: 'その他',
    subcategories: [
      { value: 'insurance', label: '保険' },
      { value: 'gold', label: '金・プラチナ' },
      { value: 'real_estate', label: '不動産' },
      { value: 'other', label: 'その他' }
    ]
  }
}

export function AssetList({ assets, onEdit, onDelete, onAdd }: AssetListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // カテゴリとサブカテゴリのラベルを取得
  const getCategoryLabel = (category: string) => {
    return ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES]?.label || category
  }

  const getSubcategoryLabel = (category: string, subcategory: string) => {
    const categoryData = ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES]
    const subcat = categoryData?.subcategories.find(s => s.value === subcategory)
    return subcat?.label || subcategory
  }

  // フィルタリングとソート
  const filteredAssets = assets
    .filter(asset => filterCategory === 'all' || asset.category === filterCategory)
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'category':
          aValue = getCategoryLabel(a.category)
          bValue = getCategoryLabel(b.category)
          break
        default:
          aValue = a.date
          bValue = b.date
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalAmount = filteredAssets.reduce((sum, asset) => sum + asset.amount, 0)

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">資産一覧</h2>
          <p className="text-muted-foreground">
            {filteredAssets.length}件の資産 • 総額: ¥{totalAmount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>資産入力</span>
        </button>
      </div>

      {/* フィルター・ソート */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">カテゴリ:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border rounded-md bg-background text-sm"
          >
            <option value="all">すべて</option>
            {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">並び替え:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
            className="px-3 py-1 border rounded-md bg-background text-sm"
          >
            <option value="date">日付</option>
            <option value="amount">金額</option>
            <option value="category">カテゴリ</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border rounded-md hover:bg-muted text-sm"
          >
            {sortOrder === 'asc' ? '昇順' : '降順'}
          </button>
        </div>
      </div>

      {/* 資産リスト */}
      <div className="space-y-2">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>資産データがありません</p>
            <button
              onClick={onAdd}
              className="mt-2 text-primary hover:underline"
            >
              最初の資産を入力する
            </button>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">
                      {getCategoryLabel(asset.category)} - {getSubcategoryLabel(asset.category, asset.subcategory)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(asset.date).toLocaleDateString('ja-JP')}
                      {asset.memo && ` • ${asset.memo}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ¥{asset.amount.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(asset)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="編集"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(asset.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* カテゴリ別集計 */}
      {filteredAssets.length > 0 && (
        <div className="mt-6 p-4 bg-card border rounded-lg">
          <h3 className="font-semibold mb-3">カテゴリ別集計</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              filteredAssets.reduce((acc, asset) => {
                const category = getCategoryLabel(asset.category)
                acc[category] = (acc[category] || 0) + asset.amount
                return acc
              }, {} as Record<string, number>)
            ).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm font-bold">¥{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}