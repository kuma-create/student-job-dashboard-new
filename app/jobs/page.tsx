import { createClient } from "@/lib/supabase/server"
import JobsClient from "./jobs-client"

// 動的レンダリングを強制する
export const dynamic = "force-dynamic"
export const revalidate = 60 // 60秒ごとに再検証

export default async function JobsPage() {
  const supabase = createClient()

  // 正しいエイリアス構文を使用する
  const { data: jobs, error } = await supabase
    .from("job_postings")
    .select(`
      id,
      title,
      description,
      location,
      job_type,
      salary_range,
      application_deadline,
      created_at,
      company_id,
      companies (
        id,
        name,
        industry,
        logo_url
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching jobs:", error)
  }

  // データを変換して、クライアントコンポーネントが期待する形式に合わせる
  const formattedJobs =
    jobs?.map((job) => ({
      id: job.id,
      job_title: job.title,
      job_description: job.description,
      location: job.location,
      employment_type: job.job_type,
      salary_min: job.salary_range?.min,
      salary_max: job.salary_range?.max,
      work_style: job.job_type, // 適切なフィールドがない場合は job_type を使用
      application_deadline: job.application_deadline,
      tags: [], // タグ情報がない場合は空配列
      created_at: job.created_at,
      companies: job.companies
        ? {
            id: job.companies.id,
            company_name: job.companies.name,
            industry: job.companies.industry,
            logo_url: job.companies.logo_url,
          }
        : null,
    })) || []

  // おすすめ求人（サイドバー用）
  const recommendedJobs = [
    {
      id: 101,
      company: "テックスタートアップ株式会社",
      position: "フルスタックエンジニア",
      logo: "/abstract-geometric-ts.png",
    },
    {
      id: 102,
      company: "AIソリューションズ株式会社",
      position: "機械学習エンジニア",
      logo: "/abstract-ai-network.png",
    },
    {
      id: 103,
      company: "デジタルマーケティング株式会社",
      position: "Webマーケター",
      logo: "/social-media-direct-message.png",
    },
  ]

  // 人気のタグ
  const popularTags = [
    "React",
    "Python",
    "AWS",
    "UI/UX",
    "Java",
    "データ分析",
    "プロジェクト管理",
    "マーケティング",
    "営業",
    "コンサルティング",
  ]

  // 業界リスト
  const industries = [
    { value: "all", label: "すべての業界" },
    { value: "it", label: "IT・通信" },
    { value: "finance", label: "金融・保険" },
    { value: "consulting", label: "コンサルティング" },
    { value: "manufacturing", label: "メーカー" },
    { value: "trading", label: "商社" },
    { value: "media", label: "広告・メディア" },
  ]

  // 職種リスト
  const jobTypes = [
    { value: "all", label: "すべての職種" },
    { value: "engineer", label: "エンジニア" },
    { value: "consultant", label: "コンサルタント" },
    { value: "designer", label: "デザイナー" },
    { value: "marketing", label: "マーケティング" },
    { value: "sales", label: "営業" },
    { value: "datascientist", label: "データサイエンティスト" },
  ]

  // 勤務地リスト
  const locations = [
    { value: "all", label: "すべての勤務地" },
    { value: "tokyo", label: "東京都" },
    { value: "osaka", label: "大阪府" },
    { value: "nagoya", label: "愛知県" },
    { value: "fukuoka", label: "福岡県" },
    { value: "remote", label: "リモート可" },
  ]

  return (
    <JobsClient
      jobs={formattedJobs}
      recommendedJobs={recommendedJobs}
      popularTags={popularTags}
      industries={industries}
      jobTypes={jobTypes}
      locations={locations}
    />
  )
}
