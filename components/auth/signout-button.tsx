"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface SignoutButtonProps {
  onSignOutSuccess?: () => void
}

export function SignoutButton({ onSignOutSuccess }: SignoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()

      // サインアウト後の処理
      if (onSignOutSuccess) {
        onSignOutSuccess()
      } else {
        // 直接ページ遷移を使用して確実にリロードする
        window.location.href = "/"
      }
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-gray-700 hover:text-red-600 hover:bg-red-50"
    >
      {isLoading ? "ログアウト中..." : "ログアウト"}
    </Button>
  )
}

export default SignoutButton
