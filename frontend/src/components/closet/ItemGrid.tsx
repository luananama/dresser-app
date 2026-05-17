import type { ClothingItem } from '../../types'
import ItemCard from './ItemCard'

export default function ItemGrid({ items }: { items: ClothingItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-4">👗</span>
        <p className="font-[var(--font-pixel)] text-[9px] text-[var(--color-pixel-muted)] mb-2 uppercase tracking-wide">
          Your closet is empty
        </p>
        <p className="font-[var(--font-body)] text-sm text-[var(--color-pixel-muted)]">
          Add your first item to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
