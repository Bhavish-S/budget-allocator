import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Portfolio } from '@/lib/database.types'
import { toast } from 'sonner'

export function usePortfolios() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user) return [] as any
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function usePortfolio(id: string | undefined) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: async (): Promise<any> => {
      if (!id) return null
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: Omit<Portfolio, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated')
      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return portfolio
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      toast.success('Portfolio created successfully!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create portfolio: ${err.message}`)
    },
  })
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Portfolio> & { id: string }) => {
      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return portfolio
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', data.id] })
      toast.success('Portfolio updated!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update portfolio: ${err.message}`)
    },
  })
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolios').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      toast.success('Portfolio deleted.')
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`)
    },
  })
}
