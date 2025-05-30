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
      activity_logs: {
        Row: {
          activity_message: string
          activity_type: string | null
          context_data: Json | null
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          activity_message: string
          activity_type?: string | null
          context_data?: Json | null
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          activity_message?: string
          activity_type?: string | null
          context_data?: Json | null
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_date: string
          created_at: string | null
          id: string
          notes: string | null
          outcome: string | null
          restaurant_id: string
          salesperson_id: string
          status: string | null
        }
        Insert: {
          call_date: string
          created_at?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          restaurant_id: string
          salesperson_id: string
          status?: string | null
        }
        Update: {
          call_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          restaurant_id?: string
          salesperson_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to_user_id: string
          created_at: string
          id: string
          name: string
          next_action_date: string | null
          next_action_description: string | null
          restaurant_id: string
          source: string | null
          stage_entered_at: string | null
          stage_notes: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to_user_id: string
          created_at?: string
          id?: string
          name: string
          next_action_date?: string | null
          next_action_description?: string | null
          restaurant_id: string
          source?: string | null
          stage_entered_at?: string | null
          stage_notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string
          created_at?: string
          id?: string
          name?: string
          next_action_date?: string | null
          next_action_description?: string | null
          restaurant_id?: string
          source?: string | null
          stage_entered_at?: string | null
          stage_notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          action_items: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_date: string
          meeting_type: string | null
          outcome: string | null
          restaurant_id: string
          scheduled_by_user_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_type?: string | null
          outcome?: string | null
          restaurant_id: string
          scheduled_by_user_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_type?: string | null
          outcome?: string | null
          restaurant_id?: string
          scheduled_by_user_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_uid: string
          body: string
          created_at: string | null
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["note_target_type"]
          updated_at: string | null
        }
        Insert: {
          author_uid: string
          body: string
          created_at?: string | null
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["note_target_type"]
          updated_at?: string | null
        }
        Update: {
          author_uid?: string
          body?: string
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["note_target_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_uid_fkey"
            columns: ["author_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_name: string
          quantity: number
          sub_total_kyats: number
          unit_price_kyats: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_name: string
          quantity?: number
          sub_total_kyats: number
          unit_price_kyats: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          sub_total_kyats?: number
          unit_price_kyats?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by_user_id: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by_user_id: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by_user_id?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          delivery_date_actual: string | null
          delivery_date_scheduled: string | null
          id: string
          lead_id: string | null
          notes: string | null
          order_date: string | null
          order_number: string
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount_kyats: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          delivery_date_actual?: string | null
          delivery_date_scheduled?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount_kyats?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          delivery_date_actual?: string | null
          delivery_date_scheduled?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount_kyats?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: number
          password: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          password: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          password?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          remarks: string | null
          salesperson_id: string
          township: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          remarks?: string | null
          salesperson_id: string
          township?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          remarks?: string | null
          salesperson_id?: string
          township?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_outcomes: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          next_action: string | null
          next_action_date: string | null
          order_id: string | null
          task_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          next_action?: string | null
          next_action_date?: string | null
          order_id?: string | null
          task_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          next_action?: string | null
          next_action_date?: string | null
          order_id?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_outcomes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_outcomes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_outcomes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "visit_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_outcomes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "visit_tasks_detailed"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          lead_id: string | null
          priority: string | null
          restaurant_id: string | null
          title: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id?: string | null
          priority?: string | null
          restaurant_id?: string | null
          title: string
        }
        Update: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id?: string | null
          priority?: string | null
          restaurant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          must_reset_pw: boolean | null
          profile_pic_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          must_reset_pw?: boolean | null
          profile_pic_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          must_reset_pw?: boolean | null
          profile_pic_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      visit_comments: {
        Row: {
          author_user_id: string
          comment_text: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          updated_at: string | null
          visit_task_id: string
        }
        Insert: {
          author_user_id: string
          comment_text: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          visit_task_id: string
        }
        Update: {
          author_user_id?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          visit_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "visit_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_comments_visit_task_id_fkey"
            columns: ["visit_task_id"]
            isOneToOne: false
            referencedRelation: "visit_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_comments_visit_task_id_fkey"
            columns: ["visit_task_id"]
            isOneToOne: false
            referencedRelation: "visit_tasks_detailed"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_plans: {
        Row: {
          created_at: string | null
          created_by: string
          estimated_total_duration_minutes: number | null
          id: string
          plan_date: string
          remarks: string | null
          team_visible: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          estimated_total_duration_minutes?: number | null
          id?: string
          plan_date: string
          remarks?: string | null
          team_visible?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          estimated_total_duration_minutes?: number | null
          id?: string
          plan_date?: string
          remarks?: string | null
          team_visible?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_tasks: {
        Row: {
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          notes: string | null
          plan_id: string
          priority_level: string | null
          restaurant_id: string
          salesperson_uid: string
          status: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at: string | null
          visit_sequence: number | null
          visit_time: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id: string
          priority_level?: string | null
          restaurant_id: string
          salesperson_uid: string
          status?: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at?: string | null
          visit_sequence?: number | null
          visit_time?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id?: string
          priority_level?: string | null
          restaurant_id?: string
          salesperson_uid?: string
          status?: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at?: string | null
          visit_sequence?: number | null
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "visit_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_tasks_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_tasks_salesperson_uid_fkey"
            columns: ["salesperson_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          created_at: string | null
          created_by: string
          duration_sec: number | null
          file_url: string
          id: string
          linked_id: string | null
          linked_type: Database["public"]["Enums"]["voice_linked_type"] | null
          restaurant_id: string
          transcript: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          duration_sec?: number | null
          file_url: string
          id?: string
          linked_id?: string | null
          linked_type?: Database["public"]["Enums"]["voice_linked_type"] | null
          restaurant_id: string
          transcript?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          duration_sec?: number | null
          file_url?: string
          id?: string
          linked_id?: string | null
          linked_type?: Database["public"]["Enums"]["voice_linked_type"] | null
          restaurant_id?: string
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      visit_tasks_detailed: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string | null
          lead_assigned_to: string | null
          lead_assigned_user_name: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          next_action_date: string | null
          notes: string | null
          phone: string | null
          plan_id: string | null
          priority_level: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          salesperson_uid: string | null
          status: Database["public"]["Enums"]["visit_task_status"] | null
          township: string | null
          updated_at: string | null
          visit_sequence: number | null
          visit_time: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_user_id_fkey"
            columns: ["lead_assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "visit_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_tasks_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_tasks_salesperson_uid_fkey"
            columns: ["salesperson_uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_restaurant_timeline: {
        Args: { restaurant_uuid: string }
        Returns: {
          id: string
          type: string
          title: string
          description: string
          created_at: string
          created_by_name: string
          status: string
          metadata: Json
        }[]
      }
      invite_user: {
        Args: {
          p_new_user_email: string
          p_user_full_name: string
          p_user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
    }
    Enums: {
      lead_status:
        | "CONTACT_STAGE"
        | "MEETING_STAGE"
        | "PRESENTATION_NEGOTIATION"
        | "CLOSED_WON"
        | "CLOSED_LOST"
      note_target_type:
        | "lead"
        | "order"
        | "visit"
        | "meeting"
        | "restaurant"
        | "generic"
      order_status:
        | "PENDING_CONFIRMATION"
        | "CONFIRMED"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "CANCELLED"
      user_role: "admin" | "salesperson" | "staff" | "manager" | "viewer"
      visit_task_status: "PLANNED" | "VISITED" | "RESCHEDULED" | "CANCELED"
      voice_linked_type: "lead" | "order" | "visit" | "meeting" | "generic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: [
        "CONTACT_STAGE",
        "MEETING_STAGE",
        "PRESENTATION_NEGOTIATION",
        "CLOSED_WON",
        "CLOSED_LOST",
      ],
      note_target_type: [
        "lead",
        "order",
        "visit",
        "meeting",
        "restaurant",
        "generic",
      ],
      order_status: [
        "PENDING_CONFIRMATION",
        "CONFIRMED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      user_role: ["admin", "salesperson", "staff", "manager", "viewer"],
      visit_task_status: ["PLANNED", "VISITED", "RESCHEDULED", "CANCELED"],
      voice_linked_type: ["lead", "order", "visit", "meeting", "generic"],
    },
  },
} as const
