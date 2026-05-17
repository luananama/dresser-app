import type { ButtonHTMLAttributes } from 'react'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function PixelButton({
  children,
  loading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: PixelButtonProps) {
  const base =
    'font-[var(--font-pixel)] text-[8px] uppercase tracking-widest px-4 py-3 cursor-pointer transition-transform active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed pixel-border'

  const variants = {
    primary: 'bg-[var(--color-pink-400)] text-white hover:bg-[var(--color-pink-500)]',
    secondary: 'bg-[var(--color-pixel-surface)] text-[var(--color-pixel-text)] hover:bg-pink-100',
    danger: 'bg-[var(--color-pink-600)] text-white hover:bg-red-700',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  )
}
