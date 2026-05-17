import type { Category } from '../../types'
import { CATEGORY_LABELS } from '../../types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][]

interface CategoryFilterProps {
  selected: Category | undefined
  onChange: (cat: Category | undefined) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange(undefined)}
        className={`font-[var(--font-pixel)] text-[7px] uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer ${
          !selected
            ? 'bg-[var(--color-pink-400)] text-white pixel-border-dark'
            : 'bg-[var(--color-pixel-surface)] text-[var(--color-pixel-muted)] pixel-border-sm hover:bg-pink-100'
        }`}
      >
        All
      </button>
      {CATEGORIES.map(([value, label]) => (
        <button
          key={value}
          onClick={() => onChange(selected === value ? undefined : value)}
          className={`font-[var(--font-pixel)] text-[7px] uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer ${
            selected === value
              ? 'bg-[var(--color-pink-400)] text-white pixel-border-dark'
              : 'bg-[var(--color-pixel-surface)] text-[var(--color-pixel-muted)] pixel-border-sm hover:bg-pink-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
