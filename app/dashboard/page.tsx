// =============================================
// Dashboard Page - Main Finance Overview
// =============================================

import { getDashboardData } from '@/lib/actions/dashboard'
import { PortfolioChart } from '@/components/portfolio-chart'
import { AllocationPie } from '@/components/allocation-pie'
import { ForecastSlider } from '@/components/forecast-slider'
import { DashboardClient } from '@/components/dashboard-client'
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react'

// カテゴリ名を日本語に変換
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'food': '食費',
    'transport': '交通費',
    'entertainment': '娯楽費',
    'utilities': '光熱費',
    'healthcare': '医療費',
    'shopping': '買い物',
    'education': '教育費',
    'other': 'その他'
  }
  return categoryMap[category] || category
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()

  if (!dashboardData.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4">
          <p className="text-destructive">
            Error loading dashboard: {dashboardData.error}
          </p>
        </div>
      </div>
    )
  }

  const { chartData, allocationData, settings } = dashboardData

  return (
    <DashboardClient 
      initialData={{
        chartData,
        allocationData,
        settings
      }}
    />
  )
}