const LAUNCHER_PRESENCE_API = 'https://binercraft.ir/launchAPI/online.php'

export async function fetchLauncherPresence(signal) {
  const response = await fetch(LAUNCHER_PRESENCE_API, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data = await response.json()
  if (!data?.ok) throw new Error(data?.error || 'Presence API error')
  return Number(data.online) || 0
}
