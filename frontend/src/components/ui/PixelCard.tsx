import type { ReactNode } from 'react'

interface PixelCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function PixelCard({ children, className = '', onClick }: PixelCardProps) {
  return (
    <div
      className={`bg-[var(--color-pixel-surface)] pixel-border p-4 ${onClick ? 'cursor-pointer hover:bg-pink-100 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
