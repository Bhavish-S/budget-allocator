import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { interpolateColor } from '@/lib/utils'

interface DPHeatmapProps {
  dpSnapshot: number[][] | null
  investmentNames: string[]
  unitSize: number
  budget: number
}

const MAX_DISPLAY_ROWS = 20
const MAX_DISPLAY_COLS = 40

export default function DPHeatmap({
  dpSnapshot,
  investmentNames,
  unitSize,
  budget,
}: DPHeatmapProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const animFrameRef = useRef<number>(0)
  const cellsRef = useRef<(HTMLDivElement | null)[][]>([])

  const rows = dpSnapshot ? Math.min(dpSnapshot.length, MAX_DISPLAY_ROWS + 1) : 0
  const cols = dpSnapshot && dpSnapshot[0] ? Math.min(dpSnapshot[0].length, MAX_DISPLAY_COLS + 1) : 0
  const totalCells = rows * cols

  const maxValue = dpSnapshot
    ? Math.max(...dpSnapshot.flat().filter(v => typeof v === 'number'))
    : 1

  const getCellColor = useCallback(
    (value: number) => interpolateColor(value, maxValue || 1),
    [maxValue]
  )

  const animateCells = useCallback(() => {
    if (!dpSnapshot || totalCells === 0) return
    setIsAnimating(true)
    setRevealedCount(0)

    let current = 0
    const batchSize = Math.max(1, Math.floor(totalCells / 100))

    const step = () => {
      const end = Math.min(current + batchSize, totalCells)
      setRevealedCount(end)
      current = end

      if (current < totalCells) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        setIsAnimating(false)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [dpSnapshot, totalCells])

  useEffect(() => {
    if (dpSnapshot) {
      const cleanup = animateCells()
      return cleanup
    }
    return undefined
  }, [dpSnapshot, animateCells])

  if (!dpSnapshot) return null

  const displayedRows = dpSnapshot.slice(1, rows) // skip row 0 (base case)
  const budgetUnits = Math.floor(budget / unitSize)

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-text-dark font-semibold text-base">
            Dynamic Programming Table
          </h3>
          <p className="text-gray-mid text-xs mt-0.5">
            The algorithm's work — {rows - 1} investments × {Math.min(cols - 1, budgetUnits)} budget units
            {isAnimating && <span className="text-gold ml-2 animate-pulse">● Animating...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Color scale legend */}
          <div className="flex items-center gap-2 text-xs text-gray-mid">
            <div className="w-16 h-3 rounded" style={{
              background: 'linear-gradient(90deg, #0A1628, #C9A84C)',
            }} />
            <span>0 → Max</span>
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex-shrink-0 mr-2">
            <div className="h-5" /> {/* spacer for header row */}
            {displayedRows.map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="text-gray-mid text-right pr-2 flex items-center justify-end"
                style={{ height: '20px', fontSize: '10px' }}
              >
                {investmentNames[rowIdx]
                  ? investmentNames[rowIdx].slice(0, 12)
                  : `Inv ${rowIdx + 1}`}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            {/* X-axis header */}
            <div className="flex mb-1" style={{ gap: '2px' }}>
              {Array.from({ length: Math.min(cols, MAX_DISPLAY_COLS + 1) }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="text-gray-mid text-center flex-shrink-0"
                  style={{ width: '18px', height: '16px', fontSize: '8px', lineHeight: '16px' }}
                >
                  {colIdx % 5 === 0 ? colIdx : ''}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {displayedRows.map((row, rowIdx) => {
              const displayedRow = row.slice(0, Math.min(cols, MAX_DISPLAY_COLS + 1))
              return (
                <div
                  key={rowIdx}
                  className="flex"
                  style={{ gap: '2px', marginBottom: '2px' }}
                >
                  {displayedRow.map((value, colIdx) => {
                    const cellIndex = rowIdx * cols + colIdx
                    const isRevealed = cellIndex < revealedCount
                    return (
                      <div
                        key={colIdx}
                        title={`dp[${rowIdx + 1}][${colIdx}] = ₹${value.toLocaleString('en-IN')}`}
                        className="flex-shrink-0 rounded-sm cursor-help"
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: isRevealed ? getCellColor(value) : '#F1F5F9',
                          opacity: isRevealed ? 1 : 0.3,
                          transition: isRevealed ? 'background-color 0.15s ease, opacity 0.1s ease' : 'none',
                          transform: isRevealed ? 'scale(1)' : 'scale(0.8)',
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Help section */}
      <button
        id="dp-help-toggle"
        onClick={() => setHelpOpen(!helpOpen)}
        className="mt-3 flex items-center gap-2 text-gray-mid text-xs hover:text-text-dark transition-colors"
      >
        <Info size={14} />
        How to read this table
        {helpOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {helpOpen && (
        <div className="mt-2 bg-gray-soft rounded-lg p-4 text-sm text-gray-700 space-y-2 border border-gray-200">
          <p>
            <strong>Rows</strong> represent each investment option (top to bottom).
          </p>
          <p>
            <strong>Columns</strong> represent budget units (multiples of ₹{unitSize.toLocaleString('en-IN')}).
          </p>
          <p>
            <strong>Cell color</strong>: dark navy = ₹0 optimal return; bright gold = maximum possible return at that budget.
          </p>
          <p>
            <strong>Reading the table</strong>: dp[i][j] = the maximum return achievable using any subset of the first i investments with a budget of j × unit size.
          </p>
          <p>
            <strong>The answer</strong> is in the bottom-right corner (brightest gold cell).
          </p>
        </div>
      )}
    </div>
  )
}
