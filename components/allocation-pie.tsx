'use client'

// =============================================
// Asset Allocation Pie Chart Component
// =============================================

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AllocationData } from '@/lib/types/database'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  taxRate?: number
  memo?: string
}

interface AllocationPieProps {
  assets: Asset[]
}

// Color palette for different asset classes
const COLORS = {
  stocks: '#10b981',   // green
  bonds: '#3b82f6',    // blue
  cash: '#f59e0b',     // amber
  crypto: '#8b5cf6',   // purple
  real_estate: '#ef4444', // red
  commodities: '#06b6d4'  // cyan
}

export function AllocationPie({ assets }: AllocationPieProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [showAssetClassTooltip, setShowAssetClassTooltip] = useState(false)
  
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

  // カテゴリを資産クラスにマッピング
  const mapCategoryToAssetClass = (category: string): string => {
    const mapping: Record<string, string> = {
      'cash': 'cash',
      'securities': 'stocks',
      'nisa': 'stocks',
      'ideco': 'stocks',
      'pension': 'stocks',
      'crypto': 'crypto',
      'other': 'bonds'
    }
    return mapping[category] || 'cash'
  }

  // 税引き後の金額を計算
  const calculateAfterTaxAmount = (asset: Asset): number => {
    // 仮想通貨で税率が設定されている場合のみ税金を差し引く
    if (asset.category === 'crypto' && asset.taxRate && asset.taxRate > 0) {
      // 税率を適用して税引き後の金額を計算
      return asset.amount * (1 - asset.taxRate / 100)
    }
    // その他の資産は税引き前の金額をそのまま返す
    return asset.amount
  }

  // 選択された月の資産配分を計算
  const calculateAllocation = (month: string): AllocationData[] => {
    const monthAssets = assets.filter(asset => asset.date.substring(0, 7) === month)
    
    if (monthAssets.length === 0) return []
    
    const totalAmount = monthAssets.reduce((sum, asset) => sum + calculateAfterTaxAmount(asset), 0)
    
    const allocationMap = monthAssets.reduce((acc, asset) => {
      const assetClass = mapCategoryToAssetClass(asset.category)
      const afterTaxAmount = calculateAfterTaxAmount(asset)
      acc[assetClass] = (acc[assetClass] || 0) + afterTaxAmount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(allocationMap).map(([asset_class, amount]) => ({
      asset_class,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }))
  }

  const data = selectedMonth ? calculateAllocation(selectedMonth) : []

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
              選択した月の資産配分データがありません
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              資産を追加すると配分が表示されます
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
      const assetClassNames = {
        stocks: '株式',
        bonds: '債券',
        cash: '現金・預金',
        crypto: '仮想通貨',
        real_estate: '不動産',
        commodities: '商品'
      }
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{assetClassNames[data.asset_class as keyof typeof assetClassNames] || data.asset_class}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label function
  const renderCustomLabel = ({ asset_class, percentage }: AllocationData) => {
    if (percentage < 5) return '' // Hide labels for small slices
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
              nameKey="asset_class"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.asset_class as keyof typeof COLORS] || '#64748b'} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={48}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => {
                const assetClassNames = {
                  stocks: '株式',
                  bonds: '債券', 
                  cash: '現金・預金',
                  crypto: '仮想通貨',
                  real_estate: '不動産',
                  commodities: '商品'
                }
                const displayName = assetClassNames[value as keyof typeof assetClassNames] || value
                return (
                  <span style={{ color: entry.color, fontSize: '14px' }}>
                    {displayName}
                  </span>
                )
              }}
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
          <p className="text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              資産クラス数
              <div className="relative">
                <span 
                  className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-200 text-gray-600 rounded-full cursor-help hover:bg-gray-300"
                  onMouseEnter={() => setShowAssetClassTooltip(true)}
                  onMouseLeave={() => setShowAssetClassTooltip(false)}
                >
                  ?
                </span>
                {showAssetClassTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10">
                    資産クラスとは、投資対象の種類別分類のことです。<br/>
                    例：株式、債券、現金、仮想通貨など。分散投資のリスク管理に重要です。
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                )}
              </div>
            </span>
          </p>
          <p className="font-semibold text-lg">{data.length}</p>
        </div>
      </div>
    </div>
  )
}