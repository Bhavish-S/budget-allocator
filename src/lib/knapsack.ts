export interface KnapsackItem {
  id: string
  name: string
  cost: number
  expected_return: number
  category?: string
  risk_level?: number
}

export interface KnapsackResult {
  selectedIds: string[]
  selectedItems: KnapsackItem[]
  totalReturn: number
  totalCost: number
  dpTable: number[][]
  maxValue: number
  roiPercent: number
  budgetUtilizedPercent: number
}

export interface GreedyResult {
  selectedIds: string[]
  selectedItems: KnapsackItem[]
  totalReturn: number
  totalCost: number
  roiPercent: number
}

/**
 * 0/1 Knapsack Dynamic Programming Algorithm
 * Time complexity: O(n × W) where W = budget / unitSize
 * Space complexity: O(n × W) — full table for backtracking and visualization
 */
export function knapsack01(
  investments: KnapsackItem[],
  budget: number,
  unitSize: number = 1000
): KnapsackResult {
  const n = investments.length
  const W = Math.floor(budget / unitSize)

  if (n === 0 || W === 0) {
    return {
      selectedIds: [],
      selectedItems: [],
      totalReturn: 0,
      totalCost: 0,
      dpTable: [[0]],
      maxValue: 0,
      roiPercent: 0,
      budgetUtilizedPercent: 0,
    }
  }

  const costs = investments.map((inv) => Math.floor(inv.cost / unitSize))
  const returns = investments.map((inv) => inv.expected_return)

  // Build full DP table for visualization
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(W + 1).fill(0)
  )

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j]
      if (costs[i - 1] <= j) {
        const withItem = dp[i - 1][j - costs[i - 1]] + returns[i - 1]
        if (withItem > dp[i][j]) {
          dp[i][j] = withItem
        }
      }
    }
  }

  // Backtrack to find selected items
  const selectedIds: string[] = []
  let j = W
  for (let i = n; i >= 1; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selectedIds.push(investments[i - 1].id)
      j -= costs[i - 1]
    }
  }

  selectedIds.reverse()
  const selectedItems = selectedIds
    .map((id) => investments.find((inv) => inv.id === id)!)
    .filter(Boolean)

  const totalReturn = dp[n][W]
  const totalCost = selectedItems.reduce((sum, inv) => sum + inv.cost, 0)
  const maxValue = totalReturn
  const roiPercent = totalCost > 0 ? ((totalReturn - totalCost) / totalCost) * 100 : 0
  const budgetUtilizedPercent = budget > 0 ? (totalCost / budget) * 100 : 0

  return {
    selectedIds,
    selectedItems,
    totalReturn,
    totalCost,
    dpTable: dp,
    maxValue,
    roiPercent,
    budgetUtilizedPercent,
  }
}

/**
 * Greedy algorithm — selects by ROI ratio (expected_return / cost)
 * Used for comparison with the optimal DP result
 */
export function greedyKnapsack(
  investments: KnapsackItem[],
  budget: number
): GreedyResult {
  const sorted = [...investments].sort(
    (a, b) => b.expected_return / b.cost - a.expected_return / a.cost
  )

  let remaining = budget
  const selectedIds: string[] = []
  const selectedItems: KnapsackItem[] = []
  let totalReturn = 0
  let totalCost = 0

  for (const inv of sorted) {
    if (inv.cost <= remaining) {
      selectedIds.push(inv.id)
      selectedItems.push(inv)
      remaining -= inv.cost
      totalReturn += inv.expected_return
      totalCost += inv.cost
    }
  }

  const roiPercent = totalCost > 0 ? ((totalReturn - totalCost) / totalCost) * 100 : 0

  return { selectedIds, selectedItems, totalReturn, totalCost, roiPercent }
}

/**
 * Get a sampled subset of the DP table for display (capped at maxRows x maxCols)
 */
export function sampleDPTable(
  dp: number[][],
  maxRows: number = 50,
  maxCols: number = 50
): number[][] {
  const rows = Math.min(dp.length, maxRows + 1)
  const cols = Math.min(dp[0]?.length || 0, maxCols + 1)
  return dp.slice(0, rows).map((row) => row.slice(0, cols))
}
