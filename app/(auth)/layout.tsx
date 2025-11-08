"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (data?.user) {
      router.replace("/")
    }
  }, [data, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-white p-8 shadow-xl">
        {children}
      </div>
    </div>
  )
}

