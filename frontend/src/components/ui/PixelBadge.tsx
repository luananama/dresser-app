const CATEGORY_COLORS: Record<string, string> = {
  tops: 'bg-pink-200 text-pink-800',
  bottoms: 'bg-blue-100 text-blue-800',
  full_body: 'bg-purple-100 text-purple-800',
  outerwear: 'bg-amber-100 text-amber-800',
  footwear: 'bg-green-100 text-green-800',
  accessories: 'bg-yellow-100 text-yellow-800',
}

interface PixelBadgeProps {
  label: string
  colorKey?: string
}

export default function PixelBadge({ label, colorKey }: PixelBadgeProps) {
  const colors = (colorKey && CATEGORY_COLORS[colorKey]) ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`font-[var(--font-pixel)] text-[6px] uppercase tracking-wider px-2 py-1 ${colors}`}>
      {label}
    </span>
  )
}
