import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, username, password)
      navigate('/closet')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--color-pixel-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-pixel)] text-[18px] text-[var(--color-pink-500)] mb-2">DRESSER</h1>
          <p className="font-[var(--font-body)] text-[var(--color-pixel-muted)] text-sm">Start your closet journey.</p>
        </div>

        <div className="bg-[var(--color-pixel-surface)] p-6 pixel-border">
          <h2 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-text)] mb-6 uppercase tracking-wide">
            Create Account
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
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <PixelInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <PixelButton type="submit" loading={loading} className="mt-2">
              SIGN UP
            </PixelButton>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="font-[var(--font-body)] text-xs text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] transition-colors"
            >
              Already have an account? <span className="text-[var(--color-pink-400)] font-semibold">Log in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
