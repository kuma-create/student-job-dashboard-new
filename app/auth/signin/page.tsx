import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SignInForm from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <div className="container mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ログイン</h1>
          <p className="text-gray-500">アカウントにログインして、就職活動を始めましょう</p>
        </div>

        <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
