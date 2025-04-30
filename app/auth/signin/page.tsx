import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata = {
  title: "ログイン | 学生転職 GAKUTEN",
  description: "アカウントにログインして、就職活動を始めましょう",
}

export default function SignInPage() {
  return (
    <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ログイン</h1>
          <p className="text-gray-500">アカウントにログインして、就職活動を始めましょう</p>
        </div>

        <SignInForm />

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-red-600">
            <ArrowLeft className="mr-1 h-4 w-4" />
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
