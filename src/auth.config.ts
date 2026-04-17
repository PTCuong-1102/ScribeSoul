import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Configured in child providers or main auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isWorkspace = nextUrl.pathname.startsWith("/workspace")
      if (isWorkspace) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      return true
    },
  },
} satisfies NextAuthConfig
