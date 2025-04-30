"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignoutButton } from "@/components/auth/signout-button"
import { createClient } from "@/lib/supabase/client"
import { MobileNavigation } from "./mobile-navigation"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      console.log("🔍 checkSession 開始")
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) console.error("❌ getSession エラー:", error)
        console.log("✅ getSession 結果:", session)

        setUser(session?.user || null)

        if (session?.user) {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("id", session.user.id)
            .single()

          console.log("✅ ロール取得:", roleData?.role)

          if (!roleError) {
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
          } else {
            console.error("❌ ロール取得エラー:", roleError)
          }
        }
      } catch (error) {
        console.error("❌ セッション取得中の例外:", error)
      } finally {
        setLoading(false)
        console.log("✅ setLoading(false) 実行")
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id)

      setUser(session?.user || null)

      if (session?.user) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("id", session.user.id)
            .single()

          if (roleError) {
            console.error("❌ ロール取得エラー:", roleError)
            setUserRole(null)
            setProfile(null)
            return
          }

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
        } catch (error) {
          console.error("❌ ロール再取得エラー:", error)
          setUserRole(null)
          setProfile(null)
        }
      } else {
        setUserRole(null)
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    console.log("🔎 状態更新: loading =", loading)
    console.log("🔎 user =", user)
    console.log("🔎 userRole =", userRole)
  }, [loading, user, userRole])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")
  const getDashboardLink = () => userRole === "company" ? "/company/dashboard" : "/dashboard"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/gakuten-logo.png" alt="学生転職 GAKUTEN" width={150} height={40} priority />
          </Link>
          <nav className="ml-8 hidden md:flex">
            <ul className="flex space-x-6">
              <li><Link href="/jobs" className={`text-sm font-medium transition-colors hover:text-red-600 ${isActive("/jobs") ? "text-red-600" : "text-gray-700"}`}>求人検索</Link></li>
              <li><Link href="/grandprix" className={`text-sm font-medium transition-colors hover:text-red-600 ${isActive("/grandprix") ? "text-red-600" : "text-gray-700"}`}>就活グランプリ</Link></li>
              <li><Link href="/features" className={`text-sm font-medium transition-colors hover:text-red-600 ${isActive("/features") ? "text-red-600" : "text-gray-700"}`}>特集</Link></li>
              {user && <li><Link href={getDashboardLink()} className={`text-sm font-medium transition-colors hover:text-red-600 ${isActive(getDashboardLink()) ? "text-red-600" : "text-gray-700"}`}>{userRole === "company" ? "企業ダッシュボード" : "マイページ"}</Link></li>}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/notifications" className="relative text-gray-700 hover:text-red-600">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">3</span>
              </Link>
              <div className="hidden items-center md:flex">
                <div className="mr-2 text-sm font-medium">
                  {userRole === "company" ? profile?.company_name || "企業アカウント" : user.user_metadata?.full_name || "ユーザー"}
                </div>
                <Link href={userRole === "company" ? "/company/profile" : "/profile"} className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                  <Image src="/mystical-forest-spirit.png" alt="プロフィール画像" fill className="object-cover" />
                </Link>
              </div>
              <div className="hidden md:block"><SignoutButton /></div>
            </>
          ) : (
            !loading && (
              <div className="hidden space-x-2 md:flex">
                <Button asChild variant="outline"><Link href="/auth/signin">ログイン</Link></Button>
                <Button asChild className="bg-red-600 hover:bg-red-700"><Link href="/auth/signup">新規登録</Link></Button>
              </div>
            )
          )}
          <button className="block md:hidden" onClick={toggleMenu}>
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
