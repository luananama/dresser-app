import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItem } from '../hooks/useItems'
import client from '../api/client'
import PixelBadge from '../components/ui/PixelBadge'
import PixelButton from '../components/ui/PixelButton'
import { CATEGORY_LABELS, SEASON_LABELS, SOURCE_LABELS } from '../types'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { item, loading, error } = useItem(Number(id))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-pixel-muted)] animate-pulse uppercase">
          Loading...
        </span>
      </div>
    )
  }

  if (error || !item) {
    return <p className="font-[var(--font-body)] text-sm text-[var(--color-pink-600)]">Item not found.</p>
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await client.delete(`/items/${item!.id}`)
      navigate('/closet')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const rows: { label: string; value: string | null }[] = [
    { label: 'Category', value: CATEGORY_LABELS[item.category] },
    { label: 'Subcategory', value: item.subcategory },
    { label: 'Source', value: item.source ? SOURCE_LABELS[item.source] : null },
    { label: 'Date Acquired', value: item.date_acquired },
    { label: 'Age', value: item.age_years != null ? `${item.age_years} yr${item.age_years !== 1 ? 's' : ''}` : null },
    { label: 'Season', value: SEASON_LABELS[item.season] },
    { label: 'Notes', value: item.notes },
  ].filter((r) => r.value)

  return (
    <div className="flex flex-col gap-4">
      {item.image_path ? (
        <img
          src={item.image_path!}
          alt={item.subcategory ?? CATEGORY_LABELS[item.category]}
          className="w-full aspect-square object-cover pixel-border"
        />
      ) : (
        <div className="w-full aspect-square bg-pink-100 pixel-border flex items-center justify-center">
          <span className="text-8xl opacity-30">👗</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h1 className="font-[var(--font-pixel)] text-[13px] text-[var(--color-pixel-text)] leading-tight">
          {item.subcategory ?? CATEGORY_LABELS[item.category]}
        </h1>
        <PixelBadge label={CATEGORY_LABELS[item.category]} colorKey={item.category} />
      </div>

      {item.fabric && item.fabric.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">Fabric</span>
          <div className="flex flex-wrap gap-2">
            {item.fabric.map((f) => (
              <span key={f} className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider px-3 py-2 bg-pink-100 text-[var(--color-pink-600)] pixel-border-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--color-pixel-surface)] pixel-border divide-y divide-[var(--color-pixel-border)]">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-2 px-3 py-2">
            <span className="font-[var(--font-pixel)] text-[7px] uppercase tracking-wider text-[var(--color-pixel-muted)]">
              {label}
            </span>
            <span className="font-[var(--font-body)] text-sm text-[var(--color-pixel-text)] text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <PixelButton
          variant="secondary"
          onClick={() => navigate(`/items/${item.id}/edit`)}
          className="flex-1"
        >
          EDIT
        </PixelButton>

        {!confirmDelete ? (
          <PixelButton
            variant="danger"
            onClick={() => setConfirmDelete(true)}
            className="flex-1"
          >
            DELETE
          </PixelButton>
        ) : (
          <div className="flex-1 flex flex-col gap-2">
            <p className="font-[var(--font-pixel)] text-[7px] text-[var(--color-pink-600)] uppercase text-center">
              Are you sure?
            </p>
            <div className="flex gap-2">
              <PixelButton
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                className="flex-1"
              >
                YES
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
                className="flex-1"
              >
                NO
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
