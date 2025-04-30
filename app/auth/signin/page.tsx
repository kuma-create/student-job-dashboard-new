import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

import AuthForm from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // サーバーサイドでセッションを確認
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // リダイレクトURLとエラーを取得
  const redirectUrl = typeof searchParams.redirect === "string" ? searchParams.redirect : "/dashboard"
  const error = typeof searchParams.error === "string" ? searchParams.error : null

  // すでにログインしている場合はリダイレクト
  if (session) {
    // リダイレクトパラメータがある場合はそちらへ、なければダッシュボードへ
    redirect(redirectUrl)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">ログイン</h1>
            <p className="text-gray-500">アカウントにログインして、就職活動を始めましょう</p>
          </div>
          <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
            <AuthForm type="signin" redirectUrl={redirectUrl} error={error} />
          </Suspense>
          <div className="mt-4 text-center">
            <Link href="/auth/reset-password" className="text-sm text-red-600 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </div>
          <div className="text-center text-sm">
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup?type=student" className="font-medium text-red-600 hover:underline">
              新規登録
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-red-600">
              <ArrowLeft className="mr-1 h-4 w-4" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
