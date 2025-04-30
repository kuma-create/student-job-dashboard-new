export interface InterviewSchedule {
  id: string // 文字列型に変更
  application_id: string // 文字列型に変更
  student_id: string // 文字列型に変更
  company_user_id: string // 文字列型に変更
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  meeting_link: string | null
  notes: string | null
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
  updated_at: string
}
