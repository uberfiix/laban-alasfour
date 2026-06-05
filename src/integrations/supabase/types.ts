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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_type: string
          created_at: string
          display_name: string | null
          email: string | null
          external_id: string | null
          id: string
          is_blocked: boolean
          metadata: Json | null
          opt_in: boolean
          phone_number: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          contact_type: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          is_blocked?: boolean
          metadata?: Json | null
          opt_in?: boolean
          phone_number: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          is_blocked?: boolean
          metadata?: Json | null
          opt_in?: boolean
          phone_number?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_logs: {
        Row: {
          id: string
          logged_at: string
          outgoing_message_id: string
          status_after: Database["public"]["Enums"]["message_status"]
          status_before: Database["public"]["Enums"]["message_status"]
          status_reason: string | null
          webhook_data: Json | null
        }
        Insert: {
          id?: string
          logged_at?: string
          outgoing_message_id: string
          status_after: Database["public"]["Enums"]["message_status"]
          status_before: Database["public"]["Enums"]["message_status"]
          status_reason?: string | null
          webhook_data?: Json | null
        }
        Update: {
          id?: string
          logged_at?: string
          outgoing_message_id?: string
          status_after?: Database["public"]["Enums"]["message_status"]
          status_before?: Database["public"]["Enums"]["message_status"]
          status_reason?: string | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_logs_outgoing_message_id_fkey"
            columns: ["outgoing_message_id"]
            isOneToOne: false
            referencedRelation: "outgoing_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      document_review_history: {
        Row: {
          action: string
          created_at: string
          document_id: string
          id: string
          notes: string | null
          notification_type: string | null
          reviewer_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          document_id: string
          id?: string
          notes?: string | null
          notification_type?: string | null
          reviewer_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          notes?: string | null
          notification_type?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_review_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_history_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "document_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      document_reviewers: {
        Row: {
          created_at: string
          department: string
          document_id: string
          id: string
          notes: string | null
          notified_at: string | null
          review_order: number
          reviewed_at: string | null
          reviewer_email: string
          reviewer_name: string
          reviewer_phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          document_id: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          review_order: number
          reviewed_at?: string | null
          reviewer_email: string
          reviewer_name: string
          reviewer_phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          document_id?: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          review_order?: number
          reviewed_at?: string | null
          reviewer_email?: string
          reviewer_name?: string
          reviewer_phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_reviewers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          approved_at: string | null
          created_at: string
          current_reviewer_order: number | null
          description: string | null
          file_urls: Json | null
          id: string
          project_id: string | null
          sender_name: string
          status: Database["public"]["Enums"]["document_status"] | null
          submitted_at: string | null
          title: string
          total_reviewers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          current_reviewer_order?: number | null
          description?: string | null
          file_urls?: Json | null
          id?: string
          project_id?: string | null
          sender_name: string
          status?: Database["public"]["Enums"]["document_status"] | null
          submitted_at?: string | null
          title: string
          total_reviewers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          current_reviewer_order?: number | null
          description?: string | null
          file_urls?: Json | null
          id?: string
          project_id?: string | null
          sender_name?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          submitted_at?: string | null
          title?: string
          total_reviewers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          contact_id: string | null
          created_at: string
          event_data: Json
          event_type: Database["public"]["Enums"]["event_type"]
          external_event_id: string | null
          id: string
          source_system: string
          template_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          event_data: Json
          event_type: Database["public"]["Enums"]["event_type"]
          external_event_id?: string | null
          id?: string
          source_system: string
          template_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          event_data?: Json
          event_type?: Database["public"]["Enums"]["event_type"]
          external_event_id?: string | null
          id?: string
          source_system?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_messages: {
        Row: {
          contact_id: string | null
          created_at: string
          has_media: boolean
          id: string
          message_text: string | null
          received_at: string
          sender_phone: string
          whatsapp_account_id: string
          whatsapp_message_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          has_media?: boolean
          id?: string
          message_text?: string | null
          received_at: string
          sender_phone: string
          whatsapp_account_id: string
          whatsapp_message_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          has_media?: boolean
          id?: string
          message_text?: string | null
          received_at?: string
          sender_phone?: string
          whatsapp_account_id?: string
          whatsapp_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_messages_whatsapp_account_id_fkey"
            columns: ["whatsapp_account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          attachments: Json | null
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          currency_code: string | null
          daftra_invoice_id: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string | null
          is_draft: boolean | null
          is_sent: boolean | null
          is_viewed: boolean | null
          issue_date: string
          items: Json | null
          notes: string | null
          paid_amount: number
          paid_date: string | null
          pdf_url: string | null
          po_number: string | null
          sent_date: string | null
          staff_id: string | null
          status: string
          subtotal: number
          synced_at: string | null
          tax_amount: number
          terms: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          amount?: number
          attachments?: Json | null
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          currency_code?: string | null
          daftra_invoice_id?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_type?: string | null
          is_draft?: boolean | null
          is_sent?: boolean | null
          is_viewed?: boolean | null
          issue_date: string
          items?: Json | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          pdf_url?: string | null
          po_number?: string | null
          sent_date?: string | null
          staff_id?: string | null
          status?: string
          subtotal?: number
          synced_at?: string | null
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          amount?: number
          attachments?: Json | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          currency_code?: string | null
          daftra_invoice_id?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string | null
          is_draft?: boolean | null
          is_sent?: boolean | null
          is_viewed?: boolean | null
          issue_date?: string
          items?: Json | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          pdf_url?: string | null
          po_number?: string | null
          sent_date?: string | null
          staff_id?: string | null
          status?: string
          subtotal?: number
          synced_at?: string | null
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          created_at: string
          download_url: string | null
          external_entity_id: string | null
          external_entity_type: string | null
          file_name: string | null
          file_size: number | null
          hash_sha256: string | null
          id: string
          incoming_message_id: string | null
          last_retry_at: string | null
          media_status: Database["public"]["Enums"]["media_status"]
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string | null
          retry_count: number
          status_message: string | null
          storage_path: string
          storage_provider: string
          tags: string[] | null
          updated_at: string
          whatsapp_media_id: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          external_entity_id?: string | null
          external_entity_type?: string | null
          file_name?: string | null
          file_size?: number | null
          hash_sha256?: string | null
          id?: string
          incoming_message_id?: string | null
          last_retry_at?: string | null
          media_status?: Database["public"]["Enums"]["media_status"]
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          retry_count?: number
          status_message?: string | null
          storage_path: string
          storage_provider?: string
          tags?: string[] | null
          updated_at?: string
          whatsapp_media_id: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          external_entity_id?: string | null
          external_entity_type?: string | null
          file_name?: string | null
          file_size?: number | null
          hash_sha256?: string | null
          id?: string
          incoming_message_id?: string | null
          last_retry_at?: string | null
          media_status?: Database["public"]["Enums"]["media_status"]
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          retry_count?: number
          status_message?: string | null
          storage_path?: string
          storage_provider?: string
          tags?: string[] | null
          updated_at?: string
          whatsapp_media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_incoming_message_id_fkey"
            columns: ["incoming_message_id"]
            isOneToOne: false
            referencedRelation: "incoming_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_text: string
          buttons: Json
          created_at: string
          created_by: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          footer_text: string | null
          header_text: string | null
          id: string
          is_active: boolean
          language: string | null
          template_key: string
          template_name: string
          updated_at: string
          variables: Json
        }
        Insert: {
          body_text: string
          buttons?: Json
          created_at?: string
          created_by?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          template_key: string
          template_name: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          body_text?: string
          buttons?: Json
          created_at?: string
          created_by?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          template_key?: string
          template_name?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_messages: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          delivered_at: string | null
          error_reason: string | null
          event_id: string | null
          id: string
          max_retries: number
          message_status: Database["public"]["Enums"]["message_status"]
          next_retry_at: string | null
          read_at: string | null
          rendered_body: string
          rendered_buttons: Json | null
          retry_count: number
          status_changed_at: string | null
          template_id: string | null
          updated_at: string
          whatsapp_account_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          error_reason?: string | null
          event_id?: string | null
          id?: string
          max_retries?: number
          message_status?: Database["public"]["Enums"]["message_status"]
          next_retry_at?: string | null
          read_at?: string | null
          rendered_body: string
          rendered_buttons?: Json | null
          retry_count?: number
          status_changed_at?: string | null
          template_id?: string | null
          updated_at?: string
          whatsapp_account_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          error_reason?: string | null
          event_id?: string | null
          id?: string
          max_retries?: number
          message_status?: Database["public"]["Enums"]["message_status"]
          next_retry_at?: string | null
          read_at?: string | null
          rendered_body?: string
          rendered_buttons?: Json | null
          retry_count?: number
          status_changed_at?: string | null
          template_id?: string | null
          updated_at?: string
          whatsapp_account_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_messages_whatsapp_account_id_fkey"
            columns: ["whatsapp_account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_number: string | null
          amount: number
          attachments: Json | null
          bank_name: string | null
          created_at: string | null
          currency_code: string | null
          daftra_payment_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          receipt_url: string | null
          reference_number: string | null
          staff_id: string | null
          status: string | null
          synced_at: string | null
          transaction_id: string | null
          treasury_id: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          attachments?: Json | null
          bank_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          daftra_payment_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          staff_id?: string | null
          status?: string | null
          synced_at?: string | null
          transaction_id?: string | null
          treasury_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          attachments?: Json | null
          bank_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          daftra_payment_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          staff_id?: string | null
          status?: string | null
          synced_at?: string | null
          transaction_id?: string | null
          treasury_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name_ar: string | null
          name_en: string | null
          price: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          price?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          price?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
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
        ]
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          cost_price: number | null
          created_at: string
          currency: string
          description_ar: string | null
          description_en: string | null
          dimensions: Json | null
          has_vr_experience: boolean | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          low_stock_threshold: number | null
          materials: string[] | null
          meta_description: string | null
          meta_title: string | null
          model_3d_url: string | null
          name_ar: string
          name_en: string
          price: number
          rating_average: number | null
          rating_count: number | null
          sale_price: number | null
          short_description_ar: string | null
          short_description_en: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number
          tags: string[] | null
          updated_at: string
          video_url: string | null
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          cost_price?: number | null
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          dimensions?: Json | null
          has_vr_experience?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          model_3d_url?: string | null
          name_ar: string
          name_en: string
          price?: number
          rating_average?: number | null
          rating_count?: number | null
          sale_price?: number | null
          short_description_ar?: string | null
          short_description_en?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          cost_price?: number | null
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          dimensions?: Json | null
          has_vr_experience?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          model_3d_url?: string | null
          name_ar?: string
          name_en?: string
          price?: number
          rating_average?: number | null
          rating_count?: number | null
          sale_price?: number | null
          short_description_ar?: string | null
          short_description_en?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          business_name: string | null
          city: string | null
          company_name: string | null
          country_code: string | null
          created_at: string | null
          daftra_client_id: string | null
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_login_at: string | null
          notification_email: boolean | null
          notification_sms: boolean | null
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          state: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          daftra_client_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_login_at?: string | null
          notification_email?: boolean | null
          notification_sms?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          daftra_client_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_login_at?: string | null
          notification_email?: boolean | null
          notification_sms?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          actual_cost: number | null
          attachments: Json | null
          budget: number | null
          created_at: string | null
          currency_code: string | null
          daftra_project_id: string | null
          deliverables: Json | null
          description: string | null
          documents: Json | null
          end_date: string | null
          estimated_completion_date: string | null
          id: string
          internal_notes: string | null
          milestones: Json | null
          name: string
          priority: string | null
          progress: number | null
          project_manager: string | null
          project_type: string | null
          start_date: string | null
          status: string
          synced_at: string | null
          tasks: Json | null
          team_members: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: Json | null
          budget?: number | null
          created_at?: string | null
          currency_code?: string | null
          daftra_project_id?: string | null
          deliverables?: Json | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          estimated_completion_date?: string | null
          id?: string
          internal_notes?: string | null
          milestones?: Json | null
          name: string
          priority?: string | null
          progress?: number | null
          project_manager?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          synced_at?: string | null
          tasks?: Json | null
          team_members?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: Json | null
          budget?: number | null
          created_at?: string | null
          currency_code?: string | null
          daftra_project_id?: string | null
          deliverables?: Json | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          estimated_completion_date?: string | null
          id?: string
          internal_notes?: string | null
          milestones?: Json | null
          name?: string
          priority?: string | null
          progress?: number | null
          project_manager?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string
          synced_at?: string | null
          tasks?: Json | null
          team_members?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          admin_user_id: string | null
          completed_at: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          records_failed: number | null
          records_processed: number | null
          records_synced: number | null
          records_updated: number | null
          started_at: string | null
          status: string
          sync_details: Json | null
          sync_method: string | null
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          admin_user_id?: string | null
          completed_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_synced?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          sync_details?: Json | null
          sync_method?: string | null
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          admin_user_id?: string | null
          completed_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_synced?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          sync_details?: Json | null
          sync_method?: string | null
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          bucket_id: string
          category_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          mime_type: string | null
          original_name: string
          product_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket_id: string
          category_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          original_name: string
          product_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket_id?: string
          category_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          original_name?: string
          product_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          access_token: string
          account_name: string
          business_account_id: string
          created_at: string
          id: string
          is_active: boolean
          phone_number: string
          phone_number_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          account_name: string
          business_account_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number: string
          phone_number_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          account_name?: string
          business_account_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          phone_number_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_internal_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "operator" | "viewer"
      document_status:
        | "draft"
        | "pending_review"
        | "needs_revision"
        | "ready_for_approval"
        | "approved"
        | "rejected"
      event_type:
        | "invoice_issued"
        | "order_status_changed"
        | "technician_assigned"
        | "payment_confirmed"
        | "appointment_scheduled"
      media_status: "received" | "fetched" | "stored" | "failed"
      media_type: "image" | "video" | "document" | "audio" | "file"
      message_status:
        | "created"
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
      user_role: "owner" | "operator" | "viewer"
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
      app_role: ["owner", "operator", "viewer"],
      document_status: [
        "draft",
        "pending_review",
        "needs_revision",
        "ready_for_approval",
        "approved",
        "rejected",
      ],
      event_type: [
        "invoice_issued",
        "order_status_changed",
        "technician_assigned",
        "payment_confirmed",
        "appointment_scheduled",
      ],
      media_status: ["received", "fetched", "stored", "failed"],
      media_type: ["image", "video", "document", "audio", "file"],
      message_status: [
        "created",
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
      ],
      user_role: ["owner", "operator", "viewer"],
    },
  },
} as const
