'use client'

// =============================================
// 資産編集フォームコンポーネント
// =============================================

import { useState } from 'react'
import { X, Save } from 'lucide-react'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  memo?: string
}

interface AssetEditFormProps {
  asset: Asset
  onSave: (asset: Asset) => void
  onCancel: () => void
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

export function AssetEditForm({ asset, onSave, onCancel }: AssetEditFormProps) {
  const [formData, setFormData] = useState<Asset>(asset)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount > 0) {
      onSave(formData)
    }
  }

  const handleCategoryChange = (category: string) => {
    const defaultSubcategory = ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES].subcategories[0].value
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: defaultSubcategory
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">資産を編集</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              日付
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium mb-2">
              カテゴリ
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* サブカテゴリ */}
          <div>
            <label className="block text-sm font-medium mb-2">
              詳細カテゴリ
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              {ASSET_CATEGORIES[formData.category as keyof typeof ASSET_CATEGORIES].subcategories.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </select>
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              金額 (円)
            </label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="1000000"
              min="0"
              step="1"
              required
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium mb-2">
              メモ (任意)
            </label>
            <input
              type="text"
              value={formData.memo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="例: 楽天銀行、SBI証券など"
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-2 border rounded-md hover:bg-muted"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}