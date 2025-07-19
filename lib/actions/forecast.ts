// Server Actions removed for static export

// =============================================
// Forecast Server Action - Wrapper for Edge Function
// =============================================

import { ForecastPoint } from '@/lib/types/database'

interface ForecastRequest {
  currentValue: number
  monthlyInvestment: number
  annualRate: number
  timeHorizonYears: number
  userId?: string
}

interface ForecastResponse {
  success: boolean
  data?: ForecastPoint[]
  error?: string
  summary?: {
    initialValue: number
    finalValue: number
    totalContributions: number
    totalGains: number
    effectiveAnnualRate: number
  }
}

/**
 * Calculate investment forecast using Supabase Edge Function
 */
export async function calculateForecast(params: ForecastRequest): Promise<ForecastResponse> {
  try {
    // Validate parameters
    if (params.currentValue < 0 || params.monthlyInvestment < 0) {
      return {
        success: false,
        error: 'Values must be non-negative'
      }
    }

    if (params.annualRate < -0.5 || params.annualRate > 1.0) {
      return {
        success: false,
        error: 'Annual rate must be between -50% and 100%'
      }
    }

    if (params.timeHorizonYears < 1 || params.timeHorizonYears > 50) {
      return {
        success: false,
        error: 'Time horizon must be between 1 and 50 years'
      }
    }

    // Call Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to calculate forecast'
      }
    }

    const result: ForecastResponse = await response.json()
    return result

  } catch (error) {
    console.error('Forecast calculation error:', error)
    return {
      success: false,
      error: 'Failed to calculate forecast'
    }
  }
}

/**
 * Client-side forecast calculation (fallback)
 */
export function calculateForecastClient(params: ForecastRequest): ForecastResponse {
  try {
    const { currentValue, monthlyInvestment, annualRate, timeHorizonYears } = params
    
    // Validate parameters
    if (currentValue < 0 || monthlyInvestment < 0) {
      return { success: false, error: 'Values must be non-negative' }
    }

    if (annualRate < -0.5 || annualRate > 1.0) {
      return { success: false, error: 'Annual rate must be between -50% and 100%' }
    }

    if (timeHorizonYears < 1 || timeHorizonYears > 50) {
      return { success: false, error: 'Time horizon must be between 1 and 50 years' }
    }

    const monthlyRate = annualRate / 12
    const totalMonths = timeHorizonYears * 12
    const data: ForecastPoint[] = []
    
    let balance = currentValue
    let totalContributions = 0

    // Add initial point
    data.push({
      month: 0,
      year: 0,
      age: 0, // Will be handled by the client component
      value: Math.round(balance),
      currentAmount: Math.round(currentValue),
      contributions: 0,
      gains: 0
    })

    // Calculate month by month, but store yearly points
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution
      balance += monthlyInvestment
      totalContributions += monthlyInvestment
      
      // Apply monthly growth
      balance *= (1 + monthlyRate)
      
      // Store yearly data points
      if (month % 12 === 0 || month === totalMonths) {
        const totalGains = balance - currentValue - totalContributions
        
        data.push({
          month,
          year: Math.floor(month / 12),
          age: 0, // Will be handled by the client component
          value: Math.round(balance),
          currentAmount: Math.round(currentValue),
          contributions: Math.round(totalContributions),
          gains: Math.round(totalGains)
        })
      }
    }

    // Calculate summary
    const finalPoint = data[data.length - 1]
    const finalValue = finalPoint.value
    const totalGains = finalValue - currentValue - totalContributions
    const effectiveAnnualRate = Math.pow(finalValue / currentValue, 1 / timeHorizonYears) - 1

    return {
      success: true,
      data,
      summary: {
        initialValue: currentValue,
        finalValue,
        totalContributions,
        totalGains,
        effectiveAnnualRate
      }
    }

  } catch (error) {
    console.error('Client-side forecast calculation error:', error)
    return {
      success: false,
      error: 'Failed to calculate forecast'
    }
  }
}