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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analysis_history: {
        Row: {
          categories: Json
          created_at: string
          custom_instructions: string | null
          id: string
          overall_score: number
          scrape_data: Json | null
          share_token: string | null
          summary: string | null
          url: string
          user_id: string
          website_id: string | null
        }
        Insert: {
          categories?: Json
          created_at?: string
          custom_instructions?: string | null
          id?: string
          overall_score: number
          scrape_data?: Json | null
          share_token?: string | null
          summary?: string | null
          url: string
          user_id: string
          website_id?: string | null
        }
        Update: {
          categories?: Json
          created_at?: string
          custom_instructions?: string | null
          id?: string
          overall_score?: number
          scrape_data?: Json | null
          share_token?: string | null
          summary?: string | null
          url?: string
          user_id?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_history_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body: string
          created_at: string
          description: string
          id: string
          keyword: string
          published_at: string
          reading_time: string
          slug: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          description: string
          id?: string
          keyword: string
          published_at?: string
          reading_time?: string
          slug: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          description?: string
          id?: string
          keyword?: string
          published_at?: string
          reading_time?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fix_pull_requests: {
        Row: {
          analysis_history_id: string | null
          branch: string
          created_at: string
          fixes_applied: Json
          id: string
          pr_number: number | null
          pr_url: string
          repo: string
          repo_connection_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_history_id?: string | null
          branch: string
          created_at?: string
          fixes_applied?: Json
          id?: string
          pr_number?: number | null
          pr_url: string
          repo: string
          repo_connection_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_history_id?: string | null
          branch?: string
          created_at?: string
          fixes_applied?: Json
          id?: string
          pr_number?: number | null
          pr_url?: string
          repo?: string
          repo_connection_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fix_pull_requests_analysis_history_id_fkey"
            columns: ["analysis_history_id"]
            isOneToOne: false
            referencedRelation: "analysis_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fix_pull_requests_repo_connection_id_fkey"
            columns: ["repo_connection_id"]
            isOneToOne: false
            referencedRelation: "repo_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_requests: {
        Row: {
          connector_id: string | null
          connector_name: string
          created_at: string
          id: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          connector_id?: string | null
          connector_name: string
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          connector_id?: string | null
          connector_name?: string
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          company: string | null
          created_at: string
          display_name: string | null
          experience_level: string | null
          goals: string[] | null
          id: string
          referral_source: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          goals?: string[] | null
          id?: string
          referral_source?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          goals?: string[] | null
          id?: string
          referral_source?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reddit_post_metrics: {
        Row: {
          checked_at: string
          clicks: number
          id: string
          num_comments: number
          post_id: string
          removed: boolean
          removed_by_category: string | null
          score: number
          signups_attributed: number
        }
        Insert: {
          checked_at?: string
          clicks?: number
          id?: string
          num_comments?: number
          post_id: string
          removed?: boolean
          removed_by_category?: string | null
          score?: number
          signups_attributed?: number
        }
        Update: {
          checked_at?: string
          clicks?: number
          id?: string
          num_comments?: number
          post_id?: string
          removed?: boolean
          removed_by_category?: string | null
          score?: number
          signups_attributed?: number
        }
        Relationships: [
          {
            foreignKeyName: "reddit_post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "reddit_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reddit_posts: {
        Row: {
          body: string
          created_at: string
          failure_reason: string | null
          id: string
          posted_at: string | null
          reddit_permalink: string | null
          reddit_post_id: string | null
          status: string
          subreddit: string
          title: string
          updated_at: string
          url: string | null
          utm_campaign: string
        }
        Insert: {
          body: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          posted_at?: string | null
          reddit_permalink?: string | null
          reddit_post_id?: string | null
          status?: string
          subreddit: string
          title: string
          updated_at?: string
          url?: string | null
          utm_campaign: string
        }
        Update: {
          body?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          posted_at?: string | null
          reddit_permalink?: string | null
          reddit_post_id?: string | null
          status?: string
          subreddit?: string
          title?: string
          updated_at?: string
          url?: string | null
          utm_campaign?: string
        }
        Relationships: []
      }
      reddit_subreddit_pool: {
        Row: {
          avg_score: number
          burn_reason: string | null
          created_at: string
          id: string
          last_post_at: string | null
          notes: string | null
          posts_count: number
          removals_count: number
          status: string
          subreddit: string
          total_signups: number
          updated_at: string
        }
        Insert: {
          avg_score?: number
          burn_reason?: string | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          notes?: string | null
          posts_count?: number
          removals_count?: number
          status?: string
          subreddit: string
          total_signups?: number
          updated_at?: string
        }
        Update: {
          avg_score?: number
          burn_reason?: string | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          notes?: string | null
          posts_count?: number
          removals_count?: number
          status?: string
          subreddit?: string
          total_signups?: number
          updated_at?: string
        }
        Relationships: []
      }
      repo_connections: {
        Row: {
          account_login: string
          created_at: string
          default_branch: string | null
          default_repo: string | null
          id: string
          installation_id: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_login: string
          created_at?: string
          default_branch?: string | null
          default_repo?: string | null
          id?: string
          installation_id: string
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_login?: string
          created_at?: string
          default_branch?: string | null
          default_repo?: string | null
          id?: string
          installation_id?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_usage: {
        Row: {
          created_at: string
          id: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string
          id: string
          last_analyzed_at: string | null
          last_score: number | null
          name: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_analyzed_at?: string | null
          last_score?: number | null
          name?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_analyzed_at?: string | null
          last_score?: number | null
          name?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_shorts: {
        Row: {
          accent_color: string
          bg_color: string
          caption_timings: Json | null
          captions: Json
          created_at: string
          description: string
          duration_ms: number | null
          format: string
          generated_at: string
          id: string
          insight: string
          music_url: string | null
          posted_at: string | null
          screenshot_urls: Json | null
          script: string | null
          status: string
          tags: string[]
          target_site: string | null
          title: string
          utm_campaign: string
          voice_id: string | null
          voice_url: string | null
        }
        Insert: {
          accent_color?: string
          bg_color?: string
          caption_timings?: Json | null
          captions?: Json
          created_at?: string
          description: string
          duration_ms?: number | null
          format: string
          generated_at?: string
          id?: string
          insight: string
          music_url?: string | null
          posted_at?: string | null
          screenshot_urls?: Json | null
          script?: string | null
          status?: string
          tags?: string[]
          target_site?: string | null
          title: string
          utm_campaign: string
          voice_id?: string | null
          voice_url?: string | null
        }
        Update: {
          accent_color?: string
          bg_color?: string
          caption_timings?: Json | null
          captions?: Json
          created_at?: string
          description?: string
          duration_ms?: number | null
          format?: string
          generated_at?: string
          id?: string
          insight?: string
          music_url?: string | null
          posted_at?: string | null
          screenshot_urls?: Json | null
          script?: string | null
          status?: string
          tags?: string[]
          target_site?: string | null
          title?: string
          utm_campaign?: string
          voice_id?: string | null
          voice_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_shared_analysis: {
        Args: { p_token: string }
        Returns: {
          categories: Json
          created_at: string
          custom_instructions: string | null
          id: string
          overall_score: number
          scrape_data: Json | null
          share_token: string | null
          summary: string | null
          url: string
          user_id: string
          website_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "analysis_history"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_active_subscription: {
        Args: { _env: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
