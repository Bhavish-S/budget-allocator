import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, TrendingUp } from 'lucide-react'
import type { Investment } from '@/lib/database.types'
import { useCategories } from '@/hooks/useCategories'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(150),
  description: z.string().max(300).optional(),
  cost: z.coerce.number().positive('Cost must be positive'),
  expected_return: z.coerce.number().min(0, 'Return must be ≥ 0'),
  category_id: z.string().optional(),
  risk_level: z.coerce.number().min(1).max(5),
})

type FormData = z.infer<typeof schema>

interface InvestmentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
  portfolioId: string
  initialData?: Investment | null
}

export default function InvestmentForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  portfolioId,
  initialData,
}: InvestmentFormProps) {
  const { data: categories = [] } = useCategories()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { risk_level: 3 },
  })

  const cost = watch('cost') || 0
  const expectedReturn = watch('expected_return') || 0
  const roi = cost > 0 ? ((expectedReturn - cost) / cost) * 100 : 0
  const riskLevel = watch('risk_level') || 3

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        cost: initialData.cost,
        expected_return: initialData.expected_return,
        category_id: initialData.category_id || '',
        risk_level: initialData.risk_level,
      })
    } else {
      reset({ name: '', description: '', cost: 0, expected_return: 0, risk_level: 3 })
    }
  }, [initialData, reset, open])

  if (!open) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-navy" />
            <h2 className="font-semibold text-text-dark">
              {initialData ? 'Edit Investment' : 'Add Investment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-mid" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, portfolio_id: portfolioId, category_id: data.category_id || null } as Omit<Investment, 'id' | 'user_id' | 'created_at'>))} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="label" htmlFor="inv-name">Investment Name *</label>
            <input id="inv-name" {...register('name')} placeholder="Reliance Industries Ltd." className="input-field" />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="inv-desc">Description</label>
            <textarea id="inv-desc" {...register('description')} rows={2} placeholder="Brief notes..." className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="inv-cost">Cost (INR) *</label>
              <input id="inv-cost" type="number" step="100" min="1" {...register('cost')} placeholder="100000" className="input-field font-mono" />
              {errors.cost && <p className="error-text">{errors.cost.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="inv-return">Expected Return (INR) *</label>
              <input id="inv-return" type="number" step="100" min="0" {...register('expected_return')} placeholder="120000" className="input-field font-mono" />
              {errors.expected_return && <p className="error-text">{errors.expected_return.message}</p>}
            </div>
          </div>

          {/* Live ROI preview */}
          {cost > 0 && (
            <div className={`rounded-lg p-3 text-sm font-medium ${
              roi >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              Projected ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
            </div>
          )}

          <div>
            <label className="label" htmlFor="inv-category">Category</label>
            <select id="inv-category" {...register('category_id')} className="input-field">
              <option value="">Select category...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="inv-risk">Risk Level: {riskLevel}/5</label>
            <input
              id="inv-risk"
              type="range"
              min={1}
              max={5}
              step={1}
              {...register('risk_level')}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-xs text-gray-mid mt-1">
              <span>Very Low</span>
              <span>Moderate</span>
              <span>Very High</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost border border-gray-200 text-text-dark">Cancel</button>
            <button id="investment-form-submit" type="submit" disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? 'Saving...' : (initialData ? 'Update Investment' : 'Add Investment')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
