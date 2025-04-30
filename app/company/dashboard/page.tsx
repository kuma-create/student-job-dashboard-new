import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CompanyDashboardClient from "./company-dashboard-client"

export const dynamic = "force-dynamic"

export default async function CompanyDashboardPage() {
  const supabase = createClient()

  // 1. セッション確認
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/auth/signin")
  }

  // 2. ユーザー取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/signin")
  }

  // 3. ユーザーロール確認（企業かつ承認済み）
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role, is_approved")
    .eq("id", user.id)
    .single()

  if (roleError || !roleData || roleData.role !== "company") {
    return redirect("/dashboard")
  }

  if (roleData.is_approved === false) {
    return redirect("/company/pending")
  }

  // 4. 企業ID取得
  const { data: companyUser, error: companyUserError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (companyUserError || !companyUser?.company_id) {
    return redirect("/company/dashboard") // fallback
  }

  const companyId = companyUser.company_id

  // 5. 企業情報取得
  const { data: companyData } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single()

  // 6. 求人情報取得
  const { data: jobPostings } = await supabase
    .from("job_postings")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  // 7. 応募情報取得
  const { data: applications } = await supabase
    .from("applications")
    .select("*, job_postings(*), profiles(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  // 8. クライアントコンポーネントに渡す
  return (
    <CompanyDashboardClient
      user={user}
      company={companyData || { name: user.user_metadata?.company_name || "企業名未設定" }}
      jobPostings={jobPostings || []}
      applications={applications || []}
    />
  )
}
