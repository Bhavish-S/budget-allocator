import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-8 text-center',
      className
    )}>
      <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gold" />
      </div>
      <h3 className="text-text-dark font-semibold text-lg">{title}</h3>
      <p className="text-gray-mid text-sm mt-2 max-w-xs">{description}</p>
      {action && (
        <button
          id="empty-state-action"
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 bg-gold text-navy text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
