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
      drafts: {
        Row: {
          id: string
          team_mode: '2v2' | '3v3' | '4v4'
          enable_souvenir_ban: boolean
          timer_seconds: number
          team1_name: string
          team2_name?: string
          auto_ban_civilizations: string[]
          auto_ban_leaders: string[]
          auto_ban_souvenirs: string[]
          created_at: string
          status: 'pending' | 'active' | 'completed'
          team1_ready?: boolean
          team2_ready?: boolean
        }
        Insert: {
          id?: string
          team_mode: '2v2' | '3v3' | '4v4'
          enable_souvenir_ban: boolean
          timer_seconds: number
          team1_name: string
          team2_name?: string
          auto_ban_civilizations: string[]
          auto_ban_leaders: string[]
          auto_ban_souvenirs: string[]
          created_at?: string
          status?: 'pending' | 'active' | 'completed'
          team1_ready?: boolean
          team2_ready?: boolean
        }
        Update: {
          id?: string
          team_mode?: '2v2' | '3v3' | '4v4'
          enable_souvenir_ban?: boolean
          timer_seconds?: number
          team1_name?: string
          team2_name?: string
          auto_ban_civilizations?: string[]
          auto_ban_leaders?: string[]
          auto_ban_souvenirs?: string[]
          created_at?: string
          status?: 'pending' | 'active' | 'completed'
          team1_ready?: boolean
          team2_ready?: boolean
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          name: string
          status: 'waiting' | 'in_progress' | 'completed'
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          status?: 'waiting' | 'in_progress' | 'completed'
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          status?: 'waiting' | 'in_progress' | 'completed'
        }
      }
      teams: {
        Row: {
          id: string
          session_id: string
          name: string
          side: 'blue' | 'red'
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          side: 'blue' | 'red'
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          side?: 'blue' | 'red'
        }
      }
      draft_actions: {
        Row: {
          id: string
          session_id: string
          team_id: string
          action_type: 'pick' | 'ban'
          entity_id: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          team_id: string
          action_type: 'pick' | 'ban'
          entity_id: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          team_id?: string
          action_type?: 'pick' | 'ban'
          entity_id?: string
          order?: number
          created_at?: string
        }
      }
    }
  }
}