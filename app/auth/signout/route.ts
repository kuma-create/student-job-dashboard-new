import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  // サインアウト処理
  await supabase.auth.signOut()

  // すべてのクッキーを削除
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name)
  }

  // ホームページにリダイレクト
  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  })
}
