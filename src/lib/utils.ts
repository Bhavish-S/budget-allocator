import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  compact: boolean = false
): string {
  if (currency === 'INR') {
    if (compact) {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
      return `₹${amount.toFixed(0)}`
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  }).format(amount)
}

export function formatROI(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

export function getRiskLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Very High',
  }
  return labels[level] || 'Unknown'
}

export function getRiskColor(level: number): string {
  const colors: Record<number, string> = {
    1: '#16A34A',
    2: '#65A30D',
    3: '#D97706',
    4: '#EA580C',
    5: '#DC2626',
  }
  return colors[level] || '#8A9BB5'
}

export function interpolateColor(
  value: number,
  maxValue: number
): string {
  if (maxValue === 0) return '#F8FAFC'
  const ratio = Math.min(value / maxValue, 1)

  // Slate-50 (#F8FAFC) → Indigo-600 (#4F46E5)
  const r = Math.round(248 + (79 - 248) * ratio)
  const g = Math.round(250 + (70 - 250) * ratio)
  const b = Math.round(252 + (229 - 252) * ratio)

  return `rgb(${r}, ${g}, ${b})`
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function generateShareToken(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
