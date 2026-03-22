/**
 * Way Back Home API Client
 * Handles all communication with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.waybackhome.dev'

// =============================================================================
// Types
// =============================================================================

export interface Event {
  code: string
  name: string
  description: string
  max_participants: number
  participant_count: number
  created_at: string
  active: boolean
}

export interface Participant {
  id: string
  event_code: string
  username: string
  display_name: string
  current_level: number
  location: {
    x: number
    y: number
  } | null
  portrait_url: string | null
  icon_url: string | null
  created_at: string
  active: boolean
  registered: boolean
}

export interface ParticipantOnMap {
  participant_id: string
  username: string
  event_code: string
  x: number
  y: number
  location_confirmed: boolean
  portrait_url: string | null
  icon_url: string | null
  suit_color: string | null
  registered_at: string | null
  active: boolean

  // Optional Firebase overrides (take precedence when present)
  level_0_complete?: boolean
  level_1_complete?: boolean
  level_2_complete?: boolean
  level_3_complete?: boolean
  level_4_complete?: boolean
  level_5_complete?: boolean
  completion_percentage?: number  // 0-100, overrides derived percentage
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch event details by code
 */
export async function getEvent(eventCode: string): Promise<Event> {
  const res = await fetch(`${API_BASE_URL}/events/${eventCode}`, {
    next: { revalidate: 30 }, // Cache for 30 seconds
  })

  if (!res.ok) {
    throw new Error(`Event not found: ${eventCode}`)
  }

  return res.json()
}

/**
 * Fetch all participants for an event (with locations)
 */
export async function getEventParticipants(eventCode: string): Promise<ParticipantOnMap[]> {
  const res = await fetch(`${API_BASE_URL}/events/${eventCode}/participants`, {
    next: { revalidate: 10 }, // Cache for 10 seconds
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch participants for event: ${eventCode}`)
  }

  return res.json()
}

/**
 * Check if username is available
 */
export async function checkUsername(eventCode: string, username: string): Promise<boolean> {
  const res = await fetch(
    `${API_BASE_URL}/events/${eventCode}/check-username/${encodeURIComponent(username)}`
  )

  if (!res.ok) {
    return false
  }

  const data = await res.json()
  return data.available
}

/**
 * Get participant by ID
 */
export async function getParticipant(participantId: string): Promise<Participant> {
  const res = await fetch(`${API_BASE_URL}/participants/${participantId}`)

  if (!res.ok) {
    throw new Error(`Participant not found: ${participantId}`)
  }

  return res.json()
}

// =============================================================================
// Polling Hook Data Fetcher
// =============================================================================

/**
 * Fetch participants for real-time updates (client-side)
 */
export async function fetchParticipantsClient(eventCode: string): Promise<ParticipantOnMap[]> {
  const res = await fetch(`${API_BASE_URL}/events/${eventCode}/participants`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch participants')
  }

  return res.json()
}