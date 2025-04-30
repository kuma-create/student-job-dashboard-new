"use client"

import AuthForm from "./auth-form"

interface Props {
  type?: "signin" | "signup"
  redirectUrl?: string
  error?: string | null
}

export default function AuthFormWrapper(props: Props) {
  return <AuthForm {...props} />
}
