'use client'

// =============================================
// 月別資産管理表コンポーネント
// =============================================

import { useState, useEffect } from 'react'
import { Edit2, Check, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'

interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  taxRate?: number
  memo?: string
}

interface MonthlyAssetTableProps {
  assets: Asset[]
  onUpdateAsset: (asset: Asset) => void
  onDeleteAsset: (id: string) => void
}

// 日本の投資カテゴリ（2段階構造）
const ASSET_CATEGORIES = {
  'cash': {
    name: '現金・預金',
    subcategories: {
      'bank_ordinary': '銀行普通預金',
      'bank_time': '銀行定期預金',
      'postal_ordinary': 'ゆうちょ通常貯金',
      'time_deposit': '積立定期',
      'zaikeishochiku': '財形貯蓄',
      'foreign_currency': '外貨預金',
      'cash_hand': '現金（手元）',
      'cash_other': 'その他'
    }
  },
  'securities': {
    name: '証券・投資',
    subcategories: {
      'securities_general': '証券口座',
      'nisa_tsumitate': 'NISAつみたて投資枠',
      'nisa_general': 'NISA成長投資枠',
      'ideco_investment': 'iDeCo',
      'pension_corporate': '企業年金（企業型DC）',
      'pension_individual': '個人年金保険',
      'real_estate_investment': '不動産投資',
      'securities_other': 'その他'
    }
  },
  'crypto': {
    name: '仮想通貨',
    subcategories: {
      'crypto_btc': 'BTC',
      'crypto_eth': 'ETH',
      'crypto_sol': 'SOL',
      'crypto_other': 'その他'
    }
  },
  'other': {
    name: 'その他',
    subcategories: {
      'other_nft': 'NFT',
      'other_financie': 'FiNANCiE',
      'other_assets': 'その他'
    }
  }
} as const

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

// 年度を取得（4月〜3月）
const getFiscalYear = (month: string): number => {
  const [year, monthNum] = month.split('-').map(Number)
  // 4月〜12月は同年度、1月〜3月は前年度+1
  return monthNum >= 4 ? year : year - 1
}

// 月別データを生成
const generateMonthlyData = (assets: Asset[]) => {
  // 月別にグループ化
  const monthlyGroups: Record<string, Asset[]> = {}
  
  assets.forEach(asset => {
    const monthKey = asset.date.substring(0, 7) // YYYY-MM
    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = []
    }
    monthlyGroups[monthKey].push(asset)
  })

  // 資産データから実際の月の範囲を取得
  const assetMonths = Object.keys(monthlyGroups).sort()
  
  // 月のリストを作成（資産データがある月 + 現在の月まで）
  const months: string[] = []
  const now = new Date()
  const currentMonth = now.toISOString().substring(0, 7)
  
  
  if (assetMonths.length > 0) {
    // 最初の資産月から現在月までの全ての月を生成
    const startMonth = assetMonths[0]
    const endMonth = assetMonths[assetMonths.length - 1] > currentMonth ? assetMonths[assetMonths.length - 1] : currentMonth
    
    const startDate = new Date(startMonth + '-01')
    const endDate = new Date(endMonth + '-01')
    
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const monthKey = currentDate.toISOString().substring(0, 7)
      months.push(monthKey)
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else {
    // 資産データがない場合は過去12ヶ月を表示
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().substring(0, 7)
      months.push(monthKey)
    }
  }

  // 年度ごとにグループ化
  const fiscalYearGroups: Record<number, string[]> = {}
  months.forEach(month => {
    const fiscalYear = getFiscalYear(month)
    if (!fiscalYearGroups[fiscalYear]) {
      fiscalYearGroups[fiscalYear] = []
    }
    fiscalYearGroups[fiscalYear].push(month)
  })

  // カテゴリごとのデータを整理（2段階構造）
  const categoryData: Record<string, Record<string, Record<string, Asset[]>>> = {}
  
  Object.keys(ASSET_CATEGORIES).forEach(mainCategory => {
    categoryData[mainCategory] = {}
    Object.keys(ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES].subcategories).forEach(subCategory => {
      categoryData[mainCategory][subCategory] = {}
      months.forEach(month => {
        categoryData[mainCategory][subCategory][month] = monthlyGroups[month]?.filter(asset => 
          asset.category === mainCategory && asset.subcategory === subCategory
        ) || []
      })
    })
  })

  return { months, categoryData, fiscalYearGroups }
}

export function MonthlyAssetTable({ assets, onUpdateAsset, onDeleteAsset }: MonthlyAssetTableProps) {
  const [editingCell, setEditingCell] = useState<{ mainCategory: string; subCategory: string; month: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showSubtotals, setShowSubtotals] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [openFiscalYears, setOpenFiscalYears] = useState<Set<number>>(new Set())
  
  const { months, categoryData, fiscalYearGroups } = generateMonthlyData(assets)
  
  // 初期状態で最新年度を開く
  useEffect(() => {
    const fiscalYears = Object.keys(fiscalYearGroups).map(Number).sort((a, b) => b - a)
    if (fiscalYears.length > 0) {
      setOpenFiscalYears(new Set([fiscalYears[0]]))
    }
  }, [fiscalYearGroups])
  
  // 年度の開閉を切り替え
  const toggleFiscalYear = (fiscalYear: number) => {
    const newOpenYears = new Set(openFiscalYears)
    if (newOpenYears.has(fiscalYear)) {
      newOpenYears.delete(fiscalYear)
    } else {
      newOpenYears.add(fiscalYear)
    }
    setOpenFiscalYears(newOpenYears)
  }
  
  // 実際に資産が入力されているカテゴリのみを取得
  const usedCategories = Object.keys(ASSET_CATEGORIES).filter(mainCategory => {
    return Object.keys(ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES].subcategories).some(subCategory => {
      return assets.some(asset => asset.category === mainCategory && asset.subcategory === subCategory)
    })
  })

  // 編集開始
  const startEditing = (mainCategory: string, subCategory: string, month: string) => {
    const monthAssets = categoryData[mainCategory][subCategory][month]
    const totalAmount = monthAssets.reduce((sum, asset) => sum + calculateAfterTaxAmount(asset), 0)
    
    setEditingCell({ mainCategory, subCategory, month })
    setEditValue(totalAmount.toString())
  }

  // 編集保存
  const saveEdit = () => {
    if (!editingCell) return
    
    const { mainCategory, subCategory, month } = editingCell
    const newAmount = parseInt(editValue) || 0
    const monthAssets = categoryData[mainCategory][subCategory][month]
    
    if (monthAssets.length > 0) {
      if (newAmount === 0) {
        // 金額が0の場合は削除
        monthAssets.forEach(asset => {
          onDeleteAsset(asset.id)
        })
      } else {
        // 既存の資産を更新（複数ある場合は最初の1つのみ更新、残りは削除）
        const asset = monthAssets[0]
        const updatedAsset = { ...asset, amount: newAmount }
        onUpdateAsset(updatedAsset)
        
        // 他の資産があれば削除
        for (let i = 1; i < monthAssets.length; i++) {
          onDeleteAsset(monthAssets[i].id)
        }
      }
    } else if (newAmount > 0) {
      // 新しい資産を作成
      const newAsset: Asset = {
        id: Date.now().toString(),
        date: `${month}-01`,
        category: mainCategory,
        subcategory: subCategory,
        amount: newAmount,
        memo: '月別表から入力'
      }
      onUpdateAsset(newAsset)
    }
    
    setEditingCell(null)
    setEditValue('')
  }

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  // 月の表示形式
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    return (
      <div className="text-center">
        <div>{year}年</div>
        <div>{parseInt(monthNum)}月</div>
      </div>
    )
  }

  // 金額の表示形式
  const formatAmount = (amount: number) => {
    if (amount === 0) return '-'
    // 四捨五入して整数にする
    const roundedAmount = Math.round(amount)
    return `¥${roundedAmount.toLocaleString()}`
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="space-y-2 mb-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">月別資産管理表</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              各月の資産残高を確認・編集できます
            </p>
            <p className="text-xs text-blue-600 sm:hidden">
              👆 横スクロールで全データを確認
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs sm:text-sm font-medium">小計表示</label>
            <button
              onClick={() => setShowSubtotals(!showSubtotals)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showSubtotals ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showSubtotals ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* テーブル */}
      {usedCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            まだ資産が入力されていません
          </p>
          <p className="text-sm text-muted-foreground">
            資産を入力すると、この表に月別の履歴が表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 年度別アコーディオン */}
          {Object.keys(fiscalYearGroups)
            .map(Number)
            .sort((a, b) => b - a) // 最新年度を上に
            .map(fiscalYear => {
              const yearMonths = fiscalYearGroups[fiscalYear]
              const isOpen = openFiscalYears.has(fiscalYear)
              
              return (
                <div key={fiscalYear} className="border border-border rounded-lg overflow-hidden">
                  {/* 年度ヘッダー */}
                  <button
                    onClick={() => toggleFiscalYear(fiscalYear)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base">
                        {fiscalYear}年度 ({fiscalYear}年4月〜{fiscalYear + 1}年3月)
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {/* 年度別テーブル */}
                  {isOpen && (
                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <div className="sm:hidden text-xs text-blue-600 mb-2 text-center p-2">
                        ← 左右にスワイプして全てのデータを確認 →
                      </div>
                      <table className="min-w-full border-collapse bg-card">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="sticky left-0 bg-background border-r p-2 sm:p-4 text-left font-semibold min-w-[80px] sm:min-w-[140px] z-20 text-xs sm:text-sm">
                            カテゴリ
                          </th>
                          <th className="sticky bg-background border-r p-2 sm:p-4 text-left font-semibold min-w-[90px] sm:min-w-[150px] z-20 text-xs sm:text-sm" style={{ left: '80px' }}>
                            詳細
                          </th>
                          {yearMonths.map(month => (
                            <th key={month} className="border-r p-2 sm:p-4 text-center font-semibold min-w-[100px] sm:min-w-[100px] text-xs sm:text-sm">
                              {formatMonth(month)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {usedCategories.map(mainCategory => {
                          const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                          const usedSubcategories = Object.keys(categoryInfo.subcategories).filter(subCategory => {
                            return assets.some(asset => asset.category === mainCategory && asset.subcategory === subCategory)
                          })
                          
                          return usedSubcategories.map((subCategory, subIndex) => {
                            const subCategoryName = categoryInfo.subcategories[subCategory as keyof typeof categoryInfo.subcategories]
                            const isFirstSubCategory = subIndex === 0
                            
                            return (
                              <tr key={`${mainCategory}-${subCategory}`} className="border-b hover:bg-muted/20 transition-colors">
                                {isFirstSubCategory && (
                                  <td 
                                    className="sticky left-0 bg-background border-r p-2 sm:p-4 font-semibold text-center align-middle border-b z-20"
                                    rowSpan={usedSubcategories.length}
                                  >
                                    <div className="text-xs sm:text-sm text-primary bg-primary/10 px-1 sm:px-3 py-1 sm:py-2 rounded-md truncate">
                                      <span className="hidden sm:inline">{categoryInfo.name}</span>
                                      <span className="sm:hidden">
                                        {categoryInfo.name === '現金・預金' ? '現金' : 
                                         categoryInfo.name === '証券・投資' ? '投資' :
                                         categoryInfo.name === '仮想通貨' ? '仮想' :
                                         categoryInfo.name === 'その他' ? '他' : categoryInfo.name}
                                      </span>
                                    </div>
                                  </td>
                                )}
                                <td className="sticky bg-background border-r p-2 sm:p-4 text-xs sm:text-sm border-b z-20" style={{ left: '80px' }}>
                                  <div className="pl-1 sm:pl-2 font-medium text-muted-foreground truncate">
                                    <span className="hidden sm:inline">{subCategoryName}</span>
                                    <span className="sm:hidden">
                                      {subCategoryName.length > 6 ? subCategoryName.substring(0, 6) + '...' : subCategoryName}
                                    </span>
                                  </div>
                                </td>
                                {yearMonths.map(month => {
                                  const monthAssets = categoryData[mainCategory][subCategory][month]
                                  const totalAmount = monthAssets.reduce((sum, asset) => sum + calculateAfterTaxAmount(asset), 0)
                                  const isEditing = editingCell?.mainCategory === mainCategory && 
                                                   editingCell?.subCategory === subCategory && 
                                                   editingCell?.month === month
                                  
                                  return (
                                    <td key={month} className="border-r p-2 sm:p-4 text-right border-b">
                                      {isEditing ? (
                                        <div className="flex items-center justify-end space-x-1">
                                          <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-16 sm:w-24 p-1 sm:p-2 text-xs sm:text-sm border rounded-md text-right focus:ring-2 focus:ring-primary focus:border-primary"
                                            min="0"
                                            step="1"
                                            autoFocus
                                          />
                                          <button
                                            onClick={saveEdit}
                                            className="p-1 sm:p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                          >
                                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          >
                                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-end space-x-1 group">
                                          <button
                                            onClick={() => startEditing(mainCategory, subCategory, month)}
                                            className="opacity-0 group-hover:opacity-100 p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                          >
                                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </button>
                                          <span className="text-xs sm:text-sm font-medium">
                                            {formatAmount(totalAmount)}
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            )
                          })
                        })}
                        
                        {/* 合計行 */}
                        <tr className="bg-gray-100 dark:bg-gray-800 font-semibold border-t-2 border-primary/20">
                          <td className="sticky left-0 bg-gray-100 dark:bg-gray-800 border-r p-2 sm:p-4 z-20" colSpan={2}>
                            <div className="text-primary font-bold text-xs sm:text-sm">
                              合計
                            </div>
                          </td>
                          {yearMonths.map(month => {
                            const monthTotal = usedCategories.reduce((sum, mainCategory) => {
                              const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                              return sum + Object.keys(categoryInfo.subcategories).reduce((catSum, subCategory) => {
                                const monthAssets = categoryData[mainCategory][subCategory][month]
                                return catSum + monthAssets.reduce((assetSum, asset) => assetSum + calculateAfterTaxAmount(asset), 0)
                              }, 0)
                            }, 0)
                            
                            return (
                              <td key={month} className="border-r p-2 sm:p-4 text-right">
                                <div className="text-primary font-bold text-xs sm:text-sm">
                                  {formatAmount(monthTotal)}
                                </div>
                              </td>
                            )
                          })}
            </tr>

                        {/* 先月対比行 */}
                        <tr className="bg-gray-100 dark:bg-gray-800 border-b">
                          <td className="sticky left-0 bg-gray-100 dark:bg-gray-800 border-r p-2 sm:p-4 z-20" colSpan={2}>
                            <div className="text-blue-400 font-semibold text-xs sm:text-sm">
                              先月対比
                            </div>
                          </td>
                          {yearMonths.map((month, index) => {
                            const monthTotal = usedCategories.reduce((sum, mainCategory) => {
                              const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                              return sum + Object.keys(categoryInfo.subcategories).reduce((catSum, subCategory) => {
                                const monthAssets = categoryData[mainCategory][subCategory][month]
                                return catSum + monthAssets.reduce((assetSum, asset) => assetSum + calculateAfterTaxAmount(asset), 0)
                              }, 0)
                            }, 0)
                            
                            // 前月の合計を計算
                            const prevMonth = index > 0 ? yearMonths[index - 1] : null
                            const prevMonthTotal = prevMonth ? usedCategories.reduce((sum, mainCategory) => {
                              const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                              return sum + Object.keys(categoryInfo.subcategories).reduce((catSum, subCategory) => {
                                const monthAssets = categoryData[mainCategory][subCategory][prevMonth]
                                return catSum + monthAssets.reduce((assetSum, asset) => assetSum + calculateAfterTaxAmount(asset), 0)
                              }, 0)
                            }, 0) : 0
                            
                            const difference = monthTotal - prevMonthTotal
                            const percentChange = prevMonthTotal > 0 ? (difference / prevMonthTotal) * 100 : 0
                            
                            return (
                              <td key={month} className="bg-gray-100 dark:bg-gray-800 border-r p-2 sm:p-4 text-right">
                                {index === 0 ? (
                                  <div className="text-gray-400 text-xs sm:text-sm">-</div>
                                ) : (
                                  <div className="text-xs sm:text-sm">
                                    <div className={`font-semibold ${difference >= 0 ? 'text-blue-400' : 'text-red-600'}`}>
                                      {difference >= 0 ? '+' : ''}{formatAmount(difference)}
                                    </div>
                                    <div className={`text-xs ${difference >= 0 ? 'text-blue-300' : 'text-red-500'}`}>
                                      {difference >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                                    </div>
                                  </div>
                                )}
                              </td>
                            )
                          })}
            </tr>

                        {/* 昨年同月対比行 */}
                        <tr className="bg-gray-100 dark:bg-gray-800 border-b">
                          <td className="sticky left-0 bg-gray-100 dark:bg-gray-800 border-r p-2 sm:p-4 z-20" colSpan={2}>
                            <div className="text-green-400 font-semibold text-xs sm:text-sm">
                              昨年同月対比
                            </div>
                          </td>
                          {yearMonths.map(month => {
                            const monthTotal = usedCategories.reduce((sum, mainCategory) => {
                              const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                              return sum + Object.keys(categoryInfo.subcategories).reduce((catSum, subCategory) => {
                                const monthAssets = categoryData[mainCategory][subCategory][month]
                                return catSum + monthAssets.reduce((assetSum, asset) => assetSum + calculateAfterTaxAmount(asset), 0)
                              }, 0)
                            }, 0)
                            
                            
                            // 昨年同月の合計を計算（修正版）
                            const [year, monthNum] = month.split('-')
                            const lastYearMonth = `${parseInt(year) - 1}-${monthNum}`
                            
                            // 昨年同月の資産を直接検索（元の方法に戻す）
                            const lastYearAssets = assets.filter(asset => {
                              if (!asset || !asset.date) return false
                              return asset.date.startsWith(lastYearMonth)
                            })
                            const lastYearMonthTotal = lastYearAssets.reduce((sum, asset) => {
                              return sum + (asset.amount || 0)
                            }, 0)
                            
                            const difference = monthTotal - lastYearMonthTotal
                            const percentChange = lastYearMonthTotal > 0 ? (difference / lastYearMonthTotal) * 100 : 0
                            
                            return (
                              <td key={month} className="bg-gray-100 dark:bg-gray-800 border-r p-2 sm:p-4 text-right">
                                {lastYearMonthTotal === 0 && monthTotal === 0 ? (
                                  <div className="text-gray-400 text-xs sm:text-sm">-</div>
                                ) : (
                                  <div className="text-xs sm:text-sm">
                                    <div className={`font-semibold ${difference >= 0 ? 'text-green-400' : 'text-red-600'}`}>
                                      {difference >= 0 ? '+' : ''}{formatAmount(difference)}
                                    </div>
                                    <div className={`text-xs ${difference >= 0 ? 'text-green-300' : 'text-red-500'}`}>
                                      {lastYearMonthTotal === 0 ? '∞%' : `${difference >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`}
                                    </div>
                                  </div>
                                )}
                              </td>
                            )
                          })}
            </tr>
                        
                        {/* 大カテゴリ別小計行（表示・非表示切り替え可能） */}
                        {showSubtotals && usedCategories.map(mainCategory => {
                          const categoryInfo = ASSET_CATEGORIES[mainCategory as keyof typeof ASSET_CATEGORIES] as { name: string; subcategories: Record<string, string> }
                          const usedSubcategories = Object.keys(categoryInfo.subcategories).filter(subCategory => {
                            return assets.some(asset => asset.category === mainCategory && asset.subcategory === subCategory)
                          })
                          
                          return (
                            <tr key={`${mainCategory}-subtotal`} className="bg-muted/20 border-b">
                              <td className="sticky left-0 bg-muted/20 border-r p-2 sm:p-4 z-20" colSpan={2}>
                                <div className="text-primary font-semibold text-xs sm:text-sm">
                                  {categoryInfo.name} 小計
                                </div>
                              </td>
                              {yearMonths.map(month => {
                                const categoryMonthTotal = usedSubcategories.reduce((sum, subCategory) => {
                                  const monthAssets = categoryData[mainCategory][subCategory][month]
                                  return sum + monthAssets.reduce((assetSum, asset) => assetSum + calculateAfterTaxAmount(asset), 0)
                                }, 0)
                                
                                return (
                                  <td key={month} className="border-r p-2 sm:p-4 text-right bg-muted/20">
                                    <div className="text-primary font-semibold text-xs sm:text-sm">
                                      {formatAmount(categoryMonthTotal)}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* 操作ガイド（アコーディオン） */}
      <div className="mt-4 border rounded-lg">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">💡 操作方法</span>
          </div>
          {showGuide ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {showGuide && (
          <div className="px-3 pb-3 border-t">
            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              <p>• 各セルにマウスを当てると編集ボタンが表示されます</p>
              <p>• 編集ボタンをクリックして金額を直接修正できます</p>
              <p>• 横スクロールで過去の月を確認できます</p>
              <p>• 0円を入力すると該当月の資産が削除されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}