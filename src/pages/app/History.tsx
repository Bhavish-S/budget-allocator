import { useState } from 'react'
import { History as HistoryIcon, Eye, X } from 'lucide-react'
import { useOptimizationRuns } from '@/hooks/useOptimizer'
import { usePortfolios } from '@/hooks/usePortfolios'
import EmptyState from '@/components/shared/EmptyState'
import DPHeatmap from '@/components/optimizer/DPHeatmap'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { OptimizationRun } from '@/lib/database.types'

export default function History() {
  const { data: runs = [], isLoading } = useOptimizationRuns()
  const { data: portfolios = [] } = usePortfolios()
  const [selectedRun, setSelectedRun] = useState<OptimizationRun | null>(null)
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all')

  const filtered = filterPortfolio === 'all'
    ? runs
    : runs.filter((r) => r.portfolio_id === filterPortfolio)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Optimization History</h1>
          <p className="page-subtitle">{runs.length} total runs</p>
        </div>
        <select
          id="history-portfolio-filter"
          value={filterPortfolio}
          onChange={(e) => setFilterPortfolio(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Portfolios</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No optimization runs yet"
          description="Run optimizations on your portfolios to see history here."
        />
      ) : (
        <div className="table-container">
          <table className="table-base">
            <thead className="table-header">
              <tr>
                <th>Date</th>
                <th>Portfolio</th>
                <th>Budget</th>
                <th>Optimal Return</th>
                <th>ROI%</th>
                <th>Time (ms)</th>
                <th>Algorithm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((run) => (
                <tr key={run.id} className="table-row">
                  <td className="text-xs text-gray-mid">{formatDate(run.run_at)}</td>
                  <td className="font-medium">
                    {(run as { portfolios?: { name: string; currency: string } }).portfolios?.name || 'Portfolio'}
                  </td>
                  <td className="font-mono text-sm">{formatCurrency(run.total_budget, 'INR', true)}</td>
                  <td className="font-mono text-sm text-success">{formatCurrency(run.total_return, 'INR', true)}</td>
                  <td>
                    <span className={`font-semibold ${
                      run.roi_percent >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {run.roi_percent >= 0 ? '+' : ''}{run.roi_percent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-gray-mid font-mono text-sm">{run.execution_time_ms ?? '-'}ms</td>
                  <td>
                    <span className="badge bg-gold/10 text-gold">{run.algorithm_variant}</span>
                  </td>
                  <td>
                    <button
                      id={`view-run-${run.id}`}
                      onClick={() => setSelectedRun(run)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-mid hover:text-text-dark transition-colors"
                      aria-label="View run details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Run detail modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-semibold text-text-dark">Run Details</h2>
              <button onClick={() => setSelectedRun(null)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
                <X size={18} className="text-gray-mid" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card-light">
                  <p className="text-gray-mid text-xs">Budget</p>
                  <p className="font-bold font-mono">{formatCurrency(selectedRun.total_budget, 'INR', true)}</p>
                </div>
                <div className="card-light">
                  <p className="text-gray-mid text-xs">Total Return</p>
                  <p className="font-bold font-mono text-success">{formatCurrency(selectedRun.total_return, 'INR', true)}</p>
                </div>
                <div className="card-light">
                  <p className="text-gray-mid text-xs">ROI</p>
                  <p className="font-bold text-success">{selectedRun.roi_percent.toFixed(2)}%</p>
                </div>
                <div className="card-light">
                  <p className="text-gray-mid text-xs">Execution Time</p>
                  <p className="font-bold font-mono">{selectedRun.execution_time_ms}ms</p>
                </div>
              </div>

              {selectedRun.dp_table_snapshot && (
                <DPHeatmap
                  dpSnapshot={selectedRun.dp_table_snapshot as number[][]}
                  investmentNames={[]}
                  unitSize={1000}
                  budget={selectedRun.total_budget}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
