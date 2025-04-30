"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  type: "signin" | "signup"
  userType?: "student" | "company"
  redirectUrl?: string
  error?: string | null
}

export function AuthForm({
  type,
  userType = "student",
  redirectUrl = "/dashboard",
  error: initialError = null,
}: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (type === "signin") {
        console.log("ログイン処理を開始...")

        // ログイン処理
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("ログインエラー:", signInError.message)
          setError(`ログインエラー: ${signInError.message}`)
          setLoading(false)
          return
        }

        // セッションを確認（←これが重要！）
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          console.error("セッション取得エラー:", sessionError?.message)
          setError("ログイン後のセッション取得に失敗しました。もう一度お試しください。")
          setLoading(false)
          return
        }

        console.log("ログイン成功、ユーザー情報取得開始")

        // ユーザー情報取得
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("ユーザー情報の取得に失敗:", userError?.message)
          setError("ログイン後にユーザー情報の取得に失敗しました")
          setLoading(false)
          return
        }

        // ユーザーロールの取得
        const { data: userRole, error: roleFetchError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (roleFetchError || !userRole) {
          console.error("ユーザーロール取得エラー:", roleFetchError?.message)
          setError("ユーザーロールの取得に失敗しました")
          setLoading(false)
          return
        }

        console.log("ユーザーロール:", userRole.role)

        // ロールに応じてリダイレクト
        if (userRole.role === "company") {
          window.location.href = "/company/dashboard"
        } else {
          // redirectUrlが/auth/signinを含む場合は、単純に/dashboardにリダイレクト
          if (redirectUrl && redirectUrl.includes("/auth/signin")) {
            window.location.href = "/dashboard"
          } else {
            window.location.href = redirectUrl || "/dashboard"
          }
        }

        return
      } else {
        // === サインアップ処理 ===
        console.log("サインアップ処理を開始...", userType)

        const { data: userData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: userType === "company" ? companyName : null,
              user_type: userType,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?userType=${userType}`,
          },
        })

        if (error) {
          console.error("登録エラー:", error.message)
          setError(`登録エラー: ${error.message}`)
          setLoading(false)
          return
        }

        console.log("サインアップ成功", userData)

        if (userData.user) {
          const { error: roleError } = await supabase.from("user_roles").insert([
            {
              id: userData.user.id,
              role: userType,
              is_approved: userType === "student" ? true : false,
            },
          ])

          if (roleError) {
            console.error("ロール設定エラー:", roleError.message)
          }
        }

        if (process.env.NODE_ENV === "development") {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!signInError) {
            if (userType === "company") {
              window.location.href = "/company/dashboard"
            } else {
              window.location.href = redirectUrl
            }
            return
          }
        }

        setSuccessMessage("登録が完了しました。確認メールを送信しましたので、メールボックスを確認してください。")
        setEmail("")
        setPassword("")
        setFullName("")
        setCompanyName("")
      }
    } catch (err) {
      console.error("認証エラー:", err)
      setError("予期せぬエラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">氏名</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="山田 太郎"
              />
            </div>

            {userType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">企業名</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required={userType === "company"}
                  placeholder="株式会社〇〇"
                />
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">パスワード</Label>
            {type === "signin" && (
              <Link href="/auth/reset-password" className="text-xs text-red-600 hover:underline">
                パスワードをお忘れですか？
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === "signin" ? "ログイン中..." : "登録中..."}
            </>
          ) : type === "signin" ? (
            "ログイン"
          ) : (
            "登録する"
          )}
        </Button>
      </form>
    </div>
  )
}
