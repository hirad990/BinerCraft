import axios from 'axios'

const API_BASE_URL = 'https://binercraft.ir/fozing'

export async function login(username, password) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password })
  return response.data
}

export async function register(userData) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData)
  return response.data
}

export async function getCurrentUser(token) {
  const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export function saveToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}
