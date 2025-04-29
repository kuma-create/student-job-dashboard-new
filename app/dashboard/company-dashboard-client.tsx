"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"
import { BarChart3, Briefcase, Calendar, ChevronRight, Edit, FileText, MessageSquare, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Company = {
  id: string
  company_name: string | null
  email: string | null
  is_approved: boolean | null
  industry: string | null
  company_size: string | null
  founded_year: number | null
  location: string | null
  description: string | null
  website_url: string | null
  logo_url: string | null
}

type Job = {
  id: number
  job_title: string
  location: string
  employment_type: string
  salary_min: number
  salary_max: number
  is_active: boolean
  created_at: string
}

type Application = {
  id: number
  status: string
  created_at: string
  student_id: string
  student_profiles: {
    id: string
    first_name: string | null
    last_name: string | null
    university: string | null
    graduation_year: number | null
    avatar_url: string | null
  }
  jobs: {
    id: number
    job_title: string
  }
}

interface CompanyDashboardClientProps {
  user: User
  company: Company
  jobs: Job[]
  applications: Application[]
}

export default function CompanyDashboardClient({ user, company, jobs, applications }: CompanyDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // 企業プロフィール完成度を計算
  const calculateProfileCompletion = () => {
    if (!company) return 0

    let total = 0
    let completed = 0

    // 基本情報
    if (company.company_name) completed++
    if (company.industry) completed++
    if (company.company_size) completed++
    if (company.founded_year) completed++
    if (company.location) completed++
    total += 5

    // 詳細情報
    if (company.description && company.description.length > 10) completed++
    if (company.website_url) completed++
    if (company.logo_url) completed++
    total += 3

    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  // 学生のフルネームを取得
  const getStudentFullName = (student: Application["student_profiles"]) => {
    if (student.first_name && student.last_name) {
      return `${student.last_name} ${student.first_name}`
    }
    return "名前未設定"
  }

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

  // 求人のステータスに応じた色を取得
  const getJobStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  // 求人のステータステキストを取得
  const getJobStatusText = (isActive: boolean) => {
    return isActive ? "公開中" : "非公開"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">企業ダッシュボード</h1>
        <p className="text-gray-500">こんにちは、{company?.company_name || user.email}様</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="jobs">求人管理</TabsTrigger>
          <TabsTrigger value="applications">応募者管理</TabsTrigger>
          <TabsTrigger value="messages">メッセージ</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 企業プロフィールカード */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">企業プロフィール</CardTitle>
                <CardDescription>企業情報</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src={company?.logo_url || "/placeholder.svg?height=96&width=96&query=company logo"}
                      alt="企業ロゴ"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium">{company?.company_name || "企業名未設定"}</h3>
                  <p className="text-sm text-gray-500">{company?.industry || "業界未設定"}</p>
                  <p className="text-sm text-gray-500">{company?.location || "所在地未設定"}</p>

                  <div className="mt-4 w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">プロフィール完成度</span>
                      <span className="text-xs font-medium">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>

                  <Button asChild className="mt-4 w-full">
                    <Link href="/company/profile">
                      <Edit className="mr-2 h-4 w-4" />
                      企業情報を編集
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 求人状況カード */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">求人状況</CardTitle>
                <CardDescription>公開中の求人と応募状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-blue-50 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">{jobs.filter((job) => job.is_active).length}</p>
                      <p className="text-xs text-blue-600">公開中求人</p>
                    </div>
                    <div className="rounded-md bg-amber-50 p-3 text-center">
                      <p className="text-2xl font-bold text-amber-700">{applications.length}</p>
                      <p className="text-xs text-amber-600">応募総数</p>
                    </div>
                  </div>

                  {jobs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">最近の求人</h4>
                      {jobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 flex items-center justify-center overflow-hidden rounded-md bg-gray-100">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{job.job_title}</p>
                            <p className="text-xs text-gray-500">{job.location}</p>
                          </div>
                          <Badge className={getJobStatusColor(job.is_active)}>{getJobStatusText(job.is_active)}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md bg-gray-50 p-4 text-center">
                      <p className="text-sm text-gray-500">まだ求人がありません</p>
                      <Button asChild className="mt-3" variant="outline" size="sm">
                        <Link href="/company/jobs/create">求人を作成</Link>
                      </Button>
                    </div>
                  )}

                  {jobs.length > 0 && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="#" onClick={() => setActiveTab("jobs")}>
                        すべての求人を見る
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 応募者状況カード */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">応募者状況</CardTitle>
                <CardDescription>最近の応募者</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.slice(0, 3).map((application) => (
                        <Link href={`/company/applications/${application.id}`} key={application.id}>
                          <div className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-gray-50">
                            <div className="h-10 w-10 overflow-hidden rounded-md">
                              <Image
                                src={
                                  application.student_profiles.avatar_url ||
                                  "/placeholder.svg?height=40&width=40&query=student" ||
                                  "/placeholder.svg"
                                }
                                alt={getStudentFullName(application.student_profiles)}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{getStudentFullName(application.student_profiles)}</p>
                              <p className="text-xs text-gray-500">{application.student_profiles.university}</p>
                              <p className="text-xs text-gray-500">{application.jobs.job_title}</p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status)}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md bg-gray-50 p-4 text-center">
                      <p className="text-sm text-gray-500">まだ応募者がいません</p>
                    </div>
                  )}

                  {applications.length > 0 && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="#" onClick={() => setActiveTab("applications")}>
                        すべての応募者を見る
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* アクティビティサマリーカード */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">アクティビティサマリー</CardTitle>
                <CardDescription>最近のアクティビティと統計</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-sm text-gray-500">総応募者数</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{jobs.length}</p>
                    <p className="text-sm text-gray-500">総求人数</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">
                      {jobs.length > 0 ? Math.round(applications.length / jobs.length) : 0}
                    </p>
                    <p className="text-sm text-gray-500">求人あたりの応募</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium">応募ステータス内訳</h4>
                  <div className="space-y-2">
                    {["pending", "reviewing", "interview", "offer", "rejected"].map((status) => {
                      const count = applications.filter((app) => app.status === status).length
                      const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0

                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{getStatusText(status)}</span>
                            <span>
                              {count}人 ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 今後の予定カード */}
            <Card className="md:col-span-1">
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
                            <p className="text-sm font-medium">
                              {getStudentFullName(application.student_profiles)}との面接
                            </p>
                            <p className="text-xs text-gray-500">{application.jobs.job_title}</p>
                            <p className="mt-1 text-xs text-gray-500">日程調整中</p>
                          </div>
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
        </TabsContent>

        {/* 求人管理タブ */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>求人管理</CardTitle>
                <CardDescription>すべての求人を管理</CardDescription>
              </div>
              <Button asChild>
                <Link href="/company/jobs/create">
                  <Plus className="mr-2 h-4 w-4" />
                  新規求人作成
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-12 w-12 flex items-center justify-center overflow-hidden rounded-md bg-gray-100">
                        <Briefcase className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{job.job_title}</h3>
                            <p className="text-sm text-gray-500">
                              {job.location} • {job.employment_type}
                            </p>
                          </div>
                          <Badge className={getJobStatusColor(job.is_active)}>{getJobStatusText(job.is_active)}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            作成日: {formatDate(job.created_at)}
                          </span>
                          <span>
                            {job.salary_min}万〜{job.salary_max}万円
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/jobs/${job.id}`}>詳細</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/jobs/${job.id}/edit`}>編集</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/jobs/${job.id}/applications`}>
                              応募者 ({applications.filter((app) => app.jobs.id === job.id).length})
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-gray-50 p-6 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <h3 className="mb-1 text-lg font-medium">求人がありません</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    まだ求人を作成していません。新しい求人を作成して学生からの応募を受け付けましょう。
                  </p>
                  <Button asChild>
                    <Link href="/company/jobs/create">求人を作成</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 応募者管理タブ */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>応募者管理</CardTitle>
              <CardDescription>すべての応募者を管理</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={
                            application.student_profiles.avatar_url ||
                            "/placeholder.svg?height=48&width=48&query=student" ||
                            "/placeholder.svg"
                          }
                          alt={getStudentFullName(application.student_profiles)}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{getStudentFullName(application.student_profiles)}</h3>
                            <p className="text-sm text-gray-500">
                              {application.student_profiles.university} • {application.student_profiles.graduation_year}
                              年卒
                            </p>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusText(application.status)}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            応募日: {formatDate(application.created_at)}
                          </span>
                          <span>{application.jobs.job_title}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/applications/${application.id}`}>詳細</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/company/chat/${application.id}`}>
                              <MessageSquare className="mr-1 h-3 w-3" />
                              メッセージ
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-gray-50 p-6 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <h3 className="mb-1 text-lg font-medium">応募者がいません</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    まだ応募者がいません。求人を公開して学生からの応募を待ちましょう。
                  </p>
                  <Button asChild>
                    <Link href="/company/jobs/create">求人を作成</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* メッセージタブ */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メッセージ</CardTitle>
              <CardDescription>応募者とのメッセージ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-gray-50 p-6 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <h3 className="mb-1 text-lg font-medium">メッセージがありません</h3>
                <p className="mb-4 text-sm text-gray-500">
                  応募者とのメッセージはまだありません。面接段階に進んだ応募者とメッセージのやり取りができます。
                </p>
                <Button asChild>
                  <Link href="/company/applications">応募者を確認</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
