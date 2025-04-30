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
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role, is_approved")  // company_nameを削除
    .eq("id", session.user.id)
    .single()

  // エラーハンドリングを追加
  if (roleError) {
    console.error("ユーザーロール取得エラー:", roleError)
    return redirect("/dashboard")
  }

  // 企業アカウントでない場合はリダイレクト
  if (userRole?.role !== "company") {
    redirect("/dashboard")
  }

  // 企業アカウントで未承認の場合は承認待ちページにリダイレクト
  if (userRole?.is_approved === false) {
    redirect("/company/pending")
  }

  // 企業IDの取得
  const { data: companyUser, error: companyError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  // エラーハンドリングを追加
  if (companyError) {
    console.error("企業ユーザー取得エラー:", companyError)
    return redirect("/dashboard")
  }

  if (!companyUser) {
    // 企業ユーザーが見つからない場合はダッシュボードにリダイレクト
    redirect("/company/dashboard")
  }

  // 企業の求人に対する応募を取得
  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      job_postings (
        id,
        title,
        location,
        job_type
      ),
      student_profiles (
        id,
        first_name,
        last_name,
        university,
        major,
        graduation_year,
        avatar_url
      )
    `)
    .eq("job_postings.company_id", companyUser.company_id)
    .order("created_at", { ascending: false })

  // エラーハンドリングを追加
  if (applicationsError) {
    console.error("応募情報取得エラー:", applicationsError)
    // エラーが発生しても空の配列を渡して表示だけはする
    return <CompanyApplicationsClient applications={[]} />
  }

  return <CompanyApplicationsClient applications={applications || []} />
}