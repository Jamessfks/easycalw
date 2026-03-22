'use client'

/**
 * Event Map Page
 * The main 3D interactive map view for an event
 */

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, getParticipantLevel, getLevelCompletionStatus } from '@/lib/store'
import { fetchParticipantsClient, getEvent } from '@/lib/api'
import type { Event, ParticipantOnMap } from '@/lib/api'

// UI Components
import { MapTitle, MapFooterLinks } from '@/components/ui/Title'
import { ParticipantDetail, ProgressTracker } from '@/components/ui/ParticipantDetail'
import { ParticipantList, EventStats } from '@/components/ui/ParticipantList'
import { LoadingScreen, ErrorScreen } from '@/components/ui/Loading'

// Dynamic import for Three.js (no SSR)
const Scene3D = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

interface EventMapClientProps {
  eventCode: string
  initialEvent: Event
  initialParticipants: ParticipantOnMap[]
}

export function EventMapClient({
  eventCode,
  initialEvent,
  initialParticipants
}: EventMapClientProps) {
  const {
    setEvent,
    setParticipants,
    setIsLoading,
    isLoading,
    autoRotate,
    setAutoRotate,
    selectedParticipant,
    currentUserId,
    participants,
  } = useMapStore()

  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)

  // Initialize store with server data
  useEffect(() => {
    setEvent(initialEvent)
    setParticipants(initialParticipants)
    setIsLoading(false)

    const urlParams = new URLSearchParams(window.location.search)

    // Check for "me" (current user identity)
    const myId = urlParams.get('me') || localStorage.getItem(`wbh-${eventCode}-id`)
    if (myId) {
      useMapStore.getState().setCurrentUserId(myId)
    }

    // Check for "share" (deep link to specific participant)
    const shareId = urlParams.get('share')
    if (shareId) {
      const target = initialParticipants.find(p => p.participant_id === shareId)
      if (target) {
        useMapStore.getState().setSelectedParticipant(target)
      }
    }
  }, [initialEvent, initialParticipants, setEvent, setParticipants, setIsLoading, eventCode])

  // Poll for participant updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const updatedParticipants = await fetchParticipantsClient(eventCode)
        setParticipants(updatedParticipants)
      } catch (err) {
        console.error('Failed to fetch participants:', err)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [eventCode, setParticipants])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useMapStore.getState().setSelectedParticipant(null)
      }
      if (e.key === 'r' || e.key === 'R') {
        setAutoRotate(!autoRotate)
      }
      if (e.key === 'h' || e.key === 'H') {
        setShowControls(!showControls)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [autoRotate, setAutoRotate, showControls])

  if (error) {
    return <ErrorScreen message={error} />
  }

  // Find current user's participant data
  const currentUserParticipant = participants.find(p => p.participant_id === currentUserId)
  // Get current user's level using helper (supports Firebase overrides)
  const currentUserLevel = currentUserParticipant
    ? getParticipantLevel(currentUserParticipant)
    : 0

  // Get detailed completion status (for non-sequential levels)
  const currentUserCompletionStatus = currentUserParticipant
    ? getLevelCompletionStatus(currentUserParticipant)
    : undefined

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Scene */}
      <Scene3D />

      {/* UI Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-layer"
          >
            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between pointer-events-none">
              {/* Left: Title and stats */}
              <div className="space-y-3 pointer-events-auto">
                <MapTitle eventName={initialEvent.name} />
                <EventStats />
              </div>

              {/* Right: Participant list */}
              <div className="pointer-events-auto">
                <ParticipantList />
              </div>
            </div>

            {/* Bottom left: Progress tracker (if logged in) */}
            {currentUserParticipant && (
              <div className="fixed bottom-4 md:bottom-6 left-4 md:left-6 w-64 pointer-events-auto">
                <ProgressTracker
                  currentLevel={currentUserLevel}
                  completionStatus={currentUserCompletionStatus}
                />
              </div>
            )}

            {/* Bottom right: Selected participant detail */}
            <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 pointer-events-auto">
              <ParticipantDetail />
            </div>

            {/* Bottom center: Controls hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="flex items-center gap-4 text-xs text-space-lavender/40">
                <span>Drag to rotate</span>
                <span>•</span>
                <span>Scroll to zoom</span>
                <span>•</span>
                <span>Click markers to select</span>
                <span>•</span>
                <span className="text-space-lavender/60">[H] toggle UI</span>
              </div>
            </motion.div>

            {/* Bottom center: Auto-rotate toggle + links */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${autoRotate
                    ? 'bg-space-orange/20 text-space-orange'
                    : 'bg-space-void-lighter/50 text-space-lavender/60'
                  }
                `}
              >
                {autoRotate ? '🌍 Rotating' : '🌍 Paused'}
              </button>

              <MapFooterLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle UI hint when hidden */}
      {!showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-space-lavender/40"
        >
          Press [H] to show UI
        </motion.div>
      )}
    </div>
  )
}

export default EventMapClient