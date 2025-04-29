import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompanyJobsClient from "./company-jobs-client"

export const dynamic = "force-dynamic"

export default async function CompanyJobsPage() {
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
    .select("role, is_approved")
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

  // 求人情報を取得
  const { data: jobs } = await supabase
    .from("job_postings")
    .select("*")
    .eq("company_id", companyUser.company_id)
    .order("created_at", { ascending: false })

  // 応募情報を取得（求人ごとの応募数を計算するため）
  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("company_id", companyUser.company_id)

  // 求人ごとの応募数を計算
  const applicationCounts = applications
    ? applications.reduce((acc: Record<string, number>, app) => {
        const jobId = app.job_id
        acc[jobId] = (acc[jobId] || 0) + 1
        return acc
      }, {})
    : {}

  return (
    <CompanyJobsClient jobs={jobs || []} applicationCounts={applicationCounts} companyId={companyUser.company_id} />
  )
}
