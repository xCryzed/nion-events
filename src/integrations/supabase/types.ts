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
        PostgrestVersion: "12.2.12 (cd3cf9e)"
    }
    public: {
        Tables: {
            app_settings: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    setting_key: string
                    setting_value: Json
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    setting_key: string
                    setting_value: Json
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    setting_key?: string
                    setting_value?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            contact_requests: {
                Row: {
                    callback_time: string | null
                    company: string | null
                    created_at: string
                    email: string
                    event_type: string | null
                    id: string
                    message: string
                    mobile: string | null
                    name: string
                    phone: string | null
                    updated_at: string
                    venue: string | null
                }
                Insert: {
                    callback_time?: string | null
                    company?: string | null
                    created_at?: string
                    email: string
                    event_type?: string | null
                    id?: string
                    message: string
                    mobile?: string | null
                    name: string
                    phone?: string | null
                    updated_at?: string
                    venue?: string | null
                }
                Update: {
                    callback_time?: string | null
                    company?: string | null
                    created_at?: string
                    email?: string
                    event_type?: string | null
                    id?: string
                    message?: string
                    mobile?: string | null
                    name?: string
                    phone?: string | null
                    updated_at?: string
                    venue?: string | null
                }
                Relationships: []
            }
            employee_personal_data: {
                Row: {
                    bic: string
                    birth_name: string | null
                    child_allowances: number | null
                    city: string
                    created_at: string
                    date_of_birth: string
                    employment_type: string
                    first_name: string
                    gender: string
                    has_other_employment: boolean
                    health_insurance_company: string | null
                    highest_professional_qualification: string | null
                    highest_school_degree: string | null
                    iban: string
                    id: string
                    is_complete: boolean | null
                    is_marginal_employment: boolean | null
                    job_title: string
                    last_name: string
                    marital_status: string
                    nationality: string
                    postal_code: string
                    previous_employment: Json | null
                    religious_affiliation: string | null
                    signature_data_url: string | null
                    signature_date: string | null
                    social_insurance_number: string | null
                    start_date: string
                    street_address: string
                    tax_class_factor: string | null
                    tax_id: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    bic: string
                    birth_name?: string | null
                    child_allowances?: number | null
                    city: string
                    created_at?: string
                    date_of_birth: string
                    employment_type: string
                    first_name: string
                    gender: string
                    has_other_employment?: boolean
                    health_insurance_company?: string | null
                    highest_professional_qualification?: string | null
                    highest_school_degree?: string | null
                    iban: string
                    id?: string
                    is_complete?: boolean | null
                    is_marginal_employment?: boolean | null
                    job_title: string
                    last_name: string
                    marital_status: string
                    nationality: string
                    postal_code: string
                    previous_employment?: Json | null
                    religious_affiliation?: string | null
                    signature_data_url?: string | null
                    signature_date?: string | null
                    social_insurance_number?: string | null
                    start_date: string
                    street_address: string
                    tax_class_factor?: string | null
                    tax_id?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    bic?: string
                    birth_name?: string | null
                    child_allowances?: number | null
                    city?: string
                    created_at?: string
                    date_of_birth?: string
                    employment_type?: string
                    first_name?: string
                    gender?: string
                    has_other_employment?: boolean
                    health_insurance_company?: string | null
                    highest_professional_qualification?: string | null
                    highest_school_degree?: string | null
                    iban?: string
                    id?: string
                    is_complete?: boolean | null
                    is_marginal_employment?: boolean | null
                    job_title?: string
                    last_name?: string
                    marital_status?: string
                    nationality?: string
                    postal_code?: string
                    previous_employment?: Json | null
                    religious_affiliation?: string | null
                    signature_data_url?: string | null
                    signature_date?: string | null
                    social_insurance_number?: string | null
                    start_date?: string
                    street_address?: string
                    tax_class_factor?: string | null
                    tax_id?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            event_registrations: {
                Row: {
                    created_at: string
                    event_id: string
                    id: string
                    notes: string | null
                    staff_category: string
                    status: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    event_id: string
                    id?: string
                    notes?: string | null
                    staff_category: string
                    status?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    event_id?: string
                    id?: string
                    notes?: string | null
                    staff_category?: string
                    status?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "event_registrations_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "internal_events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            event_requests: {
                Row: {
                    additional_wishes: string | null
                    contact_city: string | null
                    contact_company: string | null
                    contact_email: string
                    contact_house_number: string | null
                    contact_name: string
                    contact_phone: string | null
                    contact_postal_code: string | null
                    contact_street: string | null
                    created_at: string
                    dj_genres: string[] | null
                    end_date: string | null
                    end_time: string | null
                    event_date: string
                    event_title: string
                    guest_count: string
                    id: string
                    light_operator: boolean | null
                    location: string
                    offer_number: string | null
                    photographer: boolean | null
                    status: Database["public"]["Enums"]["request_status"] | null
                    tech_requirements: string[]
                    updated_at: string
                    user_id: string | null
                    videographer: boolean | null
                }
                Insert: {
                    additional_wishes?: string | null
                    contact_city?: string | null
                    contact_company?: string | null
                    contact_email: string
                    contact_house_number?: string | null
                    contact_name: string
                    contact_phone?: string | null
                    contact_postal_code?: string | null
                    contact_street?: string | null
                    created_at?: string
                    dj_genres?: string[] | null
                    end_date?: string | null
                    end_time?: string | null
                    event_date: string
                    event_title: string
                    guest_count: string
                    id?: string
                    light_operator?: boolean | null
                    location: string
                    offer_number?: string | null
                    photographer?: boolean | null
                    status?: Database["public"]["Enums"]["request_status"] | null
                    tech_requirements?: string[]
                    updated_at?: string
                    user_id?: string | null
                    videographer?: boolean | null
                }
                Update: {
                    additional_wishes?: string | null
                    contact_city?: string | null
                    contact_company?: string | null
                    contact_email?: string
                    contact_house_number?: string | null
                    contact_name?: string
                    contact_phone?: string | null
                    contact_postal_code?: string | null
                    contact_street?: string | null
                    created_at?: string
                    dj_genres?: string[] | null
                    end_date?: string | null
                    end_time?: string | null
                    event_date?: string
                    event_title?: string
                    guest_count?: string
                    id?: string
                    light_operator?: boolean | null
                    location?: string
                    offer_number?: string | null
                    photographer?: boolean | null
                    status?: Database["public"]["Enums"]["request_status"] | null
                    tech_requirements?: string[]
                    updated_at?: string
                    user_id?: string | null
                    videographer?: boolean | null
                }
                Relationships: []
            }
            internal_events: {
                Row: {
                    created_at: string
                    created_by: string | null
                    description: string | null
                    end_date: string | null
                    event_date: string
                    guest_count: number | null
                    id: string
                    location: string
                    notes: string | null
                    staff_requirements: Json | null
                    status: string | null
                    title: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    end_date?: string | null
                    event_date: string
                    guest_count?: number | null
                    id?: string
                    location: string
                    notes?: string | null
                    staff_requirements?: Json | null
                    status?: string | null
                    title: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    end_date?: string | null
                    event_date?: string
                    guest_count?: number | null
                    id?: string
                    location?: string
                    notes?: string | null
                    staff_requirements?: Json | null
                    status?: string | null
                    title?: string
                    updated_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    created_at: string
                    first_name: string | null
                    id: string
                    last_name: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    created_at: string
                    id: string
                    role: Database["public"]["Enums"]["app_role"]
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            generate_offer_number: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_user_role: {
                Args: { _user_id: string }
                Returns: Database["public"]["Enums"]["app_role"]
            }
            has_role: {
                Args: {
                    _role: Database["public"]["Enums"]["app_role"]
                    _user_id: string
                }
                Returns: boolean
            }
            is_personal_data_complete: {
                Args: {
                    employee_data_row: Database["public"]["Tables"]["employee_personal_data"]["Row"]
                }
                Returns: boolean
            }
        }
        Enums: {
            app_role: "administrator" | "user" | "employee"
            request_status:
                | "ANGEFRAGT"
                | "IN_BEARBEITUNG"
                | "ABGESCHLOSSEN"
                | "RÜCKFRAGEN_OFFEN"
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
            app_role: ["administrator", "user", "employee"],
            request_status: [
                "ANGEFRAGT",
                "IN_BEARBEITUNG",
                "ABGESCHLOSSEN",
                "RÜCKFRAGEN_OFFEN",
            ],
        },
    },
} as const