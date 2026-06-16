import { CheckCircle, TrendingUp, DollarSign, PieChart } from 'lucide-react'
import { formatCurrency, formatROI, cn } from '@/lib/utils'
import type { KnapsackItem } from '@/lib/knapsack'

interface OptimizationResult {
  selected_ids: string[]
  total_cost: number
  total_return: number
  roi_percent: number
  budget_utilized_percent: number
}

interface ResultPanelProps {
  result: OptimizationResult | null
  allInvestments: KnapsackItem[]
  budget: number
  currency: string
  executionTime?: number
}

export default function ResultPanel({
  result,
  allInvestments,
  budget,
  currency,
  executionTime,
}: ResultPanelProps) {
  if (!result) {
    return (
      <div className="card-light flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mb-3">
          <TrendingUp size={24} className="text-gold" />
        </div>
        <p className="text-text-dark font-semibold">Run optimization to see results</p>
        <p className="text-gray-mid text-sm mt-1">Click "Optimize Now" to start</p>
      </div>
    )
  }

  const selectedItems = result.selected_ids
    .map((id) => allInvestments.find((inv) => inv.id === id)!)
    .filter(Boolean)

  const unspent = budget - result.total_cost
  const utilizedPct = Math.min(result.budget_utilized_percent, 100)

  return (
    <div className="space-y-4">
      {/* ROI Badge */}
      <div className="card-light text-center">
        <p className="text-gray-mid text-sm font-medium">Optimal ROI</p>
        <p
          className="font-mono font-bold mt-1"
          style={{
            fontSize: '52px',
            lineHeight: 1.1,
            color: result.roi_percent >= 0 ? '#16A34A' : '#DC2626',
          }}
        >
          {formatROI(result.roi_percent)}
        </p>
        {executionTime !== undefined && (
          <p className="text-gray-mid text-xs mt-1">Computed in {executionTime}ms</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-light">
          <p className="text-gray-mid text-xs">Total Return</p>
          <p className="text-text-dark font-bold text-base mt-0.5 font-mono">
            {formatCurrency(result.total_return, currency, true)}
          </p>
        </div>
        <div className="card-light">
          <p className="text-gray-mid text-xs">Invested</p>
          <p className="text-text-dark font-bold text-base mt-0.5 font-mono">
            {formatCurrency(result.total_cost, currency, true)}
          </p>
        </div>
      </div>

      {/* Budget utilization */}
      <div className="card-light">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-mid text-xs font-medium">Budget Utilized</p>
          <p className="text-text-dark text-xs font-semibold">
            {utilizedPct.toFixed(1)}%
          </p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-700"
            style={{ width: `${utilizedPct}%` }}
          />
        </div>
        <p className="text-gray-mid text-xs mt-2">
          Unspent: {formatCurrency(unspent, currency, true)}
        </p>
      </div>

      {/* Selected investments */}
      <div className="card-light">
        <h4 className="text-text-dark font-semibold text-sm mb-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-success" />
          Selected Investments ({selectedItems.length})
        </h4>
        <div className="space-y-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-t border-gray-100 first:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-text-dark text-sm font-medium truncate">{item.name}</p>
                <p className="text-gray-mid text-xs">
                  Cost: {formatCurrency(item.cost, currency, true)}
                </p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <p className="text-success text-sm font-semibold">
                  +{formatCurrency(item.expected_return, currency, true)}
                </p>
                <p className="text-gray-mid text-xs">
                  {(((item.expected_return - item.cost) / item.cost) * 100).toFixed(1)}% ROI
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
