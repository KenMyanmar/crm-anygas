
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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'salesperson' | 'staff'
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'salesperson' | 'staff'
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'salesperson' | 'staff'
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          township: string | null
          address: string | null
          maps_link: string | null
          contact_person_name: string | null
          phone_primary: string
          phone_secondary: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by_user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          township?: string | null
          address?: string | null
          maps_link?: string | null
          contact_person_name?: string | null
          phone_primary: string
          phone_secondary?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by_user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          township?: string | null
          address?: string | null
          maps_link?: string | null
          contact_person_name?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by_user_id?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          restaurant_id: string
          status: 'NEW' | 'CONTACTED' | 'NEEDS_FOLLOW_UP' | 'TRIAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD'
          lost_reason: string | null
          next_action_description: string | null
          next_action_date: string | null
          assigned_to_user_id: string | null
          created_at: string
          updated_at: string
          created_by_user_id: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          status?: 'NEW' | 'CONTACTED' | 'NEEDS_FOLLOW_UP' | 'TRIAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD'
          lost_reason?: string | null
          next_action_description?: string | null
          next_action_date?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          updated_at?: string
          created_by_user_id?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          status?: 'NEW' | 'CONTACTED' | 'NEEDS_FOLLOW_UP' | 'TRIAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD'
          lost_reason?: string | null
          next_action_description?: string | null
          next_action_date?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          updated_at?: string
          created_by_user_id?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          cylinder_size_kg: number
          brand: string
          default_price_kyats: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cylinder_size_kg: number
          brand: string
          default_price_kyats?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cylinder_size_kg?: number
          brand?: string
          default_price_kyats?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          lead_id: string | null
          order_date: string
          delivery_date_scheduled: string | null
          delivery_date_actual: string | null
          status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
          total_amount_kyats: number
          notes: string | null
          created_by_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          lead_id?: string | null
          order_date?: string
          delivery_date_scheduled?: string | null
          delivery_date_actual?: string | null
          status?: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
          total_amount_kyats?: number
          notes?: string | null
          created_by_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          lead_id?: string | null
          order_date?: string
          delivery_date_scheduled?: string | null
          delivery_date_actual?: string | null
          status?: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
          total_amount_kyats?: number
          notes?: string | null
          created_by_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price_kyats: number
          sub_total_kyats: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price_kyats: number
          sub_total_kyats: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price_kyats?: number
          sub_total_kyats?: number
          created_at?: string
        }
      }
      call_logs: {
        Row: {
          id: string
          lead_id: string | null
          restaurant_id: string | null
          logged_by_user_id: string
          call_timestamp: string
          call_type: 'OUTBOUND' | 'INBOUND'
          call_outcome: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          restaurant_id?: string | null
          logged_by_user_id: string
          call_timestamp?: string
          call_type: 'OUTBOUND' | 'INBOUND'
          call_outcome?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          restaurant_id?: string | null
          logged_by_user_id?: string
          call_timestamp?: string
          call_type?: 'OUTBOUND' | 'INBOUND'
          call_outcome?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          target_id: string | null
          target_type: 'LEAD' | 'ORDER' | 'RESTAURANT' | 'USER' | 'CALL_LOG' | 'SYSTEM' | null
          activity_message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          target_id?: string | null
          target_type?: 'LEAD' | 'ORDER' | 'RESTAURANT' | 'USER' | 'CALL_LOG' | 'SYSTEM' | null
          activity_message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          target_id?: string | null
          target_type?: 'LEAD' | 'ORDER' | 'RESTAURANT' | 'USER' | 'CALL_LOG' | 'SYSTEM' | null
          activity_message?: string
          created_at?: string
        }
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      get_my_dashboard_data: {
        Args: Record<string, never>
        Returns: {
          lead_summary: {
            status: string
            count: number
          }[]
          upcoming_actions: {
            id: string
            restaurant_name: string
            next_action_description: string
            next_action_date: string
            status: string
          }[]
          recent_activity: {
            id: string
            user_id: string | null
            target_id: string | null
            target_type: string | null
            activity_message: string
            created_at: string
          }[]
          notifications: {
            id: string
            user_id: string
            title: string
            message: string
            link: string | null
            read: boolean
            created_at: string
          }[]
        }
      }
      invite_user: {
        Args: {
          p_new_user_email: string
          p_user_full_name: string
          p_user_role: 'admin' | 'salesperson' | 'staff'
        }
        Returns: Json
      }
    }
  }
}
