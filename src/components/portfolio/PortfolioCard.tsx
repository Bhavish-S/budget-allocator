import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Eye,
  Zap,
} from 'lucide-react'
import type { Portfolio } from '@/lib/database.types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PortfolioCardProps {
  portfolio: Portfolio & {
    investment_count?: number
    best_roi?: number
    last_run?: string
  }
  onEdit: (portfolio: Portfolio) => void
  onDelete: (id: string) => void
  onShare: (id: string) => void
}

export default function PortfolioCard({
  portfolio,
  onEdit,
  onDelete,
  onShare,
}: PortfolioCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleOptimize = () => {
    navigate(`/app/portfolios/${portfolio.id}/optimize`)
  }

  const handleView = () => {
    navigate(`/app/portfolios/${portfolio.id}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase size={18} className="text-gold" />
          </div>
          <div className="min-w-0">
            <h3 className="text-text-dark font-semibold truncate">{portfolio.name}</h3>
            <p className="text-gray-mid text-xs truncate">{portfolio.description || 'No description'}</p>
          </div>
        </div>

        {/* Three-dot menu */}
        <div className="relative flex-shrink-0">
          <button
            id={`portfolio-menu-${portfolio.id}`}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-mid hover:text-text-dark"
            aria-label="Portfolio options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { onEdit(portfolio); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-gray-50"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { onShare(portfolio.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-gray-50"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={() => { onDelete(portfolio.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4">
        <p className="text-gray-mid text-xs">Budget</p>
        <p className="text-text-dark text-2xl font-bold font-mono">
          {formatCurrency(portfolio.budget, portfolio.currency, true)}
        </p>
        <p className="text-gray-mid text-xs">{portfolio.currency}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-mid text-xs">Investments</p>
          <p className="text-text-dark font-semibold">{portfolio.investment_count ?? 0}</p>
        </div>
        {portfolio.best_roi !== undefined && (
          <div>
            <p className="text-gray-mid text-xs">Best ROI</p>
            <p className="text-success font-semibold">
              {portfolio.best_roi > 0 ? '+' : ''}{portfolio.best_roi.toFixed(1)}%
            </p>
          </div>
        )}
        {portfolio.last_run && (
          <div className="ml-auto">
            <p className="text-gray-mid text-xs">Last run</p>
            <p className="text-gray-mid text-xs">{formatDate(portfolio.last_run).split(',')[0]}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          id={`view-portfolio-${portfolio.id}`}
          onClick={handleView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-text-dark text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye size={14} />
          View
        </button>
        <button
          id={`optimize-portfolio-${portfolio.id}`}
          onClick={handleOptimize}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gold text-navy text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <Zap size={14} />
          Optimize
        </button>
      </div>
    </div>
  )
}
