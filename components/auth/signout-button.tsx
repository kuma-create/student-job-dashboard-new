import { AuthForm } from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SignIn({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string }
}) {
  // サーバーサイドでセッションを確認
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // すでにログインしている場合はリダイレクト
  if (session) {
    // リダイレクトパラメータがある場合はそちらへ、なければダッシュボードへ
    const redirectTo = searchParams.redirect || "/dashboard"
    redirect(redirectTo)
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ログイン</h1>
          <p className="text-gray-500">アカウントにログインしてください</p>
        </div>
        <AuthForm redirectUrl={searchParams.redirect} error={searchParams.error} />
      </div>
    </div>
  )
}
