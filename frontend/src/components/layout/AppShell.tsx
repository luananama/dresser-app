import { Outlet, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopBar from './TopBar'

export default function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-[var(--color-pixel-bg)]">
      <TopBar />
      <main className="flex-1 pb-20 pt-4 px-4 max-w-2xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Floating add button */}
      <button
        onClick={() => navigate('/items/new')}
        className="fixed bottom-[88px] right-5 z-40 w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
        aria-label="Add item"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <BottomNav />
    </div>
  )
}
