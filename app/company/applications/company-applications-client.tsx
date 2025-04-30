"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar, GraduationCap, MapPin, Briefcase, Building2, Clock, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// 型定義
interface Application {
  id: string
  created_at: string
  jobs: {
    id: string
    job_title: string
    location: string | null
    employment_type: string | null
  } | null
  students: {
    id: string
    first_name: string | null
    last_name: string | null
    university: string | null
    major: string | null
    graduation_year: number | null
    avatar_url: string | null
  } | null
}

interface CompanyApplicationsClientProps {
  applications: Application[]
}

export default function CompanyApplicationsClient({ applications }: CompanyApplicationsClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // 応募を日付順（新しい順）にソート
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  // 応募詳細ページへの遷移
  const handleViewDetails = (id: string) => {
    setIsLoading(true)
    router.push(`/company/applications/${id}`)
  }

  // 応募者の氏名を取得
  const getStudentName = (student: Application["students"]) => {
    if (!student) return "名前未設定"
    return `${student.last_name || ""} ${student.first_name || ""}`.trim() || "名前未設定"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">応募管理</h1>
        <p className="text-sm text-gray-500">求人に対する応募を管理します</p>
      </div>

      {sortedApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium">まだ応募がありません</h3>
            <p className="text-center text-sm text-gray-500">求人に対する応募が届くと、ここに表示されます。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    {application.students?.avatar_url ? (
                      <Image
                        src={application.students.avatar_url || "/placeholder.svg"}
                        alt={getStudentName(application.students)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src="/diverse-group-city.png"
                        alt={getStudentName(application.students)}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{getStudentName(application.students)}</h3>
                    <p className="text-xs text-gray-500">
                      応募日: {format(new Date(application.created_at), "yyyy年MM月dd日", { locale: ja })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h4 className="mb-3 font-semibold">{application.jobs?.job_title || "求人情報なし"}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span>{application.students?.university || "大学未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{application.students?.major || "学部未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {application.students?.graduation_year
                        ? `${application.students.graduation_year}年卒業予定`
                        : "卒業年未設定"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{application.jobs?.location || "勤務地未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{application.jobs?.employment_type || "雇用形態未設定"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button
                  variant="ghost"
                  className="ml-auto flex items-center gap-1"
                  onClick={() => handleViewDetails(application.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Skeleton className="h-4 w-4 rounded-full" />
                  ) : (
                    <>
                      詳細を見る
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
