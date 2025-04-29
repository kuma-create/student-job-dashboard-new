"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ChevronLeft, Calendar, Clock, MapPin, LinkIcon, FileText, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// 面接スケジュールの型定義
interface InterviewSchedule {
  id: number
  application_id: number
  scheduled_at: string
  status: "pending" | "confirmed" | "cancelled"
  duration_minutes: number
  location: string | null
  meeting_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface InterviewScheduleClientProps {
  applicationId: number
}

export default function InterviewScheduleClient({ applicationId }: InterviewScheduleClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingSchedules, setPendingSchedules] = useState<InterviewSchedule[]>([])
  const [confirmedSchedule, setConfirmedSchedule] = useState<InterviewSchedule | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // 面接スケジュールを取得する
  const fetchInterviewSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("interview_schedules")
        .select("*")
        .eq("application_id", applicationId)
        .order("scheduled_at", { ascending: true })

      if (error) throw error

      // データを確認済みと未確認に分ける
      const confirmed = data.find((schedule) => schedule.status === "confirmed") || null
      const pending = data.filter((schedule) => schedule.status === "pending")

      setConfirmedSchedule(confirmed)
      setPendingSchedules(pending)
    } catch (err) {
      console.error("面接スケジュールの取得に失敗しました:", err)
      setError("面接スケジュールの取得に失敗しました。再度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchInterviewSchedules()
  }, [applicationId])

  // 面接日程を確定する
  const confirmSchedule = async (scheduleId: number) => {
    try {
      setIsConfirming(true)

      const { error } = await supabase
        .from("interview_schedules")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId)

      if (error) throw error

      toast({
        title: "面接日程を確定しました",
        description: "応募者に面接日程が通知されます。",
      })

      // データを再取得して表示を更新
      await fetchInterviewSchedules()
    } catch (err) {
      console.error("面接日程の確定に失敗しました:", err)
      toast({
        title: "エラーが発生しました",
        description: "面接日程の確定に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  // 日付をフォーマットする
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "yyyy年MM月dd日(E) HH:mm", { locale: ja })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" className="mb-2 gap-1 pl-0" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          応募詳細に戻る
        </Button>
        <h1 className="text-2xl font-bold">面接スケジュール管理</h1>
        <p className="text-muted-foreground">応募ID: {applicationId}</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 確定済み面接スケジュール */}
          <div className="md:col-span-2">
            {confirmedSchedule ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">確定済み面接日程</CardTitle>
                    <Badge className="bg-green-600">確定済み</Badge>
                  </div>
                  <CardDescription>以下の日程で面接が確定しています。応募者にも通知されています。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium">日時:</span>
                    <span>{formatDateTime(confirmedSchedule.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="font-medium">所要時間:</span>
                    <span>{confirmedSchedule.duration_minutes}分</span>
                  </div>
                  {confirmedSchedule.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="font-medium">場所:</span>
                      <span>{confirmedSchedule.location}</span>
                    </div>
                  )}
                  {confirmedSchedule.meeting_link && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium">ミーティングリンク:</span>
                      <a
                        href={confirmedSchedule.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {confirmedSchedule.meeting_link}
                      </a>
                    </div>
                  )}
                  {confirmedSchedule.notes && (
                    <div className="flex gap-2">
                      <FileText className="h-5 w-5 shrink-0 text-green-600" />
                      <div>
                        <span className="font-medium">備考:</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{confirmedSchedule.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // カレンダーに追加する機能（プレースホルダー）
                      toast({
                        title: "カレンダーに追加",
                        description: "この機能は現在開発中です。",
                      })
                    }}
                  >
                    カレンダーに追加
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50 md:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Calendar className="h-12 w-12 text-yellow-600" />
                    <h3 className="text-lg font-medium">面接日程が確定していません</h3>
                    <p className="text-muted-foreground">
                      候補日から面接日程を確定するか、新しい候補日を提案してください。
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 候補日一覧 */}
          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">面接候補日</h2>
            {pendingSchedules.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingSchedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">候補日</CardTitle>
                      <CardDescription>{formatDateTime(schedule.scheduled_at)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>所要時間: {schedule.duration_minutes}分</span>
                        </div>
                        {schedule.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{schedule.location}</span>
                          </div>
                        )}
                        {schedule.notes && (
                          <div className="flex gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="line-clamp-2">{schedule.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        disabled={isConfirming || confirmedSchedule !== null}
                        onClick={() => confirmSchedule(schedule.id)}
                      >
                        {isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            確定中...
                          </>
                        ) : confirmedSchedule !== null ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            別の日程が確定済み
                          </>
                        ) : (
                          "この日程で確定する"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {confirmedSchedule ? "他の候補日はありません" : "候補日が登録されていません"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 新しい候補日を提案するボタン */}
          <div className="md:col-span-2">
            <Separator className="my-6" />
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // 新しい候補日を提案する機能（プレースホルダー）
                  toast({
                    title: "新しい候補日の提案",
                    description: "この機能は現在開発中です。",
                  })
                }}
              >
                新しい候補日を提案する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
