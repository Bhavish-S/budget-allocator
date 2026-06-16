import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number
  currency?: string
  compact?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSign?: boolean
}

export default function CurrencyDisplay({
  amount,
  currency = 'INR',
  compact = false,
  className,
  size = 'md',
  showSign = false,
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, currency, compact)
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold font-mono',
  }

  return (
    <span className={cn(sizeClasses[size], className)}>
      {showSign && amount > 0 && '+'}
      {formatted}
    </span>
  )
}
