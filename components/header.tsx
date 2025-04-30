"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Bell, Menu, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignoutButton } from "@/components/auth/signout-button"
import { createClient } from "@/lib/supabase/client"
import { MobileNavigation } from "./mobile-navigation"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      try {
        console.log("セッション確認開始")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("セッション確認結果:", session?.user?.id ? "ログイン中" : "未ログイン")
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
              console.log("ユーザーロール:", roleData?.role)
              setUserRole(roleData?.role || null)

              if (roleData?.role === "student") {
                const { data: profileData, error: profileError } = await supabase
                  .from("student_profiles")
                  .select("*")
                  .eq("id", session.user.id)
                  .single()

                if (profileError) {
                  console.error("プロフィール取得エラー:", profileError)
                } else {
                  setProfile(profileData)
                }
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
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("認証状態変更:", event, session?.user?.id)

      // 認証状態が変わったら再度セッション確認
      checkSession()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")
  const getDashboardLink = () => (userRole === "company" ? "/company/dashboard" : "/dashboard")

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Image src="/gakuten-logo.png" alt="学生転職 GAKUTEN" width={150} height={40} priority />
          </Link>
          <nav className="ml-8 hidden md:flex">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/jobs"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/jobs")
                      ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                      : "text-gray-700"
                  }`}
                  aria-current={isActive("/jobs") ? "page" : undefined}
                >
                  求人検索
                </Link>
              </li>
              <li>
                <Link
                  href="/grandprix"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/grandprix")
                      ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                      : "text-gray-700"
                  }`}
                  aria-current={isActive("/grandprix") ? "page" : undefined}
                >
                  就活グランプリ
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive("/features")
                      ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                      : "text-gray-700"
                  }`}
                  aria-current={isActive("/features") ? "page" : undefined}
                >
                  特集
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    href={getDashboardLink()}
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive(getDashboardLink())
                        ? "text-red-600 relative after:absolute after:bottom-[-1.2rem] after:left-0 after:h-0.5 after:w-full after:bg-red-600"
                        : "text-gray-700"
                    }`}
                    aria-current={isActive(getDashboardLink()) ? "page" : undefined}
                  >
                    {userRole === "company" ? "企業ダッシュボード" : "マイページ"}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            // ローディング中の表示
            <div className="hidden md:flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">読み込み中...</span>
            </div>
          ) : user ? (
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
                  href={userRole === "company" ? "/company/profile" : "/profile"}
                  className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white hover:ring-red-100 transition-all"
                  aria-label="プロフィールを表示"
                >
                  <Image src="/mystical-forest-spirit.png" alt="" fill className="object-cover" />
                </Link>
              </div>
              <div className="hidden md:block">
                <SignoutButton />
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

      {isMenuOpen && <MobileNavigation user={user} userRole={userRole} onClose={() => setIsMenuOpen(false)} />}
    </header>
  )
}

export default Header
