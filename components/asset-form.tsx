'use client'

// =============================================
// 資産入力フォームコンポーネント
// =============================================

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface AssetFormData {
  date: string
  category: string
  subcategory: string
  amount: number
  taxRate?: number
  memo?: string
}

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void
  onCancel: () => void
}

// 日本の投資カテゴリ
const ASSET_CATEGORIES = {
  'cash': {
    label: '現金・預金',
    subcategories: [
      { value: 'bank_ordinary', label: '銀行普通預金' },
      { value: 'bank_time', label: '銀行定期預金' },
      { value: 'postal_ordinary', label: 'ゆうちょ通常貯金' },
      { value: 'time_deposit', label: '積立定期' },
      { value: 'zaikeishochiku', label: '財形貯蓄' },
      { value: 'foreign_currency', label: '外貨預金' },
      { value: 'cash_hand', label: '現金（手元）' },
      { value: 'cash_other', label: 'その他' }
    ]
  },
  'securities': {
    label: '証券・投資',
    subcategories: [
      { value: 'securities_general', label: '証券口座' },
      { value: 'nisa_tsumitate', label: 'NISAつみたて投資枠' },
      { value: 'nisa_general', label: 'NISA成長投資枠' },
      { value: 'ideco_investment', label: 'iDeCo' },
      { value: 'pension_corporate', label: '企業年金（企業型DC）' },
      { value: 'pension_individual', label: '個人年金保険' },
      { value: 'real_estate_investment', label: '不動産投資' },
      { value: 'securities_other', label: 'その他' }
    ]
  },
  'crypto': {
    label: '仮想通貨',
    subcategories: [
      { value: 'crypto_btc', label: 'BTC' },
      { value: 'crypto_eth', label: 'ETH' },
      { value: 'crypto_sol', label: 'SOL' },
      { value: 'crypto_other', label: 'その他' }
    ]
  },
  'other': {
    label: 'その他',
    subcategories: [
      { value: 'other_nft', label: 'NFT' },
      { value: 'other_financie', label: 'FiNANCiE' },
      { value: 'other_assets', label: 'その他' }
    ]
  }
}

export function AssetForm({ onSubmit, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    date: new Date().toISOString().split('T')[0],
    category: 'cash',
    subcategory: 'bank_ordinary',
    amount: 0,
    taxRate: 0,
    memo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount > 0) {
      onSubmit(formData)
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
    <div className="bg-background border rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">資産を入力</h2>
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

          {/* 税率（仮想通貨のみ） */}
          {formData.category === 'crypto' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-1">
                  税率 (%)
                  <span 
                    className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-200 text-gray-600 rounded-full cursor-help hover:bg-gray-300"
                    title="仮想通貨の売却時にかかる税率です。利益に対してこの税率が適用されます。"
                  >
                    ?
                  </span>
                </span>
              </label>
              <input
                type="number"
                value={formData.taxRate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="20"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                仮想通貨の売却時にかかる税率を入力してください
              </p>
            </div>
          )}

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
              className="flex-1 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              入力
            </button>
          </div>
        </form>
    </div>
  )
}