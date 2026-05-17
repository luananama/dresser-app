export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

export interface TokenOut {
  access_token: string
  token_type: string
  user: User
}

export type Category = 'tops' | 'bottoms' | 'full_body' | 'layer' | 'footwear' | 'accessories'
export type Source = 'thrifted' | 'passed_down' | 'gift' | 'bought' | 'handmade' | 'upcycled' | 'other'
export type Season = 'all_year' | 'summer' | 'spring' | 'winter' | 'fall'

export interface ClothingItem {
  id: number
  user_id: number
  category: Category
  subcategory: string | null
  source: Source | null
  fabric: string[] | null
  date_acquired: string | null
  season: Season
  image_path: string | null
  notes: string | null
  created_at: string
  updated_at: string
  age_years: number | null
}

export interface PaginatedItems {
  items: ClothingItem[]
  total: number
  page: number
  size: number
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  full_body: 'Full Body',
  layer: 'Layer',
  footwear: 'Footwear',
  accessories: 'Accessories',
}

export const SOURCE_LABELS: Record<Source, string> = {
  thrifted: 'Thrifted',
  passed_down: 'Passed Down',
  gift: 'Gift',
  bought: 'Bought',
  handmade: 'Handmade',
  upcycled: 'Upcycled',
  other: 'Other',
}

export const SEASON_LABELS: Record<Season, string> = {
  all_year: 'All Year',
  summer: 'Summer',
  spring: 'Spring',
  winter: 'Winter',
  fall: 'Fall',
}

export const CATEGORY_SUBCATEGORIES: Record<Category, string[]> = {
  tops: ['Short sleeve', 'Long sleeve', 'Blouse', 'Tank top', 'Sweatshirt', 'Button down', 'Sweater', 'Cardigan'],
  bottoms: ['Pants', 'Jeans', 'Long skirt', 'Short skirt', 'Shorts'],
  full_body: ['Long dress', 'Short dress', 'Swimsuit', 'Overalls'],
  layer: ['Coat', 'Jacket', 'Blazer', 'Cardigan', 'Hoodie', 'Raincoat', 'Vest'],
  footwear: ['Boots', 'Sandals', 'Heels', 'Flats', 'Athletic'],
  accessories: ['Bag', 'Hat', 'Scarf', 'Other'],
}

export const FABRIC_OPTIONS = [
  'Cotton', 'Wool', 'Linen', 'Nylon', 'Polyester',
  'Silk', 'Denim', 'Leather', 'Cashmere', 'Viscose', 'Acrylic', 'Spandex',
]
