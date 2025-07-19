'use client'

// =============================================
// Portfolio Time-Series Chart Component
// =============================================

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartDataPoint } from '@/lib/types/database'

interface PortfolioChartProps {
  data: ChartDataPoint[]
}

type TimePeriod = '6m' | '1y' | '2y' | '5y' | '10y' | '20y'

export function PortfolioChart({ data }: PortfolioChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1y')
  
  // データに含まれるカテゴリを取得（値が0でない月が存在するもの）
  const getUsedCategories = () => {
    const categories = new Set<string>()
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && key !== 'total' && typeof item[key] === 'number' && item[key] > 0) {
          categories.add(key)
        }
      })
    })
    return Array.from(categories)
  }
  
  const usedCategories = getUsedCategories()

  // 期間選択オプション
  const periodOptions = [
    { value: '6m', label: '6ヶ月' },
    { value: '1y', label: '1年' },
    { value: '2y', label: '2年' },
    { value: '5y', label: '5年' },
    { value: '10y', label: '10年' },
    { value: '20y', label: '20年' }
  ]

  // 期間に基づいてデータをフィルタリング
  const getFilteredData = () => {
    if (data.length === 0) return []
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (selectedPeriod) {
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case '2y':
        cutoffDate.setFullYear(now.getFullYear() - 2)
        break
      case '5y':
        cutoffDate.setFullYear(now.getFullYear() - 5)
        break
      case '10y':
        cutoffDate.setFullYear(now.getFullYear() - 10)
        break
      case '20y':
        cutoffDate.setFullYear(now.getFullYear() - 20)
        break
      default:
        cutoffDate.setFullYear(now.getFullYear() - 1)
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate)
  }

  const filteredData = getFilteredData()

  // データが空の場合は空状態を表示
  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">
            資産データがありません
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            資産を入力するとグラフが表示されます
          </p>
        </div>
      </div>
    )
  }
  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value))
  }

  // Format date for display (月毎表示)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}年${month}月`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {/* 期間選択ボタン */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-muted rounded-lg p-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value as TimePeriod)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* フィルタリングされたデータが空の場合 */}
      {filteredData.length === 0 && data.length > 0 && (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              選択した期間にデータがありません
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              異なる期間を選択してください
            </p>
          </div>
        </div>
      )}

      {/* チャート */}
      {filteredData.length > 0 && (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs fill-muted-foreground"
                interval="preserveStartEnd"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `¥${Math.round(value / 1000000).toFixed(0)}M`}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Total portfolio value line */}
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="総資産"
                dot={false}
                activeDot={{ r: 6 }}
              />
              
              {/* 動的に生成される詳細カテゴリの線 */}
              {usedCategories.map((category, index) => {
                // カテゴリ名の日本語マッピング
                const categoryNames = {
                  // 現金・預金
                  'bank_ordinary': '銀行普通預金',
                  'bank_time': '銀行定期預金',
                  'postal_ordinary': 'ゆうちょ通常貯金',
                  'time_deposit': '積立定期',
                  'zaikeishochiku': '財形貯蓄',
                  'foreign_currency': '外貨預金',
                  'cash_hand': '現金（手元）',
                  'cash_other': 'その他（現金）',
                  // 証券・投資
                  'securities_general': '証券口座',
                  'nisa_tsumitate': 'NISAつみたて投資枠',
                  'nisa_general': 'NISA成長投資枠',
                  'ideco_investment': 'iDeCo',
                  'pension_corporate': '企業年金（企業型DC）',
                  'pension_individual': '個人年金保険',
                  'real_estate_investment': '不動産投資',
                  'securities_other': 'その他（証券）',
                  // 仮想通貨
                  'crypto_btc': 'BTC',
                  'crypto_eth': 'ETH',
                  'crypto_sol': 'SOL',
                  'crypto_other': 'その他（仮想通貨）',
                  // その他
                  'other_nft': 'NFT',
                  'other_financie': 'FiNANCiE',
                  'other_assets': 'その他'
                }
                
                // 詳細配分円グラフと同じ色パレット（明確に区別できる色）
                const detailedColors = [
                  '#d98b7f', '#e6b85c', '#b8c97a', '#7eb8a6', '#8db3d1', '#b695c4',
                  '#d88ba1', '#b8a584', '#9cbe8f', '#7aa8b8', '#a59bd4', '#c48aa8',
                  '#e09475', '#d1b866', '#9fc585', '#85b5a3', '#94a8d6', '#ba8fc0',
                  '#d6967e', '#b09d7a', '#87b895', '#78a5b5', '#9f94d2', '#c38da5',
                  '#e2987d', '#c4a76f', '#95be92', '#80b0b0', '#a396d0', '#be91b8',
                  '#da9a81', '#b7a173', '#92c096', '#7ca8ad', '#9b98ce', '#c094b5'
                ]
                
                // 色とスタイルの設定（線のタイプも含む）
                const getLineStyle = (category: string, index: number) => {
                  // 線のパターンを定義
                  const linePatterns = [
                    undefined,        // 実線
                    '5 5',           // 破線（中）
                    '2 2',           // 破線（短）
                    '8 3',           // 破線（長）
                    '3 3 1 3',       // 点線と破線の組み合わせ
                    '1 3',           // 点線
                    '10 5 2 5',      // 長破線と短破線
                    '6 2 2 2',       // 破線と点線
                    '4 4 2 4',       // 複合パターン1
                    '8 2 2 2 2 2',   // 複合パターン2
                  ]
                  
                  return { 
                    color: detailedColors[index % detailedColors.length], 
                    dash: linePatterns[index % linePatterns.length]
                  }
                }
                
                const lineStyle = getLineStyle(category, index)
                const displayName = categoryNames[category as keyof typeof categoryNames] || category
                
                return (
                  <Line 
                    key={category}
                    type="monotone" 
                    dataKey={category} 
                    stroke={lineStyle.color} 
                    strokeWidth={1.5}
                    name={displayName}
                    dot={false}
                    strokeDasharray={lineStyle.dash}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}