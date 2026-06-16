import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Briefcase } from 'lucide-react'
import type { Portfolio } from '@/lib/database.types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(300).optional(),
  budget: z.coerce.number().positive('Budget must be positive'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
})

type FormData = z.infer<typeof schema>

interface PortfolioFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
  initialData?: Portfolio | null
}

export default function PortfolioForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: PortfolioFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'INR',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        budget: initialData.budget,
        currency: initialData.currency as 'INR' | 'USD' | 'EUR' | 'GBP',
      })
    } else {
      reset({ name: '', description: '', budget: 0, currency: 'INR' })
    }
  }, [initialData, reset, open])

  if (!open) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-navy" />
            <h2 className="font-semibold text-text-dark">
              {initialData ? 'Edit Portfolio' : 'New Portfolio'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-mid"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          <div>
            <label className="label" htmlFor="portfolio-name">Portfolio Name *</label>
            <input
              id="portfolio-name"
              {...register('name')}
              placeholder="My Investment Portfolio"
              className="input-field"
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="portfolio-description">Description</label>
            <textarea
              id="portfolio-description"
              {...register('description')}
              placeholder="Brief description of your investment strategy..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="label" htmlFor="portfolio-budget">Budget *</label>
            <input
              id="portfolio-budget"
              type="number"
              step="1000"
              min="1"
              {...register('budget')}
              placeholder="1000000"
              className="input-field font-mono"
            />
            {errors.budget && <p className="error-text">{errors.budget.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="portfolio-currency">Currency</label>
            <select
              id="portfolio-currency"
              {...register('currency')}
              className="input-field"
            >
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost border border-gray-200 text-text-dark"
            >
              Cancel
            </button>
            <button
              id="portfolio-form-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Portfolio' : 'Create Portfolio')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
