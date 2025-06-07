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
            referencedRelation: "dual_business_restaurant_view"
            referencedColumns: ["id"]
          },
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
      calls_backup: {
        Row: {
          call_date: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          outcome: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
          salesperson_id: string | null
          status: string | null
        }
        Insert: {
          call_date?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          outcome?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          salesperson_id?: string | null
          status?: string | null
        }
        Update: {
          call_date?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          outcome?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          salesperson_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      dual_business_visits: {
        Row: {
          collection_priority: string | null
          competitor_gas_info: string | null
          competitor_uco_info: string | null
          created_at: string | null
          driver_notes: string | null
          gas_objective: string | null
          gas_outcome: string | null
          gas_revenue: number | null
          gas_volume_sold: number | null
          id: string
          next_visit_recommendation: string | null
          priority_level: string | null
          restaurant_id: string | null
          route_sequence: number | null
          salesperson_uid: string | null
          township: string | null
          uco_collected_kg: number | null
          uco_price_paid: number | null
          uco_quality_score: number | null
          uco_status: string | null
          updated_at: string | null
          visit_date: string
          visit_notes: string | null
          visit_type: string | null
        }
        Insert: {
          collection_priority?: string | null
          competitor_gas_info?: string | null
          competitor_uco_info?: string | null
          created_at?: string | null
          driver_notes?: string | null
          gas_objective?: string | null
          gas_outcome?: string | null
          gas_revenue?: number | null
          gas_volume_sold?: number | null
          id?: string
          next_visit_recommendation?: string | null
          priority_level?: string | null
          restaurant_id?: string | null
          route_sequence?: number | null
          salesperson_uid?: string | null
          township?: string | null
          uco_collected_kg?: number | null
          uco_price_paid?: number | null
          uco_quality_score?: number | null
          uco_status?: string | null
          updated_at?: string | null
          visit_date: string
          visit_notes?: string | null
          visit_type?: string | null
        }
        Update: {
          collection_priority?: string | null
          competitor_gas_info?: string | null
          competitor_uco_info?: string | null
          created_at?: string | null
          driver_notes?: string | null
          gas_objective?: string | null
          gas_outcome?: string | null
          gas_revenue?: number | null
          gas_volume_sold?: number | null
          id?: string
          next_visit_recommendation?: string | null
          priority_level?: string | null
          restaurant_id?: string | null
          route_sequence?: number | null
          salesperson_uid?: string | null
          township?: string | null
          uco_collected_kg?: number | null
          uco_price_paid?: number | null
          uco_quality_score?: number | null
          uco_status?: string | null
          updated_at?: string | null
          visit_date?: string
          visit_notes?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dual_business_visits_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "dual_business_restaurant_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dual_business_visits_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dual_business_visits_salesperson_uid_fkey"
            columns: ["salesperson_uid"]
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
            referencedRelation: "dual_business_restaurant_view"
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
      leads_backup: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string | null
          id: string | null
          name: string | null
          next_action_date: string | null
          next_action_description: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
          source: string | null
          stage_entered_at: string | null
          stage_notes: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          next_action_date?: string | null
          next_action_description?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          source?: string | null
          stage_entered_at?: string | null
          stage_notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          next_action_date?: string | null
          next_action_description?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          source?: string | null
          stage_entered_at?: string | null
          stage_notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "dual_business_restaurant_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings_backup: {
        Row: {
          action_items: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string | null
          location: string | null
          meeting_date: string | null
          meeting_type: string | null
          outcome: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
          scheduled_by_user_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          action_items?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          location?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          outcome?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          scheduled_by_user_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          action_items?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          location?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          outcome?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          scheduled_by_user_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migration_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          record_count: number | null
          table_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_count?: number | null
          table_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_count?: number | null
          table_name?: string | null
        }
        Relationships: []
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
      notes_backup: {
        Row: {
          author_uid: string | null
          body: string | null
          created_at: string | null
          id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
          target_id: string | null
          target_type: Database["public"]["Enums"]["note_target_type"] | null
          updated_at: string | null
        }
        Insert: {
          author_uid?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["note_target_type"] | null
          updated_at?: string | null
        }
        Update: {
          author_uid?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["note_target_type"] | null
          updated_at?: string | null
        }
        Relationships: []
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
      orders: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          delivery_date_actual: string | null
          delivery_date_scheduled: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount_kyats: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          delivery_date_actual?: string | null
          delivery_date_scheduled?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number: string
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount_kyats?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          delivery_date_actual?: string | null
          delivery_date_scheduled?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"]
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
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "dual_business_restaurant_view"
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
      restaurant_id_mapping: {
        Row: {
          match_confidence: string | null
          new_restaurant_id: string | null
          old_restaurant_id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
        }
        Insert: {
          match_confidence?: string | null
          new_restaurant_id?: string | null
          old_restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
        }
        Update: {
          match_confidence?: string | null
          new_restaurant_id?: string | null
          old_restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          avg_uco_volume_kg: number | null
          business_types: Json | null
          competitor_info: Json | null
          contact_person: string | null
          created_at: string
          gas_consumption_estimate: string | null
          gas_customer_status: string | null
          id: string
          last_uco_collection_date: string | null
          name: string
          phone: string | null
          remarks: string | null
          salesperson_id: string
          township: string | null
          uco_price_per_kg: number | null
          uco_supplier_status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avg_uco_volume_kg?: number | null
          business_types?: Json | null
          competitor_info?: Json | null
          contact_person?: string | null
          created_at?: string
          gas_consumption_estimate?: string | null
          gas_customer_status?: string | null
          id?: string
          last_uco_collection_date?: string | null
          name: string
          phone?: string | null
          remarks?: string | null
          salesperson_id: string
          township?: string | null
          uco_price_per_kg?: number | null
          uco_supplier_status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avg_uco_volume_kg?: number | null
          business_types?: Json | null
          competitor_info?: Json | null
          contact_person?: string | null
          created_at?: string
          gas_consumption_estimate?: string | null
          gas_customer_status?: string | null
          id?: string
          last_uco_collection_date?: string | null
          name?: string
          phone?: string | null
          remarks?: string | null
          salesperson_id?: string
          township?: string | null
          uco_price_per_kg?: number | null
          uco_supplier_status?: string | null
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
      restaurants_staging: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          remarks: string | null
          salesperson_id: string
          township: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          remarks?: string | null
          salesperson_id: string
          township?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          remarks?: string | null
          salesperson_id?: string
          township?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "dual_business_restaurant_view"
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
      uco_collection_items: {
        Row: {
          actual_volume_kg: number | null
          collection_priority:
            | Database["public"]["Enums"]["collection_priority_enum"]
            | null
          competitor_notes: string | null
          completed_at: string | null
          created_at: string | null
          driver_notes: string | null
          expected_volume_kg: number | null
          id: string
          plan_id: string | null
          price_per_kg: number | null
          quality_score: number | null
          restaurant_id: string | null
          route_sequence: number | null
          uco_status: Database["public"]["Enums"]["uco_status_enum"] | null
          updated_at: string | null
          visit_time: string | null
        }
        Insert: {
          actual_volume_kg?: number | null
          collection_priority?:
            | Database["public"]["Enums"]["collection_priority_enum"]
            | null
          competitor_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_notes?: string | null
          expected_volume_kg?: number | null
          id?: string
          plan_id?: string | null
          price_per_kg?: number | null
          quality_score?: number | null
          restaurant_id?: string | null
          route_sequence?: number | null
          uco_status?: Database["public"]["Enums"]["uco_status_enum"] | null
          updated_at?: string | null
          visit_time?: string | null
        }
        Update: {
          actual_volume_kg?: number | null
          collection_priority?:
            | Database["public"]["Enums"]["collection_priority_enum"]
            | null
          competitor_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_notes?: string | null
          expected_volume_kg?: number | null
          id?: string
          plan_id?: string | null
          price_per_kg?: number | null
          quality_score?: number | null
          restaurant_id?: string | null
          route_sequence?: number | null
          uco_status?: Database["public"]["Enums"]["uco_status_enum"] | null
          updated_at?: string | null
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uco_collection_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "uco_collection_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uco_collection_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "dual_business_restaurant_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uco_collection_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      uco_collection_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          driver_name: string | null
          id: string
          plan_date: string
          plan_name: string
          township: string
          truck_capacity_kg: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          driver_name?: string | null
          id?: string
          plan_date: string
          plan_name: string
          township: string
          truck_capacity_kg?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          driver_name?: string | null
          id?: string
          plan_date?: string
          plan_name?: string
          township?: string
          truck_capacity_kg?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uco_collection_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "visit_comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "dual_business_restaurant_view"
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
      visit_tasks_backup: {
        Row: {
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string | null
          notes: string | null
          plan_id: string | null
          priority_level: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          restaurant_township: string | null
          salesperson_uid: string | null
          status: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at: string | null
          visit_sequence: number | null
          visit_time: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string | null
          notes?: string | null
          plan_id?: string | null
          priority_level?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          salesperson_uid?: string | null
          status?: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at?: string | null
          visit_sequence?: number | null
          visit_time?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string | null
          notes?: string | null
          plan_id?: string | null
          priority_level?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_township?: string | null
          salesperson_uid?: string | null
          status?: Database["public"]["Enums"]["visit_task_status"] | null
          updated_at?: string | null
          visit_sequence?: number | null
          visit_time?: string | null
        }
        Relationships: []
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
            referencedRelation: "dual_business_restaurant_view"
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
      dual_business_restaurant_view: {
        Row: {
          address: string | null
          avg_uco_volume_kg: number | null
          business_category: string | null
          business_types: Json | null
          competitor_info: Json | null
          contact_person: string | null
          created_at: string | null
          gas_consumption_estimate: string | null
          gas_customer_status: string | null
          gas_revenue_last_30_days: number | null
          id: string | null
          last_uco_collection_date: string | null
          name: string | null
          phone: string | null
          remarks: string | null
          salesperson_id: string | null
          township: string | null
          uco_collected_last_30_days: number | null
          uco_price_per_kg: number | null
          uco_supplier_status: string | null
          updated_at: string | null
          visits_last_30_days: number | null
        }
        Insert: {
          address?: string | null
          avg_uco_volume_kg?: number | null
          business_category?: never
          business_types?: Json | null
          competitor_info?: Json | null
          contact_person?: string | null
          created_at?: string | null
          gas_consumption_estimate?: string | null
          gas_customer_status?: string | null
          gas_revenue_last_30_days?: never
          id?: string | null
          last_uco_collection_date?: string | null
          name?: string | null
          phone?: string | null
          remarks?: string | null
          salesperson_id?: string | null
          township?: string | null
          uco_collected_last_30_days?: never
          uco_price_per_kg?: number | null
          uco_supplier_status?: string | null
          updated_at?: string | null
          visits_last_30_days?: never
        }
        Update: {
          address?: string | null
          avg_uco_volume_kg?: number | null
          business_category?: never
          business_types?: Json | null
          competitor_info?: Json | null
          contact_person?: string | null
          created_at?: string | null
          gas_consumption_estimate?: string | null
          gas_customer_status?: string | null
          gas_revenue_last_30_days?: never
          id?: string | null
          last_uco_collection_date?: string | null
          name?: string | null
          phone?: string | null
          remarks?: string | null
          salesperson_id?: string | null
          township?: string | null
          uco_collected_last_30_days?: never
          uco_price_per_kg?: number | null
          uco_supplier_status?: string | null
          updated_at?: string | null
          visits_last_30_days?: never
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
      township_uco_analytics: {
        Row: {
          active_suppliers: number | null
          avg_volume_per_restaurant: number | null
          potential_suppliers: number | null
          total_collected_last_30_days: number | null
          total_restaurants: number | null
          township: string | null
          visits_last_30_days: number | null
        }
        Relationships: []
      }
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
            referencedRelation: "dual_business_restaurant_view"
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
      delete_all_restaurants_safely: {
        Args: Record<PropertyKey, never>
        Returns: {
          success: boolean
          deleted_count: number
          message: string
        }[]
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_restaurant_timeline: {
        Args: Record<PropertyKey, never> | { restaurant_uuid: string }
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
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      business_type:
        | "gas_prospect"
        | "gas_customer"
        | "uco_supplier"
        | "dual_business"
      collection_priority_enum: "confirmed" | "high" | "medium" | "low" | "skip"
      gas_customer_status:
        | "prospect"
        | "contacted"
        | "interested"
        | "negotiating"
        | "active_customer"
        | "lost_customer"
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
      uco_status_enum:
        | "have_uco"
        | "no_uco_reuse_staff"
        | "no_uco_not_ready"
        | "shop_closed"
        | "not_assessed"
      uco_supplier_status:
        | "not_assessed"
        | "high_potential"
        | "medium_potential"
        | "low_potential"
        | "active_supplier"
        | "inactive"
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
      business_type: [
        "gas_prospect",
        "gas_customer",
        "uco_supplier",
        "dual_business",
      ],
      collection_priority_enum: ["confirmed", "high", "medium", "low", "skip"],
      gas_customer_status: [
        "prospect",
        "contacted",
        "interested",
        "negotiating",
        "active_customer",
        "lost_customer",
      ],
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
      uco_status_enum: [
        "have_uco",
        "no_uco_reuse_staff",
        "no_uco_not_ready",
        "shop_closed",
        "not_assessed",
      ],
      uco_supplier_status: [
        "not_assessed",
        "high_potential",
        "medium_potential",
        "low_potential",
        "active_supplier",
        "inactive",
      ],
      user_role: ["admin", "salesperson", "staff", "manager", "viewer"],
      visit_task_status: ["PLANNED", "VISITED", "RESCHEDULED", "CANCELED"],
      voice_linked_type: ["lead", "order", "visit", "meeting", "generic"],
    },
  },
} as const
