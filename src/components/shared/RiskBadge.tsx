import { getRiskColor, getRiskLabel } from '@/lib/utils'

interface RiskBadgeProps {
  level: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function RiskBadge({ level, showLabel = false, size = 'sm' }: RiskBadgeProps) {
  const color = getRiskColor(level)
  const label = getRiskLabel(level)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`rounded-sm ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
            style={{
              backgroundColor: star <= level ? color : '#E2E8F0',
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}
