'use client'

// =============================================
// Detailed Asset Allocation Pie Chart Component
// =============================================

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  taxRate?: number
  memo?: string
}

interface DetailedAllocationPieProps {
  assets: Asset[]
}

// 詳細カテゴリの色パレット（明確に区別できる落ち着いた色）
const DETAILED_COLORS = [
  '#d98b7f', '#e6b85c', '#b8c97a', '#7eb8a6', '#8db3d1', '#b695c4',
  '#d88ba1', '#b8a584', '#9cbe8f', '#7aa8b8', '#a59bd4', '#c48aa8',
  '#e09475', '#d1b866', '#9fc585', '#85b5a3', '#94a8d6', '#ba8fc0',
  '#d6967e', '#b09d7a', '#87b895', '#78a5b5', '#9f94d2', '#c38da5',
  '#e2987d', '#c4a76f', '#95be92', '#80b0b0', '#a396d0', '#be91b8',
  '#da9a81', '#b7a173', '#92c096', '#7ca8ad', '#9b98ce', '#c094b5'
]

// 詳細カテゴリの日本語名マッピング
const SUBCATEGORY_NAMES = {
  // 現金・預金
  'bank_ordinary': '銀行普通預金',
  'bank_time': '銀行定期預金',
  'postal_ordinary': 'ゆうちょ通常貯金',
  'time_deposit': '積立定期',
  'zaikeishochiku': '財形貯蓄',
  'foreign_currency': '外貨預金',
  'cash_hand': '現金（手元）',
  'cash_other': '現金その他',
  // 証券・投資
  'securities_general': '証券口座',
  'nisa_tsumitate': 'NISAつみたて投資枠',
  'nisa_general': 'NISA成長投資枠',
  'ideco_investment': 'iDeCo',
  'pension_corporate': '企業年金（企業型DC）',
  'pension_individual': '個人年金保険',
  'real_estate_investment': '不動産投資',
  'securities_other': '証券その他',
  // 仮想通貨
  'crypto_btc': 'BTC',
  'crypto_eth': 'ETH',
  'crypto_sol': 'SOL',
  'crypto_other': '仮想通貨その他',
  // その他
  'other_nft': 'NFT',
  'other_financie': 'FiNANCiE',
  'other_assets': 'その他資産'
}

export function DetailedAllocationPie({ assets }: DetailedAllocationPieProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  
  // 利用可能な月の一覧を取得
  const availableMonths = Array.from(new Set(assets.map(asset => asset.date.substring(0, 7))))
    .sort()
    .reverse() // 最新月を先頭に
  
  // 初期選択月を設定（最新月）
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0])
    }
  }, [availableMonths, selectedMonth])

  // 税引き後の金額を計算
  const calculateAfterTaxAmount = (asset: Asset): number => {
    // 仮想通貨で税率が設定されている場合のみ税金を差し引く
    if (asset.category === 'crypto' && asset.taxRate && asset.taxRate > 0) {
      // 税率を適用して税引き後の金額を計算し、四捨五入
      return Math.round(asset.amount * (1 - asset.taxRate / 100))
    }
    // その他の資産は税引き前の金額をそのまま返す
    return asset.amount
  }

  // 選択された月の詳細資産配分を計算
  const calculateDetailedAllocation = (month: string) => {
    const monthAssets = assets.filter(asset => asset.date.substring(0, 7) === month)
    
    if (monthAssets.length === 0) return []
    
    const totalAmount = monthAssets.reduce((sum, asset) => sum + calculateAfterTaxAmount(asset), 0)
    
    const allocationMap = monthAssets.reduce((acc, asset) => {
      const afterTaxAmount = calculateAfterTaxAmount(asset)
      acc[asset.subcategory] = (acc[asset.subcategory] || 0) + afterTaxAmount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(allocationMap).map(([subcategory, amount], index) => ({
      subcategory,
      name: SUBCATEGORY_NAMES[subcategory as keyof typeof SUBCATEGORY_NAMES] || subcategory,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: DETAILED_COLORS[index % DETAILED_COLORS.length]
    })).sort((a, b) => b.amount - a.amount) // 金額順でソート
  }

  const data = selectedMonth ? calculateDetailedAllocation(selectedMonth) : []

  // 月の表示形式
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    return `${year}年${parseInt(monthNum)}月`
  }

  // データが空の場合は空状態を表示
  if (data.length === 0) {
    return (
      <div className="w-full">
        {/* 年月選択（空状態でも表示） */}
        {availableMonths.length > 0 && (
          <div className="flex justify-center mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              選択した月の詳細資産配分データがありません
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              資産を追加すると詳細配分が表示されます
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value))
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label function
  const renderCustomLabel = ({ percentage }: any) => {
    if (percentage < 8) return '' // Hide labels for small slices
    return `${percentage.toFixed(1)}%`
  }

  return (
    <div className="w-full">
      {/* 年月選択 */}
      {availableMonths.length > 0 && (
        <div className="flex justify-center mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* チャート */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 60, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={48}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats below chart */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
        <div>
          <p className="text-muted-foreground mb-1">総資産価値</p>
          <p className="font-semibold text-lg">
            {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">詳細カテゴリ数</p>
          <p className="font-semibold text-lg">{data.length}</p>
        </div>
      </div>
    </div>
  )
}