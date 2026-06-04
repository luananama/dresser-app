import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import type { Category, ClothingItem } from '../types'

type TopMode = 'tops' | 'full_body'
type PinnableCategory = 'layer' | 'tops' | 'full_body' | 'bottoms' | 'footwear'
interface Pinned { file: File; url: string; category: PinnableCategory }

const ICON: Partial<Record<Category, string>> = {
  layer: '🧥', tops: '👕', full_body: '👗', bottoms: '👖', footwear: '👟',
}

const CATEGORY_PICK: { value: PinnableCategory; label: string; icon: string }[] = [
  { value: 'layer',     label: 'Layer / Jacket', icon: '🧥' },
  { value: 'tops',      label: 'Top',            icon: '👕' },
  { value: 'full_body', label: 'Full Body',       icon: '👗' },
  { value: 'bottoms',   label: 'Bottom',          icon: '👖' },
  { value: 'footwear',  label: 'Shoes',           icon: '👟' },
]

function CategoryPicker({ onSelect, onCancel }: {
  onSelect: (c: PinnableCategory) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onCancel}>
      <div className="w-full bg-white rounded-t-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'system-ui, sans-serif' }}>
            What type of item?
          </span>
          <button onClick={onCancel} className="text-gray-400 text-xl cursor-pointer leading-none">×</button>
        </div>
        <div className="flex flex-col pb-8 px-3 pt-1">
          {CATEGORY_PICK.map(opt => (
            <button key={opt.value} onClick={() => onSelect(opt.value)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer text-left">
              <span className="text-xl">{opt.icon}</span>
              <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'system-ui, sans-serif' }}>
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
  index: number                       // -1 = none selected
  onIndexChange: (i: number) => void
  extra?: React.ReactNode
  pinned?: Pinned | null
  onSavePinned?: () => void
  onClearPinned?: () => void
}

function Zone({ label, category, items, index, onIndexChange, extra, pinned, onSavePinned, onClearPinned }: ZoneProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipUpdate = useRef(false)
  const icon = ICON[category] ?? '👗'
  const isPinned = !!pinned

  // Virtual list: slot 0 = "none", slots 1..n = items
  const slots: Array<ClothingItem | null> = [null, ...items]

  // Re-apply scale values on every scroll frame (direct DOM, no re-render)
  // Skip first and last children (spacers)
  const applyScales = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const elRect = el.getBoundingClientRect()
    const visibleCenter = elRect.left + elRect.width / 2
    const children = Array.from(el.children).slice(1, -1) // skip spacers
    children.forEach(child => {
      const c = child as HTMLElement
      const r = c.getBoundingClientRect()
      const dist = Math.abs(r.left + r.width / 2 - visibleCenter) / elRect.width
      c.style.transform = `scale(${1 - Math.min(dist * 0.35, 0.2)})`
    })
  }, [])

  const handleScroll = useCallback(() => {
    applyScales()
    if (skipUpdate.current) return
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      const el = scrollRef.current
      if (!el) return
      const elRect = el.getBoundingClientRect()
      const visibleCenter = elRect.left + elRect.width / 2
      const children = Array.from(el.children).slice(1, -1) // skip spacers
      let best = 0, bestDist = Infinity
      children.forEach((child, i) => {
        const r = (child as HTMLElement).getBoundingClientRect()
        const d = Math.abs(r.left + r.width / 2 - visibleCenter)
        if (d < bestDist) { bestDist = d; best = i }
      })
      onIndexChange(best - 1) // slot 0 = "none" (-1), slot 1 = items[0] (0), etc.
    }, 80)
  }, [applyScales, onIndexChange])

  // Scroll to index when it changes externally (e.g. pin/clear)
  // children layout: [spacer] [slot0=none] [slot1=items[0]] ... [spacer]
  // so target child = index + 2 (skip leading spacer, skip "none" slot if index>=0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // +1 for leading spacer, +1 for "none" slot at position 0 → index+2, but "none" is slot 0 so index=-1 → child 1
    const childIndex = index + 2 // spacer(0), none(1), items[0](2), ...
    const child = el.children[childIndex] as HTMLElement | undefined
    if (!child) return
    skipUpdate.current = true
    child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    setTimeout(() => { skipUpdate.current = false; applyScales() }, 400)
  }, [index, applyScales])

  // Re-run scales whenever items load or index changes
  useEffect(() => { applyScales() }, [applyScales, items.length, index])

  if (isPinned) {
    return (
      <div className="flex-1 relative bg-white overflow-hidden">
        <span className="absolute top-2 left-3 z-10 text-[9px] font-semibold tracking-widest uppercase text-gray-300 pointer-events-none"
          style={{ fontFamily: 'system-ui, sans-serif' }}>📌 {label}</span>
        <img src={pinned.url} className="w-full h-full object-contain" draggable={false} />
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          <button onClick={onSavePinned}
            className="text-[11px] bg-gray-900 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer"
            style={{ fontFamily: 'system-ui, sans-serif' }}>
            Save to Closet →
          </button>
          <button onClick={onClearPinned}
            className="w-7 h-7 bg-white text-gray-500 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer text-base leading-none">
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        onScroll={handleScroll}
      >
        {/* Leading spacer so first item can snap to center */}
        <div style={{ minWidth: '15%', flexShrink: 0 }} />

        {slots.map((item) => (
          <div
            key={item?.id ?? 'none'}
            className="flex items-center justify-center"
            style={{
              minWidth: '70%',
              flexShrink: 0,
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              transition: 'transform 0.12s ease-out',
            }}
          >
            {item ? (
              item.image_path
                ? <img src={item.image_path} className="h-full w-full object-contain" draggable={false} />
                : <span className="text-5xl">{icon}</span>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-25 select-none">
                <span className="text-5xl">{icon}</span>
                {items.length > 0 && (
                  <span className="text-[10px] text-gray-400" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    none
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Trailing spacer so last item can snap to center */}
        <div style={{ minWidth: '15%', flexShrink: 0 }} />
      </div>

      {/* Zone label + counter */}
      <div className="flex items-center justify-between px-4 pb-1.5 pt-0.5 shrink-0">
        <span className="text-[9px] font-semibold tracking-widest uppercase text-gray-300"
          style={{ fontFamily: 'system-ui, sans-serif' }}>{label}</span>
        <div className="flex items-center gap-2">
          {extra}
          {index >= 0 && items.length > 0 && (
            <span className="text-[9px] text-gray-300" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {index + 1}/{items.length}
            </span>
          )}
        </div>
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

  const clearPinned = () => { if (pinned?.url) URL.revokeObjectURL(pinned.url); setPinned(null) }
  const switchTopMode = () => {
    if (pinned?.category === 'tops' || pinned?.category === 'full_body') clearPinned()
    setTopMode(m => m === 'tops' ? 'full_body' : 'tops')
    setTopIdx(-1); setBottomIdx(-1)
  }
  const pinnedFor = (cat: PinnableCategory) => pinned?.category === cat ? pinned : null
  const saveToCloset = () => { if (pinned) navigate('/items/new', { state: { pendingImage: pinned.file } }) }

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

  return (
    <div className="flex flex-col -mt-4 -mx-4 -mb-20 bg-white" style={{ height: 'calc(100svh - 46px)' }}>
      {pendingFile && (
        <CategoryPicker onSelect={handleCategorySelect} onCancel={() => {
          URL.revokeObjectURL(pendingFile.url); setPendingFile(null)
        }} />
      )}

      <div className="flex items-center px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate('/closet')}
          className="w-8 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors text-lg leading-none">←</button>
        <span className="flex-1 text-center text-sm font-semibold text-gray-700 tracking-wide"
          style={{ fontFamily: 'system-ui, sans-serif' }}>Try On</span>
        <button onClick={() => uploadRef.current?.click()}
          className="w-8 text-lg text-right text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
          title="Upload photo to try on">📷</button>
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Zone label="Layer" category="layer" items={layers} index={layerIdx} onIndexChange={setLayerIdx}
          pinned={pinnedFor('layer')} onSavePinned={saveToCloset} onClearPinned={clearPinned} />
        <Zone
          label={topMode === 'tops' ? 'Top' : 'Full Body'}
          category={topMode} items={topItems} index={topIdx} onIndexChange={setTopIdx}
          pinned={pinnedFor(topMode)} onSavePinned={saveToCloset} onClearPinned={clearPinned}
          extra={!pinnedFor(topMode) ? (
            <button onClick={e => { e.stopPropagation(); switchTopMode() }}
              className="text-[9px] text-gray-300 hover:text-gray-500 cursor-pointer transition-colors"
              style={{ fontFamily: 'system-ui, sans-serif' }}>
              {topMode === 'tops' ? 'full body?' : 'tops?'}
            </button>
          ) : undefined}
        />
        {topMode === 'tops' && (
          <Zone label="Bottom" category="bottoms" items={bottoms} index={bottomIdx} onIndexChange={setBottomIdx}
            pinned={pinnedFor('bottoms')} onSavePinned={saveToCloset} onClearPinned={clearPinned} />
        )}
        <Zone label="Shoes" category="footwear" items={shoes} index={shoeIdx} onIndexChange={setShoeIdx}
          pinned={pinnedFor('footwear')} onSavePinned={saveToCloset} onClearPinned={clearPinned} />
      </div>
    </div>
  )
}
