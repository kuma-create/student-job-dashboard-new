"use client"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// 動的レンダリングを強制する
export const dynamic = "force-dynamic"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [isInterested, setIsInterested] = useState(false)
  const [eventRegistered, setEventRegistered] = useState<Record<string, boolean>>({})
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("job_postings")
          .select(`
            *,
            companies (*)
          `)
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Error fetching job:", error)
          router.push("/jobs")
          return
        }

        setJob(data)
      } catch (error) {
        console.error("Failed to fetch job:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [params.id, router, supabase])

  const handleEventRegistration = (eventId: number) => {
    setEventRegistered((prev) => ({
      ...prev,
      [eventId]: true,
    }))
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (!job) {
    return <div className="container mx-auto px-4 py-8">求人が見つかりませんでした</div>
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {job.companies && job.companies.logo_url ? (
            <img
              src={job.companies.logo_url || "/placeholder.svg"}
              alt={job.companies?.name || "企業ロゴ"}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl font-bold">
              {job.companies?.name?.charAt(0) || "?"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{job.title || "求人タイトル"}</h1>
            <p className="text-lg text-muted-foreground">{job.companies?.name || "企業名不明"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.location && <Badge variant="outline">{job.location}</Badge>}
          {job.job_type && <Badge variant="outline">{job.job_type}</Badge>}
          {job.salary_range && <Badge variant="outline">{job.salary_range}</Badge>}
          <Badge variant="outline">{new Date(job.created_at).toLocaleDateString("ja-JP")}に投稿</Badge>
        </div>

        {/* {user && (
          <div className="flex gap-4 mb-8">
            <Link href={`/jobs/${job.id}/apply`}>
              <Button className="bg-red-600 hover:bg-red-700">応募する</Button>
            </Link>
            <Button variant="outline">保存する</Button>
          </div>
        )} */}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">職務内容</h2>
          <div className="prose max-w-none">
            <p>{job.description}</p>
          </div>
        </section>

        {job.requirements && (
          <section>
            <h2 className="text-xl font-semibold mb-4">応募要件</h2>
            <div className="prose max-w-none">
              <p>{job.requirements}</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">企業情報</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium">会社名</h3>
              <p>{job.companies?.name || "情報なし"}</p>
            </div>
            {job.companies?.industry && (
              <div>
                <h3 className="font-medium">業界</h3>
                <p>{job.companies.industry}</p>
              </div>
            )}
            {job.companies?.location && (
              <div>
                <h3 className="font-medium">所在地</h3>
                <p>{job.companies.location}</p>
              </div>
            )}
            {job.companies?.size && (
              <div>
                <h3 className="font-medium">従業員数</h3>
                <p>{job.companies.size}</p>
              </div>
            )}
            {job.companies?.description && (
              <div>
                <h3 className="font-medium">会社概要</h3>
                <p>{job.companies.description}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
