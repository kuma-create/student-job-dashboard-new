"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SignoutButtonProps {
  onSignOutSuccess?: () => void
}

export function SignoutButton({ onSignOutSuccess }: SignoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()

      // コールバック関数があれば実行
      if (onSignOutSuccess) {
        onSignOutSuccess()
      }

      // ホームページにリダイレクト
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoading} className="text-sm">
      {isLoading ? "処理中..." : "ログアウト"}
    </Button>
  )
}
