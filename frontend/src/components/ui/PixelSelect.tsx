import type { SelectHTMLAttributes } from 'react'

interface PixelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function PixelSelect({ label, id, options, placeholder, ...props }: PixelSelectProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]"
      >
        {label}
      </label>
      <select
        id={inputId}
        className="font-[var(--font-body)] text-sm px-3 py-2 bg-white text-[var(--color-pixel-text)] pixel-border-sm outline-none focus:shadow-[2px_0_0_0_var(--color-pink-400),-2px_0_0_0_var(--color-pink-400),0_2px_0_0_var(--color-pink-400),0_-2px_0_0_var(--color-pink-400)] appearance-none cursor-pointer"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
