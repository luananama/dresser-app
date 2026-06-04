import { useRef, useState } from 'react'
import type { Category, Season, Source } from '../../types'
import { CATEGORY_LABELS, CATEGORY_SUBCATEGORIES, FABRIC_OPTIONS, SEASON_LABELS, SOURCE_LABELS } from '../../types'
import PixelButton from '../ui/PixelButton'
import PixelInput from '../ui/PixelInput'
import PixelSelect from '../ui/PixelSelect'

export interface ItemFormValues {
  category: Category
  subcategory: string
  source: Source | ''
  fabric: string[]
  date_acquired: string
  season: Season
  notes: string
  image: File | null
}

interface ItemFormProps {
  initial?: Partial<ItemFormValues>
  existingImagePath?: string | null
  initialImageFile?: File | null
  onSubmit: (values: ItemFormValues) => Promise<void>
  submitLabel?: string
  loading?: boolean
  error?: string
}

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))
const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const SEASON_OPTIONS = Object.entries(SEASON_LABELS).map(([v, l]) => ({ value: v, label: l }))

export default function ItemForm({
  initial,
  existingImagePath,
  initialImageFile,
  onSubmit,
  submitLabel = 'SAVE',
  loading = false,
  error,
}: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>({
    category: initial?.category ?? 'tops',
    subcategory: initial?.subcategory ?? '',
    source: initial?.source ?? '',
    fabric: initial?.fabric ?? [],
    date_acquired: initial?.date_acquired ?? '',
    season: initial?.season ?? 'all_year',
    notes: initial?.notes ?? '',
    image: initialImageFile ?? null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    initialImageFile ? URL.createObjectURL(initialImageFile) : null
  )
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setValues((v) => ({ ...v, image: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  function set(field: keyof ItemFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (field === 'category') {
        setValues((v) => ({ ...v, category: e.target.value as Category, subcategory: '' }))
      } else {
        setValues((v) => ({ ...v, [field]: e.target.value }))
      }
    }
  }

  function toggleFabric(fabric: string) {
    setValues((v) => ({
      ...v,
      fabric: v.fabric.includes(fabric)
        ? v.fabric.filter((f) => f !== fabric)
        : [...v.fabric, fabric],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(values)
  }

  const displayImage = imagePreview ?? existingImagePath ?? null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="font-[var(--font-body)] text-xs text-[var(--color-pink-600)] bg-pink-100 px-3 py-2">
          {error}
        </p>
      )}

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <span className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">
          Photo
        </span>
        <div
          className="w-full aspect-[4/3] bg-pink-100 pixel-border flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {displayImage ? (
            <img src={displayImage} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--color-pixel-muted)]">
              <span className="text-4xl">📷</span>
              <span className="font-[var(--font-pixel)] text-[7px] uppercase">Tap to upload</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <PixelSelect
        label="Category"
        options={CATEGORY_OPTIONS}
        value={values.category}
        onChange={set('category')}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">
          Subcategory
        </label>
        <select
          className="font-[var(--font-body)] text-sm px-3 py-2 bg-white text-[var(--color-pixel-text)] pixel-border-sm outline-none appearance-none cursor-pointer"
          value={values.subcategory}
          onChange={set('subcategory')}
        >
          <option value="">Select subcategory...</option>
          {CATEGORY_SUBCATEGORIES[values.category].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <PixelSelect
        label="Source"
        options={SOURCE_OPTIONS}
        value={values.source}
        onChange={set('source')}
        placeholder="Select source..."
      />

      {/* Fabric multi-select */}
      <div className="flex flex-col gap-2">
        <span className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">
          Fabric
        </span>
        <div className="flex flex-wrap gap-2">
          {FABRIC_OPTIONS.map((fabric) => {
            const selected = values.fabric.includes(fabric)
            return (
              <button
                key={fabric}
                type="button"
                onClick={() => toggleFabric(fabric)}
                className={`font-[var(--font-pixel)] text-[7px] uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[var(--color-pink-400)] text-white pixel-border-dark'
                    : 'bg-[var(--color-pixel-surface)] text-[var(--color-pixel-muted)] pixel-border-sm hover:bg-pink-100'
                }`}
              >
                {fabric}
              </button>
            )
          })}
        </div>
      </div>

      <PixelInput label="Date Acquired" type="date" value={values.date_acquired} onChange={set('date_acquired')} />

      <PixelSelect
        label="Season"
        options={SEASON_OPTIONS}
        value={values.season}
        onChange={set('season')}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">
          Notes
        </label>
        <textarea
          className="font-[var(--font-body)] text-sm px-3 py-2 bg-white text-[var(--color-pixel-text)] pixel-border-sm outline-none resize-none"
          rows={3}
          value={values.notes}
          onChange={set('notes')}
          placeholder="Any extra details..."
        />
      </div>

      <PixelButton type="submit" loading={loading} className="mt-2">
        {submitLabel}
      </PixelButton>
    </form>
  )
}
