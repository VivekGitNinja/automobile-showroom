/**
 * Admin API client with silent session refresh.
 *
 * The API issues 15-minute access tokens. Instead of bouncing staff to the
 * login screen when one expires, this wrapper:
 *   1. attaches the current access token to every request, and
 *   2. on a 401, exchanges the stored refresh token for a new access token
 *      (updating localStorage AND the admin-token cookie the edge middleware
 *      validates), then retries the original request exactly once.
 * If the refresh also fails, the session is cleared and the user is sent to
 * the login screen.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function setAdminSession(accessToken: string, refreshToken?: string | null) {
  if (typeof window === 'undefined') return
  localStorage.setItem('adminToken', accessToken)
  if (refreshToken) localStorage.setItem('adminRefreshToken', refreshToken)
  // Keep the middleware-validated cookie in sync with the rotating token
  document.cookie = `admin-token=${accessToken};path=/;max-age=86400`
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminRefreshToken')
  document.cookie = 'admin-token=;path=/;max-age=0'
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('adminRefreshToken') : null
  if (!refreshToken) return null

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json()
        if (!data.accessToken) return null
        setAdminSession(data.accessToken, data.refreshToken || refreshToken)
        return data.accessToken as string
      })
      .catch(() => null)
      .finally(() => {
        // Allow a new refresh cycle on the next expiry
        setTimeout(() => { refreshInFlight = null }, 1000)
      })
  }
  return refreshInFlight
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = () =>
    fetch(url, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders((init.headers as Record<string, string>) || {}),
      },
    })

  let res = await doFetch()

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await doFetch() // retried with the refreshed token
    } else {
      clearAdminSession()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login')
      }
    }
  }

  return res
}

/**
 * Keeps the session alive while an admin page is open: proactively rotates
 * the access token every 10 minutes (token lifetime is 15).
 */
export function startSessionKeeper(): () => void {
  if (typeof window === 'undefined') return () => {}
  const timer = setInterval(() => {
    void refreshAccessToken()
  }, 10 * 60 * 1000)
  return () => clearInterval(timer)
}
