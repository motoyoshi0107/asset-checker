'use client'

// =============================================
// Forecast Slider Component with Projections
// =============================================

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ForecastPoint } from '@/lib/types/database'

interface ForecastSliderProps {
  annualRate: number
  monthlyInvest: number
  currentAmount?: number
  onSettingsChange?: (annualRate: number, monthlyInvest: number, currentAmount: number) => void
}

export function ForecastSlider({ annualRate, monthlyInvest, currentAmount = 0, onSettingsChange }: ForecastSliderProps) {
  const [localAnnualRate, setLocalAnnualRate] = useState(annualRate)
  const [localMonthlyInvest, setLocalMonthlyInvest] = useState(monthlyInvest)
  const [localCurrentAmount, setLocalCurrentAmount] = useState(currentAmount)
  const [timeHorizon, setTimeHorizon] = useState(30) // years
  const [currentAge, setCurrentAge] = useState(0) // current age
  const [showTooltip, setShowTooltip] = useState(false)
  const [showCurrentAmountTooltip, setShowCurrentAmountTooltip] = useState(false)

  // Calculate compound interest forecast
  const forecastData = useMemo(() => {
    const monthlyRate = localAnnualRate / 12
    const data: ForecastPoint[] = []
    let currentValue = localCurrentAmount // Starting with current amount
    let totalContributions = 0

    for (let year = 0; year <= timeHorizon; year++) {
      // For year 0, just show the current amount
      if (year === 0) {
        data.push({
          month: 0,
          year: 0,
          age: currentAge,
          value: Math.round(localCurrentAmount),
          currentAmount: Math.round(localCurrentAmount),
          contributions: 0,
          gains: 0
        })
        continue
      }

      // Calculate value at end of each year
      const monthsElapsed = year * 12
      let yearEndValue = currentValue
      let yearContributions = totalContributions

      // Apply monthly contributions and growth for this year
      for (let month = 1; month <= 12; month++) {
        yearEndValue += localMonthlyInvest // Add contribution first
        yearEndValue *= (1 + monthlyRate) // Then apply growth
        yearContributions += localMonthlyInvest
      }

      // Update current value for next year
      currentValue = yearEndValue
      totalContributions = yearContributions

      const gains = yearEndValue - localCurrentAmount - yearContributions

      data.push({
        month: monthsElapsed,
        year,
        age: currentAge + year,
        value: Math.round(yearEndValue),
        currentAmount: Math.round(localCurrentAmount),
        contributions: Math.round(yearContributions),
        gains: Math.round(gains)
      })
    }

    return data
  }, [localAnnualRate, localMonthlyInvest, localCurrentAmount, timeHorizon, currentAge])

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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}年後 ({data.age}歳)</p>
          <p className="text-sm text-green-600">
            総資産価値: {formatCurrency(data.value)}
          </p>
          <p className="text-sm" style={{ color: '#c084fc' }}>
            投資利益: {formatCurrency(data.gains)}
          </p>
          <p className="text-sm" style={{ color: '#60a5fa' }}>
            月次投資額累計: {formatCurrency(data.contributions)}
          </p>
          <p className="text-sm" style={{ color: '#3b82f6' }}>
            現状投資総資産: {formatCurrency(data.currentAmount)}
          </p>
        </div>
      )
    }
    return null
  }

  const finalValue = forecastData[forecastData.length - 1]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Top row - Current amount and age */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-1">
                現状投資総資産
                <div className="relative">
                  <span 
                    className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-200 text-gray-600 rounded-full cursor-help hover:bg-gray-300"
                    onMouseEnter={() => setShowCurrentAmountTooltip(true)}
                    onMouseLeave={() => setShowCurrentAmountTooltip(false)}
                  >
                    ?
                  </span>
                  {showCurrentAmountTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10">
                      現在既に保有している投資資産の総額です。<br/>
                      この金額も年次リターン率で成長し、最終的な資産価値に含まれます。
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  )}
                </div>
              </span>
            </label>
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">¥</span>
                <input
                  type="text"
                  value={localCurrentAmount.toLocaleString()}
                  onChange={(e) => {
                    let value = e.target.value
                    // 全角数字を半角数字に変換
                    value = value.replace(/[０-９]/g, (s) => 
                      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
                    )
                    const cleanValue = value.replace(/[^\d]/g, '')
                    const newAmount = parseInt(cleanValue) || 0
                    setLocalCurrentAmount(newAmount)
                    onSettingsChange?.(localAnnualRate, localMonthlyInvest, newAmount)
                  }}
                  className="w-full p-2 pl-6 border rounded-md text-center focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                既存の投資総資産額を入力
              </p>
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              現在の年齢
            </label>
            <div className="space-y-1">
              <input
                type="text"
                value={currentAge}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setCurrentAge(0)
                  } else {
                    // 全角数字を半角数字に変換
                    const halfWidthValue = value.replace(/[０-９]/g, (s) => 
                      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
                    )
                    const numValue = parseInt(halfWidthValue)
                    if (!isNaN(numValue) && numValue >= 0) {
                      setCurrentAge(numValue)
                    }
                  }
                }}
                className="w-full p-1.5 border rounded-md text-center focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="0"
              />
              <p className="text-xs text-center text-muted-foreground">
                年齢を入力
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row - Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="flex items-center gap-1">
                年次リターン率
                <div className="relative">
                  <span 
                    className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-200 text-gray-600 rounded-full cursor-help hover:bg-gray-300"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    ?
                  </span>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10">
                      年次リターン率とは、投資した資産が1年間でどのくらい成長するかを示す割合です。<br/>
                      例：5%なら100万円が1年後に105万円になる期待値です。
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  )}
                </div>
              </span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="0.20"
                step="0.01"
                value={localAnnualRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value)
                  setLocalAnnualRate(newRate)
                  onSettingsChange?.(newRate, localMonthlyInvest, localCurrentAmount)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-sm text-center text-muted-foreground">
                {(localAnnualRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              月次投資額
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={localMonthlyInvest}
                onChange={(e) => {
                  const newInvest = parseInt(e.target.value)
                  setLocalMonthlyInvest(newInvest)
                  onSettingsChange?.(localAnnualRate, newInvest, localCurrentAmount)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-sm text-center text-muted-foreground">
                {formatCurrency(localMonthlyInvest)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              投資期間
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-sm text-center text-muted-foreground">
                {timeHorizon} 年
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">最終資産価値</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(finalValue?.value || 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">総拠出額</p>
          <p className="text-xl font-bold" style={{ color: '#60a5fa' }}>
            {formatCurrency((finalValue?.contributions || 0) + localCurrentAmount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">投資利益</p>
          <p className="text-xl font-bold" style={{ color: '#c084fc' }}>
            {formatCurrency(finalValue?.gains || 0)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              tick={{
                fontSize: 11,
                textAnchor: 'middle'
              }}
              tickFormatter={(value) => `${value}年`}
              interval={0}
            />
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              axisLine={false}
              tickLine={false}
              orientation="bottom"
              tick={{
                fontSize: 11,
                textAnchor: 'middle',
                dy: 3
              }}
              tickFormatter={(value) => `${currentAge + value}歳`}
              interval={0}
              xAxisId="age"
            />
            <YAxis 
              tickFormatter={(value) => `¥${Math.round(value / 1000000).toFixed(0)}M`}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="currentAmount" 
              stackId="a"
              fill="#3b82f6" 
              name="現状投資総資産"
            />
            <Bar 
              dataKey="contributions" 
              stackId="a"
              fill="#60a5fa" 
              name="月次投資額累計"
            />
            <Bar 
              dataKey="gains" 
              stackId="a"
              fill="#c084fc" 
              name="投資利益"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}