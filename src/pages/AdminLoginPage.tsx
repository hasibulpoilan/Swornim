import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AdminLoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (auth.configured && auth.ready && auth.isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await auth.login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page admin-login">
      <div className="admin-card">
        <Link to="/" className="cart-back">
          ← Back to site
        </Link>
        <h1>Admin login</h1>
        <p className="admin-muted">Only shop admin can edit products.</p>

        {!auth.configured && (
          <p className="admin-error">
            Supabase keys missing. Copy <code>.env.example</code> → <code>.env.local</code> and
            paste the anon key from the dashboard.
          </p>
        )}

        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!auth.configured || busy}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!auth.configured || busy}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="btn-order" disabled={!auth.configured || busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
