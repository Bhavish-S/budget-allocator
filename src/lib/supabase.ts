import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = 'https://qotycjlrqtfmcreyihmw.supabase.co'
const supabaseAnonKey = 'sb_publishable_-B-JV7lokRjjlWjGYjlj_Q_G4yDuU-M'

export const supabase: any = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isDemoMode = !supabaseUrl || !supabaseAnonKey
