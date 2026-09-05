export function readStoredUser() {
  try {
    const raw = JSON.parse(localStorage.getItem('user') || 'null')
    const token = raw?.token || localStorage.getItem('binercraft_user_token') || ''
    return raw ? { ...raw, token } : token ? { token } : null
  } catch {
    return null
  }
}

export function getToken() {
  const user = readStoredUser()
  return user?.token || ''
}

export function storeAuth(user, token) {
  const next = { ...(user || {}), token: token || user?.token || '' }
  localStorage.setItem('user', JSON.stringify(next))
  if (next.token) localStorage.setItem('binercraft_user_token', next.token)
  window.dispatchEvent(new Event('binercraft-auth-changed'))
  return next
}

export function clearAuth() {
  localStorage.removeItem('user')
  localStorage.removeItem('binercraft_user_token')
  window.dispatchEvent(new Event('binercraft-auth-changed'))
}

export async function refreshAuth() {
  const token = getToken()
  if (!token) return null
  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Authentication expired')
    const data = await response.json()
    return storeAuth(data.user, token)
  } catch {
    clearAuth()
    return null
  }
}
