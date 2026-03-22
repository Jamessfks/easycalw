'use client'

/**
 * Participant List
 * Sidebar showing all explorers in the event with expandable search
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, getLevelColor, getLevelName, getParticipantLevel } from '@/lib/store'

export function ParticipantList() {
  const {
    participants,
    showParticipantList,
    toggleParticipantList,
    setSelectedParticipant,
    selectedParticipant,
    currentUserId,
  } = useMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle search toggle
  const handleSearchToggle = () => {
    if (isSearchOpen) {
      // Closing search — clear query
      setSearchQuery('')
      setIsSearchOpen(false)
    } else {
      // Opening search — also open the list
      setIsSearchOpen(true)
      if (!showParticipantList) {
        toggleParticipantList()
      }
    }
  }

  // Handle search key events
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  // Sort: current user first, then by registration time
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.participant_id === currentUserId) return -1
    if (b.participant_id === currentUserId) return 1
    // Sort by registration time (newest first)
    const aTime = a.registered_at ? new Date(a.registered_at).getTime() : 0
    const bTime = b.registered_at ? new Date(b.registered_at).getTime() : 0
    return bTime - aTime
  })

  // Filter by search query
  const filteredParticipants = searchQuery.trim()
    ? sortedParticipants.filter(p =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : sortedParticipants

  return (
    <>
      {/* Button bar: toggle + search */}
      <div className="flex items-center gap-2">
        {/* Search icon / input */}
        <motion.div
          className="flex items-center glass-panel overflow-hidden"
          animate={{ width: isSearchOpen ? 200 : 40 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSearchToggle}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-space-lavender/70 hover:text-space-cream transition-colors"
            title={isSearchOpen ? 'Close search' : 'Search explorers'}
          >
            {isSearchOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </motion.button>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.input
                ref={searchInputRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search explorers..."
                className="flex-1 min-w-0 bg-transparent text-sm text-space-cream placeholder:text-space-lavender/40 border-none outline-none pr-3 py-2"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Toggle button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleParticipantList}
          className="glass-panel px-4 py-2 flex items-center gap-2 text-space-cream hover:bg-space-void-lighter/70 transition-colors"
        >
          <span className="text-lg">👥</span>
          <span className="font-display text-sm font-medium">
            {participants.length} Explorer{participants.length !== 1 ? 's' : ''}
          </span>
          <motion.span
            animate={{ rotate: showParticipantList ? 180 : 0 }}
            className="text-space-lavender/60"
          >
            ▼
          </motion.span>
        </motion.button>
      </div>

      {/* List panel */}
      <AnimatePresence>
        {showParticipantList && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel mt-2 overflow-hidden"
          >
            {/* Search results count when filtering */}
            {searchQuery.trim() && (
              <div className="px-3 pt-2 pb-1 text-xs text-space-lavender/50 border-b border-space-lavender/10">
                {filteredParticipants.length} result{filteredParticipants.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </div>
            )}

            <div className="p-2 max-h-80 overflow-y-auto scrollbar-hide">
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-8 text-space-lavender/50">
                  <p className="text-2xl mb-2">{searchQuery.trim() ? '🔍' : '🌍'}</p>
                  <p className="text-sm">
                    {searchQuery.trim()
                      ? 'No explorers found'
                      : 'No explorers on the map yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredParticipants.map((participant, index) => {
                    const isCurrentUser = participant.participant_id === currentUserId
                    const isSelected = selectedParticipant?.participant_id === participant.participant_id
                    const level = getParticipantLevel(participant)
                    const levelColor = getLevelColor(level)

                    return (
                      <motion.button
                        key={participant.participant_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedParticipant(participant)}
                        className={`
                          w-full flex items-center gap-3 p-2 rounded-lg text-left
                          transition-colors duration-200
                          ${isSelected
                            ? 'bg-space-lavender/20'
                            : 'hover:bg-space-void-lighter/50'
                          }
                        `}
                      >
                        {/* Avatar */}
                        <div
                          className={`
                            w-9 h-9 rounded-lg overflow-hidden flex-shrink-0
                            border-2 transition-all
                            ${isCurrentUser
                              ? 'border-space-orange shadow-glow-orange'
                              : 'border-transparent'
                            }
                          `}
                        >
                          {participant.icon_url ? (
                            <img
                              src={participant.icon_url}
                              alt={participant.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-sm font-bold text-space-void"
                              style={{ backgroundColor: levelColor }}
                            >
                              {participant.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-space-cream truncate">
                              {participant.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-space-orange">(You)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: levelColor }}
                            />
                            <span className="text-xs text-space-lavender/60">
                              {getLevelName(level)}
                            </span>
                          </div>
                        </div>

                        {/* Level indicator */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: `${levelColor}30`,
                            color: levelColor,
                          }}
                        >
                          {level}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Stats bar showing event statistics
 */
export function EventStats() {
  const { event, participants } = useMapStore()

  if (!event) return null

  // Count participants who have been located (location_confirmed = true)
  const completedCount = participants.filter(p => p.location_confirmed).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-panel px-4 py-3 flex items-center gap-6"
    >
      {/* Total explorers */}
      <div className="flex items-center gap-2">
        <span className="text-space-mint text-lg">👥</span>
        <div>
          <p className="text-space-cream font-display text-lg font-bold">
            {participants.length}
          </p>
          <p className="text-space-lavender/50 text-xs">Explorers</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-space-lavender/20" />

      {/* Location confirmed */}
      <div className="flex items-center gap-2">
        <span className="text-space-orange text-lg">📍</span>
        <div>
          <p className="text-space-cream font-display text-lg font-bold">
            {completedCount}
          </p>
          <p className="text-space-lavender/50 text-xs">Located</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-space-lavender/20" />

      {/* Capacity */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-space-lavender/50">Capacity</span>
            <span className="text-space-cream">
              {participants.length}/{event.max_participants}
            </span>
          </div>
          <div className="w-24 h-1.5 bg-space-void-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-space-mint to-space-lavender rounded-full"
              style={{ width: `${(participants.length / event.max_participants) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ParticipantList