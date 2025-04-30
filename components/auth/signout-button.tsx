"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SignoutButtonProps {
  className?: string // classNameプロパティを追加
  onSignOutSuccess?: () => void
}

export function SignoutButton({ className, onSignOutSuccess }: SignoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // サインアウト処理
      await supabase.auth.signOut()

      // サーバーサイドのセッションもクリア
      await fetch("/auth/signout", { method: "POST" })

      // コールバック関数があれば実行
      if (onSignOutSuccess) {
        onSignOutSuccess()
      } else {
        // 強制的にページをリロード
        window.location.href = "/"
      }
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={loading}
      className={className} // classNameを適用
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      ログアウト
    </Button>
  )
}
