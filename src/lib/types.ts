export interface Activity {
  id: string
  name: string
  description: string | null
  city: string | null
  country: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  images: string[] | null
  image_url: string | null
  is_sidequest: boolean | null
  sidequest_score: number | null
  experience_tag: string | null
  cost_tier: string | null
  duration_minutes: number | null
  tags: string[] | null
  estimated_cost: number | null
  source: string | null
  created_at: string
}

export interface Trip {
  id: string
  owner_id: string
  title: string
  destinations: string[] | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string | null
  mode: 'planning' | 'active' | 'reflection' | 'completed' | null
  invite_code: string | null
  status: string | null
  created_at: string
  updated_at: string | null
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: string
  created_at: string
  profile?: Profile
}

export interface Profile {
  id: string
  email: string | null
  name: string | null
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  stats: Record<string, unknown> | null
  xp: number | null
  rank: string | null
  created_at: string
}

export interface SavedActivity {
  id: string
  user_id: string
  activity_id: string
  is_super_like: boolean
  created_at: string
  activity?: Activity
}

export interface ProposalRow {
  trip_id: string
  activity_id: string
  activity_name: string
  activity_description: string | null
  category: string | null
  neighborhood: string | null
  city: string | null
  images: string[] | null
  image_url: string | null
  is_custom: boolean
  proposed_by: string | null
  proposed_by_name: string | null
  proposed_at: string | null
  votes_up: string[]
  votes_down: string[]
  upvote_count: number
  downvote_count: number
  net_votes: number
}

export interface Itinerary {
  id: string
  creator_id: string
  title: string
  description: string | null
  destinations: string[] | null
  total_days: number | null
  estimated_budget: number | null
  is_public: boolean
  created_at: string
}

export interface WaitlistEntry {
  id?: string
  email: string
  created_at?: string
}
