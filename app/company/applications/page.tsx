import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompanyApplicationsClient from "./company-applications-client"

export default async function CompanyApplicationsPage() {
  const supabase = createClient()

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // ユーザーロールの取得
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role, is_approved, company_name")
    .eq("id", session.user.id)
    .single()

  // 企業アカウントでない場合はリダイレクト
  if (userRole?.role !== "company") {
    redirect("/dashboard")
  }

  // 企業アカウントで未承認の場合は承認待ちページにリダイレクト
  if (userRole?.is_approved === false) {
    redirect("/company/pending")
  }

  // 企業IDの取得
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  if (!companyUser) {
    // 企業ユーザーが見つからない場合はダッシュボードにリダイレクト
    redirect("/company/dashboard")
  }

  // 企業の求人に対する応募を取得
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      jobs:job_id (
        id,
        job_title,
        location,
        employment_type
      ),
      students:student_id (
        id,
        first_name,
        last_name,
        university,
        major,
        graduation_year,
        avatar_url
      )
    `)
    .eq("jobs.company_id", companyUser.company_id)
    .order("created_at", { ascending: false })

  return <CompanyApplicationsClient applications={applications || []} />
}
