import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post('/auth/forgot-password', { email })
      setResetToken(res.data.reset_token ?? '')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (resetToken) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[var(--color-pixel-bg)] px-4">
        <div className="w-full max-w-sm">
          <div className="bg-[var(--color-pixel-surface)] p-6 pixel-border">
            <h2 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-text)] mb-4 uppercase tracking-wide">
              Reset Token
            </h2>
            <p className="font-[var(--font-body)] text-sm text-[var(--color-pixel-muted)] mb-4">
              Copy this token and use it on the reset password page:
            </p>
            <div className="bg-pink-100 p-3 pixel-border-sm mb-4 break-all">
              <code className="font-[var(--font-pixel)] text-[8px] text-[var(--color-pink-600)]">
                {resetToken}
              </code>
            </div>
            <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
              <PixelButton className="w-full">RESET PASSWORD</PixelButton>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--color-pixel-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-pixel-surface)] p-6 pixel-border">
          <h2 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-text)] mb-6 uppercase tracking-wide">
            Forgot Password
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
            />
            <PixelButton type="submit" loading={loading} className="mt-2">
              GET RESET TOKEN
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
