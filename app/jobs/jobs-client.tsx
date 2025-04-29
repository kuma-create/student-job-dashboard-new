"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

type Job = {
  id: number
  job_title: string
  job_description: string
  location: string
  employment_type: string
  salary_min: number
  salary_max: number
  work_style: string
  application_deadline: string
  tags: string[]
  created_at: string
  companies: {
    id: number
    company_name: string
    industry: string
    logo_url: string
  } | null
}

type RecommendedJob = {
  id: number
  company: string
  position: string
  logo: string
}

type FilterOption = {
  value: string
  label: string
}

interface JobsClientProps {
  jobs: Job[]
  recommendedJobs: RecommendedJob[]
  popularTags: string[]
  industries: FilterOption[]
  jobTypes: FilterOption[]
  locations: FilterOption[]
}

export default function JobsClient({
  jobs: initialJobs,
  recommendedJobs,
  popularTags,
  industries,
  jobTypes,
  locations,
}: JobsClientProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedWorkStyle, setSelectedWorkStyle] = useState("all")
  const [salaryRange, setSalaryRange] = useState([0, 1000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [sortOption, setSortOption] = useState("newest")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 保存済み求人を取得
  useEffect(() => {
    async function fetchSavedJobs() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("student_id", user.id)

        if (!error && data) {
          setSavedJobs(data.map((item) => item.job_id))
        }
      }
    }

    fetchSavedJobs()
  }, [])

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from("job_postings")
          .select(`
            id, 
            title, 
            company_id,
            description, 
            location, 
            job_type, 
            salary_range, 
            created_at,
            companies (
              name,
              logo_url
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setJobs(data || [])
      } catch (error) {
        console.error("求人の取得に失敗しました:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [supabase])

  // 求人を保存/削除する関数
  const toggleSaveJob = async (jobId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // ユーザーがログインしていない場合はログインページにリダイレクト
      window.location.href = "/auth/signin"
      return
    }

    const isSaved = savedJobs.includes(jobId)

    if (isSaved) {
      // 保存済みの場合は削除
      const { error } = await supabase.from("saved_jobs").delete().eq("student_id", user.id).eq("job_id", jobId)

      if (!error) {
        setSavedJobs(savedJobs.filter((id) => id !== jobId))
      }
    } else {
      // 保存されていない場合は追加
      const { error } = await supabase.from("saved_jobs").insert({
        student_id: user.id,
        job_id: jobId,
        created_at: new Date().toISOString(),
      })

      if (!error) {
        setSavedJobs([...savedJobs, jobId])
      }
    }
  }

  // 検索とフィルタリングの処理
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companies?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags && job.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesIndustry =
      selectedIndustry === "all" ||
      (job.companies?.industry && job.companies.industry.toLowerCase() === selectedIndustry.toLowerCase())

    const matchesJobType =
      selectedJobType === "all" || job.employment_type?.toLowerCase() === selectedJobType.toLowerCase()

    const matchesLocation =
      selectedLocation === "all" || job.location?.toLowerCase().includes(selectedLocation.toLowerCase())

    const matchesWorkStyle =
      selectedWorkStyle === "all" || job.work_style?.toLowerCase().includes(selectedWorkStyle.toLowerCase())

    const matchesSalary =
      (!job.salary_min && !job.salary_max) || (job.salary_min >= salaryRange[0] && job.salary_max <= salaryRange[1])

    return matchesSearch && matchesIndustry && matchesJobType && matchesLocation && matchesWorkStyle && matchesSalary
  })

  // ソート処理
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "salary_high":
        return (b.salary_max || 0) - (a.salary_max || 0)
      case "salary_low":
        return (a.salary_min || 0) - (b.salary_min || 0)
      case "deadline":
        return new Date(a.application_deadline || "").getTime() - new Date(b.application_deadline || "").getTime()
      default:
        return 0
    }
  })

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  // 検索を実行する関数
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 検索処理の模擬（実際にはAPIリクエストなどが入る）
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // フィルターをリセットする関数
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedIndustry("all")
    setSelectedJobType("all")
    setSelectedLocation("all")
    setSelectedWorkStyle("all")
    setSalaryRange([0, 1000])
    setSortOption("newest")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* ヘッダーセクション */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">求人検索</h1>
          <p className="text-muted-foreground">
            あなたのスキルや経験に合った求人を見つけましょう。{jobs.length}件の求人が見つかりました。
          </p>
        </div>

        {/* 検索バーとフィルターボタン */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="職種、企業名、スキルなどで検索"
                className="pl-10 pr-4 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-12"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            フィルター
            {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button className="h-12 bg-red-600 hover:bg-red-700" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            検索
          </Button>
        </div>

        {/* フィルターパネル */}
        {isFilterOpen && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">検索条件</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-600 hover:text-red-700">
                <X className="h-4 w-4 mr-2" />
                リセット
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 業界 */}
              <div>
                <Label className="text-sm font-medium mb-2 block">業界</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 職種 */}
              <div>
                <Label className="text-sm font-medium mb-2 block">職種</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                >
                  {jobTypes.map((jobType) => (
                    <option key={jobType.value} value={jobType.value}>
                      {jobType.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 勤務地 */}
              <div>
                <Label className="text-sm font-medium mb-2 block">勤務地</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 並び替え */}
              <div>
                <Label className="text-sm font-medium mb-2 block">並び替え</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                  <option value="salary_high">給与高い順</option>
                  <option value="salary_low">給与低い順</option>
                  <option value="deadline">締切間近順</option>
                </select>
              </div>
            </div>

            {/* 詳細フィルター */}
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              >
                {isAdvancedFilterOpen ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                詳細条件
              </button>

              {isAdvancedFilterOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 給与範囲 */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      給与範囲: {salaryRange[0]}万円 - {salaryRange[1]}万円
                    </Label>
                    <Slider
                      value={salaryRange}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setSalaryRange(value as [number, number])}
                      className="my-4"
                    />
                  </div>

                  {/* 勤務形態 */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">勤務形態</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remote"
                          checked={selectedWorkStyle === "remote"}
                          onCheckedChange={() =>
                            setSelectedWorkStyle(selectedWorkStyle === "remote" ? "all" : "remote")
                          }
                        />
                        <Label htmlFor="remote" className="text-sm font-normal">
                          リモート可
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hybrid"
                          checked={selectedWorkStyle === "hybrid"}
                          onCheckedChange={() =>
                            setSelectedWorkStyle(selectedWorkStyle === "hybrid" ? "all" : "hybrid")
                          }
                        />
                        <Label htmlFor="hybrid" className="text-sm font-normal">
                          ハイブリッド
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="office"
                          checked={selectedWorkStyle === "office"}
                          onCheckedChange={() =>
                            setSelectedWorkStyle(selectedWorkStyle === "office" ? "all" : "office")
                          }
                        />
                        <Label htmlFor="office" className="text-sm font-normal">
                          オフィス勤務
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="flexible"
                          checked={selectedWorkStyle === "flexible"}
                          onCheckedChange={() =>
                            setSelectedWorkStyle(selectedWorkStyle === "flexible" ? "all" : "flexible")
                          }
                        />
                        <Label htmlFor="flexible" className="text-sm font-normal">
                          フレックス
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1 space-y-6">
            {/* おすすめ求人 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">おすすめ求人</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedJobs.map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                    <div className="flex items-start space-x-3 group">
                      <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={job.logo || "/placeholder.svg"}
                          alt={job.company}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium group-hover:text-red-600 transition-colors">
                          {job.position}
                        </h4>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* 人気のタグ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">人気のタグ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 求人リスト */}
          <div className="lg:col-span-3">
            {/* アクティブなフィルター */}
            {(selectedIndustry !== "all" ||
              selectedJobType !== "all" ||
              selectedLocation !== "all" ||
              selectedWorkStyle !== "all" ||
              salaryRange[0] > 0 ||
              salaryRange[1] < 1000) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">アクティブなフィルター</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
                    すべてクリア
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedIndustry !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      業界: {industries.find((i) => i.value === selectedIndustry)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedIndustry("all")} />
                    </Badge>
                  )}
                  {selectedJobType !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      職種: {jobTypes.find((j) => j.value === selectedJobType)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedJobType("all")} />
                    </Badge>
                  )}
                  {selectedLocation !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      勤務地: {locations.find((l) => l.value === selectedLocation)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation("all")} />
                    </Badge>
                  )}
                  {selectedWorkStyle !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      勤務形態: {selectedWorkStyle}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedWorkStyle("all")} />
                    </Badge>
                  )}
                  {(salaryRange[0] > 0 || salaryRange[1] < 1000) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      給与: {salaryRange[0]}万円 - {salaryRange[1]}万円
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSalaryRange([0, 1000])} />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 求人カード */}
            {sortedJobs.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium">求人が見つかりませんでした</h3>
                <p className="text-muted-foreground mt-2">検索条件を変更してお試しください</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  フィルターをリセット
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 p-6 flex items-center justify-center bg-gray-50">
                        <div className="w-20 h-20 relative">
                          {job.companies?.logo_url ? (
                            <Image
                              src={job.companies.logo_url || "/placeholder.svg"}
                              alt={job.companies.company_name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                              {job.companies?.company_name?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:w-3/4 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              <Link href={`/jobs/${job.id}`} className="hover:text-red-600 transition-colors">
                                {job.job_title}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">{job.companies?.company_name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            <Bookmark
                              className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-red-600 text-red-600" : ""}`}
                            />
                            <span className="sr-only">保存</span>
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.location && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </Badge>
                          )}
                          {job.employment_type && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {job.employment_type}
                            </Badge>
                          )}
                          {job.work_style && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.work_style}
                            </Badge>
                          )}
                          {job.salary_min && job.salary_max && (
                            <Badge variant="outline">
                              {job.salary_min}万円〜{job.salary_max}万円
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.job_description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(job.created_at)}に投稿
                            {job.application_deadline && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-3" />
                                <span>応募締切: {formatDate(job.application_deadline)}</span>
                              </>
                            )}
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              詳細を見る
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
