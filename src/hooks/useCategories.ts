import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    },
    staleTime: Infinity, // Categories rarely change
  })
}
