import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CompanyDashboardClient from "./company-dashboard-client"

export const dynamic = "force_dynamic"

export default async function CompanyDashboardPage() {
  const supabase = createClient()

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // ユーザーロールを確認
  const { data: roleData } = await supabase.from("user_roles").select("role, is_approved").eq("id", user.id).single()

  // 企業ユーザーでない場合はリダイレクト
  if (!roleData || roleData.role !== "company") {
    redirect("/dashboard")
  }

  // 承認待ちの場合はペンディングページにリダイレクト
  if (roleData && !roleData.is_approved) {
    redirect("/company/pending")
  }

  // 企業情報を取得
  const { data: companyData } = await supabase.from("companies").select("*").eq("user_id", user.id).single()

  // 求人情報を取得
  const { data: jobPostings } = await supabase
    .from("job_postings")
    .select("*")
    .eq("company_id", companyData?.id || user.id)
    .order("created_at", { ascending: false })

  // 応募情報を取得
  const { data: applications } = await supabase
    .from("applications")
    .select("*, job_postings(*), profiles(*)")
    .eq("company_id", companyData?.id || user.id)
    .order("created_at", { ascending: false })

  return (
    <CompanyDashboardClient
      user={user}
      company={companyData || { name: user.user_metadata?.company_name || "企業名未設定" }}
      jobPostings={jobPostings || []}
      applications={applications || []}
    />
  )
}
