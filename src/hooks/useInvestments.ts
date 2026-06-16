import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Investment } from '@/lib/database.types'
import { toast } from 'sonner'

export function useInvestments(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['investments', portfolioId],
    queryFn: async (): Promise<any[]> => {
      if (!portfolioId) return [] as any
      const { data, error } = await supabase
        .from('investments')
        .select('*, categories(*)')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!portfolioId,
  })
}

export function useAllInvestments() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['all-investments', user?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user) return [] as any
      const { data, error } = await supabase
        .from('investments')
        .select('*, categories(*), portfolios(name, currency)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useCreateInvestment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (
      data: Omit<Investment, 'id' | 'user_id' | 'created_at'>
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data: investment, error } = await supabase
        .from('investments')
        .insert({ ...data, user_id: user.id })
        .select('*, categories(*)')
        .single()
      if (error) throw error
      return investment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['investments', data.portfolio_id] })
      toast.success('Investment added!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to add investment: ${err.message}`)
    },
  })
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Investment> & { id: string }) => {
      const { data: investment, error } = await supabase
        .from('investments')
        .update(data)
        .eq('id', id)
        .select('*, categories(*)')
        .single()
      if (error) throw error
      return investment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['investments', data.portfolio_id] })
      toast.success('Investment updated!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update: ${err.message}`)
    },
  })
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, portfolioId }: { id: string; portfolioId: string }) => {
      const { error } = await supabase.from('investments').delete().eq('id', id)
      if (error) throw error
      return portfolioId
    },
    onSuccess: (portfolioId) => {
      queryClient.invalidateQueries({ queryKey: ['investments', portfolioId] })
      toast.success('Investment removed.')
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`)
    },
  })
}
