"use client"
import Link from "next/link"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Edit,
  FileText,
  MapPin,
  MessageSquare,
  Trophy,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GrandprixBanner } from "@/components/grandprix-banner"

type Profile = {
  id: string
  full_name: string
  university: string
  major: string
  graduation_year: number
  skills: string[]
  interests: string[]
  resume_url: string | null
  avatar_url: string | null
}

type Application = {
  id: number
  status: string
  created_at: string
  jobs: {
    id: number
    job_title: string
    companies: {
      id: number
      company_name: string
      logo_url: string
    }
  }
}

type SavedJob = {
  id: number
  created_at: string
  jobs: {
    id: number
    job_title: string
    location: string
    salary_min: number
    salary_max: number
    companies: {
      id: number
      company_name: string
      logo_url: string
    }
  }
}

type RecommendedJob = {
  id: number
  job_title: string
  location: string
  salary_min: number
  salary_max: number
  companies: {
    id: number
    company_name: string
    logo_url: string
  }
}

interface DashboardClientProps {
  user: User
  userRole: string
  profile: Profile | null
  applications: Application[]
  savedJobs: SavedJob[]
  recommendedJobs: RecommendedJob[]
}

export default function DashboardClient({
  user,
  userRole,
  profile,
  applications,
  savedJobs,
  recommendedJobs,
}: DashboardClientProps) {
  // プロフィール完成度を計算
  const calculateProfileCompletion = () => {
    if (!profile) return 0

    let total = 0
    let completed = 0

    // 基本情報
    if (profile.full_name) completed++
    if (profile.university) completed++
    if (profile.major) completed++
    if (profile.graduation_year) completed++
    total += 4

    // スキルと興味
    if (profile.skills && profile.skills.length > 0) completed++
    if (profile.interests && profile.interests.length > 0) completed++
    total += 2

    // 履歴書とアバター
    if (profile.resume_url) completed++
    if (profile.avatar_url) completed++
    total += 2

    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  // 応募ステータスを日本語に変換
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "審査中"
      case "reviewing":
        return "書類選考中"
      case "interview":
        return "面接調整中"
      case "offer":
        return "内定"
      case "rejected":
        return "不採用"
      default:
        return "審査中"
    }
  }

  // 応募ステータスに応じた色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "reviewing":
        return "bg-purple-100 text-purple-800"
      case "interview":
        return "bg-amber-100 text-amber-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-gray-500">こんにちは、{profile?.full_name || user.email}さん</p>
      </div>

      {/* 就活グランプリバナー */}
      <div className="mb-8">
        <GrandprixBanner />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* 左サイドバー - プロフィール情報 */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">プロフィール</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    src={profile?.avatar_url || "/placeholder.svg?height=96&width=96&query=avatar"}
                    alt="プロフィール画像"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium">{profile?.full_name || "名前未設定"}</h3>
                <p className="text-sm text-gray-500">{profile?.university || "大学未設定"}</p>
                <p className="text-sm text-gray-500">{profile?.major || "専攻未設定"}</p>

                <div className="mt-4 w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs">プロフィール完成度</span>
                    <span className="text-xs font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>

                <Button asChild className="mt-4 w-full">
                  <Link href="/profile">
                    <Edit className="mr-2 h-4 w-4" />
                    プロフィールを編集
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">メニュー</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="grid gap-1 px-2">
                <Link
                  href="/jobs"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>求人を探す</span>
                </Link>
                <Link
                  href="/applications"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>応募履歴</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>メッセージ</span>
                </Link>
                <Link
                  href="/resume"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>履歴書</span>
                </Link>
                <Link
                  href="/grandprix"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <Trophy className="h-4 w-4" />
                  <span>就活グランプリ</span>
                </Link>
              </nav>
            </CardContent>
          </Card>

          {/* 保存した求人 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">保存した求人</CardTitle>
            </CardHeader>
            <CardContent>
              {savedJobs.length > 0 ? (
                <div className="space-y-3">
                  {savedJobs.slice(0, 3).map((savedJob) => (
                    <Link href={`/jobs/${savedJob.jobs.id}`} key={savedJob.id}>
                      <div className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-50">
                        <div className="h-8 w-8 overflow-hidden rounded-md">
                          <Image
                            src={savedJob.jobs.companies.logo_url || "/placeholder.svg"}
                            alt={savedJob.jobs.companies.company_name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{savedJob.jobs.job_title}</p>
                          <p className="text-xs text-gray-500">{savedJob.jobs.companies.company_name}</p>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  <p>保存した求人はありません</p>
                </div>
              )}
              {savedJobs.length > 0 && (
                <div className="mt-3 text-center">
                  <Link
                    href="/jobs?filter=saved"
                    className="text-xs text-red-600 hover:underline inline-flex items-center"
                  >
                    すべて見る <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <div className="md:col-span-3 space-y-6">
          {/* 就活グランプリの進捗 */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-purple-600" />
                就活グランプリ進捗状況
              </CardTitle>
              <CardDescription>あなたの就活グランプリの進捗状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                  <div className="text-sm font-medium text-gray-500">ビジネスケース</div>
                  <div className="mt-1 text-lg font-bold text-purple-700">未挑戦</div>
                  <Link href="/grandprix/case">
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      挑戦する
                    </Button>
                  </Link>
                </div>
                <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Webテスト</div>
                  <div className="mt-1 text-lg font-bold text-purple-700">未挑戦</div>
                  <Link href="/grandprix/webtest">
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      挑戦する
                    </Button>
                  </Link>
                </div>
                <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                  <div className="text-sm font-medium text-gray-500">ビジネス英語</div>
                  <div className="mt-1 text-lg font-bold text-purple-700">未挑戦</div>
                  <Link href="/grandprix/business">
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      挑戦する
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/grandprix" className="text-sm text-purple-700 hover:underline w-full text-center">
                就活グランプリについて詳しく見る
              </Link>
            </CardFooter>
          </Card>

          {/* 応募状況カード */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">応募状況</CardTitle>
              <CardDescription>あなたの応募状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-blue-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{applications.length}</p>
                    <p className="text-xs text-blue-600">応募総数</p>
                  </div>
                  <div className="rounded-md bg-amber-50 p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">
                      {applications.filter((app) => app.status === "interview").length}
                    </p>
                    <p className="text-xs text-amber-600">面接調整中</p>
                  </div>
                  <div className="rounded-md bg-green-50 p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {applications.filter((app) => app.status === "offer").length}
                    </p>
                    <p className="text-xs text-green-600">内定獲得</p>
                  </div>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">最近の応募</h4>
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={application.jobs.companies.logo_url || "/placeholder.svg"}
                            alt={application.jobs.companies.company_name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{application.jobs.job_title}</p>
                          <p className="text-xs text-gray-500">{application.jobs.companies.company_name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(application.created_at)}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">まだ応募履歴がありません</p>
                    <Button asChild className="mt-3" variant="outline" size="sm">
                      <Link href="/jobs">求人を探す</Link>
                    </Button>
                  </div>
                )}

                {applications.length > 0 && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/applications">
                      すべての応募を見る
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* おすすめ求人カード */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">おすすめ求人</CardTitle>
              <CardDescription>あなたにおすすめの求人</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id}>
                    <div className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50 border border-gray-100">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={job.companies.logo_url || "/placeholder.svg"}
                          alt={job.companies.company_name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{job.job_title}</p>
                        <p className="text-sm text-gray-500">{job.companies.company_name}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="mr-1 h-3 w-3" />
                            {job.salary_min}万〜{job.salary_max}万円
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                <Button asChild variant="outline" className="w-full">
                  <Link href="/jobs">
                    すべての求人を見る
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 今後の予定カード */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">今後の予定</CardTitle>
              <CardDescription>面接や締切などの予定</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.some((app) => app.status === "interview") ? (
                <div className="space-y-3">
                  {applications
                    .filter((app) => app.status === "interview")
                    .slice(0, 3)
                    .map((application) => (
                      <div key={application.id} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{application.jobs.companies.company_name}との面接</p>
                          <p className="text-xs text-gray-500">{application.jobs.job_title}</p>
                          <p className="mt-1 text-xs text-gray-500">日程調整中</p>
                        </div>
                        <Link href={`/applications/${application.id}`}>
                          <Button size="sm" variant="outline">
                            詳細
                          </Button>
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-md bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">予定はありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
