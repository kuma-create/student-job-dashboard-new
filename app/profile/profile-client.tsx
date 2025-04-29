"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Save, Upload, PlusCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"

interface StudentProfile {
  id?: string
  full_name?: string
  university?: string
  major?: string
  graduation_year?: number
  skills?: string[]
  interests?: string[]
  resume_url?: string
  avatar_url?: string
  bio?: string
}

interface ProfileClientProps {
  initialProfile: StudentProfile
  userId: string
}

export default function ProfileClient({ initialProfile, userId }: ProfileClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [profile, setProfile] = useState<StudentProfile>({
    id: userId,
    full_name: initialProfile.full_name || "",
    university: initialProfile.university || "",
    major: initialProfile.major || "",
    graduation_year: initialProfile.graduation_year || new Date().getFullYear() + 1,
    skills: initialProfile.skills || [],
    interests: initialProfile.interests || [],
    resume_url: initialProfile.resume_url || "",
    avatar_url: initialProfile.avatar_url || "",
    bio: initialProfile.bio || "",
  })

  const [isSkillsOpen, setIsSkillsOpen] = useState(true)
  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // スキルの追加
  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  // スキルの削除
  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter((s) => s !== skill) || [],
    })
  }

  // 興味・関心の追加
  const addInterest = () => {
    if (newInterest.trim() && !profile.interests?.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...(profile.interests || []), newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  // 興味・関心の削除
  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests?.filter((i) => i !== interest) || [],
    })
  }

  // アバター画像のアップロード
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `avatars/${userId}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

      setProfile({
        ...profile,
        avatar_url: data.publicUrl,
      })

      toast({
        title: "アップロード完了",
        description: "プロフィール画像がアップロードされました",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  // 履歴書のアップロード
  const uploadResume = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `resumes/${userId}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

      setProfile({
        ...profile,
        resume_url: data.publicUrl,
      })

      toast({
        title: "アップロード完了",
        description: "履歴書がアップロードされました",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "履歴書のアップロードに失敗しました",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  // プロフィールの保存
  const saveProfile = async () => {
    try {
      setIsSaving(true)

      const { error } = await supabase.from("student_profiles").upsert({
        id: userId,
        full_name: profile.full_name,
        university: profile.university,
        major: profile.major,
        graduation_year: profile.graduation_year,
        skills: profile.skills,
        interests: profile.interests,
        resume_url: profile.resume_url,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      toast({
        title: "保存完了",
        description: "プロフィールが更新されました",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロフィールの保存に失敗しました",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">プロフィール編集</h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            あなたのプロフィール情報を入力して、企業にアピールしましょう
          </p>
        </div>
        <Button
          onClick={saveProfile}
          disabled={isSaving}
          className="h-8 gap-1 text-xs sm:h-10 sm:gap-2 sm:text-sm bg-red-600 hover:bg-red-700"
        >
          <Save size={14} className="sm:h-4 sm:w-4" />
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左カラム - プロフィール画像とサマリー */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">プロフィール画像</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40">
                <Image
                  src={profile.avatar_url || "/placeholder.svg?height=160&width=160&query=profile"}
                  alt="プロフィール画像"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="avatar-upload" className="w-full">
                  <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 sm:text-sm">
                    <Upload size={14} className="sm:h-4 sm:w-4" />
                    画像をアップロード
                  </div>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={isUploading}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">履歴書</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                PDFまたはWordファイルをアップロードしてください
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {profile.resume_url ? (
                <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">履歴書がアップロードされています</span>
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline sm:text-sm"
                    >
                      表示
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-500 sm:text-sm">
                  履歴書はまだアップロードされていません
                </div>
              )}
              <Label htmlFor="resume-upload" className="w-full">
                <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 sm:text-sm">
                  <Upload size={14} className="sm:h-4 sm:w-4" />
                  履歴書をアップロード
                </div>
              </Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={uploadResume}
                disabled={isUploading}
              />
            </CardContent>
          </Card>
        </div>

        {/* 右カラム - プロフィール情報 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs sm:text-sm">
                  氏名
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="山田 太郎"
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university" className="text-xs sm:text-sm">
                  大学
                </Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  placeholder="〇〇大学"
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major" className="text-xs sm:text-sm">
                  学部・学科
                </Label>
                <Input
                  id="major"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  placeholder="〇〇学部△△学科"
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduation_year" className="text-xs sm:text-sm">
                  卒業予定年度
                </Label>
                <Select
                  value={profile.graduation_year?.toString()}
                  onValueChange={(value) => setProfile({ ...profile, graduation_year: Number.parseInt(value) })}
                >
                  <SelectTrigger id="graduation_year" className="h-8 text-xs sm:h-10 sm:text-sm">
                    <SelectValue placeholder="卒業予定年度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(6)].map((_, i) => {
                      const year = new Date().getFullYear() + i
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs sm:text-sm">
                  自己紹介
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="自己紹介を入力してください"
                  className="min-h-[100px] text-xs sm:min-h-[120px] sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">スキルと興味</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium sm:text-base">スキル</Label>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8">
                      {isSkillsOpen ? (
                        <ChevronUp size={14} className="sm:h-4 sm:w-4" />
                      ) : (
                        <ChevronDown size={14} className="sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills?.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        >
                          <Trash2 size={12} className="sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="新しいスキルを追加"
                      className="h-8 text-xs sm:h-10 sm:text-sm"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} className="h-8 sm:h-10 bg-red-600 hover:bg-red-700">
                      <PlusCircle size={14} className="sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium sm:text-base">興味・関心</Label>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8">
                      <ChevronDown size={14} className="sm:h-4 sm:w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.interests?.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs sm:text-sm"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        >
                          <Trash2 size={12} className="sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="新しい興味・関心を追加"
                      className="h-8 text-xs sm:h-10 sm:text-sm"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    />
                    <Button type="button" onClick={addInterest} className="h-8 sm:h-10 bg-red-600 hover:bg-red-700">
                      <PlusCircle size={14} className="sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
