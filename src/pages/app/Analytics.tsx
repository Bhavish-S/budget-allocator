import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { usePortfolios } from '@/hooks/usePortfolios'
import { useAllInvestments } from '@/hooks/useInvestments'
import { useOptimizationRuns } from '@/hooks/useOptimizer'
import { useCategories } from '@/hooks/useCategories'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency, formatDateShort } from '@/lib/utils'

const CHART_COLORS = ['#C9A84C', '#2D5EA8', '#16A34A', '#D97706', '#DC2626', '#8A9BB5', '#1B3A6B', '#065F46']

const TOOLTIP_STYLE = {
  background: '#1B3A6B',
  border: '1px solid rgba(201, 168, 76, 0.2)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
}

export default function Analytics() {
  const { data: portfolios = [] } = usePortfolios()
  const { data: allInvestments = [] } = useAllInvestments()
  const { data: runs = [], isLoading: runsLoading } = useOptimizationRuns()
  const { data: categories = [] } = useCategories()
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all')

  const filteredInvestments = filterPortfolio === 'all'
    ? allInvestments
    : allInvestments.filter((inv) => inv.portfolio_id === filterPortfolio)

  const filteredRuns = filterPortfolio === 'all'
    ? runs.slice(-30)
    : runs.filter((r) => r.portfolio_id === filterPortfolio).slice(-30)

  // Category allocation data
  const getCategoryColor = (categoryId: string) => categories.find((cat: any) => cat.id === categoryId)?.color || '#8A9BB5'
  const categoryData = categories.map((cat: any) => {
    const total = filteredInvestments
      .filter((inv) => inv.category_id === cat.id)
      .reduce((sum, inv) => sum + inv.cost, 0)
    return { name: cat.name, value: total, color: cat.color }
  }).filter((d) => d.value > 0)

  // Return bar chart data
  const returnData = [...filteredInvestments]
    .sort((a: any, b: any) => b.expected_return - a.expected_return)
    .slice(0, 15)
    .map((inv) => ({
      name: inv.name.length > 15 ? inv.name.slice(0, 15) + '…' : inv.name,
      return: inv.expected_return,
      cost: inv.cost,
    }))

  // ROI trend data
  const roiTrendData = filteredRuns
    .slice()
    .reverse()
    .map((run, idx) => ({
      run: idx + 1,
      roi: parseFloat(run.roi_percent.toFixed(2)),
      date: formatDateShort(run.run_at),
    }))

  // Risk distribution
  const riskData = [1, 2, 3, 4, 5].map((level) => ({
    risk: `Level ${level}`,
    count: filteredInvestments.filter((inv) => inv.risk_level === level).length,
  }))

  const hasData = filteredInvestments.length > 0

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            {filteredInvestments.length} investments across{' '}
            {filterPortfolio === 'all' ? portfolios.length : 1} portfolio(s)
          </p>
        </div>
        <select
          id="analytics-portfolio-filter"
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

      {!hasData ? (
        <EmptyState
          icon={BarChart2}
          title="No data to display"
          description="Add investments to your portfolios to see analytics charts."
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Allocation Pie Chart */}
          <div className="card-light">
            <h2 className="font-semibold text-text-dark mb-4">Category Allocation</h2>
            {categoryData.length === 0 ? (
              <p className="text-gray-mid text-sm text-center py-8">Assign categories to see allocation.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value, 'INR', true), 'Cost']}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: '#1A2332', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ROI Trend */}
          <div className="card-light">
            <h2 className="font-semibold text-text-dark mb-4">ROI Trend (Last {roiTrendData.length} runs)</h2>
            {roiTrendData.length === 0 ? (
              <p className="text-gray-mid text-sm text-center py-8">Run optimizations to see ROI trend.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={roiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="run" label={{ value: 'Run #', position: 'insideBottom', offset: -5, fontSize: 11 }} tick={{ fontSize: 11, fill: '#8A9BB5' }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#8A9BB5' }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toFixed(2)}%`, 'ROI']}
                    labelFormatter={(label) => `Run #${label}`}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#C9A84C"
                    strokeWidth={2.5}
                    dot={{ fill: '#C9A84C', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Return Bar Chart */}
          <div className="card-light">
            <h2 className="font-semibold text-text-dark mb-4">
              Top {returnData.length} Investments by Return
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={returnData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrency(v, 'INR', true)}
                  tick={{ fontSize: 10, fill: '#8A9BB5' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 10, fill: '#8A9BB5' }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [formatCurrency(v, 'INR', true), name === 'return' ? 'Expected Return' : 'Cost']}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="cost" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="cost" />
                <Bar dataKey="return" fill="#C9A84C" radius={[0, 4, 4, 0]} name="return" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="card-light">
            <h2 className="font-semibold text-text-dark mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="risk" tick={{ fontSize: 11, fill: '#8A9BB5' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8A9BB5' }} />
                <Tooltip
                  formatter={(v: number) => [v, 'Investments']}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry: any, index: number) => {
                    const colors = ['#16A34A', '#65A30D', '#D97706', '#EA580C', '#DC2626']
                    return <Cell key={index} fill={colors[index]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
