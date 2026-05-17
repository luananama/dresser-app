import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/auth/reset-password', { token, new_password: newPassword })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--color-pixel-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-pixel-surface)] p-6 pixel-border">
          <h2 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-text)] mb-6 uppercase tracking-wide">
            Reset Password
          </h2>

          {error && (
            <p className="font-[var(--font-body)] text-xs text-[var(--color-pink-600)] bg-pink-100 px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PixelInput
              label="Reset Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <PixelInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PixelButton type="submit" loading={loading} className="mt-2">
              SET PASSWORD
            </PixelButton>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="font-[var(--font-body)] text-xs text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
