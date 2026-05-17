import { useCallback, useEffect, useState } from 'react'
import client from '../api/client'
import type { Category, ClothingItem, PaginatedItems, Season } from '../types'

interface Filters {
  category?: Category
  season?: Season
  page?: number
  size?: number
}

export function useItems(filters: Filters = {}) {
  const [data, setData] = useState<PaginatedItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = {}
      if (filters.category) params.category = filters.category
      if (filters.season) params.season = filters.season
      if (filters.page) params.page = filters.page
      if (filters.size) params.size = filters.size
      const res = await client.get<PaginatedItems>('/items/', { params })
      setData(res.data)
    } catch {
      setError('Failed to load items.')
    } finally {
      setLoading(false)
    }
  }, [filters.category, filters.season, filters.page, filters.size])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useItem(id: number) {
  const [item, setItem] = useState<ClothingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    client.get<ClothingItem>(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setError('Item not found.'))
      .finally(() => setLoading(false))
  }, [id])

  return { item, loading, error }
}
