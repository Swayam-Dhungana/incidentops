"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "../lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const res = await apiFetch<{ success: boolean; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    setMessage(res.message)
    setIsLoading(false)

    if (res.success) router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm space-y-5"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-500">Login to continue to your dashboard.</p>
        </div>

        <div className="space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={isLoading}
          className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}