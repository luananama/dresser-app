import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/closet')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--color-pixel-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-pixel)] text-[18px] text-[var(--color-pink-500)] mb-2">DRESSER</h1>
          <p className="font-[var(--font-body)] text-[var(--color-pixel-muted)] text-sm">Your closet, gamified.</p>
        </div>

        <div className="bg-[var(--color-pixel-surface)] p-6 pixel-border">
          <h2 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-text)] mb-6 uppercase tracking-wide">
            Log In
          </h2>

          {error && (
            <p className="font-[var(--font-body)] text-xs text-[var(--color-pink-600)] bg-pink-100 px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PixelInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <PixelInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <PixelButton type="submit" loading={loading} className="mt-2">
              LOG IN
            </PixelButton>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center">
            <Link
              to="/forgot-password"
              className="font-[var(--font-body)] text-xs text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] transition-colors"
            >
              Forgot password?
            </Link>
            <Link
              to="/register"
              className="font-[var(--font-body)] text-xs text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] transition-colors"
            >
              No account? <span className="text-[var(--color-pink-400)] font-semibold">Sign up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
