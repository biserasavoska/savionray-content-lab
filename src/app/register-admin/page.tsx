"use client"

import { useState } from "react"

export default function RegisterAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("ADMIN")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`User created: ${data.user.email} (${data.user.role})`)
        setEmail("")
        setPassword("")
      } else {
        setError(data.error || "Unknown error")
      }
    } catch (err: any) {
      setError(err.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold mb-4">Admin User Registration</h1>
        {message && <div className="bg-green-100 text-green-800 p-2 rounded">{message}</div>}
        {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full border rounded p-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" className="w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select className="w-full border rounded p-2" value={role} onChange={e => setRole(e.target.value)}>
            <option value="ADMIN">ADMIN</option>
            <option value="CREATIVE">CREATIVE</option>
            <option value="CLIENT">CLIENT</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
          {loading ? "Registering..." : "Register User"}
        </button>
      </form>
    </div>
  )
} 