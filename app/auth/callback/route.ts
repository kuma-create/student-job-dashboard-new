import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // リダイレクト先を取得
  let redirectTo = requestUrl.searchParams.get("next") || "/dashboard"
  const userType = requestUrl.searchParams.get("type") || "individual"

  // リダイレクトループを防止
  if (redirectTo.includes("/auth/signin")) {
    redirectTo = "/dashboard"
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

      // セッションの交換
      await supabase.auth.exchangeCodeForSession(code)

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
    } catch (error) {
      console.error("認証コールバックでエラーが発生しました:", error)
      // エラーが発生した場合でもリダイレクトを続行
    }
  }

  // キャッシュを防止するヘッダーを追加
  const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}
