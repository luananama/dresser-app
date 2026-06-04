import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import type { Category, ClothingItem } from '../types'
import { CATEGORY_LABELS } from '../types'

type TopMode = 'tops' | 'full_body'
type PinnableCategory = 'layer' | 'tops' | 'full_body' | 'bottoms' | 'footwear'

interface Pinned {
  file: File
  url: string
  category: PinnableCategory
}

const PLACEHOLDER: Partial<Record<Category, string>> = {
  layer: '🧥',
  tops: '👕',
  full_body: '👗',
  bottoms: '👖',
  footwear: '👟',
}

const CATEGORY_PICK: { value: PinnableCategory; label: string; icon: string }[] = [
  { value: 'layer',     label: 'Layer / Jacket', icon: '🧥' },
  { value: 'tops',      label: 'Top',            icon: '👕' },
  { value: 'full_body', label: 'Full Body',       icon: '👗' },
  { value: 'bottoms',   label: 'Bottom',          icon: '👖' },
  { value: 'footwear',  label: 'Shoes',           icon: '👟' },
]

function cycle(items: ClothingItem[], idx: number, dir: 1 | -1): number {
  if (items.length === 0) return -1
  if (dir === 1) return idx >= items.length - 1 ? -1 : idx + 1
  return idx <= -1 ? items.length - 1 : idx - 1
}

function CategoryPicker({ onSelect, onCancel }: {
  onSelect: (c: PinnableCategory) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-40" onClick={onCancel}>
      <div
        className="w-full bg-[var(--color-pixel-surface)] pixel-border-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-pixel-border)]">
          <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-pixel-text)] uppercase tracking-wide">
            What type of item?
          </span>
          <button
            onClick={onCancel}
            className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pixel-muted)] cursor-pointer hover:text-[var(--color-pixel-text)]"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-1 p-3 pb-8">
          {CATEGORY_PICK.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--color-pixel-bg)] hover:bg-pink-100 active:bg-pink-100 transition-colors cursor-pointer pixel-border-sm text-left"
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="font-[var(--font-body)] text-sm font-semibold text-[var(--color-pixel-text)]">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ZoneProps {
  label: string
  category: Category
  items: ClothingItem[]
  index: number
  onNext: () => void
  onPrev: () => void
  extra?: React.ReactNode
  pinned?: Pinned | null
  onSavePinned?: () => void
  onClearPinned?: () => void
}

function Zone({ label, category, items, index, onNext, onPrev, extra, pinned, onSavePinned, onClearPinned }: ZoneProps) {
  const startX = useRef<number | null>(null)
  const current = index >= 0 ? items[index] : null
  const icon = PLACEHOLDER[category] ?? '👗'
  const isPinned = !!pinned

  const onPointerDown = (e: React.PointerEvent) => {
    if (isPinned) return
    startX.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (isPinned || startX.current === null) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 40) dx < 0 ? onNext() : onPrev()
    startX.current = null
  }

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden select-none ${
        isPinned
          ? 'border-b-2 border-[var(--color-pink-400)]'
          : 'border-b border-[var(--color-pixel-border)] last:border-b-0'
      }`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 flex-shrink-0 ${
        isPinned ? 'bg-[var(--color-pink-100)]' : 'bg-[var(--color-pixel-surface)]'
      }`}>
        <span className={`font-[var(--font-pixel)] text-[6px] uppercase tracking-wider ${
          isPinned ? 'text-[var(--color-pink-600)]' : 'text-[var(--color-pink-500)]'
        }`}>
          {isPinned ? '📌 ' : ''}{label}
        </span>

        {isPinned ? (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onSavePinned}
              className="font-[var(--font-pixel)] text-[5px] uppercase text-white bg-[var(--color-pink-500)] px-2 py-1 cursor-pointer hover:bg-[var(--color-pink-400)] transition-colors"
            >
              Save to Closet →
            </button>
            <button
              onClick={onClearPinned}
              className="font-[var(--font-pixel)] text-[10px] text-[var(--color-pink-600)] hover:text-[var(--color-pink-400)] cursor-pointer transition-colors leading-none"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            {extra}
            <span className="font-[var(--font-pixel)] text-[6px] text-[var(--color-pixel-muted)]">
              {items.length === 0 ? '—' : index === -1 ? 'none' : `${index + 1}/${items.length}`}
            </span>
          </>
        )}
      </div>

      {/* Image area */}
      <div className="flex-1 relative flex items-center justify-center bg-[var(--color-pixel-bg)] overflow-hidden">
        {isPinned ? (
          <img
            src={pinned.url}
            alt="Pinned item"
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : current ? (
          <>
            {current.image_path ? (
              <img
                key={current.id}
                src={current.image_path}
                alt={current.subcategory ?? CATEGORY_LABELS[current.category]}
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-5xl">{icon}</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 py-1 px-3 bg-[var(--color-pixel-surface)] bg-opacity-90">
              <p className="font-[var(--font-body)] text-xs font-semibold text-[var(--color-pixel-text)] text-center truncate">
                {current.subcategory ?? CATEGORY_LABELS[current.category]}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20 pointer-events-none">
            <span className="text-5xl">{icon}</span>
            <span className="font-[var(--font-pixel)] text-[6px] text-[var(--color-pixel-muted)] uppercase">
              {items.length === 0 ? 'no items' : 'swipe to browse'}
            </span>
          </div>
        )}

        {!isPinned && items.length > 0 && (
          <>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onPrev() }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--color-pixel-surface)] pixel-border-sm flex items-center justify-center font-[var(--font-pixel)] text-[12px] text-[var(--color-pixel-text)] opacity-50 hover:opacity-100 active:opacity-100 transition-opacity cursor-pointer"
            >
              ‹
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onNext() }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--color-pixel-surface)] pixel-border-sm flex items-center justify-center font-[var(--font-pixel)] text-[12px] text-[var(--color-pixel-text)] opacity-50 hover:opacity-100 active:opacity-100 transition-opacity cursor-pointer"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TryOnPage() {
  const navigate = useNavigate()
  const [topMode, setTopMode] = useState<TopMode>('tops')
  const [layerIdx, setLayerIdx] = useState(-1)
  const [topIdx, setTopIdx] = useState(-1)
  const [bottomIdx, setBottomIdx] = useState(-1)
  const [shoeIdx, setShoeIdx] = useState(-1)
  const [pinned, setPinned] = useState<Pinned | null>(null)
  const [pendingFile, setPendingFile] = useState<{ file: File; url: string } | null>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => { if (pinned?.url) URL.revokeObjectURL(pinned.url) }
  }, [pinned?.url])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (pendingFile?.url) URL.revokeObjectURL(pendingFile.url)
    setPendingFile({ file, url: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const handleCategorySelect = (category: PinnableCategory) => {
    if (!pendingFile) return
    if (pinned?.url) URL.revokeObjectURL(pinned.url)
    setPinned({ ...pendingFile, category })
    setPendingFile(null)
    if (category === 'full_body') setTopMode('full_body')
    else if (category === 'tops') setTopMode('tops')
    if (category === 'layer') setLayerIdx(-1)
    else if (category === 'tops' || category === 'full_body') setTopIdx(-1)
    else if (category === 'bottoms') setBottomIdx(-1)
    else if (category === 'footwear') setShoeIdx(-1)
  }

  const cancelPending = () => {
    if (pendingFile?.url) URL.revokeObjectURL(pendingFile.url)
    setPendingFile(null)
  }

  const clearPinned = () => {
    if (pinned?.url) URL.revokeObjectURL(pinned.url)
    setPinned(null)
  }

  const switchTopMode = () => {
    if (pinned?.category === 'tops' || pinned?.category === 'full_body') clearPinned()
    setTopMode(m => m === 'tops' ? 'full_body' : 'tops')
    setTopIdx(-1)
    setBottomIdx(-1)
  }

  const pinnedFor = (cat: PinnableCategory) => pinned?.category === cat ? pinned : null

  const { data: layerData }    = useItems({ category: 'layer',     size: 100 })
  const { data: topsData }     = useItems({ category: 'tops',      size: 100 })
  const { data: fullBodyData } = useItems({ category: 'full_body', size: 100 })
  const { data: bottomsData }  = useItems({ category: 'bottoms',   size: 100 })
  const { data: shoeData }     = useItems({ category: 'footwear',  size: 100 })

  const layers     = layerData?.items    ?? []
  const tops       = topsData?.items     ?? []
  const fullBodies = fullBodyData?.items ?? []
  const bottoms    = bottomsData?.items  ?? []
  const shoes      = shoeData?.items     ?? []
  const topItems   = topMode === 'tops' ? tops : fullBodies

  const saveToCloset = () => {
    if (pinned) navigate('/items/new', { state: { pendingImage: pinned.file } })
  }

  return (
    <div className="flex flex-col -mt-4 -mx-4 -mb-20" style={{ height: 'calc(100svh - 46px)' }}>
      {pendingFile && (
        <CategoryPicker onSelect={handleCategorySelect} onCancel={cancelPending} />
      )}

      {/* Header */}
      <div className="flex items-center px-3 py-2 bg-[var(--color-pixel-surface)] pixel-border-sm flex-shrink-0">
        <button
          onClick={() => navigate('/closet')}
          className="w-8 font-[var(--font-pixel)] text-[8px] text-[var(--color-pixel-muted)] hover:text-[var(--color-pixel-text)] cursor-pointer transition-colors"
        >
          ←
        </button>
        <span className="flex-1 text-center font-[var(--font-pixel)] text-[9px] text-[var(--color-pixel-text)] uppercase tracking-wide">
          Try On
        </span>
        <button
          onClick={() => uploadRef.current?.click()}
          className="w-8 text-base text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] cursor-pointer transition-colors"
          title="Upload photo to try on"
        >
          📷
        </button>
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Zones */}
      <div className="flex-1 flex flex-col min-h-0">
        <Zone
          label="Layer"
          category="layer"
          items={layers}
          index={layerIdx}
          onNext={() => setLayerIdx(i => cycle(layers, i, 1))}
          onPrev={() => setLayerIdx(i => cycle(layers, i, -1))}
          pinned={pinnedFor('layer')}
          onSavePinned={saveToCloset}
          onClearPinned={clearPinned}
        />
        <Zone
          label={topMode === 'tops' ? 'Top' : 'Full Body'}
          category={topMode}
          items={topItems}
          index={topIdx}
          onNext={() => setTopIdx(i => cycle(topItems, i, 1))}
          onPrev={() => setTopIdx(i => cycle(topItems, i, -1))}
          pinned={pinnedFor(topMode)}
          onSavePinned={saveToCloset}
          onClearPinned={clearPinned}
          extra={
            !pinnedFor(topMode) ? (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); switchTopMode() }}
                className="font-[var(--font-pixel)] text-[5px] uppercase text-[var(--color-pixel-muted)] hover:text-[var(--color-pink-500)] border border-[var(--color-pixel-border)] px-1.5 py-0.5 cursor-pointer transition-colors leading-tight"
              >
                {topMode === 'tops' ? 'full body?' : 'tops?'}
              </button>
            ) : undefined
          }
        />
        {topMode === 'tops' && (
          <Zone
            label="Bottom"
            category="bottoms"
            items={bottoms}
            index={bottomIdx}
            onNext={() => setBottomIdx(i => cycle(bottoms, i, 1))}
            onPrev={() => setBottomIdx(i => cycle(bottoms, i, -1))}
            pinned={pinnedFor('bottoms')}
            onSavePinned={saveToCloset}
            onClearPinned={clearPinned}
          />
        )}
        <Zone
          label="Shoes"
          category="footwear"
          items={shoes}
          index={shoeIdx}
          onNext={() => setShoeIdx(i => cycle(shoes, i, 1))}
          onPrev={() => setShoeIdx(i => cycle(shoes, i, -1))}
          pinned={pinnedFor('footwear')}
          onSavePinned={saveToCloset}
          onClearPinned={clearPinned}
        />
      </div>
    </div>
  )
}
