import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "Đăng ký — ScribeSoul",
}

export default function RegisterPage() {
  return <RegisterForm />
}
