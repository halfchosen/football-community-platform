export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string;
          name: string;
          iso_code: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          iso_code?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          iso_code?: string | null;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          slug: string;
          country_id: string | null;
          tier: number | null;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          country_id?: string | null;
          tier?: number | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          country_id?: string | null;
          tier?: number | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          country_id: string | null;
          league_id: string | null;
          tier: number | null;
          logo_url: string | null;
          active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          country_id?: string | null;
          league_id?: string | null;
          tier?: number | null;
          logo_url?: string | null;
          active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          country_id?: string | null;
          league_id?: string | null;
          tier?: number | null;
          logo_url?: string | null;
          active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          is_permanent: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_permanent?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_permanent?: boolean;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      titles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          min_level: number;
          sort_order: number;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          min_level: number;
          sort_order: number;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          min_level?: number;
          sort_order?: number;
          active?: boolean;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          level_number: number;
          min_xp: number;
          title_id: string | null;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          level_number: number;
          min_xp: number;
          title_id?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          level_number?: number;
          min_xp?: number;
          title_id?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          primary_club_id: string | null;
          preferred_language: string;
          onboarding_completed: boolean;
          is_18_plus_confirmed: boolean;
          community_rules_accepted_at: Timestamp | null;
          registration_year: number;
          generation_id: string | null;
          level: number;
          xp: number;
          current_title_id: string | null;
          reputation_score: number;
          selected_badge_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          primary_club_id?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          is_18_plus_confirmed?: boolean;
          community_rules_accepted_at?: Timestamp | null;
          registration_year?: number;
          generation_id?: string | null;
          level?: number;
          xp?: number;
          current_title_id?: string | null;
          reputation_score?: number;
          selected_badge_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          primary_club_id?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          is_18_plus_confirmed?: boolean;
          community_rules_accepted_at?: Timestamp | null;
          registration_year?: number;
          generation_id?: string | null;
          level?: number;
          xp?: number;
          current_title_id?: string | null;
          reputation_score?: number;
          selected_badge_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Relationships: [];
      };
      user_private_settings: {
        Row: {
          user_id: string;
          email_notifications_enabled: boolean;
          interface_language: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          user_id: string;
          email_notifications_enabled?: boolean;
          interface_language?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          user_id?: string;
          email_notifications_enabled?: boolean;
          interface_language?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Relationships: [];
      };
      user_supported_clubs: {
        Row: {
          user_id: string;
          club_id: string;
          support_type: string;
          created_at: Timestamp;
        };
        Insert: {
          user_id: string;
          club_id: string;
          support_type?: string;
          created_at?: Timestamp;
        };
        Update: {
          user_id?: string;
          club_id?: string;
          support_type?: string;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          awarded_at: Timestamp;
          awarded_reason: string | null;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          awarded_at?: Timestamp;
          awarded_reason?: string | null;
        };
        Update: {
          user_id?: string;
          badge_id?: string;
          awarded_at?: Timestamp;
          awarded_reason?: string | null;
        };
        Relationships: [];
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          xp_amount: number;
          source_type: string | null;
          source_id: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          xp_amount: number;
          source_type?: string | null;
          source_id?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          xp_amount?: number;
          source_type?: string | null;
          source_id?: string | null;
          created_at?: Timestamp;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
