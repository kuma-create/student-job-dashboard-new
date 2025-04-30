"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, Briefcase, Trophy, Newspaper, User, ChevronRight } from "lucide-react"
import { SignoutButton } from "@/components/auth/signout-button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface MobileNavigationProps {
  user: any
  userRole: string | null
  onClose: () => void
}

export function MobileNavigation({ user, userRole, onClose }: MobileNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [localUser, setLocalUser] = useState<any>(user)
  const [localUserRole, setLocalUserRole] = useState<string | null>(userRole || null)

  // ユーザー情報が渡されない場合は自動的に取得
  useEffect(() => {
    if (!user) {
      const fetchUserData = async () => {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setLocalUser(session.user)

          // ユーザーロールの取得
          const { data: roleData } = await supabase.from("user_roles").select("role").eq("id", session.user.id).single()

          if (roleData) {
            setLocalUserRole(roleData.role)
          }
        }
      }

      fetchUserData().catch(console.error)
    }
  }, [user])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setIsOpen(false)
    }
  }

  const isCompanyUser = localUserRole === "company"

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  // ダッシュボードへのリンク - ユーザーロールに基づいて変更
  const getDashboardLink = () => {
    if (userRole === "company") {
      return "/company/dashboard"
    }
    return "/dashboard"
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-xl p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {user ? (
          // ログイン済みの場合
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200 mr-3">
                <Image src="/mystical-forest-spirit.png" alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="font-medium">
                  {userRole === "company"
                    ? user.user_metadata?.company_name || "企業アカウント"
                    : user.user_metadata?.full_name || "ユーザー"}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <nav className="flex-1 py-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/") &&
                      !isActive("/jobs") &&
                      !isActive("/grandprix") &&
                      !isActive("/features") &&
                      !isActive(getDashboardLink())
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    <span>ホーム</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/jobs") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Briefcase className="mr-3 h-5 w-5" />
                    <span>求人検索</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/grandprix"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/grandprix") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Trophy className="mr-3 h-5 w-5" />
                    <span>就活グランプリ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/features") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Newspaper className="mr-3 h-5 w-5" />
                    <span>特集</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={getDashboardLink()}
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive(getDashboardLink()) ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span>{userRole === "company" ? "企業ダッシュボード" : "マイページ"}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notifications"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Bell className="mr-3 h-5 w-5" />
                    <span>通知</span>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                      3
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="border-t pt-4">
              <div className="px-4">
                <SignoutButton />
              </div>
            </div>
          </div>
        ) : (
          // 未ログインの場合
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">メニュー</h2>
            </div>

            <nav className="flex-1 py-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/") && !isActive("/jobs") && !isActive("/grandprix") && !isActive("/features")
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    <span>ホーム</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/jobs") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Briefcase className="mr-3 h-5 w-5" />
                    <span>求人検索</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/grandprix"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/grandprix") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Trophy className="mr-3 h-5 w-5" />
                    <span>就活グランプリ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive("/features") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <Newspaper className="mr-3 h-5 w-5" />
                    <span>特集</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="border-t pt-4 space-y-2 p-4">
              <Link
                href="/auth/signin"
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={onClose}
              >
                <span>ログイン</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={onClose}
              >
                <span>新規登録</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// デフォルトエクスポートも追加
export default MobileNavigation
