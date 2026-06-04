import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ItemForm, { type ItemFormValues } from '../components/closet/ItemForm'
import { useItem } from '../hooks/useItems'
import client from '../api/client'
import type { Category, Season, Source } from '../types'

function buildFormData(values: ItemFormValues): FormData {
  const fd = new FormData()
  fd.append('category', values.category)
  if (values.subcategory) fd.append('subcategory', values.subcategory)
  if (values.source) fd.append('source', values.source)
  if (values.fabric.length > 0) fd.append('fabric', values.fabric.join(','))
  if (values.date_acquired) fd.append('date_acquired', values.date_acquired)
  fd.append('season', values.season)
  if (values.notes) fd.append('notes', values.notes)
  if (values.image) fd.append('image', values.image)
  return fd
}

function EditItem({ id }: { id: number }) {
  const { item, loading } = useItem(id)
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-pixel-muted)] animate-pulse uppercase">
          Loading...
        </span>
      </div>
    )
  }

  if (!item) return <p className="font-[var(--font-body)] text-sm">Item not found.</p>

  async function handleSubmit(values: ItemFormValues) {
    setSubmitError('')
    setSubmitting(true)
    try {
      await client.put(`/items/${id}`, buildFormData(values))
      navigate(`/items/${id}`)
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail ?? 'Failed to update item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="font-[var(--font-pixel)] text-[12px] text-[var(--color-pixel-text)] uppercase tracking-wide mb-6">
        Edit Item
      </h1>
      <ItemForm
        initial={{
          category: item.category as Category,
          subcategory: item.subcategory ?? '',
          source: (item.source ?? '') as Source | '',
          fabric: item.fabric ?? [],
          date_acquired: item.date_acquired ?? '',
          season: item.season as Season,
          notes: item.notes ?? '',
        }}
        existingImagePath={item.image_path}
        onSubmit={handleSubmit}
        submitLabel="SAVE CHANGES"
        loading={submitting}
        error={submitError}
      />
    </>
  )
}

function NewItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const pendingImage = (location.state as { pendingImage?: File } | null)?.pendingImage ?? null
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: ItemFormValues) {
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await client.post('/items/', buildFormData(values))
      navigate(`/items/${res.data.id}`)
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail ?? 'Failed to create item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="font-[var(--font-pixel)] text-[12px] text-[var(--color-pixel-text)] uppercase tracking-wide mb-6">
        Add Item
      </h1>
      <ItemForm
        initialImageFile={pendingImage}
        onSubmit={handleSubmit}
        submitLabel="ADD TO CLOSET"
        loading={submitting}
        error={submitError}
      />
    </>
  )
}

export default function AddEditItemPage() {
  const { id } = useParams()
  return id ? <EditItem id={Number(id)} /> : <NewItem />
}
