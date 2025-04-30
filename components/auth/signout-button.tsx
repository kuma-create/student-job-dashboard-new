"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface SignoutButtonProps {
  className?: string
  onSignOutSuccess?: () => void
}

// 名前付きエクスポートとデフォルトエクスポートの両方を提供
export function SignoutButton({ className, onSignOutSuccess }: SignoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("サインアウトエラー:", error)
        toast({
          title: "サインアウトエラー",
          description: "サインアウト中にエラーが発生しました。もう一度お試しください。",
          variant: "destructive",
        })
        return
      }

      // サインアウト成功
      toast({
        title: "サインアウト成功",
        description: "正常にサインアウトしました。",
      })

      // コールバック関数があれば実行
      if (onSignOutSuccess) {
        onSignOutSuccess()
      }

      // ホームページにリダイレクト
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("サインアウト処理エラー:", error)
      toast({
        title: "サインアウトエラー",
        description: "サインアウト中に予期せぬエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading} className={className}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      ログアウト
    </Button>
  )
}

// デフォルトエクスポートも追加
export default SignoutButton
