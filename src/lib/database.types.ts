export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          budget: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          budget: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          budget?: number
          currency?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          portfolio_id: string
          user_id: string
          name: string
          description: string | null
          cost: number
          expected_return: number
          category_id: string | null
          risk_level: number
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          user_id: string
          name: string
          description?: string | null
          cost: number
          expected_return: number
          category_id?: string | null
          risk_level?: number
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          cost?: number
          expected_return?: number
          category_id?: string | null
          risk_level?: number
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon: string
        }
        Update: {
          name?: string
          color?: string
          icon?: string
        }
      }
      optimization_runs: {
        Row: {
          id: string
          portfolio_id: string
          user_id: string
          total_budget: number
          total_cost: number
          total_return: number
          roi_percent: number
          selected_investment_ids: string[]
          dp_table_snapshot: Json | null
          greedy_result_json: Json | null
          algorithm_variant: string
          execution_time_ms: number | null
          run_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          user_id: string
          total_budget: number
          total_cost: number
          total_return: number
          roi_percent: number
          selected_investment_ids: string[]
          dp_table_snapshot?: Json | null
          greedy_result_json?: Json | null
          algorithm_variant?: string
          execution_time_ms?: number | null
          run_at?: string
        }
        Update: Record<string, never>
      }
      shared_portfolios: {
        Row: {
          id: string
          portfolio_id: string
          user_id: string
          share_token: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          user_id: string
          share_token?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          expires_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type Investment = Database['public']['Tables']['investments']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type OptimizationRun = Database['public']['Tables']['optimization_runs']['Row']
export type SharedPortfolio = Database['public']['Tables']['shared_portfolios']['Row']

export type InvestmentWithCategory = Investment & {
  categories: Category | null
}

export type PortfolioWithStats = Portfolio & {
  investment_count: number
  last_optimized?: string
  best_roi?: number
}
