import { Header } from "@/components/header"
import { MobileNavigation } from "@/components/mobile-navigation"
import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "学生転職プラットフォーム",
  description: "学生のための転職プラットフォーム",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">{children}</main>
        <MobileNavigation />
        <Toaster />
      </body>
    </html>
  )
}
