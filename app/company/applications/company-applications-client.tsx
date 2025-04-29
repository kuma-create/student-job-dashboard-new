"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  ChevronRight,
  Search,
  User,
  Building2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 応募ステータスの定義
const APPLICATION_STATUS = {
  pending: { label: "審査中", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  document_screening: { label: "書類選考中", color: "bg-blue-100 text-blue-800", icon: FileText },
  interview_adjustment: { label: "面接調整中", color: "bg-purple-100 text-purple-800", icon: Calendar },
  interview_scheduled: { label: "面接予定", color: "bg-indigo-100 text-indigo-800", icon: Calendar },
  interview_completed: { label: "面接完了", color: "bg-cyan-100 text-cyan-800", icon: CheckCircle2 },
  offer: { label: "内定", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "不採用", color: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "キャンセル", color: "bg-gray-100 text-gray-800", icon: XCircle },
}

// 型定義
interface Student {
  id: string
  first_name: string | null
  last_name: string | null
  university: string | null
  major: string | null
  graduation_year: number | null
  avatar_url: string | null
}

interface Job {
  id: number
  job_title: string
  location: string
  employment_type: string
}

interface Application {
  id: number
  student_id: string
  job_id: number
  status: string
  self_pr: string | null
  questions: string | null
  interview_dates: number[] | null
  resume_url: string | null
  created_at: string
  updated_at: string
  jobs: Job
  students: Student
}

interface CompanyApplicationsClientProps {
  applications: Application[]
}

export default function CompanyApplicationsClient({ applications }: CompanyApplicationsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedJob, setSelectedJob] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  // 求人リストを取得（フィルター用）
  const jobs = Array.from(new Set(applications.map((app) => app.job_id)))
    .map((jobId) => {
      const job = applications.find((app) => app.job_id === jobId)?.jobs
      return job ? { id: job.id, title: job.job_title } : null
    })
    .filter(Boolean) as { id: number; title: string }[]

  // 応募をフィルタリングする関数
  const filteredApplications = applications.filter((app) => {
    // 検索語でフィルタリング
    const studentName = `${app.students.last_name || ""} ${app.students.first_name || ""}`.trim()
    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.students.university || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.job_title.toLowerCase().includes(searchTerm.toLowerCase())

    // タブでフィルタリング
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && ["pending", "document_screening"].includes(app.status)) ||
      (activeTab === "interview" &&
        ["interview_adjustment", "interview_scheduled", "interview_completed"].includes(app.status)) ||
      (activeTab === "completed" && ["offer", "rejected", "cancelled"].includes(app.status))

    // 求人でフィルタリング
    const matchesJob = selectedJob === "all" || app.job_id.toString() === selectedJob

    return matchesSearch && matchesTab && matchesJob
  })

  // 応募ステータスを更新する関数
  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return

    try {
      setIsUpdating(true)

      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", selectedApplication.id)

      if (error) throw error

      toast({
        title: "ステータスを更新しました",
        description: `応募のステータスが「${APPLICATION_STATUS[newStatus as keyof typeof APPLICATION_STATUS]?.label || newStatus}」に更新されました`,
      })

      // 応募リストを更新
      router.refresh()
      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "エラーが発生しました",
        description: "ステータスの更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 応募ステータスに応じたバッジを表示する関数
  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = APPLICATION_STATUS[status as keyof typeof APPLICATION_STATUS] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    }
    const Icon = statusInfo.icon

    return (
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
        <Icon className="mr-1 h-3 w-3" />
        {statusInfo.label}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">応募管理</h1>
        <p className="text-sm text-gray-500">求人に対する応募を管理します</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="応募者名・大学名で検索"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="求人で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての求人</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">選考中</TabsTrigger>
            <TabsTrigger value="interview">面接</TabsTrigger>
            <TabsTrigger value="completed">完了</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium">応募が見つかりません</h3>
            <p className="text-center text-sm text-gray-500">
              {searchTerm || selectedJob !== "all"
                ? "検索条件に一致する応募はありません。検索条件を変更してみてください。"
                : "まだ応募がありません。"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={application.students.avatar_url || "/placeholder.svg?height=40&width=40&query=person"}
                        alt={`${application.students.last_name || ""} ${application.students.first_name || ""}`.trim()}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {`${application.students.last_name || ""} ${application.students.first_name || ""}`.trim() ||
                          "名前未設定"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        応募日: {format(new Date(application.created_at), "yyyy年MM月dd日", { locale: ja })}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h3 className="mb-3 font-semibold">{application.jobs.job_title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{application.students.university || "大学未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{application.students.major || "学部未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {application.students.graduation_year
                        ? `${application.students.graduation_year}年卒業予定`
                        : "卒業年未設定"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application)
                    setNewStatus(application.status)
                    setIsStatusDialogOpen(true)
                  }}
                >
                  ステータス変更
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => router.push(`/company/applications/${application.id}`)}
                >
                  詳細を見る
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ステータス変更ダイアログ */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>応募ステータスの変更</DialogTitle>
            <DialogDescription>
              応募のステータスを更新します。応募者には更新されたステータスが通知されます。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedApplication && (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="mb-2 font-medium">{selectedApplication.jobs.job_title}</div>
                  <div className="text-sm text-gray-500">
                    応募者:{" "}
                    {`${selectedApplication.students.last_name || ""} ${selectedApplication.students.first_name || ""}`.trim()}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    新しいステータス
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">審査中</SelectItem>
                      <SelectItem value="document_screening">書類選考中</SelectItem>
                      <SelectItem value="interview_adjustment">面接調整中</SelectItem>
                      <SelectItem value="interview_scheduled">面接予定</SelectItem>
                      <SelectItem value="interview_completed">面接完了</SelectItem>
                      <SelectItem value="offer">内定</SelectItem>
                      <SelectItem value="rejected">不採用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="default"
              onClick={updateApplicationStatus}
              disabled={isUpdating || !newStatus || newStatus === selectedApplication?.status}
            >
              {isUpdating ? "更新中..." : "ステータスを更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
