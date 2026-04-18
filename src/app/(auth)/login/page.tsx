import { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Đăng nhập — ScribeSoul",
}

export default function LoginPage() {
  return <LoginForm />
}
