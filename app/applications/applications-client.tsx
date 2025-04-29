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
  MapPin,
  Briefcase,
  ChevronRight,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
  jobs: {
    id: number
    job_title: string
    location: string
    employment_type: string
    companies: {
      id: number
      name: string
      logo_url: string | null
    }
  }
}

interface StudentProfile {
  id?: string
  full_name?: string
  university?: string
  major?: string
  graduation_year?: number
  skills?: string[]
  interests?: string[]
  resume_url?: string | null
  avatar_url?: string | null
  bio?: string
}

interface ApplicationsClientProps {
  applications: Application[]
  profile: StudentProfile
}

export default function ApplicationsClient({ applications, profile }: ApplicationsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // 応募をフィルタリングする関数
  const filteredApplications = applications.filter((app) => {
    // 検索語でフィルタリング
    const matchesSearch =
      app.jobs.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.location.toLowerCase().includes(searchTerm.toLowerCase())

    // タブでフィルタリング
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && !["rejected", "cancelled", "offer"].includes(app.status)) ||
      (activeTab === "completed" && ["rejected", "cancelled", "offer"].includes(app.status))

    return matchesSearch && matchesTab
  })

  // 応募をキャンセルする関数
  const cancelApplication = async () => {
    if (!selectedApplication) return

    try {
      setIsCancelling(true)

      const { error } = await supabase
        .from("applications")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", selectedApplication.id)

      if (error) throw error

      toast({
        title: "応募をキャンセルしました",
        description: "応募が正常にキャンセルされました",
      })

      // 応募リストを更新
      router.refresh()
      setIsDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "エラーが発生しました",
        description: "応募のキャンセルに失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
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
        <h1 className="text-2xl font-bold">応募履歴</h1>
        <p className="text-sm text-gray-500">あなたの応募状況を確認できます</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="企業名・求人名で検索"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="active">進行中</TabsTrigger>
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
              {searchTerm
                ? "検索条件に一致する応募はありません。検索語を変更してみてください。"
                : "まだ応募履歴がありません。求人に応募してみましょう。"}
            </p>
            {!searchTerm && (
              <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => router.push("/jobs")}>
                求人を探す
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={application.jobs.companies.logo_url || "/placeholder.svg?height=40&width=40&query=company"}
                        alt={application.jobs.companies.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{application.jobs.companies.name}</CardTitle>
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
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{application.jobs.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{application.jobs.employment_type}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application)
                    setIsDialogOpen(true)
                  }}
                  disabled={["cancelled", "rejected"].includes(application.status)}
                >
                  {application.status === "cancelled"
                    ? "キャンセル済み"
                    : application.status === "rejected"
                      ? "不採用"
                      : "キャンセル"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => router.push(`/applications/${application.id}`)}
                >
                  詳細を見る
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 応募キャンセル確認ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>応募をキャンセルしますか？</DialogTitle>
            <DialogDescription>この操作は取り消せません。本当に応募をキャンセルしますか？</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedApplication && (
              <div className="rounded-md border p-4">
                <div className="mb-2 font-medium">{selectedApplication.jobs.job_title}</div>
                <div className="text-sm text-gray-500">{selectedApplication.jobs.companies.name}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={cancelApplication} disabled={isCancelling}>
              {isCancelling ? "処理中..." : "応募をキャンセルする"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
