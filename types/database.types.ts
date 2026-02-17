export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          equipment: string | null
          id: string
          is_custom: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment?: string | null
          id?: string
          is_custom?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment?: string | null
          id?: string
          is_custom?: boolean | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          sets: Json
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          sets?: Json
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          sets?: Json
          workout_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          workout_date?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
