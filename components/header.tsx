"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "./mobile-navigation"
import { useAuth } from "./auth-provider"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userRole, profile, signOut } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/gakuten-logo.png" alt="学生転職 GAKUTEN" width={150} height={40} priority />
          </Link>
          <nav className="ml-8 hidden md:flex">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/jobs"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/jobs") ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  求人検索
                </Link>
              </li>
              <li>
                <Link
                  href="/grandprix"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/grandprix") ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  就活グランプリ
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/features") ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  特集
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    href={getDashboardLink()}
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive(userRole === "company" ? "/company/dashboard" : "/dashboard")
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {userRole === "company" ? "企業ダッシュボード" : "マイページ"}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* ユーザーがログインしている場合 */}
          {user ? (
            <>
              <Link href="/notifications" className="relative text-gray-700 hover:text-red-600">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                  3
                </span>
              </Link>
              <div className="hidden items-center md:flex">
                <div className="mr-2 text-sm font-medium">
                  {userRole === "company"
                    ? profile?.company_name || user.user_metadata?.company_name || "企業アカウント"
                    : user.user_metadata?.full_name || "ユーザー"}
                </div>
                <Link
                  href={userRole === "company" ? "/company/profile" : "/profile"}
                  className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200"
                >
                  <Image src="/mystical-forest-spirit.png" alt="プロフィール画像" fill className="object-cover" />
                </Link>
              </div>
              <div className="hidden md:block">
                <Button variant="outline" size="sm" onClick={signOut} className="text-sm">
                  ログアウト
                </Button>
              </div>
            </>
          ) : (
            // ユーザーがログインしていない場合
            <div className="hidden space-x-2 md:flex">
              <Button asChild variant="outline">
                <Link href="/auth/signin">ログイン</Link>
              </Button>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/auth/signup">新規登録</Link>
              </Button>
            </div>
          )}

          <button className="block md:hidden" onClick={toggleMenu}>
            <span className="sr-only">メニュー</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <MobileNavigation isAuthenticated={!!user} userRole={userRole} onClose={() => setIsMenuOpen(false)} />
      )}
    </header>
  )
}

export default Header
