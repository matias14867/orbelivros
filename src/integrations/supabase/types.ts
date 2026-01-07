export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          handle: string
          id: string
          image_url: string | null
          in_stock: boolean | null
          original_price: number | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          handle: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          original_price?: number | null
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          handle?: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          original_price?: number | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cj_sync_log: {
        Row: {
          completed_at: string | null
          errors: Json | null
          id: string
          products_synced: number | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          products_synced?: number | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          products_synced?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          resolved_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          resolved_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_handle: string
          product_image: string | null
          product_price: number | null
          product_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_handle: string
          product_image?: string | null
          product_price?: number | null
          product_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_handle?: string
          product_image?: string | null
          product_price?: number | null
          product_title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cj_variant_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          quantity: number
          sku: string | null
          title: string
          total_price: number
          unit_price: number
        }
        Insert: {
          cj_variant_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          quantity?: number
          sku?: string | null
          title: string
          total_price: number
          unit_price: number
        }
        Update: {
          cj_variant_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          sku?: string | null
          title?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          cj_order_id: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          id: string
          logistic_name: string | null
          order_number: string
          paid_at: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address: string
          shipping_address2: string | null
          shipping_city: string
          shipping_cost: number | null
          shipping_country: string | null
          shipping_country_code: string | null
          shipping_email: string | null
          shipping_name: string
          shipping_phone: string
          shipping_state: string
          shipping_zip: string
          status: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cj_order_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          logistic_name?: string | null
          order_number: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address: string
          shipping_address2?: string | null
          shipping_city: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_country_code?: string | null
          shipping_email?: string | null
          shipping_name: string
          shipping_phone: string
          shipping_state: string
          shipping_zip: string
          status?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          cj_order_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          logistic_name?: string | null
          order_number?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: string
          shipping_address2?: string | null
          shipping_city?: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_country_code?: string | null
          shipping_email?: string | null
          shipping_name?: string
          shipping_phone?: string
          shipping_state?: string
          shipping_zip?: string
          status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pending_purchases: {
        Row: {
          created_at: string
          id: string
          items: Json
          reference_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          reference_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          reference_id?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          cj_category_id: string | null
          cj_product_id: string | null
          cj_variant_id: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          handle: string
          id: string
          image_url: string | null
          images: Json | null
          in_stock: boolean | null
          price: number
          shipping_time: string | null
          sku: string | null
          stock_quantity: number | null
          supplier_name: string | null
          title: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          category?: string | null
          cj_category_id?: string | null
          cj_product_id?: string | null
          cj_variant_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          handle: string
          id?: string
          image_url?: string | null
          images?: Json | null
          in_stock?: boolean | null
          price: number
          shipping_time?: string | null
          sku?: string | null
          stock_quantity?: number | null
          supplier_name?: string | null
          title: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          category?: string | null
          cj_category_id?: string | null
          cj_product_id?: string | null
          cj_variant_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          handle?: string
          id?: string
          image_url?: string | null
          images?: Json | null
          in_stock?: boolean | null
          price?: number
          shipping_time?: string | null
          sku?: string | null
          stock_quantity?: number | null
          supplier_name?: string | null
          title?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_history: {
        Row: {
          id: string
          order_id: string
          product_handle: string
          product_image: string | null
          product_price: number
          product_title: string
          purchased_at: string
          quantity: number
          user_id: string
        }
        Insert: {
          id?: string
          order_id: string
          product_handle: string
          product_image?: string | null
          product_price: number
          product_title: string
          purchased_at?: string
          quantity?: number
          user_id: string
        }
        Update: {
          id?: string
          order_id?: string
          product_handle?: string
          product_image?: string | null
          product_price?: number
          product_title?: string
          purchased_at?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_pending_purchases: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "subscriber"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "subscriber"],
    },
  },
} as const
