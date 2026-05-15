import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { SettingsPageClient } from './settings-client'

export default async function SettingsPage() {
  // Verify session before rendering
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) {
    redirect('/login')
  }

  return <SettingsPageClient />
}
