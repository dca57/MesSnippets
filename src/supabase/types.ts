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
      workspaces: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
          color: string
          icon_key: string
          workspace_order: number | null
          order: number | null // Legacy support if needed, or alias
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
          color: string
          icon_key: string
          workspace_order?: number | null
          order?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
          color?: string
          icon_key?: string
          workspace_order?: number | null
          order?: number | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
          workspace_id: string | null
          color: string
          icon_key: string
          order: number | null
          view_show_favorites_only: boolean | null
          view_sort_by_date: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
          workspace_id?: string | null
          color: string
          icon_key: string
          order?: number | null
          view_show_favorites_only?: boolean | null
          view_sort_by_date?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
          workspace_id?: string | null
          color?: string
          icon_key?: string
          order?: number | null
          view_show_favorites_only?: boolean | null
          view_sort_by_date?: boolean | null
        }
      }
      bookmarks: {
        Row: {
          id: string
          created_at: string
          title: string
          url: string
          user_id: string
          category_id: string | null
          description: string | null
          tags: string[] | null
          is_pinned: boolean | null
          pinned_at: string | null
          pinned_order: number | null
          click_count: number | null
          last_opened_at: string | null
          order: number | null
          last_ai_rename_at: string | null
          last_ai_clean_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          url: string
          user_id: string
          category_id?: string | null
          description?: string | null
          tags?: string[] | null
          is_pinned?: boolean | null
          pinned_at?: string | null
          pinned_order?: number | null
          click_count?: number | null
          last_opened_at?: string | null
          order?: number | null
          last_ai_rename_at?: string | null
          last_ai_clean_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          url?: string
          user_id?: string
          category_id?: string | null
          description?: string | null
          tags?: string[] | null
          is_pinned?: boolean | null
          pinned_at?: string | null
          pinned_order?: number | null
          click_count?: number | null
          last_opened_at?: string | null
          order?: number | null
          last_ai_rename_at?: string | null
          last_ai_clean_at?: string | null
        }
      }
      admin_settings: {
        Row: {
          parameter: string
          value: string
        }
        Insert: {
          parameter: string
          value: string
        }
        Update: {
          parameter?: string
          value?: string
        }
      }
      llm_providers: {
        Row: {
          id: string
          created_at: string
          name: string
          provider: string
          model_id: string
          base_url: string | null
          api_key: string | null
          is_active: boolean | null
          cost_per_1k_tokens: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          provider: string
          model_id: string
          base_url?: string | null
          api_key?: string | null
          is_active?: boolean | null
          cost_per_1k_tokens?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          provider?: string
          model_id?: string
          base_url?: string | null
          api_key?: string | null
          is_active?: boolean | null
          cost_per_1k_tokens?: number | null
        }
      }
      user_llm_usage: {
        Row: {
          id: string
          created_at: string
          user_id: string
          model_id: string | null
          tokens_input: number | null
          tokens_output: number | null
          total_tokens: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          model_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          model_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
      }
      plan_limits: {
        Row: {
          plan_name: string
          max_workspaces: number
          max_categories_per_workspace: number
          max_bookmarks: number
          max_upload_size_mb: number
          max_tokens_llm: number
          updated_at: string | null
        }
        Insert: {
          plan_name: string
          max_workspaces: number
          max_categories_per_workspace: number
          max_bookmarks: number
          max_upload_size_mb: number
          max_tokens_llm?: number
          updated_at?: string | null
        }
        Update: {
          plan_name?: string
          max_workspaces?: number
          max_categories_per_workspace?: number
          max_bookmarks?: number
          max_upload_size_mb?: number
          max_tokens_llm?: number
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          subscription_plan: string
          subscription_expires_at: string | null
          created_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          subscription_plan?: string
          subscription_expires_at?: string | null
          created_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          subscription_plan?: string
          subscription_expires_at?: string | null
          created_at?: string
          last_login_at?: string | null
        }
      }
      sni_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          language: string
          icon: string | null
          color: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          language?: string
          icon?: string | null
          color?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          language?: string
          icon?: string | null
          color?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sni_categories: {
        Row: {
          id: string
          user_id: string
          collection_id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          collection_id: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          collection_id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sni_snippets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          code: string
          description: string | null
          tags: string[] | null
          dependencies: string[] | null
          created_at: string
          updated_at: string
          order: number
          is_admin_compatible: boolean
          is_coloration_compatible: boolean
        }
        Insert: {
          id?: string
          user_id?: string
          category_id: string
          title: string
          code: string
          description?: string | null
          tags?: string[] | null
          dependencies?: string[] | null
          created_at?: string
          updated_at?: string
          order?: number
          is_admin_compatible?: boolean
          is_coloration_compatible?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          code?: string
          description?: string | null
          tags?: string[] | null
          dependencies?: string[] | null
          created_at?: string
          updated_at?: string
          order?: number
          is_admin_compatible?: boolean
          is_coloration_compatible?: boolean
        }
      }
      sni_fichiers: {
        Row: {
          id: string
          user_id: string
          created_at: string
          categorie: string
          titre: string
          nom_fichier: string
          extension: string | null
          taille: number | null
          file_path: string
        }
        Insert: {
          id?: string
          user_id?: string
          created_at?: string
          categorie: string
          titre: string
          nom_fichier: string
          extension?: string | null
          taille?: number | null
          file_path: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          categorie?: string
          titre?: string
          nom_fichier?: string
          extension?: string | null
          taille?: number | null
          file_path?: string
        }
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
  }
}
// End of Database definitions
