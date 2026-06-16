import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in demo mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to your Supabase project.'
  )
}

export const supabase: any = createClient(
  supabaseUrl || 'https://qotycjlrqtfmcreyihmw.supabase.co',
  supabaseAnonKey || 'sb_publishable_-B-JV7lokRjjlWjGYjlj_Q_G4yDuU-M',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isDemoMode = !supabaseUrl || !supabaseAnonKey
