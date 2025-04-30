"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { InterviewSchedule } from "@/types/interview"
import { useToast } from "@/hooks/use-toast"

export function useInterviewSchedules(applicationId: number) {
  const supabase = createClient()
  const { toast } = useToast()

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
        .eq("application_id", applicationId.toString())
        .order("scheduled_at", { ascending: true })

      if (error) throw error

      if (!data) {
        setPendingSchedules([])
        setConfirmedSchedule(null)
        return
      }

      // データを確認済みと未確認に分ける
      const confirmed = data.find((schedule) => schedule.status === "confirmed") || null
      const pending = data.filter((schedule) => schedule.status === "pending")

      // 型アサーションを使用して型を明示的に指定
      setConfirmedSchedule(confirmed as InterviewSchedule | null)
      setPendingSchedules(pending as InterviewSchedule[])
    } catch (err) {
      console.error("面接スケジュールの取得に失敗しました:", err)
      setError("面接スケジュールの取得に失敗しました。再度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  // 面接日程を確定する
  const confirmSchedule = async (scheduleId: string) => {
    // 文字列型に変更
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

  return {
    isLoading,
    error,
    pendingSchedules,
    confirmedSchedule,
    isConfirming,
    confirmSchedule,
    fetchInterviewSchedules,
  }
}
