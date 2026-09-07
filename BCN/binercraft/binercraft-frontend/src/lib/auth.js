const API_BASE_URL = 'https://binercraft.ir/fozing'

export const getToken = () => localStorage.getItem('token')

export const saveToken = (token) => {
  if (token) localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const refreshAuth = async () => {
  const token = getToken()
  if (!token) return null

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    removeToken()
    return null
  }

  const user = await response.json()
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

export const authAPI = {
  me: refreshAuth,

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || data.error || 'Login failed')
    if (data.token) saveToken(data.token)
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || data.error || 'Registration failed')
    if (data.token) saveToken(data.token)
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },
}

export { API_BASE_URL }
