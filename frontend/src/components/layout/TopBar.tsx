import { useAuth } from '../../auth/AuthContext'

export default function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-pixel-surface)] pixel-border-sm flex items-center justify-between px-4 py-3">
      <span className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pink-500)] tracking-tight">
        👗 DRESSER
      </span>
      {user && (
        <div className="flex items-center gap-3">
          <span className="font-[var(--font-body)] text-sm text-[var(--color-pixel-muted)]">
            {user.username}
          </span>
          <button
            onClick={logout}
            className="font-[var(--font-pixel)] text-[7px] text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] uppercase tracking-wider transition-colors cursor-pointer"
          >
            LOGOUT
          </button>
        </div>
      )}
    </header>
  )
}
