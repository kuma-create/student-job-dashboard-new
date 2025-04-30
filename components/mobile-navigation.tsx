"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Home, Briefcase, Trophy, Newspaper, User, LogOut } from "lucide-react"
import { SignoutButton } from "@/components/auth/signout-button"
import Image from "next/image"

interface MobileNavigationProps {
  user: any
  userRole: string | null
  onClose: () => void
}

export function MobileNavigation({ user, userRole, onClose }: MobileNavigationProps) {
  const router = useRouter()

  // 学生と企業で適切なリンク先を返す関数
  const getDashboardLink = () => (userRole === "company" ? "/company/dashboard" : "/dashboard")
  const getProfileLink = () => (userRole === "company" ? "/company/profile" : "/profile")

  const handleSignOutSuccess = () => {
    onClose()
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={onClose}>
      <div
        className="absolute right-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {user ? (
          // ログイン済みの場合
          <>
            <div className="mb-6 flex items-center border-b pb-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                <Image src="/mystical-forest-spirit.png" alt="" fill className="object-cover" />
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {userRole === "company"
                    ? user.user_metadata?.company_name || "企業アカウント"
                    : user.user_metadata?.full_name || "ユーザー"}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Briefcase className="mr-3 h-5 w-5" />
                    求人検索
                  </Link>
                </li>
                <li>
                  <Link
                    href="/grandprix"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Trophy className="mr-3 h-5 w-5" />
                    就活グランプリ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Newspaper className="mr-3 h-5 w-5" />
                    特集
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notifications"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Bell className="mr-3 h-5 w-5" />
                    通知
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      3
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5" />
                    {userRole === "company" ? "企業ダッシュボード" : "マイページ"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getProfileLink()}
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5" />
                    プロフィール
                  </Link>
                </li>
                <li>
                  <div className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                    <LogOut className="mr-3 h-5 w-5" />
                    <SignoutButton onSignOutSuccess={handleSignOutSuccess} />
                  </div>
                </li>
              </ul>
            </nav>
          </>
        ) : (
          // 未ログインの場合
          <>
            <div className="mb-6 border-b pb-4">
              <h3 className="font-medium">メニュー</h3>
            </div>

            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Briefcase className="mr-3 h-5 w-5" />
                    求人検索
                  </Link>
                </li>
                <li>
                  <Link
                    href="/grandprix"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Trophy className="mr-3 h-5 w-5" />
                    就活グランプリ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <Newspaper className="mr-3 h-5 w-5" />
                    特集
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mt-6 space-y-2">
              <Link
                href="/auth/signin"
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm hover:bg-gray-50"
                onClick={onClose}
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full rounded-md bg-red-600 px-4 py-2 text-center text-sm text-white hover:bg-red-700"
                onClick={onClose}
              >
                新規登録
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation
