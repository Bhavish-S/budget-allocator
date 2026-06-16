import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
  loading?: boolean
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#C9A84C',
  trend,
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-32 bg-gray-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-mid text-sm font-medium">{title}</p>
          <p className="text-text-dark text-2xl font-bold mt-1 truncate font-mono">{value}</p>
          {subtitle && (
            <p className="text-gray-mid text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-1.5 text-xs font-medium',
              trend.positive ? 'text-success' : 'text-danger'
            )}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}
