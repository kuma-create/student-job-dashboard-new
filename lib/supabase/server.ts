import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "../database.types"

// サーバーサイドコンポーネント用 Supabase クライアントを生成
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
