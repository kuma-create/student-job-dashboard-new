import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // セッションのみ確認（最小限のチェック）
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("ミドルウェア: セッション取得エラー:", sessionError)
    }

    // 現在のパス
    const path = req.nextUrl.pathname

    // リダイレクトループを検出
    const isRedirectLoop =
      req.nextUrl.searchParams.has("redirect") &&
      req.nextUrl.searchParams.get("redirect") === "/dashboard" &&
      path === "/auth/signin"

    // リダイレクトループが検出され、かつセッションが存在する場合は直接ダッシュボードへ
    if (isRedirectLoop && session) {
      console.log("ミドルウェア: リダイレクトループを検出、ダッシュボードへ直接遷移")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // ログイン済みユーザーがログインページにアクセスした場合はダッシュボードへリダイレクト
    if (path === "/auth/signin" && session) {
      console.log("ミドルウェア: ログイン済みユーザーがログインページにアクセス、ダッシュボードへリダイレクト")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // ダッシュボード関連のパスかどうかを確認
    const isDashboardPath =
      path.startsWith("/dashboard") ||
      path.startsWith("/profile") ||
      path.startsWith("/applications") ||
      path.startsWith("/jobs") ||
      path.startsWith("/messages") ||
      path.startsWith("/offers") ||
      path.startsWith("/chat")

    // 企業関連のパスかどうかを確認
    const isCompanyPath =
      path.startsWith("/company") && !path.startsWith("/company/contact") && !path.startsWith("/company/pricing")

    // 認証が必要なパスへのアクセスで、セッションがない場合
    if ((isDashboardPath || isCompanyPath) && !session) {
      // リダイレクト先のパスをエンコード
      const redirectPath = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/auth/signin?redirect=${redirectPath}`, req.url))
    }

    return res
  } catch (error) {
    console.error("ミドルウェアで予期せぬエラー:", error)
    return NextResponse.next() // エラーが発生した場合でも、処理を中断せずに続行
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/jobs/:path*",
    "/messages/:path*",
    "/offers/:path*",
    "/chat/:path*",
    "/company/:path*",
    "/auth/signin",
  ],
}
