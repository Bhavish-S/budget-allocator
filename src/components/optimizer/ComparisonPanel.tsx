import { Trophy, TrendingUp, ArrowRight } from 'lucide-react'
import { formatCurrency, formatROI } from '@/lib/utils'
import type { KnapsackItem } from '@/lib/knapsack'

interface ComparisonPanelProps {
  dpResult: {
    selected_ids: string[]
    total_cost: number
    total_return: number
    roi_percent: number
  } | null
  greedyResult: {
    selectedIds: string[]
    totalReturn: number
    totalCost: number
    roiPercent: number
  } | null
  allInvestments: KnapsackItem[]
  currency: string
}

export default function ComparisonPanel({
  dpResult,
  greedyResult,
  allInvestments,
  currency,
}: ComparisonPanelProps) {
  if (!dpResult || !greedyResult) return null

  const dpBetter = dpResult.total_return - greedyResult.totalReturn
  const dpBetterPct = greedyResult.totalReturn > 0
    ? (dpBetter / greedyResult.totalReturn) * 100
    : 0

  const getNames = (ids: string[]) =>
    ids
      .map((id) => allInvestments.find((inv) => inv.id === id)?.name || id)
      .slice(0, 3)
      .join(', ') + (ids.length > 3 ? ` +${ids.length - 3}` : '')

  return (
    <div className="mt-6">
      <h3 className="text-text-dark font-semibold text-base mb-4">
        Algorithm Comparison
      </h3>

      {/* Improvement callout */}
      {dpBetter > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-4 flex items-center gap-3">
          <Trophy size={20} className="text-success flex-shrink-0" />
          <div>
            <p className="text-success font-semibold text-sm">
              DP outperforms Greedy by {formatCurrency(dpBetter, currency, true)}
            </p>
            <p className="text-success/70 text-xs">
              {dpBetterPct.toFixed(2)}% more return with optimal selection
            </p>
          </div>
        </div>
      )}

      {dpBetter === 0 && (
        <div className="bg-blue-mid/10 border border-blue-mid/20 rounded-xl p-3 mb-4">
          <p className="text-blue-mid text-sm">
            Both algorithms found the same optimal solution.
          </p>
        </div>
      )}

      {/* Side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* DP column */}
        <div className="card-light border-2 border-gold/40">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gold rounded-md flex items-center justify-center">
              <Trophy size={12} className="text-navy" />
            </div>
            <p className="font-semibold text-text-dark text-sm">0/1 Knapsack DP</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-mid text-xs">Total Return</p>
              <p className="text-text-dark font-bold font-mono">
                {formatCurrency(dpResult.total_return, currency, true)}
              </p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">ROI</p>
              <p className="font-bold text-success">{formatROI(dpResult.roi_percent)}</p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">Budget Used</p>
              <p className="text-text-dark font-mono text-sm">{formatCurrency(dpResult.total_cost, currency, true)}</p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">Selected</p>
              <p className="text-text-dark text-xs truncate">{getNames(dpResult.selected_ids)}</p>
            </div>
          </div>
        </div>

        {/* Greedy column */}
        <div className="card-light opacity-80">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
              <TrendingUp size={12} className="text-gray-mid" />
            </div>
            <p className="font-semibold text-gray-mid text-sm">Greedy (ROI%)</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-mid text-xs">Total Return</p>
              <p className="text-text-dark font-bold font-mono">
                {formatCurrency(greedyResult.totalReturn, currency, true)}
              </p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">ROI</p>
              <p className="font-bold text-gray-mid">{formatROI(greedyResult.roiPercent)}</p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">Budget Used</p>
              <p className="text-text-dark font-mono text-sm">{formatCurrency(greedyResult.totalCost, currency, true)}</p>
            </div>
            <div>
              <p className="text-gray-mid text-xs">Selected</p>
              <p className="text-text-dark text-xs truncate">{getNames(greedyResult.selectedIds)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
