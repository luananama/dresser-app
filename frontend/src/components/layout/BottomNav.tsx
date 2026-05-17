import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/closet', label: 'CLOSET', icon: '👗' },
  { to: '/items/new', label: '+ ADD', icon: '✨' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-pixel-surface)] pixel-border-sm flex justify-around items-center h-16 px-4">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 font-[var(--font-pixel)] text-[7px] tracking-wider uppercase transition-colors ${
              isActive
                ? 'text-[var(--color-pink-500)]'
                : 'text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-400)]'
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
