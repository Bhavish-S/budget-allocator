import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { TrendingUp, Lock, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface SharedData {
  portfolio: {
    id: string
    name: string
    description: string | null
    budget: number
    currency: string
  }
  run: {
    total_return: number
    total_cost: number
    roi_percent: number
    run_at: string
    selected_investment_ids: string[]
  } | null
  investments: Array<{
    id: string
    name: string
    cost: number
    expected_return: number
  }>
}

export default function SharedPortfolio() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!token) return

      // Find the share record
      const { data: share, error: shareError } = await supabase
        .from('shared_portfolios')
        .select('*')
        .eq('share_token', token)
        .single()

      if (shareError || !share) {
        setError('This share link is invalid or has expired.')
        setLoading(false)
        return
      }

      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        setError('This share link has expired.')
        setLoading(false)
        return
      }

      // Fetch portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id, name, description, budget, currency')
        .eq('id', share.portfolio_id)
        .single()

      // Fetch latest optimization run
      const { data: runs } = await supabase
        .from('optimization_runs')
        .select('total_return, total_cost, roi_percent, run_at, selected_investment_ids')
        .eq('portfolio_id', share.portfolio_id)
        .order('run_at', { ascending: false })
        .limit(1)

      // Fetch investments
      const { data: investments } = await supabase
        .from('investments')
        .select('id, name, cost, expected_return')
        .eq('portfolio_id', share.portfolio_id)

      setData({
        portfolio: portfolio!,
        run: runs?.[0] || null,
        investments: investments || [],
      })
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Lock size={40} className="text-primary mx-auto mb-4" />
          <h1 className="text-text-dark text-2xl font-bold mb-2">Link Unavailable</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <Link to="/" className="btn-primary">Go to Budget Allocator</Link>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { portfolio, run, investments } = data
  const selectedInvestments = run
    ? investments.filter((inv) => run.selected_investment_ids.includes(inv.id))
    : []

  return (
    <div className="min-h-screen bg-gray-soft">
      {/* CTA Banner */}
      <div className="bg-primary-dark text-center py-3 px-4">
        <p className="text-primary-light text-sm">
          Viewing a shared portfolio —{' '}
          <Link to="/signup" className="text-white font-semibold hover:underline">
            Sign up free to create your own
          </Link>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-text-dark font-bold text-xl tracking-tight">Budget Allocator</span>
        </Link>

        {/* Portfolio header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-text-dark">{portfolio.name}</h1>
          {portfolio.description && <p className="text-gray-mid mt-1">{portfolio.description}</p>}
          <p className="text-3xl font-bold font-mono text-text-dark mt-3">
            {formatCurrency(portfolio.budget, portfolio.currency, true)}
            <span className="text-sm font-normal text-gray-mid ml-2">{portfolio.currency} budget</span>
          </p>
        </div>

        {run && (
          <>
            {/* ROI summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-gray-mid text-xs">Optimal ROI</p>
                <p className="text-success font-bold text-2xl font-mono">
                  {run.roi_percent >= 0 ? '+' : ''}{run.roi_percent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-gray-mid text-xs">Total Return</p>
                <p className="text-text-dark font-bold font-mono">{formatCurrency(run.total_return, portfolio.currency, true)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-gray-mid text-xs">Budget Used</p>
                <p className="text-text-dark font-bold font-mono">{formatCurrency(run.total_cost, portfolio.currency, true)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-gray-mid text-xs">Last Optimized</p>
                <p className="text-text-dark text-sm">{formatDate(run.run_at).split(',')[0]}</p>
              </div>
            </div>

            {/* Selected investments */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-5 border-b border-gray-200">
                <h2 className="font-semibold text-text-dark">Optimal Selection ({selectedInvestments.length} investments)</h2>
                <p className="text-gray-mid text-xs mt-0.5">Computed by 0/1 Knapsack DP algorithm</p>
              </div>
              <div className="p-5">
                {selectedInvestments.length === 0 ? (
                  <p className="text-gray-mid text-sm">No investments in optimal selection.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedInvestments.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <p className="text-text-dark font-medium">{inv.name}</p>
                        <div className="text-right">
                          <p className="text-success font-semibold text-sm">{formatCurrency(inv.expected_return, portfolio.currency, true)}</p>
                          <p className="text-gray-mid text-xs">Cost: {formatCurrency(inv.cost, portfolio.currency, true)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/signup"
            className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
          >
            <ExternalLink size={18} />
            Create Your Own Portfolio
          </Link>
          <p className="text-gray-mid text-sm mt-2">Free forever for up to 3 portfolios</p>
        </div>
      </div>
    </div>
  )
}
