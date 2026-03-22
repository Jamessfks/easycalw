'use client'

import { create } from 'zustand'
import type { ParticipantOnMap, Event } from './api'

interface MapState {
  // Event data
  event: Event | null
  setEvent: (event: Event) => void

  // Participants
  participants: ParticipantOnMap[]
  setParticipants: (participants: ParticipantOnMap[]) => void

  // Selected participant (for detail view)
  selectedParticipant: ParticipantOnMap | null
  setSelectedParticipant: (participant: ParticipantOnMap | null) => void

  // Current user (if viewing their own profile)
  currentUserId: string | null
  setCurrentUserId: (id: string | null) => void

  // UI State
  showParticipantList: boolean
  toggleParticipantList: () => void

  // Camera controls
  autoRotate: boolean
  setAutoRotate: (value: boolean) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (value: boolean) => void
}

export const useMapStore = create<MapState>((set) => ({
  // Event
  event: null,
  setEvent: (event) => set({ event }),

  // Participants
  participants: [],
  setParticipants: (participants) => set({ participants }),

  // Selection
  selectedParticipant: null,
  setSelectedParticipant: (participant) => set({ selectedParticipant: participant }),

  // Current user
  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),

  // UI
  showParticipantList: false,
  toggleParticipantList: () => set((state) => ({ showParticipantList: !state.showParticipantList })),

  // Camera
  autoRotate: true,
  setAutoRotate: (value) => set({ autoRotate: value }),

  // Loading
  isLoading: true,
  setIsLoading: (value) => set({ isLoading: value }),
}))

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert 2D map coordinates to 3D sphere position
 * x, y are in range [0, 1]
 */
export function coordsToSphere(x: number, y: number, radius: number = 2): [number, number, number] {
  // Map x to longitude (0-360 degrees -> 0-2π)
  const longitude = x * Math.PI * 2

  // Map y to latitude (-90 to 90 degrees -> -π/2 to π/2)
  const latitude = (y - 0.5) * Math.PI

  // Convert spherical to Cartesian
  const posX = radius * Math.cos(latitude) * Math.cos(longitude)
  const posY = radius * Math.sin(latitude)
  const posZ = radius * Math.cos(latitude) * Math.sin(longitude)

  return [posX, posY, posZ]
}

/**
 * Get level color based on progress
 */
export function getLevelColor(level: number): string {
  const colors = [
    '#E8A87C', // Level 0 - Terracotta (just landed)
    '#A8E6CF', // Level 1 - Mint (making progress)
    '#C4B5E0', // Level 2 - Lavender (advancing)
    '#F8B4B4', // Level 3 - Peach (almost there)
    '#FF9F43', // Level 4+ - Orange (home!)
  ]
  return colors[Math.min(level, colors.length - 1)]
}

/**
 * Get level name
 */
export function getLevelName(level: number): string {
  const names = [
    'Stranded',
    'Survivor',
    'Explorer',
    'Navigator',
    'Pathfinder',
    'Homebound',
  ]
  return names[Math.min(level, names.length - 1)]
}

// =============================================================================
// Firebase Override Helper Functions
// =============================================================================

/**
 * Get array of level completion statuses (for individual level display)
 * Priority: Firebase level_x_complete > derived logic
 */
export function getLevelCompletionStatus(participant: ParticipantOnMap): boolean[] {
  return [0, 1, 2, 3, 4, 5].map(levelId => {
    const overrideKey = `level_${levelId}_complete` as keyof ParticipantOnMap
    const override = participant[overrideKey]

    if (typeof override === 'boolean') {
      return override
    }

    // Fallback: derived logic
    // Level 0 (Identity) is complete only if location is confirmed (marking move to Level 1)
    // This preserves the old behavior where Level 0 was "Current" (incomplete) for new users
    if (levelId === 0) return participant.location_confirmed === true

    // All other levels default to incomplete in the derived system
    return false
  })
}

/**
 * Get participant's current level (for display purposes)
 * Returns the Highest Completed Level + 1 (The level they are working on)
 */
export function getParticipantLevel(participant: ParticipantOnMap): number {
  const completionStatus = getLevelCompletionStatus(participant)

  // Find highest completed level
  let highestCompleted = -1
  for (let i = completionStatus.length - 1; i >= 0; i--) {
    if (completionStatus[i]) {
      highestCompleted = i
      break
    }
  }

  // Current level is the one after the highest completed one
  // e.g., if Level 0 is done, we are on Level 1
  return highestCompleted + 1
}

/**
 * Get overall journey completion percentage
 * Priority: Firebase completion_percentage > derived from level
 */
export function getCompletionPercentage(participant: ParticipantOnMap): number {
  if (typeof participant.completion_percentage === 'number') {
    return participant.completion_percentage
  }

  // Fallback: Use the exact original formula logic (based on current level)
  // calculated from our new getParticipantLevel
  const level = getParticipantLevel(participant)
  return Math.min(level * 25, 100)
}