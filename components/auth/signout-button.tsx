"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
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

      // サインアウト処理
      await supabase.auth.signOut()

      console.log("サインアウト成功")

      // コールバックがあれば実行
      if (onSignOutSuccess) {
        onSignOutSuccess()
      }

      // 完全なページリロードでセッション状態をリセット
      window.location.href = "/"
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
      className="text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          処理中...
        </span>
      ) : (
        <span className="flex items-center">
          <LogOut className="mr-1 h-4 w-4" />
          ログアウト
        </span>
      )}
    </Button>
  )
}
