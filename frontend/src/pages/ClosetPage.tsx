import { useState } from 'react'
import CategoryFilter from '../components/closet/CategoryFilter'
import ItemGrid from '../components/closet/ItemGrid'
import { useItems } from '../hooks/useItems'
import type { Category } from '../types'

export default function ClosetPage() {
  const [category, setCategory] = useState<Category | undefined>()
  const { data, loading, error } = useItems({ category })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-[var(--font-pixel)] text-[12px] text-[var(--color-pixel-text)] uppercase tracking-wide">
        My Closet
      </h1>

      <CategoryFilter selected={category} onChange={setCategory} />

      {loading && (
        <div className="flex justify-center py-12">
          <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-pixel-muted)] animate-pulse uppercase">
            Loading...
          </span>
        </div>
      )}

      {error && (
        <p className="font-[var(--font-body)] text-sm text-[var(--color-pink-600)]">{error}</p>
      )}

      {!loading && data && (
        <>
          {data.total > 0 && (
            <p className="font-[var(--font-body)] text-xs text-[var(--color-pixel-muted)]">
              {data.total} item{data.total !== 1 ? 's' : ''}
            </p>
          )}
          <ItemGrid items={data.items} />
        </>
      )}
    </div>
  )
}
