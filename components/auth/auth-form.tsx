"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export default function AuthForm({ type }: { type: "signin" | "signup" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient<Database>()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // リダイレクト先を取得
  const redirect = searchParams.get("redirect")

  // リダイレクト先が /auth/signin を含む場合は、リダイレクトループを防ぐためにダッシュボードに遷移
  const redirectPath =
    redirect && redirect.includes("/auth/signin")
      ? "/dashboard"
      : redirect
        ? decodeURIComponent(redirect)
        : "/dashboard"

  useEffect(() => {
    // エラーメッセージをクリア
    setError(null)
    setMessage(null)
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (type === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // ログイン成功後、リダイレクト
        // ロールに応じてリダイレクト
        // if (userRole.role === "company") {
        //   window.location.href = "/company/dashboard"
        // } else {
        // redirectUrlが/auth/signinを含む場合は、単純に/dashboardにリダイレクト
        if (redirect && redirect.includes("/auth/signin")) {
          window.location.href = "/dashboard"
        } else {
          window.location.href = redirect || "/dashboard"
        }
        // }
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        setMessage("アカウント登録メールを送信しました。メールを確認してください。")
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      setError(error.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">{type === "signin" ? "ログイン" : "新規登録"}</h1>
      <p className="text-center mb-6">
        {type === "signin"
          ? "アカウントにログインして、就職活動を始めましょう"
          : "新しいアカウントを作成して、就職活動を始めましょう"}
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 w-full">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium">
              パスワード
            </label>
            {type === "signin" && (
              <Link href="/auth/reset-password" className="text-sm text-red-600 hover:underline">
                パスワードをお忘れですか？
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          {loading ? "処理中..." : type === "signin" ? "ログイン" : "新規登録"}
        </button>
      </form>

      <div className="mt-6 text-center">
        {type === "signin" ? (
          <p>
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup" className="text-red-600 hover:underline">
              新規登録
            </Link>
          </p>
        ) : (
          <p>
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/signin" className="text-red-600 hover:underline">
              ログイン
            </Link>
          </p>
        )}
      </div>

      <div className="mt-4">
        <Link href="/" className="text-sm text-gray-600 hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
