"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "../lib/api"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await apiFetch<{ success?: boolean; message: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })

    setMessage(res.message)

    if (res.success !== false) router.push("/login")
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border p-6 rounded space-y-4">
        <h1 className="text-2xl font-bold">Signup</h1>

        <input className="border p-2 w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="bg-black text-white p-2 w-full">Create Account</button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}