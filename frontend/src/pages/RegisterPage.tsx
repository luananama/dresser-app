import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'

export default function RegisterPage() {
  const { register, googleLogin } = useAuth()
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

  const openGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      setLoading(true)
      try {
        await googleLogin(tokenResponse.access_token)
        navigate('/closet')
      } catch {
        setError('Google sign-up failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => setError('Google sign-up failed. Please try again.'),
  })

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

          <button
            type="button"
            onClick={() => openGoogleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-[var(--font-body)] text-xs bg-white text-gray-700 border border-gray-300 pixel-border px-4 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[var(--color-pixel-muted)] opacity-30" />
            <span className="font-[var(--font-body)] text-[10px] text-[var(--color-pixel-muted)] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--color-pixel-muted)] opacity-30" />
          </div>

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
