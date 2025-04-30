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
      applications: {
        Row: {
          id: string
          student_id: string
          job_id: string
          status: string
          cover_letter: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          job_id: string
          status?: string
          cover_letter?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          job_id?: string
          status?: string
          cover_letter?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          description: string | null
          logo_url: string | null
          website_url: string | null
          location: string | null
          size: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          location?: string | null
          size?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          location?: string | null
          size?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_users: {
        Row: {
          id: string
          user_id: string
          company_id: string
          position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          student_id: string
          company_user_id: string
          job_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          company_user_id: string
          job_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          company_user_id?: string
          job_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_user_id_fkey"
            columns: ["company_user_id"]
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          id: string
          application_id: string
          student_id: string
          company_user_id: string
          scheduled_at: string
          duration_minutes: number | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          student_id: string
          company_user_id: string
          scheduled_at: string
          duration_minutes?: number | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          student_id?: string
          company_user_id?: string
          scheduled_at?: string
          duration_minutes?: number | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_schedules_company_user_id_fkey"
            columns: ["company_user_id"]
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_schedules_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string | null
          location: string | null
          job_type: string | null
          salary_range: string | null
          application_deadline: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements?: string | null
          location?: string | null
          job_type?: string | null
          salary_range?: string | null
          application_deadline?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          requirements?: string | null
          location?: string | null
          job_type?: string | null
          salary_range?: string | null
          application_deadline?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          id: string
          student_id: string
          job_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          job_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          job_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          university: string | null
          major: string | null
          graduation_year: number | null
          skills: string[] | null
          bio: string | null
          resume_url: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          skills?: string[] | null
          bio?: string | null
          resume_url?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          skills?: string[] | null
          bio?: string | null
          resume_url?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          created_at: string
          updated_at: string
          is_active: boolean | null
          is_approved: boolean | null
        }
        Insert: {
          id: string
          role: string
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
          is_approved?: boolean | null
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
          is_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
