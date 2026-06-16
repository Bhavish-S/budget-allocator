import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Settings2 } from 'lucide-react'
import { usePortfolio } from '@/hooks/usePortfolios'
import { useInvestments } from '@/hooks/useInvestments'
import { useOptimizer } from '@/hooks/useOptimizer'
import OptimizeButton from '@/components/optimizer/OptimizeButton'
import ResultPanel from '@/components/optimizer/ResultPanel'
import DPHeatmap from '@/components/optimizer/DPHeatmap'
import ComparisonPanel from '@/components/optimizer/ComparisonPanel'
import SensitivitySlider from '@/components/optimizer/SensitivitySlider'
import { formatCurrency } from '@/lib/utils'
import type { KnapsackItem } from '@/lib/knapsack'

const UNIT_SIZES = [1000, 5000, 10000, 50000, 100000]

export default function Optimizer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: portfolio } = usePortfolio(id)
  const { data: rawInvestments = [], isLoading: invLoading } = useInvestments(id)
  const { optimize, isOptimizing, result } = useOptimizer()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [budget, setBudget] = useState<number>(0)
  const [unitSize, setUnitSize] = useState<number>(1000)
  const [algorithm, setAlgorithm] = useState<'dp' | 'greedy'>('dp')

  // Initialize budget from portfolio
  useMemo(() => {
    if (portfolio && budget === 0) {
      setBudget(portfolio.budget)
    }
  }, [portfolio, budget])

  // Initialize selected IDs from investments
  useMemo(() => {
    if (rawInvestments.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(rawInvestments.map((inv) => inv.id)))
    }
  }, [rawInvestments, selectedIds.size])

  const toggleInvestment = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectedInvestments: KnapsackItem[] = useMemo(() =>
    rawInvestments
      .filter((inv) => selectedIds.has(inv.id))
      .map((inv) => ({
        id: inv.id,
        name: inv.name,
        cost: inv.cost,
        expected_return: inv.expected_return,
        risk_level: inv.risk_level,
      })),
    [rawInvestments, selectedIds]
  )

  const handleOptimize = () => {
    if (!portfolio || selectedInvestments.length === 0) return
    optimize.mutate({
      portfolioId: portfolio.id,
      budget,
      investments: selectedInvestments,
      unitSize,
    })
  }

  const handleExportCSV = () => {
    if (!result?.dp_result) return
    const rows = result.dp_result.selected_ids
      .map((sid: string) => rawInvestments.find((inv) => inv.id === sid))
      .filter(Boolean)
    const csv = [
      'Name,Cost,Expected Return,ROI%',
      ...rows.map((inv: any) => {
        if (!inv) return ''
        const roi = inv.cost > 0 ? ((inv.expected_return - inv.cost) / inv.cost) * 100 : 0
        return `"${inv.name}",${inv.cost},${inv.expected_return},${roi.toFixed(2)}`
      }),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${portfolio?.name ?? 'portfolio'}_optimization.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const investmentNames = rawInvestments.map((inv) => inv.name)

  if (invLoading || !portfolio) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-white rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(`/app/portfolios/${id}`)}
        className="flex items-center gap-2 text-gray-mid hover:text-text-dark text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to {portfolio.name}
      </button>

      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Optimizer</h1>
          <p className="page-subtitle">
            0/1 Knapsack DP — Budget: {formatCurrency(portfolio.budget, portfolio.currency, true)}
          </p>
        </div>
        {result && (
          <div className="flex gap-2">
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="btn-ghost border border-gray-200 text-text-dark text-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* 3-column optimizer layout */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Investment checklist */}
        <div className="card-light">
          <h2 className="font-semibold text-text-dark mb-4">
            Investments
            <span className="text-gray-mid font-normal text-sm ml-2">
              ({selectedIds.size}/{rawInvestments.length} selected)
            </span>
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {rawInvestments.map((inv) => {
              const checked = selectedIds.has(inv.id)
              return (
                <label
                  key={inv.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                    checked
                      ? 'bg-primary-light border-primary/30'
                      : 'bg-gray-50 border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInvestment(inv.id)}
                    className="accent-primary w-4 h-4 flex-shrink-0"
                    id={`check-inv-${inv.id}`}
                    aria-label={`Include ${inv.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-dark text-sm font-medium truncate">{inv.name}</p>
                    <p className="text-gray-mid text-xs">
                      Cost: {formatCurrency(inv.cost, portfolio.currency, true)} |
                      Return: {formatCurrency(inv.expected_return, portfolio.currency, true)}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>

          {rawInvestments.length === 0 && (
            <p className="text-gray-mid text-sm text-center py-8">
              No investments in this portfolio.
            </p>
          )}
        </div>

        {/* Center: Controls */}
        <div className="card-light space-y-5">
          <h2 className="font-semibold text-text-dark flex items-center gap-2">
            <Settings2 size={18} className="text-gray-mid" />
            Optimizer Settings
          </h2>

          <div>
            <label className="label" htmlFor="optimizer-budget">
              Budget
            </label>
            <input
              id="optimizer-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              step={unitSize}
              min={unitSize}
              className="input-field font-mono"
            />
            <p className="text-gray-mid text-xs mt-1">
              Original: {formatCurrency(portfolio.budget, portfolio.currency, true)}
            </p>
          </div>

          <div>
            <label className="label" htmlFor="optimizer-unit-size">
              Unit Size (DP granularity)
            </label>
            <select
              id="optimizer-unit-size"
              value={unitSize}
              onChange={(e) => setUnitSize(Number(e.target.value))}
              className="input-field"
            >
              {UNIT_SIZES.map((u) => (
                <option key={u} value={u}>
                  {formatCurrency(u, portfolio.currency, false)} per unit
                </option>
              ))}
            </select>
            <p className="text-gray-mid text-xs mt-1">
              Budget units: {Math.floor(budget / unitSize)} | Smaller = more precise, slower
            </p>
          </div>

          <div>
            <label className="label" htmlFor="optimizer-algorithm">
              Algorithm
            </label>
            <select
              id="optimizer-algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as 'dp' | 'greedy')}
              className="input-field"
            >
              <option value="dp">0/1 Knapsack DP (Optimal)</option>
              <option value="greedy">Greedy by ROI% (Approximation)</option>
            </select>
          </div>

          {/* Optimize button */}
          <OptimizeButton
            onClick={handleOptimize}
            isLoading={isOptimizing}
            disabled={selectedInvestments.length === 0 || budget <= 0}
          />

          {selectedInvestments.length === 0 && (
            <p className="text-danger text-xs text-center">
              Select at least one investment to optimize.
            </p>
          )}
        </div>

        {/* Right: Results */}
        <div>
          <h2 className="font-semibold text-text-dark mb-4">Results</h2>
          <ResultPanel
            result={result?.dp_result ?? null}
            allInvestments={selectedInvestments}
            budget={budget}
            currency={portfolio.currency}
            executionTime={result?.execution_time_ms}
          />
        </div>
      </div>

      {/* DP Heatmap */}
      {result?.dp_snapshot && (
        <div className="card-light">
          <DPHeatmap
            dpSnapshot={result.dp_snapshot as number[][]}
            investmentNames={investmentNames}
            unitSize={unitSize}
            budget={budget}
          />

          {/* Comparison panel */}
          <ComparisonPanel
            dpResult={result.dp_result}
            greedyResult={result.greedy_result}
            allInvestments={selectedInvestments}
            currency={portfolio.currency}
          />
        </div>
      )}

      {/* Sensitivity analysis — only show after first run */}
      {result && selectedInvestments.length > 0 && (
        <div className="card-light mt-6">
          <SensitivitySlider
            baseBudget={portfolio.budget}
            investments={selectedInvestments}
            unitSize={unitSize}
            currency={portfolio.currency}
          />
        </div>
      )}
    </div>
  )
}
