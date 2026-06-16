import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { knapsack01 } from '@/lib/knapsack'
import { formatCurrency } from '@/lib/utils'
import type { KnapsackItem } from '@/lib/knapsack'

interface SensitivitySliderProps {
  baseBudget: number
  investments: KnapsackItem[]
  unitSize: number
  currency: string
}

export default function SensitivitySlider({
  baseBudget,
  investments,
  unitSize,
  currency,
}: SensitivitySliderProps) {
  const [budgetPct, setBudgetPct] = useState(100)

  const chartData = useMemo(() => {
    const points = [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200]
    return points.map((pct) => {
      const budget = baseBudget * (pct / 100)
      const result = knapsack01(investments, budget, unitSize)
      return {
        budget: pct,
        roi: parseFloat(result.roiPercent.toFixed(2)),
        return: result.totalReturn,
      }
    })
  }, [baseBudget, investments, unitSize])

  const currentBudget = baseBudget * (budgetPct / 100)
  const currentResult = useMemo(
    () => knapsack01(investments, currentBudget, unitSize),
    [investments, currentBudget, unitSize]
  )

  return (
    <div className="mt-6">
      <h3 className="text-text-dark font-semibold text-base mb-2">Sensitivity Analysis</h3>
      <p className="text-gray-mid text-xs mb-4">
        Adjust budget to see how ROI changes — helps find the sweet spot.
      </p>

      {/* Slider */}
      <div className="card-light mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-dark" htmlFor="budget-sensitivity-slider">
            Budget: {formatCurrency(currentBudget, currency, true)} ({budgetPct}%)
          </label>
          <span className="text-success font-semibold text-sm">
            ROI: {currentResult.roiPercent.toFixed(2)}%
          </span>
        </div>
        <input
          id="budget-sensitivity-slider"
          type="range"
          min={50}
          max={200}
          value={budgetPct}
          onChange={(e) => setBudgetPct(Number(e.target.value))}
          className="w-full accent-gold cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-mid mt-1">
          <span>50%</span>
          <span>100% (original)</span>
          <span>200%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="card-light">
        <p className="text-gray-mid text-xs mb-3">ROI% vs Budget Allocation</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="budget"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#8A9BB5' }}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#8A9BB5' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'ROI']}
              labelFormatter={(label) => `Budget: ${label}%`}
              contentStyle={{
                background: '#1B3A6B',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="roi"
              stroke="#C9A84C"
              strokeWidth={2}
              dot={{ fill: '#C9A84C', r: 4 }}
              activeDot={{ r: 6, fill: '#E8D5A3' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
