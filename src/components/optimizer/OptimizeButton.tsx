import { Zap, Loader2 } from 'lucide-react'

interface OptimizeButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export default function OptimizeButton({
  onClick,
  isLoading,
  disabled,
}: OptimizeButtonProps) {
  return (
    <button
      id="optimize-now-btn"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gold text-navy font-bold text-lg rounded-xl hover:bg-yellow-400 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none shadow-lg hover:shadow-xl animate-pulse-gold"
      style={{ fontWeight: 800 }}
      aria-label={isLoading ? 'Computing optimal allocation...' : 'Optimize portfolio now'}
    >
      {isLoading ? (
        <>
          <Loader2 size={22} className="animate-spin" />
          Computing optimal allocation...
        </>
      ) : (
        <>
          <Zap size={22} fill="currentColor" />
          OPTIMIZE NOW
        </>
      )}
    </button>
  )
}
