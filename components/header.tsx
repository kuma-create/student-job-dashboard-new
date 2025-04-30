"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Bell, Menu, X, User, Briefcase, MessageSquare, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { MobileNavigation } from "./mobile-navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavLink = {
  href: string
  label: string
  icon?: React.ElementType
}

export function Header() {
  const pathname = usePathname()
  const { user, userRole, profile, signOut, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const isMobile = windowWidth < 768
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  // ログイン前のナビゲーションリンク
  const publicNavLinks: NavLink[] = [
    { href: "/jobs", label: "求人検索" },
    { href: "/grandprix", label: "就活グランプリ" },
    { href: "/features", label: "特集" },
  ]

  // 学生ユーザー向けのナビゲーションリンク
  const studentNavLinks: NavLink[] = [
    { href: "/dashboard", label: "マイページ", icon: User },
    { href: "/jobs", label: "求人検索", icon: Briefcase },
    { href: "/applications", label: "応募管理", icon: FileText },
    { href: "/messages", label: "メッセージ", icon: MessageSquare },
  ]

  // 企業ユーザー向けのナビゲーションリンク
  const companyNavLinks: NavLink[] = [
    { href: "/company/dashboard", label: "ダッシュボード", icon: User },
    { href: "/company/jobs", label: "求人管理", icon: Briefcase },
    { href: "/company/applications", label: "応募者管理", icon: FileText },
    { href: "/company/messages", label: "メッセージ", icon: MessageSquare },
  ]

  // ユーザーの種類に応じたナビゲーションリンクを取得
  const getNavLinks = () => {
    if (!user) return publicNavLinks
    return userRole === "company" ? companyNavLinks : studentNavLinks
  }

  const navLinks = getNavLinks()

  // プロフィールリンクを取得
  const getProfileLink = () => {
    if (!user) return "/auth/signin"
    return userRole === "company" ? "/company/profile" : "/profile"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Image src="/gakuten-logo.png" alt="学生転職 GAKUTEN" width={150} height={40} priority />
          </Link>
          <nav className="ml-8 hidden md:flex">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive(link.href)
                        ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                        : "text-gray-700"
                    }`}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    <span className="flex items-center">
                      {link.icon && <link.icon className="mr-1 h-4 w-4" />}
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    href="/company/contact"
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive("/company/contact")
                        ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                        : "text-gray-700"
                    }`}
                    aria-current={isActive("/company/contact") ? "page" : undefined}
                  >
                    企業の方はこちら
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoading && user ? (
            // ログイン済みの場合
            <>
              <Link href="/notifications" className="relative text-gray-700 hover:text-red-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                  3
                </span>
                <span className="sr-only">通知 3件</span>
              </Link>

              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium">
                          {userRole === "company"
                            ? profile?.company_name || "企業アカウント"
                            : `${profile?.first_name || ""} ${profile?.last_name || ""}`}
                        </span>
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white hover:ring-red-100 transition-all">
                          <Image
                            src={profile?.avatar_url || "/mystical-forest-spirit.png"}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getProfileLink()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>プロフィール</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>通知</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            // 未ログインの場合
            <div className="hidden md:flex space-x-2">
              <Button asChild variant="outline" className="transition-all hover:border-red-300">
                <Link href="/auth/signin">ログイン</Link>
              </Button>
              <Button asChild className="bg-red-600 hover:bg-red-700 transition-colors">
                <Link href="/auth/signup">新規登録</Link>
              </Button>
            </div>
          )}

          <button
            className="block md:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="メニューを開く"
          >
            <span className="sr-only">メニュー</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* モバイルナビゲーション */}
      {isMenuOpen && isMobile && <MobileNavigation onClose={() => setIsMenuOpen(false)} />}
    </header>
  )
}

export default Header
