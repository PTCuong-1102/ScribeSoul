'use server'

import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema/users'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

/**
 * Đăng nhập bằng email và mật khẩu.
 * Gọi từ form action trên trang /login.
 */
export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }

  const { error } = await auth.signIn.email({ email, password })

  if (error) {
    return { error: error.message || 'Email hoặc mật khẩu không chính xác.' }
  }

  redirect('/workspace')
}

/**
 * Đăng ký tài khoản mới bằng email và mật khẩu.
 * Gọi từ form action trên trang /register.
 */
export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!email || !password || !name) {
    return { error: 'Vui lòng điền đầy đủ thông tin.' }
  }

  if (password.length < 8) {
    return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' }
  }

  const { error } = await auth.signUp.email({ email, name, password })

  if (error) {
    return { error: error.message || 'Không thể tạo tài khoản. Vui lòng thử lại.' }
  }

  redirect('/workspace')
}

/**
 * Đăng xuất người dùng hiện tại.
 */
export async function signOut() {
  await auth.signOut()
  redirect('/login')
}

/**
 * Lấy thông tin user hiện tại từ DB dựa trên session.
 */
export async function getCurrentUser() {
  const { data: session } = await auth.getSession()
  if (!session?.user?.email) return null

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  return user || null
}
