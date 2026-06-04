import { NavLink } from 'react-router-dom'

// To use your own PNG icons, drop files into frontend/public/icons/ and
// replace the SVG components below with:  <img src="/icons/closet.png" className="w-6 h-6" />

function ClosetIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}

function TryOnIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  )
}

function PackingIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

const tabs = [
  { to: '/closet',   label: 'Closet',   Icon: ClosetIcon   },
  { to: '/tryon',    label: 'Try On',   Icon: TryOnIcon    },
  { to: '/packing',  label: 'Packing',  Icon: PackingIcon  },
  { to: '/calendar', label: 'Calendar', Icon: CalendarIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{ boxShadow: '0 -1px 12px rgba(0,0,0,0.05)' }}>
      <div className="flex justify-around sm:justify-center sm:gap-12 items-end h-16 px-2 pb-2 sm:px-0 max-w-2xl sm:mx-auto">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 sm:flex-none"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 py-1 transition-all duration-150">
                <span className={isActive ? 'text-gray-900' : 'text-gray-400'}>
                  <Icon active={isActive} />
                </span>
                <span className={`text-[10px] tracking-wide transition-colors duration-150 ${
                  isActive
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-400 font-normal'
                }`}
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-gray-900 -mt-0.5" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
