import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Zap, Plus, Upload, ArrowLeft, Edit2, Trash2, Share2, TrendingUp, DollarSign, BarChart2, Star } from 'lucide-react'
import { usePortfolio, useUpdatePortfolio, useDeletePortfolio } from '@/hooks/usePortfolios'
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment } from '@/hooks/useInvestments'
import InvestmentTable from '@/components/investment/InvestmentTable'
import InvestmentForm from '@/components/investment/InvestmentForm'
import CSVImport from '@/components/investment/CSVImport'
import PortfolioForm from '@/components/portfolio/PortfolioForm'
import StatCard from '@/components/shared/StatCard'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils'
import type { Investment } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(id)
  const { data: investments = [], isLoading: invLoading } = useInvestments(id)
  const updatePortfolio = useUpdatePortfolio()
  const deletePortfolio = useDeletePortfolio()
  const createInvestment = useCreateInvestment()
  const updateInvestment = useUpdateInvestment()
  const deleteInvestment = useDeleteInvestment()

  const [invFormOpen, setInvFormOpen] = useState(false)
  const [editingInv, setEditingInv] = useState<Investment | null>(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const [editPortfolioOpen, setEditPortfolioOpen] = useState(false)

  if (portfolioLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-32 bg-white rounded-xl animate-pulse mb-6" />
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-mid">Portfolio not found.</p>
      </div>
    )
  }

  const totalCost = investments.reduce((s, i) => s + i.cost, 0)
  const totalReturn = investments.reduce((s, i) => s + i.expected_return, 0)
  const avgROI = totalCost > 0 ? ((totalReturn - totalCost) / totalCost) * 100 : 0
  const highestROI = investments.reduce((best, inv) => {
    const roi = inv.cost > 0 ? ((inv.expected_return - inv.cost) / inv.cost) * 100 : 0
    return roi > best ? roi : best
  }, 0)
  const utilization = portfolio.budget > 0 ? (totalCost / portfolio.budget) * 100 : 0

  const handleShare = async () => {
    const token = crypto.randomUUID().replace(/-/g, '')
    const { error } = await supabase
      .from('shared_portfolios')
      .insert({ portfolio_id: portfolio.id, user_id: portfolio.user_id, share_token: token })
    if (error) toast.error('Failed to create share link')
    else {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
      toast.success('Share link copied!')
    }
  }

  const handleCSVImport = async (rows: Array<{ name: string; cost: number; expected_return: number; category_id?: string | null; risk_level: number }>) => {
    for (const row of rows) {
      await createInvestment.mutateAsync({
        ...row,
        portfolio_id: portfolio.id,
        description: null,
        category_id: row.category_id || null,
      })
    }
    setCsvOpen(false)
    toast.success(`Imported ${rows.length} investments!`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/app/portfolios')}
        className="flex items-center gap-2 text-gray-mid hover:text-text-dark text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Portfolios
      </button>

      {/* Portfolio header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-gray-mid text-sm mt-1">{portfolio.description}</p>
            )}
            <p className="text-3xl font-bold font-mono text-text-dark mt-2">
              {formatCurrency(portfolio.budget, portfolio.currency, true)}
              <span className="text-sm font-normal text-gray-mid ml-2">{portfolio.currency} budget</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditPortfolioOpen(true)} className="btn-ghost border border-gray-200 text-text-dark text-sm"><Edit2 size={14} /> Edit</button>
            <button onClick={handleShare} className="btn-ghost border border-gray-200 text-text-dark text-sm"><Share2 size={14} /> Share</button>
            <button
              id="portfolio-detail-optimize"
              onClick={() => navigate(`/app/portfolios/${portfolio.id}/optimize`)}
              className="btn-primary"
            >
              <Zap size={16} /> Optimize
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Cost" value={formatCurrency(totalCost, portfolio.currency, true)} icon={DollarSign} />
        <StatCard title="Budget Used" value={`${utilization.toFixed(1)}%`} icon={BarChart2} iconColor="#0EA5E9" />
        <StatCard title="Avg Expected ROI" value={`${avgROI.toFixed(1)}%`} icon={TrendingUp} iconColor="#10B981" />
        <StatCard title="Best Single ROI" value={`${highestROI.toFixed(1)}%`} icon={Star} iconColor="#F59E0B" />
      </div>

      {/* Investments table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-text-dark">
            Investments ({investments.length})
          </h2>
          <div className="flex gap-2">
            <button
              id="import-csv-btn"
              onClick={() => setCsvOpen(true)}
              className="btn-ghost border border-gray-200 text-text-dark text-sm"
            >
              <Upload size={14} /> Import CSV
            </button>
            <button
              id="add-investment-btn"
              onClick={() => { setEditingInv(null); setInvFormOpen(true) }}
              className="btn-primary text-sm"
            >
              <Plus size={14} /> Add Investment
            </button>
          </div>
        </div>

        {investments.length === 0 && !invLoading ? (
          <EmptyState
            icon={TrendingUp}
            title="No investments yet"
            description="Add investments to this portfolio to start optimizing."
            action={{ label: 'Add First Investment', onClick: () => setInvFormOpen(true) }}
          />
        ) : (
          <InvestmentTable
            investments={investments as Parameters<typeof InvestmentTable>[0]['investments']}
            currency={portfolio.currency}
            onEdit={(inv) => { setEditingInv(inv); setInvFormOpen(true) }}
            onDelete={(id) => deleteInvestment.mutate({ id, portfolioId: portfolio.id })}
            loading={invLoading}
          />
        )}
      </div>

      {/* Modals / Drawers */}
      <InvestmentForm
        open={invFormOpen}
        onClose={() => { setInvFormOpen(false); setEditingInv(null) }}
        onSubmit={(data) => {
          if (editingInv) {
            updateInvestment.mutate({ id: editingInv.id, ...data })
          } else {
            createInvestment.mutate(data)
          }
          setInvFormOpen(false)
          setEditingInv(null)
        }}
        isLoading={createInvestment.isPending || updateInvestment.isPending}
        portfolioId={portfolio.id}
        initialData={editingInv}
      />

      {csvOpen && (
        <CSVImport
          onImport={handleCSVImport}
          onClose={() => setCsvOpen(false)}
          isLoading={createInvestment.isPending}
        />
      )}

      <PortfolioForm
        open={editPortfolioOpen}
        onClose={() => setEditPortfolioOpen(false)}
        onSubmit={(data) => {
          updatePortfolio.mutate({ id: portfolio.id, ...data })
          setEditPortfolioOpen(false)
        }}
        isLoading={updatePortfolio.isPending}
        initialData={portfolio}
      />
    </div>
  )
}
