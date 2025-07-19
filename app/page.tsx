// =============================================
// Home Page - Dashboard
// =============================================

import { getDashboardData } from '@/lib/actions/dashboard'
import { DashboardClient } from '@/components/dashboard-client'

export default async function HomePage() {
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