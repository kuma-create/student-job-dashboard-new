"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignoutButton } from "@/components/auth/signout-button"
import { Home, Search, FileText, User, MessageSquare, Info, Building, Users, PlusCircle, Settings } from "lucide-react"

interface MobileNavigationProps {
  user?: any
  userRole: string | null
  onClose: () => void
}

export function MobileNavigation({ user, userRole, onClose }: MobileNavigationProps) {
  const pathname = usePathname()
  const isCompanyUser = userRole === "company"

  return (
    <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in md:hidden bg-white">
      <div className="relative z-20 grid gap-6 p-4 rounded-md">
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {!user ? (
            // 未ログインユーザー向けメニュー
            <>
              <Link href="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100" onClick={onClose}>
                <Home className="h-4 w-4" />
                <span>ホーム</span>
              </Link>
              <Link
                href="/features"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
                onClick={onClose}
              >
                <Info className="h-4 w-4" />
                <span>機能紹介</span>
              </Link>
              <Link
                href="/company"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
                onClick={onClose}
              >
                <Building className="h-4 w-4" />
                <span>企業の方へ</span>
              </Link>
              <div className="my-4 border-t" />
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
                onClick={onClose}
              >
                <User className="h-4 w-4" />
                <span>ログイン</span>
              </Link>
              <Link
                href="/auth/reset-password"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
                onClick={onClose}
              >
                パスワードをリセット
              </Link>
              <Link
                href="/auth/signup?type=student"
                className="flex items-center gap-2 p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={onClose}
              >
                <User className="h-4 w-4" />
                <span>新規登録</span>
              </Link>
            </>
          ) : isCompanyUser ? (
            // 企業ユーザー向けメニュー
            <>
              <Link
                href="/company/dashboard"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/company/dashboard" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Home className="h-4 w-4" />
                <span>ダッシュボード</span>
              </Link>
              <Link
                href="/company/jobs"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/company/jobs") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <FileText className="h-4 w-4" />
                <span>求人管理</span>
              </Link>
              <Link
                href="/company/jobs/create"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/company/jobs/create" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <PlusCircle className="h-4 w-4" />
                <span>新規求人作成</span>
              </Link>
              <Link
                href="/company/applications"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/company/applications") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Users className="h-4 w-4" />
                <span>応募者管理</span>
              </Link>
              <Link
                href="/company/messages"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/company/messages") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <MessageSquare className="h-4 w-4" />
                <span>メッセージ</span>
              </Link>
              <div className="my-4 border-t" />
              <Link
                href="/company/profile"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/company/profile" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Building className="h-4 w-4" />
                <span>企業情報</span>
              </Link>
              <Link
                href="/company/settings"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/company/settings" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Settings className="h-4 w-4" />
                <span>設定</span>
              </Link>
              <div className="my-4 border-t" />
              <div className="p-2">
                <SignoutButton className="w-full justify-center" />
              </div>
            </>
          ) : (
            // 学生ユーザー向けメニュー
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/dashboard" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Home className="h-4 w-4" />
                <span>ダッシュボード</span>
              </Link>
              <Link
                href="/jobs"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/jobs") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <Search className="h-4 w-4" />
                <span>求人検索</span>
              </Link>
              <Link
                href="/applications"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/applications") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <FileText className="h-4 w-4" />
                <span>応募履歴</span>
              </Link>
              <Link
                href="/messages"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname.startsWith("/messages") ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <MessageSquare className="h-4 w-4" />
                <span>メッセージ</span>
              </Link>
              <div className="my-4 border-t" />
              <Link
                href="/profile"
                className={`flex items-center gap-2 p-2 rounded-md ${
                  pathname === "/profile" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <User className="h-4 w-4" />
                <span>プロフィール</span>
              </Link>
              <div className="my-4 border-t" />
              <div className="p-2">
                <SignoutButton className="w-full justify-center" />
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
