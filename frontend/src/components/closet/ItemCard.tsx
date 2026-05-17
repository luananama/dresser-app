import { useNavigate } from 'react-router-dom'
import type { ClothingItem } from '../../types'
import { CATEGORY_LABELS } from '../../types'
import PixelBadge from '../ui/PixelBadge'

function HangerPlaceholder() {
  return (
    <div className="w-full aspect-square bg-pink-100 flex items-center justify-center">
      <span className="text-4xl opacity-40">👗</span>
    </div>
  )
}

export default function ItemCard({ item }: { item: ClothingItem }) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-[var(--color-pixel-surface)] pixel-border cursor-pointer hover:bg-pink-100 transition-colors"
      onClick={() => navigate(`/items/${item.id}`)}
    >
      {item.image_path ? (
        <img
          src={item.image_path!}
          alt={item.subcategory ?? CATEGORY_LABELS[item.category]}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <HangerPlaceholder />
      )}
      <div className="p-2">
        <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--color-pixel-text)] truncate mb-1">
          {item.subcategory ?? CATEGORY_LABELS[item.category]}
        </p>
        <PixelBadge label={CATEGORY_LABELS[item.category]} colorKey={item.category} />
      </div>
    </div>
  )
}
