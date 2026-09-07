const API_BASE_URL = 'https://binercraft.ir/fozing'

export const authAPI = {
  me: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Failed to fetch current user')
    return response.json()
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Login failed')
    return data
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Registration failed')
    return data
  },
}
