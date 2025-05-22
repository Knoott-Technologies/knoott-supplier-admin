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
      business_invitations: {
        Row: {
          business_id: string
          created_at: string
          id: string
          invitation_token: string
          role: Database["public"]["Enums"]["provider_businees_user_roles"]
          status: string
          updated_at: string
          user_email: string
          user_name: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          invitation_token: string
          role?: Database["public"]["Enums"]["provider_businees_user_roles"]
          status?: string
          updated_at?: string
          user_email: string
          user_name: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          invitation_token?: string
          role?: Database["public"]["Enums"]["provider_businees_user_roles"]
          status?: string
          updated_at?: string
          user_email?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_invitations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_invitations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          amount: number
          cart_id: number
          created_at: string
          id: number
          message: string | null
          metadata: Json
          wedding_gift_card_id: number | null
          wedding_product_id: number | null
        }
        Insert: {
          amount: number
          cart_id: number
          created_at?: string
          id?: number
          message?: string | null
          metadata: Json
          wedding_gift_card_id?: number | null
          wedding_product_id?: number | null
        }
        Update: {
          amount?: number
          cart_id?: number
          created_at?: string
          id?: number
          message?: string | null
          metadata?: Json
          wedding_gift_card_id?: number | null
          wedding_product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "user_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_wedding_gift_card_id_fkey"
            columns: ["wedding_gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_wedding_product_id_fkey"
            columns: ["wedding_product_id"]
            isOneToOne: false
            referencedRelation: "wedding_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_banners: {
        Row: {
          banner_status: Database["public"]["Enums"]["banner_status"]
          banner_style: Database["public"]["Enums"]["banner_styles"]
          brand_id: number | null
          category_id: number | null
          created_at: string
          custom_link: string | null
          ends_at: string
          id: number
          image_desktop: string
          image_mobile: string
          placement: number | null
          product_id: number | null
          starts_at: string
          text: string | null
          title: string | null
          type: Database["public"]["Enums"]["banner_types"]
        }
        Insert: {
          banner_status?: Database["public"]["Enums"]["banner_status"]
          banner_style?: Database["public"]["Enums"]["banner_styles"]
          brand_id?: number | null
          category_id?: number | null
          created_at?: string
          custom_link?: string | null
          ends_at?: string
          id?: number
          image_desktop: string
          image_mobile: string
          placement?: number | null
          product_id?: number | null
          starts_at?: string
          text?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["banner_types"]
        }
        Update: {
          banner_status?: Database["public"]["Enums"]["banner_status"]
          banner_style?: Database["public"]["Enums"]["banner_styles"]
          brand_id?: number | null
          category_id?: number | null
          created_at?: string
          custom_link?: string | null
          ends_at?: string
          id?: number
          image_desktop?: string
          image_mobile?: string
          placement?: number | null
          product_id?: number | null
          starts_at?: string
          text?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["banner_types"]
        }
        Relationships: [
          {
            foreignKeyName: "catalog_banners_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "random_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_placement_fkey"
            columns: ["placement"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_placement_fkey"
            columns: ["placement"]
            isOneToOne: false
            referencedRelation: "z_catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_banners_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "z_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_brands: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          logo_url: string | null
          name: string
          status: Database["public"]["Enums"]["brand_status"]
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          logo_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["brand_status"]
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          logo_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["brand_status"]
        }
        Relationships: []
      }
      catalog_collections: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          name: string
          parent_id: number | null
          status: Database["public"]["Enums"]["collection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          name: string
          parent_id?: number | null
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          name?: string
          parent_id?: number | null
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          bg_color: string | null
          bg_image_url: string | null
          created_at: string
          created_by: string
          current_amount: number
          description: string
          id: number
          last_updated_by: string | null
          title: string
          total_amount: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          bg_color?: string | null
          bg_image_url?: string | null
          created_at?: string
          created_by: string
          current_amount?: number
          description: string
          id?: number
          last_updated_by?: string | null
          title: string
          total_amount: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          bg_color?: string | null
          bg_image_url?: string | null
          created_at?: string
          created_by?: string
          current_amount?: number
          description?: string
          id?: number
          last_updated_by?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      knoott_ai_conversations: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          messages: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
          wedding_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          wedding_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knoott_ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knoott_ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knoott_ai_conversations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knoott_ai_conversations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          cancelation_reason: string | null
          canceled_at: string | null
          cart_id: number | null
          created_at: string
          currency: string
          description: string | null
          id: number
          last_payment_error: Json | null
          metadata: Json | null
          payment_intent_id: string
          status: string
          user_id: string
          wedding_id: string | null
        }
        Insert: {
          amount: number
          cancelation_reason?: string | null
          canceled_at?: string | null
          cart_id?: number | null
          created_at?: string
          currency: string
          description?: string | null
          id?: number
          last_payment_error?: Json | null
          metadata?: Json | null
          payment_intent_id: string
          status: string
          user_id?: string
          wedding_id?: string | null
        }
        Update: {
          amount?: number
          cancelation_reason?: string | null
          canceled_at?: string | null
          cart_id?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: number
          last_payment_error?: Json | null
          metadata?: Json | null
          payment_intent_id?: string
          status?: string
          user_id?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "user_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: number | null
          created_at: string
          description: string
          dimensions: Json | null
          embedding: string | null
          id: number
          images_url: string[]
          keywords: string[] | null
          name: string
          presence_in_gifts: number
          provider_business_id: string | null
          rejected_reason: string | null
          shipping_cost: number
          short_description: string
          short_name: string
          specs: Json | null
          status: Database["public"]["Enums"]["product_status"]
          subcategory_id: number
          updated_at: string
        }
        Insert: {
          brand_id?: number | null
          created_at?: string
          description: string
          dimensions?: Json | null
          embedding?: string | null
          id?: number
          images_url?: string[]
          keywords?: string[] | null
          name: string
          presence_in_gifts?: number
          provider_business_id?: string | null
          rejected_reason?: string | null
          shipping_cost?: number
          short_description: string
          short_name: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: number
          updated_at?: string
        }
        Update: {
          brand_id?: number | null
          created_at?: string
          description?: string
          dimensions?: Json | null
          embedding?: string | null
          id?: number
          images_url?: string[]
          keywords?: string[] | null
          name?: string
          presence_in_gifts?: number
          provider_business_id?: string | null
          rejected_reason?: string | null
          shipping_cost?: number
          short_description?: string
          short_name?: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "random_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      products_variant_options: {
        Row: {
          accorded_commision: number
          created_at: string
          display_name: string
          id: number
          images_url: string[] | null
          is_default: boolean
          metadata: Json | null
          name: string
          position: number
          price: number | null
          sku: string | null
          stock: number | null
          updated_at: string
          variant_id: number
        }
        Insert: {
          accorded_commision?: number
          created_at?: string
          display_name: string
          id?: number
          images_url?: string[] | null
          is_default?: boolean
          metadata?: Json | null
          name: string
          position?: number
          price?: number | null
          sku?: string | null
          stock?: number | null
          updated_at?: string
          variant_id: number
        }
        Update: {
          accorded_commision?: number
          created_at?: string
          display_name?: string
          id?: number
          images_url?: string[] | null
          is_default?: boolean
          metadata?: Json | null
          name?: string
          position?: number
          price?: number | null
          sku?: string | null
          stock?: number | null
          updated_at?: string
          variant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "variant_options_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "products_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      products_variants: {
        Row: {
          created_at: string
          display_name: string
          id: number
          name: string
          position: number
          product_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: number
          name: string
          position?: number
          product_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: number
          name?: string
          position?: number
          product_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "z_products"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_business: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          business_legal_name: string | null
          business_logo_url: string
          business_name: string
          business_sector: string | null
          city: string | null
          commission_percentage: number | null
          contact_phone_number: string | null
          country: string | null
          created_at: string
          delivery_zones: Json | null
          description: string | null
          external_number: string | null
          id: string
          internal_number: string | null
          is_verified: boolean
          main_email: string | null
          main_phone_number: string | null
          neighborhood: string | null
          postal_code: string | null
          reference: string
          rejection_reason: string | null
          social_media: Json | null
          state: string | null
          street: string | null
          tax_situation_url: string | null
          website_url: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_legal_name?: string | null
          business_logo_url: string
          business_name: string
          business_sector?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_phone_number?: string | null
          country?: string | null
          created_at?: string
          delivery_zones?: Json | null
          description?: string | null
          external_number?: string | null
          id?: string
          internal_number?: string | null
          is_verified?: boolean
          main_email?: string | null
          main_phone_number?: string | null
          neighborhood?: string | null
          postal_code?: string | null
          reference?: string
          rejection_reason?: string | null
          social_media?: Json | null
          state?: string | null
          street?: string | null
          tax_situation_url?: string | null
          website_url?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_legal_name?: string | null
          business_logo_url?: string
          business_name?: string
          business_sector?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_phone_number?: string | null
          country?: string | null
          created_at?: string
          delivery_zones?: Json | null
          description?: string | null
          external_number?: string | null
          id?: string
          internal_number?: string | null
          is_verified?: boolean
          main_email?: string | null
          main_phone_number?: string | null
          neighborhood?: string | null
          postal_code?: string | null
          reference?: string
          rejection_reason?: string | null
          social_media?: Json | null
          state?: string | null
          street?: string | null
          tax_situation_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      provider_business_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: number
          order_id: number | null
          provider_business_id: string | null
          receipt_url: string
          reference: string
          status: Database["public"]["Enums"]["transaction_status"]
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: number
          order_id?: number | null
          provider_business_id?: string | null
          receipt_url: string
          reference: string
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: number
          order_id?: number | null
          provider_business_id?: string | null
          receipt_url?: string
          reference?: string
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Relationships: [
          {
            foreignKeyName: "provider_business_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "wedding_product_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_business_transactions_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_business_transactions_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_business_users: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["provider_businees_user_roles"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["provider_businees_user_roles"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["provider_businees_user_roles"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_business_users_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_business_users_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_business_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_business_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          app_reference: string
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          app_reference?: string
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          app_reference?: string
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_auth_states: {
        Row: {
          business_id: string
          created_at: string
          id: string
          state: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          state: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_auth_states_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopify_auth_states_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_integrations: {
        Row: {
          access_token: string | null
          auto_sync: boolean | null
          business_id: string
          category_mapping: Json | null
          connected_at: string | null
          created_at: string
          id: string
          last_synced: string | null
          product_count: number | null
          scope: string | null
          shop_currency: string | null
          shop_domain: string
          shop_email: string | null
          shop_locale: string | null
          shop_name: string | null
          shop_owner: string | null
          shop_plan: string | null
          shop_timezone: string | null
          state: string | null
          status: string
          sync_completed_at: string | null
          sync_error: string | null
          sync_frequency: string | null
          sync_inventory: boolean | null
          sync_prices: boolean | null
          sync_products: boolean | null
          sync_progress: number | null
          sync_started_at: string | null
          sync_status: string | null
          updated_at: string
          webhooks: Json | null
        }
        Insert: {
          access_token?: string | null
          auto_sync?: boolean | null
          business_id: string
          category_mapping?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          last_synced?: string | null
          product_count?: number | null
          scope?: string | null
          shop_currency?: string | null
          shop_domain: string
          shop_email?: string | null
          shop_locale?: string | null
          shop_name?: string | null
          shop_owner?: string | null
          shop_plan?: string | null
          shop_timezone?: string | null
          state?: string | null
          status?: string
          sync_completed_at?: string | null
          sync_error?: string | null
          sync_frequency?: string | null
          sync_inventory?: boolean | null
          sync_prices?: boolean | null
          sync_products?: boolean | null
          sync_progress?: number | null
          sync_started_at?: string | null
          sync_status?: string | null
          updated_at?: string
          webhooks?: Json | null
        }
        Update: {
          access_token?: string | null
          auto_sync?: boolean | null
          business_id?: string
          category_mapping?: Json | null
          connected_at?: string | null
          created_at?: string
          id?: string
          last_synced?: string | null
          product_count?: number | null
          scope?: string | null
          shop_currency?: string | null
          shop_domain?: string
          shop_email?: string | null
          shop_locale?: string | null
          shop_name?: string | null
          shop_owner?: string | null
          shop_plan?: string | null
          shop_timezone?: string | null
          state?: string | null
          status?: string
          sync_completed_at?: string | null
          sync_error?: string | null
          sync_frequency?: string | null
          sync_inventory?: boolean | null
          sync_prices?: boolean | null
          sync_products?: boolean | null
          sync_progress?: number | null
          sync_started_at?: string | null
          sync_status?: string | null
          updated_at?: string
          webhooks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopify_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
        ]
      }
      user_carts: {
        Row: {
          created_at: string
          id: number
          message: string | null
          status: Database["public"]["Enums"]["cart_status"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
          status?: Database["public"]["Enums"]["cart_status"]
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
          status?: Database["public"]["Enums"]["cart_status"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_carts_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_carts_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string
          id: number
          message: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_marketing: boolean
          email_notifications: boolean
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email_marketing?: boolean
          email_notifications?: boolean
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email_marketing?: boolean
          email_notifications?: boolean
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_weddings: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["wedding_user_role"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["wedding_user_role"]
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["wedding_user_role"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_weddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_weddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_weddings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_weddings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string
          role: Database["public"]["Enums"]["admin_role"] | null
          status: Database["public"]["Enums"]["user_status"]
          stripe_cus_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number: string
          role?: Database["public"]["Enums"]["admin_role"] | null
          status?: Database["public"]["Enums"]["user_status"]
          stripe_cus_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["admin_role"] | null
          status?: Database["public"]["Enums"]["user_status"]
          stripe_cus_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wedding_addresses: {
        Row: {
          additional_notes: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean
          postal_code: string
          state: string
          street_address: string
          tag: string | null
          updated_at: string | null
          wedding_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean
          postal_code: string
          state: string
          street_address: string
          tag?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean
          postal_code?: string
          state?: string
          street_address?: string
          tag?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_addresses_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_addresses_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_invitations: {
        Row: {
          created_at: string | null
          id: string
          invitation_token: string
          partner_email: string
          partner_name: string
          status: string
          updated_at: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_token: string
          partner_email: string
          partner_name: string
          status?: string
          updated_at?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_token?: string
          partner_email?: string
          partner_name?: string
          status?: string
          updated_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_invitations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_invitations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_memories: {
        Row: {
          access_code: string
          created_at: string
          id: string
          is_active: boolean
          qr_code_url: string | null
          updated_at: string
          wedding_id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_url?: string | null
          updated_at?: string
          wedding_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_url?: string | null
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_memories_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_memories_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_product_orders: {
        Row: {
          address_id: string
          cancelation_reason: string | null
          canceled_at: string | null
          catalog_product_id: number | null
          catalog_product_variant_id: number | null
          confirmed_by: string | null
          created_at: string
          delivered_at: string | null
          "eta-first": string | null
          "eta-second": string | null
          id: number
          knoott_received_amount: number
          ordered_by: string
          paid_at: string | null
          povider_received_amount: number
          product_id: number | null
          provider_business_id: string | null
          shipped_at: string | null
          shipped_ordered_by: string | null
          shipping_guide_url: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          verified_at: string | null
          wedding_id: string
        }
        Insert: {
          address_id: string
          cancelation_reason?: string | null
          canceled_at?: string | null
          catalog_product_id?: number | null
          catalog_product_variant_id?: number | null
          confirmed_by?: string | null
          created_at?: string
          delivered_at?: string | null
          "eta-first"?: string | null
          "eta-second"?: string | null
          id?: number
          knoott_received_amount?: number
          ordered_by: string
          paid_at?: string | null
          povider_received_amount?: number
          product_id?: number | null
          provider_business_id?: string | null
          shipped_at?: string | null
          shipped_ordered_by?: string | null
          shipping_guide_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          verified_at?: string | null
          wedding_id: string
        }
        Update: {
          address_id?: string
          cancelation_reason?: string | null
          canceled_at?: string | null
          catalog_product_id?: number | null
          catalog_product_variant_id?: number | null
          confirmed_by?: string | null
          created_at?: string
          delivered_at?: string | null
          "eta-first"?: string | null
          "eta-second"?: string | null
          id?: number
          knoott_received_amount?: number
          ordered_by?: string
          paid_at?: string | null
          povider_received_amount?: number
          product_id?: number | null
          provider_business_id?: string | null
          shipped_at?: string | null
          shipped_ordered_by?: string | null
          shipping_guide_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          verified_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_product_orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "wedding_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "z_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_catalog_product_variant_id_fkey"
            columns: ["catalog_product_variant_id"]
            isOneToOne: false
            referencedRelation: "products_variant_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wedding_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_provider_business_id_fkey"
            columns: ["provider_business_id"]
            isOneToOne: false
            referencedRelation: "z_provider_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_shipped_ordered_by_fkey"
            columns: ["shipped_ordered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_shipped_ordered_by_fkey"
            columns: ["shipped_ordered_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_product_orders_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_products: {
        Row: {
          auto_purchase: boolean
          created_at: string
          created_by: string
          current_amount: number
          id: number
          is_ordered: boolean
          order_id: number | null
          product_id: number
          product_variant_option_id: number
          wedding_id: string
        }
        Insert: {
          auto_purchase?: boolean
          created_at?: string
          created_by: string
          current_amount?: number
          id?: number
          is_ordered?: boolean
          order_id?: number | null
          product_id: number
          product_variant_option_id: number
          wedding_id: string
        }
        Update: {
          auto_purchase?: boolean
          created_at?: string
          created_by?: string
          current_amount?: number
          id?: number
          is_ordered?: boolean
          order_id?: number | null
          product_id?: number
          product_variant_option_id?: number
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "wedding_product_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "z_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_product_variant_option_id_fkey"
            columns: ["product_variant_option_id"]
            isOneToOne: false
            referencedRelation: "products_variant_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_products_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_transactions: {
        Row: {
          amount: number
          cart_id: number | null
          created_at: string
          description: string | null
          id: number
          is_greeted: boolean
          knoott_received_amount: number | null
          reference: string
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_types"]
          user_id: string | null
          user_received_amount: number | null
          wedding_id: string
        }
        Insert: {
          amount?: number
          cart_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          is_greeted?: boolean
          knoott_received_amount?: number | null
          reference: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_types"]
          user_id?: string | null
          user_received_amount?: number | null
          wedding_id: string
        }
        Update: {
          amount?: number
          cart_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          is_greeted?: boolean
          knoott_received_amount?: number | null
          reference?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_types"]
          user_id?: string | null
          user_received_amount?: number | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_transactions_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "user_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_transactions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_transactions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_verify: {
        Row: {
          created_at: string
          document_back_url: string | null
          document_front_url: string
          document_type: string
          full_name: string
          id: number
          rejected_reason: string | null
          selfie_url: string
          status: Database["public"]["Enums"]["verify_status"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          document_back_url?: string | null
          document_front_url: string
          document_type: string
          full_name: string
          id?: number
          rejected_reason?: string | null
          selfie_url: string
          status?: Database["public"]["Enums"]["verify_status"]
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string
          document_type?: string
          full_name?: string
          id?: number
          rejected_reason?: string | null
          selfie_url?: string
          status?: Database["public"]["Enums"]["verify_status"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_verify_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_verify_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "z_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_verify_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_verify_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "z_weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          account_holder: string | null
          avatar_image_url: string
          balance: number | null
          bank: string | null
          bank_account_number: number
          banner_image_url: string
          city: string | null
          created_at: string
          id: string
          is_verified: boolean
          message: string
          name: string
          qr_code_url: string
          reference: string
          state: string | null
          status: Database["public"]["Enums"]["wedding_status"]
          updated_at: string
          wedding_date: string
        }
        Insert: {
          account_holder?: string | null
          avatar_image_url: string
          balance?: number | null
          bank?: string | null
          bank_account_number: number
          banner_image_url: string
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          message: string
          name: string
          qr_code_url: string
          reference: string
          state?: string | null
          status?: Database["public"]["Enums"]["wedding_status"]
          updated_at?: string
          wedding_date: string
        }
        Update: {
          account_holder?: string | null
          avatar_image_url?: string
          balance?: number | null
          bank?: string | null
          bank_account_number?: number
          banner_image_url?: string
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          message?: string
          name?: string
          qr_code_url?: string
          reference?: string
          state?: string | null
          status?: Database["public"]["Enums"]["wedding_status"]
          updated_at?: string
          wedding_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      random_brands: {
        Row: {
          created_at: string | null
          id: number | null
          image_url: string | null
          logo_url: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          image_url?: string | null
          logo_url?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          image_url?: string | null
          logo_url?: string | null
          name?: string | null
        }
        Relationships: []
      }
      z_catalog_brands: {
        Row: {
          created_at: string | null
          id: number | null
          image_url: string | null
          logo_url: string | null
          name: string | null
          status: Database["public"]["Enums"]["brand_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          image_url?: string | null
          logo_url?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["brand_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          image_url?: string | null
          logo_url?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["brand_status"] | null
        }
        Relationships: []
      }
      z_catalog_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: number | null
          image_url: string | null
          name: string | null
          parent_id: number | null
          parent_name: string | null
          status: Database["public"]["Enums"]["collection_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "z_catalog_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      z_knoott_account_balances: {
        Row: {
          account: string | null
          amount: number | null
          created_at: string | null
          description: string | null
          id: number | null
          provider_business_id: string | null
          provider_name: string | null
          running_balance: number | null
          source: string | null
          transaction_id: string | null
          type: string | null
          user_id: string | null
          user_name: string | null
          wedding_id: string | null
          wedding_name: string | null
        }
        Relationships: []
      }
      z_knoott_account_summary: {
        Row: {
          account: string | null
          current_balance: number | null
          total_income: number | null
          total_outcome: number | null
        }
        Relationships: []
      }
      z_knoott_commissions: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          operation_type: string | null
          order_id: number | null
          provider_business_id: string | null
          provider_name: string | null
          reference: string | null
          source: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string | null
          type: string | null
          user_id: string | null
          user_name: string | null
          wedding_id: string | null
          wedding_name: string | null
        }
        Relationships: []
      }
      z_knoott_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          destination: string | null
          is_commission: boolean | null
          operation_type: string | null
          order_id: number | null
          provider_business_id: string | null
          provider_name: string | null
          reference: string | null
          source: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string | null
          type: string | null
          user_id: string | null
          user_name: string | null
          wedding_id: string | null
          wedding_name: string | null
        }
        Relationships: []
      }
      z_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          id: number | null
          images_url: string[] | null
          name: string | null
          partner: string | null
          price: number | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string | null
        }
        Relationships: []
      }
      z_provider_business: {
        Row: {
          id: string | null
          name: string | null
          sector: string | null
          status: boolean | null
          total_active_products: number | null
          total_in_sales: number | null
          total_pending_sales: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      z_users: {
        Row: {
          email: string | null
          has_gifted: boolean | null
          has_table: boolean | null
          id: string | null
          is_provider: boolean | null
          name: string | null
          phone: string | null
          ticket_promedio: number | null
          total_contribution: number | null
          total_contribution_amount: number | null
        }
        Relationships: []
      }
      z_weddings: {
        Row: {
          balance: number | null
          id: string | null
          name: string | null
          status: Database["public"]["Enums"]["wedding_status"] | null
          total_contribution_count: number | null
          total_income: number | null
          total_purchases: number | null
          total_withdrawal: number | null
          wedding_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      cleanup_old_shopify_auth_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_info: {
        Args: { business_id: string }
        Returns: Json
      }
      get_user_provider_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: unknown
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: unknown
      }
      http_head: {
        Args: { uri: string }
        Returns: unknown
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: unknown
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin_for_business: {
        Args: { business_id: string }
        Returns: boolean
      }
      is_admin_of_business: {
        Args: { business_uuid: string }
        Returns: boolean
      }
      is_business_admin: {
        Args: { business_id: string }
        Returns: boolean
      }
      match_products: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          similarity: number
        }[]
      }
      search_products_by_delivery_zone: {
        Args: {
          p_city: string
          p_state: string
          p_product_name?: string
          p_product_keywords?: string[]
          p_description?: string
          p_brand_name?: string
          p_subcategory_id?: number
          p_brand_id?: number
          p_status?: string
          p_min_price?: number
          p_max_price?: number
          p_limit?: number
          p_offset?: number
          p_debug?: boolean
        }
        Returns: Json
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_embedding_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      admin_role: "superadmin" | "mod" | "marketing" | "account_manager"
      banner_status: "active" | "inactive"
      banner_styles: "main" | "secondary" | "tertiary" | "quaternary"
      banner_types: "brand" | "category" | "product"
      brand_status: "on_revision" | "active"
      cart_status: "pending" | "completed" | "abandoned"
      collection_status: "on_revision" | "active"
      order_status:
        | "paid"
        | "pending"
        | "shipped"
        | "delivered"
        | "canceled"
        | "requires_confirmation"
      product_status:
        | "active"
        | "archived"
        | "draft"
        | "requires_verification"
        | "deleted"
        | "rejected"
      provider_businees_user_roles: "admin" | "supervisor" | "staff"
      transaction_status: "completed" | "pending" | "canceled"
      transaction_types: "income" | "egress" | "purchase"
      user_provider_branches_role: "admin" | "supervisor" | "cashier"
      user_status: "active" | "deactivated" | "deleted"
      verify_status: "pending" | "on_revision" | "verified" | "rejected"
      wedding_status: "active" | "paused" | "closed"
      wedding_user_role: "admin" | "planner"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      admin_role: ["superadmin", "mod", "marketing", "account_manager"],
      banner_status: ["active", "inactive"],
      banner_styles: ["main", "secondary", "tertiary", "quaternary"],
      banner_types: ["brand", "category", "product"],
      brand_status: ["on_revision", "active"],
      cart_status: ["pending", "completed", "abandoned"],
      collection_status: ["on_revision", "active"],
      order_status: [
        "paid",
        "pending",
        "shipped",
        "delivered",
        "canceled",
        "requires_confirmation",
      ],
      product_status: [
        "active",
        "archived",
        "draft",
        "requires_verification",
        "deleted",
        "rejected",
      ],
      provider_businees_user_roles: ["admin", "supervisor", "staff"],
      transaction_status: ["completed", "pending", "canceled"],
      transaction_types: ["income", "egress", "purchase"],
      user_provider_branches_role: ["admin", "supervisor", "cashier"],
      user_status: ["active", "deactivated", "deleted"],
      verify_status: ["pending", "on_revision", "verified", "rejected"],
      wedding_status: ["active", "paused", "closed"],
      wedding_user_role: ["admin", "planner"],
    },
  },
} as const
