// Server Actions removed for static export

// =============================================
// Dashboard Server Actions - Mock Data Version
// =============================================

import { ChartDataPoint, AllocationData } from '@/lib/types/database'

export async function getDashboardData() {
  // Return empty data initially - users will add their own data
  try {
    const mockAssets: any[] = [] // 空の配列
    const mockSettings = { annual_rate: 0.07, monthly_invest: 50000 } // デフォルト設定

    // Transform data for charts
    const chartData = transformAssetsToChartData(mockAssets)
    const allocationData = calculateAllocation(mockAssets)

    return {
      chartData,
      allocationData,
      settings: mockSettings,
      success: true
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return {
      error: 'Failed to fetch dashboard data',
      success: false
    }
  }
}

function transformAssetsToChartData(assets: any[]): ChartDataPoint[] {
  // Return empty array if no assets
  if (assets.length === 0) {
    return []
  }

  // Group assets by date
  const assetsByDate = assets.reduce((acc, asset) => {
    const date = asset.date
    if (!acc[date]) {
      acc[date] = { date, total: 0, stocks: 0, bonds: 0, cash: 0, crypto: 0 }
    }
    
    acc[date].total += asset.amount
    acc[date][asset.asset_class as keyof ChartDataPoint] = 
      (acc[date][asset.asset_class as keyof ChartDataPoint] as number || 0) + asset.amount
    
    return acc
  }, {} as Record<string, ChartDataPoint>)

  const result = Object.values(assetsByDate) as ChartDataPoint[]
  return result.sort((a: ChartDataPoint, b: ChartDataPoint) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

function calculateAllocation(assets: any[]): AllocationData[] {
  // Return empty array if no assets
  if (assets.length === 0) {
    return []
  }

  // Get latest date
  const latestDate = assets.reduce((latest, asset) => 
    asset.date > latest ? asset.date : latest, assets[0]?.date || '')

  // Sum amounts by asset class for latest date
  const latestAssets = assets.filter(asset => asset.date === latestDate)
  const totalAmount = latestAssets.reduce((sum, asset) => sum + asset.amount, 0)
  
  const allocationMap = latestAssets.reduce((acc, asset) => {
    acc[asset.asset_class] = (acc[asset.asset_class] || 0) + asset.amount
    return acc
  }, {} as Record<string, number>)

  return Object.entries(allocationMap).map(([asset_class, amount]) => ({
    asset_class,
    amount: amount as number,
    percentage: totalAmount > 0 ? ((amount as number) / totalAmount) * 100 : 0
  }))
}