import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function middleware(req: NextRequest) {
  console.log("ミドルウェア実行:", req.nextUrl.pathname)

  // パスワードリセット関連のルートは処理をスキップ
  if (
    req.nextUrl.pathname === "/auth/callback" ||
    req.nextUrl.pathname === "/auth/signout" ||
    req.nextUrl.pathname === "/auth/update-password" ||
    req.nextUrl.pathname === "/auth/reset-password"
  ) {
    console.log("認証関連ルート、スキップします:", req.nextUrl.pathname)
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

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

    // 認証が必要なルートへの未認証アクセスをリダイレクト
    const isAuthRoute =
      path.startsWith("/auth") &&
      path !== "/auth/callback" &&
      path !== "/auth/signout" &&
      path !== "/auth/update-password" &&
      path !== "/auth/reset-password"
    const isProtectedRoute =
      path.startsWith("/profile") ||
      path.startsWith("/company") ||
      path.startsWith("/offers") ||
      path.startsWith("/chat") ||
      path === "/dashboard"

    if (!session && isProtectedRoute) {
      // 未認証でprotectedルートにアクセスした場合
      console.log("ミドルウェア: 未認証ユーザーが保護されたルートにアクセス:", path)
      const redirectUrl = new URL("/auth/signin", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // すでにログイン済みの場合、認証ページへのアクセスをリダイレクト
    if (session && isAuthRoute && path !== "/auth/signout") {
      console.log("ミドルウェア: 認証済みユーザーが認証ページにアクセス:", path)

      // ユーザーロールを取得（最小限のクエリ）
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role, is_approved")
        .eq("id", session.user.id)
        .single()

      console.log("ミドルウェア: ユーザーロール:", userRole)

      // ユーザーロールに基づいてリダイレクト
      if (userRole?.role === "company") {
        if (userRole.is_approved === false) {
          return NextResponse.redirect(new URL("/company/pending", req.url))
        }
        return NextResponse.redirect(new URL("/company/dashboard", req.url))
      }

      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  } catch (error) {
    console.error("ミドルウェアエラー:", error)
  }

  return res
}

// 認証チェックを適用するパス
export const config = {
  matcher: ["/profile/:path*", "/company/:path*", "/offers/:path*", "/chat/:path*", "/auth/:path*", "/dashboard"],
}
