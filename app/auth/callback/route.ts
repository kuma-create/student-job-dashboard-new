import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const userType = requestUrl.searchParams.get("userType") || "student"
  const redirectTo = requestUrl.searchParams.get("redirect") || "/dashboard"
  const next = requestUrl.searchParams.get("next") // nextパラメータを取得

  console.log("Auth callback received with params:", {
    code: code ? "exists" : "missing",
    next,
    redirectTo,
  })

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      console.log("Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Code exchange error:", error.message)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
      }

      console.log("Session created successfully:", data.session ? "Session exists" : "No session")

      // セッションが正常に作成されたことを確認
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session retrieval error:", sessionError.message)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(sessionError.message)}`,
        )
      }

      if (!session) {
        console.error("No session after code exchange")
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=session_creation_failed`)
      }

      // パスワードリセットの場合は、nextパラメータで指定されたURLにリダイレクト
      if (next) {
        console.log(`Redirecting to next URL: ${next}`)
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }

      // 以下は既存のコード
      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // ユーザーメタデータからユーザータイプを取得
        const userMetadata = user.user_metadata
        const userRole = userMetadata?.user_type || userType

        // ユーザーロールテーブルを確認
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role, is_approved")
          .eq("id", user.id)
          .single()

        console.log("User role data:", roleData)

        // ユーザーロールに基づいてリダイレクト先を決定
        if (userRole === "company" || (roleData && roleData.role === "company")) {
          // 企業ユーザーの場合
          const isApproved = roleData?.is_approved ?? false

          if (!isApproved) {
            // 承認待ちの場合
            return NextResponse.redirect(`${requestUrl.origin}/company/pending`)
          }
          // 承認済みの場合
          return NextResponse.redirect(`${requestUrl.origin}/company/dashboard`)
        }
      }

      // 学生ユーザーまたはロールが不明な場合はデフォルトのリダイレクト先へ
      const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
      return response
    } catch (error: any) {
      console.error("Auth callback error:", error.message || error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message || "auth_callback_error")}`,
      )
    }
  }

  // codeがない場合
  console.error("No code provided in callback")
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code_provided`)
}
