import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // セッション取得
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("ミドルウェア: セッション取得エラー:", sessionError)
    }

    // デバッグログ
    console.log("middleware セッション:", session?.user?.id || "なし")

    const path = req.nextUrl.pathname

    const isRedirectLoop =
      req.nextUrl.searchParams.has("redirect") &&
      req.nextUrl.searchParams.get("redirect") === "/dashboard" &&
      path === "/auth/signin"

    if (isRedirectLoop && session) {
      console.log("ミドルウェア: リダイレクトループを検出、ダッシュボードへ直接遷移")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path === "/auth/signin" && session) {
      console.log("ミドルウェア: ログイン済みユーザーがログインページにアクセス、ダッシュボードへリダイレクト")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    const isDashboardPath =
      path.startsWith("/dashboard") ||
      path.startsWith("/profile") ||
      path.startsWith("/applications") ||
      path.startsWith("/jobs") ||
      path.startsWith("/messages") ||
      path.startsWith("/offers") ||
      path.startsWith("/chat")

    const isCompanyPath =
      path.startsWith("/company") &&
      !path.startsWith("/company/contact") &&
      !path.startsWith("/company/pricing")

    if ((isDashboardPath || isCompanyPath) && !session) {
      const redirectPath = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/auth/signin?redirect=${redirectPath}`, req.url))
    }

    return res
  } catch (error) {
    console.error("ミドルウェアで予期せぬエラー:", error)
    return res
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
    // ❌ "/auth/signin" は除外 → 無限ループ防止
  ],
}
