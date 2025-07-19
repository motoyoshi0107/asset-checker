'use client'

// =============================================
// Dashboard Client Component
// =============================================

import { useState, useEffect } from 'react'
import { PortfolioChart } from '@/components/portfolio-chart'
import { AllocationPie } from '@/components/allocation-pie'
import { ForecastSlider } from '@/components/forecast-slider'
import { AssetForm } from '@/components/asset-form'
import { EmptyState } from '@/components/empty-state'
import { DataManagement } from '@/components/data-management'
import { MonthlyAssetTable } from '@/components/monthly-asset-table'
import { TrendingUp, DollarSign, Target, Plus, Settings } from 'lucide-react'
import { saveAssets, loadAssets, debugStoredData } from '@/lib/utils/storage'

// 型定義
interface Asset {
  id: string
  date: string
  category: string
  subcategory: string
  amount: number
  taxRate?: number
  memo?: string
}


interface DashboardClientProps {
  initialData: {
    chartData: any[]
    allocationData: any[]
    settings: any
  }
}


export function DashboardClient({ initialData }: DashboardClientProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [dashboardData, setDashboardData] = useState(initialData)
  const [investmentSettings, setInvestmentSettings] = useState({
    annualRate: initialData.settings.annual_rate,
    monthlyInvest: initialData.settings.monthly_invest,
    currentAmount: 0
  })

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    console.log('Dashboard: Loading data from localStorage...')
    debugStoredData()
    
    const loadedAssets = loadAssets()
    
    setAssets(loadedAssets)
    
    console.log('Dashboard: Data loaded successfully')
  }, [])

  // データが更新されたらローカルストレージに保存
  useEffect(() => {
    console.log('Dashboard: Assets changed, saving to localStorage')
    saveAssets(assets)
    updateDashboardData()
  }, [assets])

  // ダッシュボードデータを更新
  const updateDashboardData = () => {
    console.log('Updating dashboard data with assets:', assets)
    
    // チャートデータを生成（直接assetsを使用）
    const chartData = transformAssetsToChartData(assets)
    const allocationData = calculateAllocation(assets)
    
    setDashboardData({
      chartData,
      allocationData,
      settings: initialData.settings
    })
  }

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

  // カテゴリを資産クラスにマッピング
  const mapCategoryToAssetClass = (category: string): string => {
    const mapping: Record<string, string> = {
      'cash': 'cash',
      'securities': 'stocks',
      'nisa': 'stocks',
      'ideco': 'stocks',
      'pension': 'stocks',
      'crypto': 'crypto',
      'other': 'other'
    }
    return mapping[category] || 'cash'
  }

  // 資産追加
  const handleAddAsset = (formData: any) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      date: formData.date,
      category: formData.category,
      subcategory: formData.subcategory,
      amount: formData.amount,
      taxRate: formData.taxRate,
      memo: formData.memo
    }
    const updatedAssets = [...assets, newAsset]
    
    console.log('Dashboard: Adding new asset:', newAsset)
    setAssets(updatedAssets)
    saveAssets(updatedAssets)
    
    setShowAssetForm(false)
  }


  // 資産更新（月別表から）
  const handleUpdateAsset = (updatedAsset: Asset) => {
    const existingAssetIndex = assets.findIndex(asset => asset.id === updatedAsset.id)
    
    if (existingAssetIndex >= 0) {
      // 既存の資産を更新
      const updatedAssets = [...assets]
      updatedAssets[existingAssetIndex] = updatedAsset
      setAssets(updatedAssets)
      saveAssets(updatedAssets)
    } else {
      // 新しい資産を追加
      const newAssets = [...assets, updatedAsset]
      setAssets(newAssets)
      saveAssets(newAssets)
    }
  }

  // 資産削除（月別表から）
  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== id)
    setAssets(updatedAssets)
    saveAssets(updatedAssets)
  }

  // データインポート
  const handleImportData = (importedAssets: Asset[]) => {
    setAssets(importedAssets)
    setShowDataManagement(false)
  }

  // データリセット確認
  const handleResetData = () => {
    setShowResetConfirm(true)
  }

  // データリセット実行
  const confirmResetData = () => {
    // ローカルストレージをクリア
    localStorage.removeItem('asset-checker-assets')
    
    // 状態をリセット
    setAssets([])
    setInvestmentSettings({
      annualRate: initialData.settings.annual_rate,
      monthlyInvest: initialData.settings.monthly_invest,
      currentAmount: 0
    })
    
    // ダッシュボードデータをリセット
    setDashboardData({
      chartData: [],
      allocationData: [],
      settings: initialData.settings
    })
    
    setShowResetConfirm(false)
    
    console.log('Dashboard: All data has been reset')
  }

  // チャートデータ変換関数（月毎に詳細カテゴリで集約）
  const transformAssetsToChartData = (assets: any[]) => {
    console.log('Transform assets to chart data:', assets)
    
    const assetsByMonth = assets.reduce((acc, asset) => {
      // 日付を月初日に正規化（YYYY-MM-01形式）
      const dateObj = new Date(asset.date)
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          date: monthKey, 
          total: 0,
          // 現金・預金の詳細カテゴリ
          bank_ordinary: 0,
          bank_time: 0,
          postal_ordinary: 0,
          time_deposit: 0,
          zaikeishochiku: 0,
          foreign_currency: 0,
          cash_hand: 0,
          cash_other: 0,
          // 証券・投資の詳細カテゴリ
          securities_general: 0,
          nisa_tsumitate: 0,
          nisa_general: 0,
          ideco_investment: 0,
          pension_corporate: 0,
          pension_individual: 0,
          real_estate_investment: 0,
          securities_other: 0,
          // 仮想通貨の詳細カテゴリ
          crypto_btc: 0,
          crypto_eth: 0,
          crypto_sol: 0,
          crypto_other: 0,
          // その他の詳細カテゴリ
          other_nft: 0,
          other_financie: 0,
          other_assets: 0
        }
      }
      
      const afterTaxAmount = calculateAfterTaxAmount(asset)
      acc[monthKey].total += afterTaxAmount
      
      // subcategoryが存在する場合のみ追加
      if (asset.subcategory && acc[monthKey].hasOwnProperty(asset.subcategory)) {
        acc[monthKey][asset.subcategory] = (acc[monthKey][asset.subcategory] || 0) + afterTaxAmount
      } else {
        console.warn('Unknown subcategory:', asset.subcategory, 'for asset:', asset)
      }
      
      return acc
    }, {})

    const result = Object.values(assetsByMonth).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    console.log('Chart data result:', result)
    return result
  }

  // 配分計算関数（詳細カテゴリ対応）
  const calculateAllocation = (assets: any[]) => {
    const latestDate = assets.reduce((latest, asset) => 
      asset.date > latest ? asset.date : latest, assets[0]?.date || '')

    const latestAssets = assets.filter(asset => asset.date === latestDate)
    const totalAmount = latestAssets.reduce((sum, asset) => sum + calculateAfterTaxAmount(asset), 0)
    
    // 大カテゴリ別に集約
    const allocationMap = latestAssets.reduce((acc, asset) => {
      const mainCategory = mapCategoryToAssetClass(asset.category)
      const afterTaxAmount = calculateAfterTaxAmount(asset)
      acc[mainCategory] = (acc[mainCategory] || 0) + afterTaxAmount
      return acc
    }, {})

    return Object.entries(allocationMap).map(([asset_class, amount]) => ({
      asset_class,
      amount: amount as number,
      percentage: totalAmount > 0 ? ((amount as number) / totalAmount) * 100 : 0
    }))
  }

  const { chartData, allocationData, settings } = dashboardData
  const currentValue = chartData[chartData.length - 1]?.total || 0
  const previousValue = chartData[chartData.length - 2]?.total || 0
  const growthAmount = currentValue - previousValue
  const growthPercent = previousValue ? (growthAmount / previousValue) * 100 : 0

  // 常にダッシュボード画面を表示（空状態でも）

  // 投資設定の更新ハンドラー
  const handleSettingsChange = (annualRate: number, monthlyInvest: number, currentAmount: number) => {
    setInvestmentSettings({ annualRate, monthlyInvest, currentAmount })
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            あなたの資産状況を把握し、将来の計画を立てましょう
          </p>
          <p className="text-xs sm:text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 px-3 py-2 rounded-md">
            💾 データはローカルストレージに保存されます（リセットボタンで削除可能）
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setShowDataManagement(true)}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 border rounded-md hover:bg-muted text-sm font-medium"
          >
            <Settings className="h-4 w-4" />
            <span>データ管理</span>
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 text-sm font-medium"
          >
            <TrendingUp className="h-4 w-4 rotate-180" />
            <span>リセット</span>
          </button>
          <button
            onClick={() => setShowAssetForm(true)}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>資産入力</span>
          </button>
        </div>
      </div>

      {/* Top Row: Portfolio Value and Asset Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="space-y-4">
          {/* Portfolio Value */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-medium">ポートフォリオ価値</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              ¥{Math.round(currentValue).toLocaleString()}
            </p>
            <p className={`text-sm mt-1 ${growthAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthAmount >= 0 ? '+' : ''}¥{Math.round(growthAmount).toLocaleString()} ({growthPercent.toFixed(1)}%)
            </p>
          </div>
          
          {/* Asset Class */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <h3 className="text-sm font-medium">資産クラス</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {allocationData.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              分散投資
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 sm:p-6">
          <div className="space-y-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">資産配分</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              選択した月のポートフォリオ分散状況
            </p>
          </div>
          <AllocationPie assets={assets} />
        </div>
      </div>

      {/* Portfolio Growth Chart */}
      <div className="bg-card border rounded-lg p-4 sm:p-6">
        <div className="space-y-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">ポートフォリオ成長</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            時系列での資産推移を確認
          </p>
        </div>
        <PortfolioChart data={chartData} />
      </div>

      {/* Monthly Asset Management Table */}
      <MonthlyAssetTable
        assets={assets}
        onUpdateAsset={handleUpdateAsset}
        onDeleteAsset={handleDeleteAsset}
      />


      {/* Forecast Section */}
      <div className="bg-card border rounded-lg p-4 sm:p-6">
        <div className="space-y-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">投資シミュレーション</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            パラメータを調整して将来のポートフォリオ成長を予測
          </p>
        </div>
        <ForecastSlider 
          annualRate={investmentSettings.annualRate} 
          monthlyInvest={investmentSettings.monthlyInvest}
          currentAmount={investmentSettings.currentAmount}
          onSettingsChange={handleSettingsChange}
        />
      </div>


      {/* Forms */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AssetForm
            onSubmit={handleAddAsset}
            onCancel={() => setShowAssetForm(false)}
          />
        </div>
      )}
      {showDataManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">データ管理</h2>
              <button
                onClick={() => setShowDataManagement(false)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <DataManagement
              assets={assets}
              onImportData={handleImportData}
            />
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg p-6 w-full max-w-md">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400 rotate-180" />
                </div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  全データをリセット
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  すべての資産データが削除されます。<br/>
                  この操作は元に戻せません。
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ リセット前にデータをエクスポートすることをお勧めします
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmResetData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  削除実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}