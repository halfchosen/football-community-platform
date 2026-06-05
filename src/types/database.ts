export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      countries: TableDefinition<
        { id: string; name: string; iso_code: string | null; created_at: Timestamp },
        { id?: string; name: string; iso_code?: string | null; created_at?: Timestamp },
        { id?: string; name?: string; iso_code?: string | null; created_at?: Timestamp }
      >;
      leagues: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          country_id: string | null;
          tier: number | null;
          region: string | null;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          country_id?: string | null;
          tier?: number | null;
          region?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          country_id?: string | null;
          tier?: number | null;
          region?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      clubs: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          country_id: string | null;
          logo_url: string | null;
          active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          country_id?: string | null;
          logo_url?: string | null;
          active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          country_id?: string | null;
          logo_url?: string | null;
          active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        }
      >;
      club_league_memberships: TableDefinition<
        {
          id: string;
          club_id: string;
          league_id: string;
          season: string;
          tier: number | null;
          is_current: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          club_id: string;
          league_id: string;
          season: string;
          tier?: number | null;
          is_current?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          club_id?: string;
          league_id?: string;
          season?: string;
          tier?: number | null;
          is_current?: boolean;
          created_at?: Timestamp;
        }
      >;
      national_teams: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          fifa_code: string | null;
          country_id: string | null;
          confederation: string | null;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          fifa_code?: string | null;
          country_id?: string | null;
          confederation?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          fifa_code?: string | null;
          country_id?: string | null;
          confederation?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      generations: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          is_permanent: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_permanent?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_permanent?: boolean;
          created_at?: Timestamp;
        }
      >;
      titles: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          min_level: number;
          sort_order: number;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          min_level: number;
          sort_order: number;
          active?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          min_level?: number;
          sort_order?: number;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      levels: TableDefinition<
        {
          id: string;
          level_number: number;
          min_xp: number;
          title_id: string | null;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          level_number: number;
          min_xp: number;
          title_id?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          level_number?: number;
          min_xp?: number;
          title_id?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      badges: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      club_suggestions: TableDefinition<
        {
          id: string;
          user_id: string;
          context: "primary" | "secondary" | "national_team";
          suggested_name: string;
          country_id: string | null;
          league_id: string | null;
          status: "pending" | "approved" | "rejected" | "merged";
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id: string;
          context: "primary" | "secondary" | "national_team";
          suggested_name: string;
          country_id?: string | null;
          league_id?: string | null;
          status?: "pending" | "approved" | "rejected" | "merged";
          created_at?: Timestamp;
        },
        {
          id?: string;
          user_id?: string;
          context?: "primary" | "secondary" | "national_team";
          suggested_name?: string;
          country_id?: string | null;
          league_id?: string | null;
          status?: "pending" | "approved" | "rejected" | "merged";
          created_at?: Timestamp;
        }
      >;
      user_profiles: TableDefinition<
        {
          id: string;
          username: string;
          display_name: string | null;
          primary_club_id: string | null;
          primary_club_suggestion_id: string | null;
          national_team_id: string | null;
          national_team_suggestion_id: string | null;
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
        },
        {
          id: string;
          username: string;
          display_name?: string | null;
          primary_club_id?: string | null;
          primary_club_suggestion_id?: string | null;
          national_team_id?: string | null;
          national_team_suggestion_id?: string | null;
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
        },
        {
          id?: string;
          username?: string;
          display_name?: string | null;
          primary_club_id?: string | null;
          primary_club_suggestion_id?: string | null;
          national_team_id?: string | null;
          national_team_suggestion_id?: string | null;
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
        }
      >;
      user_private_settings: TableDefinition<
        {
          user_id: string;
          email_notifications_enabled: boolean;
          interface_language: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          user_id: string;
          email_notifications_enabled?: boolean;
          interface_language?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        },
        {
          user_id?: string;
          email_notifications_enabled?: boolean;
          interface_language?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        }
      >;
      user_supported_clubs: TableDefinition<
        {
          id: string;
          user_id: string;
          club_id: string | null;
          club_suggestion_id: string | null;
          support_type: string;
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id: string;
          club_id?: string | null;
          club_suggestion_id?: string | null;
          support_type?: string;
          created_at?: Timestamp;
        },
        {
          id?: string;
          user_id?: string;
          club_id?: string | null;
          club_suggestion_id?: string | null;
          support_type?: string;
          created_at?: Timestamp;
        }
      >;
      user_badges: TableDefinition<
        {
          user_id: string;
          badge_id: string;
          awarded_at: Timestamp;
          awarded_reason: string | null;
        },
        {
          user_id: string;
          badge_id: string;
          awarded_at?: Timestamp;
          awarded_reason?: string | null;
        },
        {
          user_id?: string;
          badge_id?: string;
          awarded_at?: Timestamp;
          awarded_reason?: string | null;
        }
      >;
      xp_events: TableDefinition<
        {
          id: string;
          user_id: string | null;
          event_type: string;
          xp_amount: number;
          source_type: string | null;
          source_id: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id?: string | null;
          event_type: string;
          xp_amount: number;
          source_type?: string | null;
          source_id?: string | null;
          created_at?: Timestamp;
        },
        {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          xp_amount?: number;
          source_type?: string | null;
          source_id?: string | null;
          created_at?: Timestamp;
        }
      >;
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          primary_club_name: string | null;
          national_team_name: string | null;
          generation_name: string | null;
          level: number;
          title_name: string | null;
          selected_badge_name: string | null;
          registration_year: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
