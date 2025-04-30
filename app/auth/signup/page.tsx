"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState("student")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // ユーザーメタデータを設定
      const metadata =
        userType === "student" ? { full_name: fullName } : { full_name: fullName, company_name: companyName }

      // サインアップ処理
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // ユーザーロールを設定
        const { error: roleError } = await supabase.from("user_roles").insert([{ id: data.user.id, role: userType }])

        if (roleError) throw roleError

        // 学生プロフィールを作成（学生の場合）
        if (userType === "student") {
          const { error: profileError } = await supabase
            .from("student_profiles")
            .insert([{ id: data.user.id, full_name: fullName }])

          if (profileError) throw profileError
        }

        // 登録成功メッセージを表示
        alert("登録が完了しました。メールを確認してアカウントを有効化してください。")

        // ログインページにリダイレクト
        router.push("/auth/signin")
      }
    } catch (error: any) {
      console.error("サインアップエラー:", error)
      setError(error.message || "アカウント作成中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">新規アカウント登録</CardTitle>
          <CardDescription className="text-center">必要情報を入力して、アカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">アカウントタイプ</Label>
              <RadioGroup id="userType" value={userType} onValueChange={setUserType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">学生</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">企業</Label>
                </div>
              </RadioGroup>
            </div>

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
                <Label htmlFor="companyName">会社名</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required={userType === "company"}
                  placeholder="株式会社サンプル"
                />
              </div>
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
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                minLength={8}
              />
              <p className="text-xs text-gray-500">8文字以上の英数字を入力してください</p>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? "登録中..." : "アカウント作成"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-gray-500">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/signin" className="text-red-600 hover:underline">
              ログイン
            </Link>
          </p>
          <Link href="/" className="text-sm text-center text-gray-500 hover:underline">
            ホームに戻る
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
