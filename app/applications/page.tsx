import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ApplicationsClient from "./applications-client"

export default async function ApplicationsPage() {
  const supabase = createClient()

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // ユーザーロールの取得
  const { data: userRole } = await supabase.from("user_roles").select("*").eq("id", session.user.id).single()

  if (!userRole || userRole.role !== "student") {
    redirect("/dashboard")
  }

  // 応募履歴の取得（企業情報と求人情報も含む）
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      jobs:job_id (
        id,
        job_title,
        location,
        employment_type,
        companies:company_id (
          id,
          name,
          logo_url
        )
      )
    `)
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false })

  // 学生プロフィールの取得
  const { data: profile } = await supabase.from("student_profiles").select("*").eq("id", session.user.id).single()

  return <ApplicationsClient applications={applications || []} profile={profile || {}} />
}
