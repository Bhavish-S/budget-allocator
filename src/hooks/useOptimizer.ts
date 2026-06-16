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
      // Run client-side since edge function is giving CORS errors (not deployed)
      const start = Date.now()
      const dpResult = knapsack01(investments, budget, unitSize)
      const greedyResult = greedyKnapsack(investments, budget)
      const executionTime = Date.now() - start
      const dpSnapshot = sampleDPTable(dpResult.dpTable)
      
      const resultData = {
        success: true,
        run_id: null as string | null,
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
      }

      if (session) {
        // Save to DB
        const { data, error } = await supabase
          .from('optimization_runs')
          .insert({
            portfolio_id: portfolioId,
            user_id: session.user.id,
            total_budget: budget,
            total_cost: dpResult.totalCost,
            total_return: dpResult.totalReturn,
            roi_percent: dpResult.roiPercent,
            selected_investment_ids: dpResult.selectedIds,
            dp_table_snapshot: dpSnapshot,
            greedy_result_json: greedyResult,
            algorithm_variant: '0/1-dp-local',
            execution_time_ms: executionTime,
          })
          .select()
          .single()
          
        if (!error && data) {
           resultData.run_id = data.id
        }
      }

      return resultData
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
    enabled: !!user,
  })
}
