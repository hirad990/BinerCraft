import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getToken, readStoredUser, refreshAuth } from '../lib/auth.js'

const API_BASE = '/api'

export default function ProfilePage() {
  const [user, setUser] = useState(() => readStoredUser())
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const current = await refreshAuth()
        if (!alive) return
        setUser(current || readStoredUser())

        const currentUser = current || readStoredUser()
        const userId = currentUser?.id
        if (!userId) {
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE}/wallet/${encodeURIComponent(userId)}`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        })
        if (alive) setWallet(response.data)
      } catch (err) {
        if (alive) setError(err.response?.data?.error || 'Failed to load profile.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => { alive = false }
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-10">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-10">{error}</div>

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">پروفایل {user?.displayName || user?.username || ''}</h1>
      {wallet && <pre className="mt-6 overflow-auto rounded-2xl border border-glass-border p-5">{JSON.stringify(wallet, null, 2)}</pre>}
    </main>
  )
}
