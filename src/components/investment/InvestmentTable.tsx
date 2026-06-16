import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import type { Investment, Category } from '@/lib/database.types'
import { formatCurrency } from '@/lib/utils'
import RiskBadge from '@/components/shared/RiskBadge'

type InvestmentWithCategory = Investment & { categories: Category | null }

interface InvestmentTableProps {
  investments: InvestmentWithCategory[]
  currency: string
  onEdit: (investment: Investment) => void
  onDelete: (id: string) => void
  loading?: boolean
}

export default function InvestmentTable({
  investments,
  currency,
  onEdit,
  onDelete,
  loading,
}: InvestmentTableProps) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="p-8 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table-base">
        <thead className="table-header">
          <tr>
            <th>Investment</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Return</th>
            <th>ROI%</th>
            <th>Risk</th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => {
            const roi = inv.cost > 0
              ? ((inv.expected_return - inv.cost) / inv.cost) * 100
              : 0
            return (
              <tr key={inv.id} className="table-row">
                <td>
                  <div>
                    <p className="font-medium text-text-dark">{inv.name}</p>
                    {inv.description && (
                      <p className="text-gray-mid text-xs truncate max-w-48">{inv.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  {inv.categories && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${inv.categories.color}20`,
                        color: inv.categories.color,
                      }}
                    >
                      {inv.categories.name}
                    </span>
                  )}
                </td>
                <td className="font-mono text-sm">{formatCurrency(inv.cost, currency, true)}</td>
                <td className="font-mono text-sm text-success">{formatCurrency(inv.expected_return, currency, true)}</td>
                <td>
                  <span className={`font-semibold text-sm ${
                    roi >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <RiskBadge level={inv.risk_level} showLabel />
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-inv-${inv.id}`}
                      onClick={() => onEdit(inv)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-mid hover:text-text-dark transition-colors"
                      aria-label="Edit investment"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      id={`delete-inv-${inv.id}`}
                      onClick={() => onDelete(inv.id)}
                      className="p-1.5 rounded hover:bg-danger/10 text-gray-mid hover:text-danger transition-colors"
                      aria-label="Delete investment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
