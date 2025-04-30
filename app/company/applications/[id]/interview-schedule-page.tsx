import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InterviewScheduleClient from "./interview-schedule-client"

export default async function InterviewSchedulePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証チェック
  if (!session) {
    redirect("/auth/signin")
  }

  // 応募IDを取得
  const applicationId = Number.parseInt(params.id)

  // 応募データを取得して、自社の求人に対する応募かどうかを確認
  const { data: application } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      jobs (
        company_id
      )
    `)
    .eq("id", applicationId)
    .single()

  // 応募が存在しない場合はリダイレクト
  if (!application) {
    redirect("/company/applications")
  }

  // 企業ユーザーのプロフィールを取得
  const { data: companyUser } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  // 企業ユーザーでない場合はリダイレクト
  if (!companyUser) {
    redirect("/dashboard")
  }

  // 自社の求人に対する応募でない場合はリダイレクト
  if (application.jobs.company_id !== companyUser.company_id) {
    redirect("/company/applications")
  }

  return <InterviewScheduleClient applicationId={applicationId} />
}
