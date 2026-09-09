import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { ReactNode } from 'react'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.configured) {
    return (
      <div className="admin-page">
        <h1>Admin not configured</h1>
        <p>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in{' '}
          <code>.env.local</code>, then restart the dev server.
        </p>
      </div>
    )
  }

  if (!auth.ready) {
    return (
      <div className="admin-page">
        <p>Loading…</p>
      </div>
    )
  }

  if (!auth.isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
