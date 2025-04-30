"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Bell, Menu, X, User, Briefcase, MessageSquare, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { MobileNavigation } from "./mobile-navigation"

// ファイルの先頭（importの後）に以下の型定義を追加してください
type NavLink = {
  href: string
  label: string
  icon?: React.ElementType // アイコンはオプショナル
}

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)

      // PCサイズの場合はメニューを閉じる
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    // 初期値設定
    setWindowWidth(window.innerWidth)

    // リサイズイベントリスナーを追加
    window.addEventListener("resize", handleResize)

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // モバイル表示かどうかを判定
  const isMobile = windowWidth < 768

  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user || null)

        if (session?.user) {
          try {
            const { data: roleData, error: roleError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("id", session.user.id)
              .single()

            if (roleError) {
              console.error("ロール取得エラー:", roleError)
            } else {
              setUserRole(roleData?.role || null)

              if (roleData?.role === "student") {
                const { data: profileData } = await supabase
                  .from("student_profiles")
                  .select("*")
                  .eq("id", session.user.id)
                  .single()

                setProfile(profileData)
              } else if (roleData?.role === "company") {
                setProfile({
                  company_name: session.user.user_metadata?.company_name || "企業名未設定",
                })
              }
            }
          } catch (error) {
            console.error("ユーザー情報取得エラー:", error)
          }
        } else {
          setUserRole(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("セッション確認エラー:", error)
        setUser(null)
        setUserRole(null)
        setProfile(null)
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async () => {
      checkSession()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")
  const getDashboardLink = () => (userRole === "company" ? "/company/dashboard" : "/dashboard")

  // 学生と企業で適切なリンク先を返す関数
  const getProfileLink = () => {
    if (!user) return "/auth/signin"
    return userRole === "company" ? "/company/profile" : "/profile"
  }

  // 以下の行を修正してください
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
          {user ? (
            // ログイン済みの場合
            <>
              <Link href="/notifications" className="relative text-gray-700 hover:text-red-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                  3
                </span>
                <span className="sr-only">通知 3件</span>
              </Link>
              <div className="hidden md:flex items-center">
                <span className="mr-2 text-sm font-medium">
                  {userRole === "company"
                    ? profile?.company_name || "企業アカウント"
                    : user.user_metadata?.full_name || "ユーザー"}
                </span>
                <Link
                  href={getProfileLink()}
                  className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white hover:ring-red-100 transition-all"
                  aria-label="プロフィールを表示"
                >
                  <Image src="/mystical-forest-spirit.png" alt="" fill className="object-cover" />
                </Link>
              </div>
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  onClick={() => {
                    const supabase = createClient()
                    supabase.auth.signOut().then(() => {
                      window.location.href = "/"
                    })
                  }}
                >
                  ログアウト
                </Button>
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
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="メニューを開く"
          >
            <span className="sr-only">メニュー</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* モバイルナビゲーションはモバイル表示かつメニューが開いている場合のみ表示 */}
      {isMenuOpen && isMobile && (
        <MobileNavigation user={user} userRole={userRole} onClose={() => setIsMenuOpen(false)} />
      )}
    </header>
  )
}

export default Header
