"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("ログイン情報が取得できませんでした")
      setLoading(false)
      return
    }

    // 自社のcompany_idを取得
    const { data: companyUser } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    if (!companyUser) {
      setError("企業情報が見つかりません")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("job_postings").insert([
      {
        company_id: companyUser.company_id,
        title,
        description,
        location,
        job_type: jobType,
        is_active: true,
      }
    ])

    if (insertError) {
      setError("保存中にエラーが発生しました")
      console.error(insertError)
      setLoading(false)
      return
    }

    router.push("/company/jobs")
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新しい求人を作成する</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">求人タイトル</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="例：営業職（新卒採用）"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">仕事内容</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="業務内容の詳細を入力してください"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">勤務地</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="例：東京都渋谷区"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">雇用形態</Label>
          <Input
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
            placeholder="例：正社員／インターン"
          />
        </div>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? "保存中..." : "保存する"}
        </Button>
      </form>
    </div>
  )
}
