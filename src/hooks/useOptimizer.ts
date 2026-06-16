import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { supabase, isDemoMode } from '@/lib/supabase'
import { knapsack01, greedyKnapsack, sampleDPTable, type KnapsackItem } from '@/lib/knapsack'

interface OptimizeParams {
  portfolioId: string
  budget: number
  investments: KnapsackItem[]
  unitSize: number
}

export function useOptimizer() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const optimize = useMutation({
    mutationFn: async ({ portfolioId, budget, investments, unitSize }: OptimizeParams) => {
      // Demo mode: run client-side
      if (isDemoMode || !session) {
        const start = Date.now()
        const dpResult = knapsack01(investments, budget, unitSize)
        const greedyResult = greedyKnapsack(investments, budget)
        const executionTime = Date.now() - start
        const dpSnapshot = sampleDPTable(dpResult.dpTable)
        return {
          success: true,
          run_id: null,
          dp_result: {
            selected_ids: dpResult.selectedIds,
            total_cost: dpResult.totalCost,
            total_return: dpResult.totalReturn,
            roi_percent: dpResult.roiPercent,
            budget_utilized_percent: dpResult.budgetUtilizedPercent,
          },
          greedy_result: {
            selectedIds: greedyResult.selectedIds,
            totalReturn: greedyResult.totalReturn,
            totalCost: greedyResult.totalCost,
            roiPercent: greedyResult.roiPercent,
          },
          dp_snapshot: dpSnapshot,
          execution_time_ms: executionTime,
          demo_mode: true,
        }
      }

      // Production mode: call Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            portfolio_id: portfolioId,
            budget,
            investments,
            unit_size: unitSize,
          }),
        }
      )
      if (!response.ok) throw new Error(await response.text())
      return response.json()
    },
    onSuccess: (data) => {
      const roi = data.dp_result?.roi_percent?.toFixed(2) ?? '0.00'
      toast.success(`Optimization complete! ROI: ${roi}%`)
      queryClient.invalidateQueries({ queryKey: ['optimization-runs'] })
    },
    onError: (err: Error) => {
      toast.error(`Optimization failed: ${err.message}`)
    },
  })

  return { optimize, isOptimizing: optimize.isPending, result: optimize.data }
}

export function useOptimizationRuns(portfolioId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['optimization-runs', user?.id, portfolioId],
    queryFn: async (): Promise<any[]> => {
      if (!user) return [] as any
      let query = supabase
        .from('optimization_runs')
        .select('*, portfolios(name, currency)')
        .eq('user_id', user.id)
        .order('run_at', { ascending: false })
        .limit(50)

      if (portfolioId) {
        query = query.eq('portfolio_id', portfolioId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: !!user && !isDemoMode,
  })
}
