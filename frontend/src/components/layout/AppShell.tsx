import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <div className="flex flex-col min-h-svh bg-[var(--color-pixel-bg)]">
      <TopBar />
      <main className="flex-1 pb-20 pt-4 px-4 max-w-2xl w-full mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
