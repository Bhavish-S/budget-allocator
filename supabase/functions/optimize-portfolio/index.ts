import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Investment {
  id: string
  name: string
  cost: number
  expected_return: number
  category?: string
  risk_level?: number
}

interface OptimizationRequest {
  portfolio_id: string
  budget: number
  investments: Investment[]
  unit_size?: number
}

function knapsack01DP(investments: Investment[], budget: number, unitSize: number) {
  const n = investments.length
  const W = Math.floor(budget / unitSize)

  const scaledCosts = investments.map((inv) => Math.floor(inv.cost / unitSize))
  const scaledReturns = investments.map((inv) => Math.floor(inv.expected_return * 100))

  const selected = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false))
  const dpFull = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = W; j >= 0; j--) {
      dpFull[i][j] = dpFull[i - 1][j]
      if (scaledCosts[i - 1] <= j) {
        const withItem = dpFull[i - 1][j - scaledCosts[i - 1]] + scaledReturns[i - 1]
        if (withItem > dpFull[i][j]) {
          dpFull[i][j] = withItem
          selected[i][j] = true
        }
      }
    }
  }

  const selectedIds: string[] = []
  let j = W
  for (let i = n; i >= 1; i--) {
    if (selected[i][j]) {
      selectedIds.push(investments[i - 1].id)
      j -= scaledCosts[i - 1]
    }
  }

  const optimalReturn = dpFull[n][W] / 100
  const totalCost = selectedIds.reduce((sum, id) => {
    return sum + investments.find((i) => i.id === id)!.cost
  }, 0)

  const snapN = Math.min(n, 50)
  const snapW = Math.min(W, 50)
  const snapshot = dpFull.slice(0, snapN + 1).map((row) => row.slice(0, snapW + 1))

  return { selectedIds, optimalReturn, totalCost, snapshot }
}

function greedyByROI(investments: Investment[], budget: number) {
  const sorted = [...investments].sort(
    (a, b) => b.expected_return / b.cost - a.expected_return / a.cost
  )
  let remaining = budget
  const selectedIds: string[] = []
  let totalReturn = 0, totalCost = 0

  for (const inv of sorted) {
    if (inv.cost <= remaining) {
      selectedIds.push(inv.id)
      remaining -= inv.cost
      totalReturn += inv.expected_return
      totalCost += inv.cost
    }
  }
  return { selectedIds, totalReturn, totalCost }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const start = Date.now()
    const { portfolio_id, budget, investments, unit_size = 1000 }: OptimizationRequest = await req.json()

    if (!investments || investments.length === 0) {
      return new Response(JSON.stringify({ error: 'No investments provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (investments.length > 500) {
      return new Response(JSON.stringify({ error: 'Maximum 500 investments per run' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dpResult = knapsack01DP(investments, budget, unit_size)
    const greedyResult = greedyByROI(investments, budget)
    const executionTime = Date.now() - start

    const roiPercent =
      dpResult.totalCost > 0
        ? ((dpResult.optimalReturn - dpResult.totalCost) / dpResult.totalCost) * 100
        : 0

    // Save to Supabase
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    let run = null
    if (user) {
      const { data: runData, error: runError } = await supabase
        .from('optimization_runs')
        .insert({
          portfolio_id,
          user_id: user.id,
          total_budget: budget,
          total_cost: dpResult.totalCost,
          total_return: dpResult.optimalReturn,
          roi_percent: roiPercent,
          selected_investment_ids: dpResult.selectedIds,
          dp_table_snapshot: dpResult.snapshot,
          greedy_result_json: greedyResult,
          algorithm_variant: '0/1-dp',
          execution_time_ms: executionTime,
        })
        .select()
        .single()

      if (runError) console.error('DB error:', runError)
      run = runData
    }

    return new Response(
      JSON.stringify({
        success: true,
        run_id: run?.id,
        dp_result: {
          selected_ids: dpResult.selectedIds,
          total_cost: dpResult.totalCost,
          total_return: dpResult.optimalReturn,
          roi_percent: roiPercent,
          budget_utilized_percent: (dpResult.totalCost / budget) * 100,
        },
        greedy_result: greedyResult,
        dp_snapshot: dpResult.snapshot,
        execution_time_ms: executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
