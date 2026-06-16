import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, DollarSign, TrendingUp, Activity, Plus, Zap, ArrowRight } from 'lucide-react'
import { usePortfolios, useCreatePortfolio } from '@/hooks/usePortfolios'
import { useOptimizationRuns } from '@/hooks/useOptimizer'
import { useAuth } from '@/hooks/useAuth'
import StatCard from '@/components/shared/StatCard'
import EmptyState from '@/components/shared/EmptyState'
import PortfolioForm from '@/components/portfolio/PortfolioForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Portfolio } from '@/lib/database.types'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: portfolios = [], isLoading: portfoliosLoading } = usePortfolios()
  const { data: runs = [], isLoading: runsLoading } = useOptimizationRuns()
  const createPortfolio = useCreatePortfolio()
  const [formOpen, setFormOpen] = useState(false)

  const totalBudget = portfolios.reduce((sum, p) => sum + p.budget, 0)
  const bestROI = runs.length > 0 ? Math.max(...runs.map((r) => r.roi_percent)) : 0
  const thisMonth = runs.filter((r) => {
    const d = new Date(r.run_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Good morning, {firstName} 👋</h1>
          <p className="page-subtitle">Here's your portfolio overview</p>
        </div>
        <button
          id="dashboard-new-portfolio-btn"
          onClick={() => setFormOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          New Portfolio
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Portfolios"
          value={portfoliosLoading ? '—' : portfolios.length.toString()}
          icon={Briefcase}
          loading={portfoliosLoading}
        />
        <StatCard
          title="Total Budget"
          value={portfoliosLoading ? '—' : formatCurrency(totalBudget, 'INR', true)}
          icon={DollarSign}
          iconColor="#2D5EA8"
          loading={portfoliosLoading}
        />
        <StatCard
          title="Best ROI Achieved"
          value={runsLoading ? '—' : `${bestROI.toFixed(1)}%`}
          icon={TrendingUp}
          iconColor="#16A34A"
          trend={bestROI > 0 ? { value: 'vs last month', positive: true } : undefined}
          loading={runsLoading}
        />
        <StatCard
          title="Optimizations This Month"
          value={runsLoading ? '—' : thisMonth.toString()}
          icon={Activity}
          iconColor="#C9A84C"
          loading={runsLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent portfolios */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-dark font-semibold">Recent Portfolios</h2>
            <button
              onClick={() => navigate('/app/portfolios')}
              className="text-blue-mid text-sm hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {portfoliosLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No portfolios yet"
              description="Create your first portfolio to start optimizing your investments."
              action={{ label: 'Create Portfolio', onClick: () => setFormOpen(true) }}
            />
          ) : (
            <div className="space-y-3">
              {portfolios.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-dark font-semibold truncate">{p.name}</p>
                    <p className="text-gray-mid text-xs">
                      {formatCurrency(p.budget, p.currency, true)} budget
                    </p>
                  </div>
                  <button
                    id={`dashboard-optimize-${p.id}`}
                    onClick={() => navigate(`/app/portfolios/${p.id}/optimize`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-navy text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                  >
                    <Zap size={14} /> Optimize
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent runs */}
        <div>
          <h2 className="text-text-dark font-semibold mb-4">Recent Optimization Runs</h2>
          {runsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-white rounded-lg animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="card-light text-center py-8">
              <Activity size={24} className="text-gray-mid mx-auto mb-2" />
              <p className="text-gray-mid text-sm">No optimizations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 8).map((run) => (
                <div
                  key={run.id}
                  onClick={() => navigate(`/app/portfolios/${run.portfolio_id}/optimize`)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-text-dark text-sm font-medium truncate flex-1">
                      {(run as { portfolios?: { name: string } }).portfolios?.name || 'Portfolio'}
                    </p>
                    <span className={`text-sm font-semibold ml-2 ${
                      run.roi_percent >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {run.roi_percent >= 0 ? '+' : ''}{run.roi_percent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-mid text-xs mt-0.5">
                    {formatDate(run.run_at).split(',')[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PortfolioForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => {
          createPortfolio.mutate(data)
          setFormOpen(false)
        }}
        isLoading={createPortfolio.isPending}
      />
    </div>
  )
}
