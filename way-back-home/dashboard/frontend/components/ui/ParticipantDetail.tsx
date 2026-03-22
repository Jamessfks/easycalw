'use client'

/**
 * Participant Detail Panel
 * Shows when a participant marker is clicked
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, getLevelColor, getLevelName, getParticipantLevel, getCompletionPercentage, getLevelCompletionStatus } from '@/lib/store'

const SHARING_TEMPLATES = [
  "Option 1: The Multi-Agent Architect 🚀\nMission Update: I'm home! 🌌 I, {user_name}, have completed {progress_percent}% of the quest and finally cleared the path back. Building a specialized Multi-Agent System with Google Cloud MCP servers, Graph RAG, and Gemini Live was the key to my survival. The beacon is bright and the journey is won!\n\n🛰️ #buildwithai @GoogleCloud #WayBackHomeAI",
  "Option 2: The Agentic Evolution 🧠\nI can see the landing lights—I'm home! 🤖 I, {user_name}, am {progress_percent}% through the mission. The age of the Multi-Agent System at #WayBackHomeAI made the impossible possible. Using A2A coordination and Graph RAG, I've mastered the stars. Destination reached!\n\n🛰️ #buildwithai #MultiAgent @GoogleCloud",
  "Option 3: The Multimodal Masterclass 👁️\nFinal entry: I'm home! 👁️👂 Quest status: {progress_percent}% done. I, {user_name}, built a Multi-Agent System that used 'eyes' and 'ears' to navigate the void. Thanks to Google Cloud MCP servers and Gemini Live, the rescue is complete and I'm safely back on base. The future is multimodal!\n\n⚡ #buildwithai #MultiAgent @GoogleCloud #WayBackHomeAI",
  "Option 4: The Neural Sync Pilot 🖐️\nTouchdown! I, {user_name}, have cleared {progress_percent}% of the mission and I'm finally home! ⚡ Establishing a 'Neural Sync' via Gemini Live was the final piece of the puzzle. My Multi-Agent System handled the rest. High-speed, autonomous, and safely back on Earth!\n\n🛸 #buildwithai #MultiAgent #WayBackHomeAI",
  "Option 5: The Specialized Rescue Crew 🛠️\nI'm home! I can finally breathe! 🆘 Progress: {progress_percent}%. I, {user_name}, orchestrated a Multi-Agent System that lit up the galaxy. With Google Cloud MCP servers and Graph RAG, we found the coordinates and secured the extraction. Home never looked so good!\n\n🔦🏁 #buildwithai #MultiAgent @GoogleCloud",
  "Option 6: The \"Live Wire\" Hub 👁️\nConnection established: I'm home! 👁️ I, {user_name}, am {progress_percent}% through the #WayBackHomeAI quest. Building a Multi-Agent System with bidirectional streaming allowed me to bridge the gap between worlds. Low-latency, live, and safely returned!\n\n⚡ #buildwithai #MultiAgent @GoogleCloud",
  "Option 7: The Data-Driven Explorer 🪐\nI've reached the final frontier: I'm home! 🚀 I, {user_name}, just hit {progress_percent}% and confirmed our arrival. My Multi-Agent System used star catalogs via Google Cloud MCP servers and Graph RAG to solve the final mystery. A multimodal masterpiece that brought me back!\n\n🛸✨ #buildwithai #MultiAgent #GoogleCloud",
  "Option 8: Interactive Multi-Agent Logic 🖐️\nLogic confirmed, course set—I'm home! 🌌 I, {user_name}, have locked in {progress_percent}% of the quest. My specialized Multi-Agent System used Google Cloud MCP servers and Gemini Live to outsmart the rift. I’m back and the mission is a total success!\n\n🛰️🧠 #buildwithai #MultiAgent #WayBackHomeAI",
  "Option 9: The Real-Time Sentinel 🚁\nExtraction complete: I, the {user_name}, am home! 🚀 I'm {progress_percent}% ready for the next adventure now that I'm safe. My Multi-Agent System on Cloud Run acted as my eyes and ears until the very end. This is what the future of AI looks like!\n\n🦾⚡ #buildwithai #MultiAgent @GoogleCloud",
  "Option 10: The Ultimate Rescue Loop 🛠️\nFinal Mission Log: I'M HOME! 🏁 I, {user_name}, am {progress_percent}% finished with this legendary quest. Using Google Cloud MCP servers, Graph RAG, and Gemini Live, we rescued the survivors and made it back in record time. Mission accomplished!\n\n🚀✨ #buildwithai #MultiAgent #CloudRun"
];

export function ParticipantDetail() {
  const { selectedParticipant, setSelectedParticipant, currentUserId, event } = useMapStore()

  const isCurrentUser = selectedParticipant?.participant_id === currentUserId
  const level = selectedParticipant ? getParticipantLevel(selectedParticipant) : 0
  const levelColor = selectedParticipant ? getLevelColor(level) : ''
  const levelName = selectedParticipant ? getLevelName(level) : ''

  return (
    <AnimatePresence>
      {selectedParticipant && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="glass-panel p-5 w-72"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedParticipant(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-space-void-lighter/50 
                       flex items-center justify-center text-space-lavender/60 
                       hover:text-space-cream hover:bg-space-void-lighter transition-colors"
          >
            ✕
          </button>

          {/* Avatar and name */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`
                w-16 h-16 rounded-xl overflow-hidden border-2 shadow-lg
                ${isCurrentUser ? 'border-space-orange shadow-glow-orange' : 'border-space-cream/30'}
              `}
            >
              {selectedParticipant.icon_url ? (
                <img
                  src={selectedParticipant.icon_url}
                  alt={selectedParticipant.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl font-bold text-space-void"
                  style={{ backgroundColor: levelColor }}
                >
                  {selectedParticipant.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-semibold text-space-cream truncate">
                {selectedParticipant.username}
              </h3>
              <p className="text-space-lavender/60 text-sm font-mono">
                @{selectedParticipant.username}
              </p>
              {isCurrentUser && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full 
                               bg-space-orange/20 text-space-orange text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-space-orange animate-pulse" />
                  You
                </span>
              )}
            </div>
          </div>

          {/* Level badge */}
          <div className="mb-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: `${levelColor}20`,
                color: levelColor,
              }}
            >
              <span className="text-sm">Level {level}</span>
              <span className="text-xs opacity-70">•</span>
              <span className="text-sm font-medium">{levelName}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-space-lavender/60 mb-1">
              <span>Journey Progress</span>
              <span>{selectedParticipant ? getCompletionPercentage(selectedParticipant) : 0}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${selectedParticipant ? getCompletionPercentage(selectedParticipant) : 0}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="progress-bar-fill"
              />
            </div>
          </div>


          {/* Coordinates */}
          <div className="coord-badge mb-4">
            <span className="text-space-lavender/40">📍</span>
            <span>
              {(selectedParticipant.x - 180).toFixed(1)}°,
              {(selectedParticipant.y - 90).toFixed(1)}°
            </span>
          </div>


          {/* Share Buttons */}
          {getCompletionPercentage(selectedParticipant) >= 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-space-lavender/60 mb-2 uppercase tracking-wider">
                Share Progress
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const template = SHARING_TEMPLATES[Math.floor(Math.random() * SHARING_TEMPLATES.length)];
                    const cleanTemplate = template.split('\n').slice(1).join('\n'); // Remove "Option X" header

                    const text = cleanTemplate
                      .replace('{user_name}', selectedParticipant.username)
                      .replace('{progress_percent}', String(getCompletionPercentage(selectedParticipant)));

                    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${selectedParticipant.participant_id}?eventCode=${selectedParticipant.event_code}` : '';

                    const fullText = `${text}\n\n${shareUrl}`;

                    // For Twitter, we use fullText which includes the URL
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank');
                  }}
                  className="flex-1 bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg 
                           flex items-center justify-center gap-2 transition-colors border border-white/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-xs font-medium">Heading home</span>
                </button>
                <button
                  onClick={() => {
                    const template = SHARING_TEMPLATES[Math.floor(Math.random() * SHARING_TEMPLATES.length)];
                    const cleanTemplate = template.split('\n').slice(1).join('\n'); // Remove "Option X" header

                    const text = cleanTemplate
                      .replace('{user_name}', selectedParticipant.username)
                      .replace('{progress_percent}', String(getCompletionPercentage(selectedParticipant)));

                    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${selectedParticipant.participant_id}?eventCode=${selectedParticipant.event_code}` : '';

                    const fullText = `${text}\n\n${shareUrl}`;

                    // For LinkedIn, explicitly include link in text, AND pass url param for card scraping
                    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                  className="flex-1 bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-[#0077b5] p-2 rounded-lg 
                           flex items-center justify-center gap-2 transition-colors border border-[#0077b5]/20"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.22-.44-2-1.45-2-.79 0-1.26.54-1.46 1.05-.07.35-.09.84-.09 1.33V19h-3s.04-7.79 0-8.58h3v1.36c-.05.13-.15.34-.15.34l.05-.05A3.17 3.17 0 0115.7 10.7c2.1 0 3.68 1.37 3.68 4.31z" />
                  </svg>
                  <span className="text-xs font-medium">Heading home</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Progress tracker showing all levels
 */
export function ProgressTracker({ currentLevel = 0, completionStatus }: { currentLevel?: number, completionStatus?: boolean[] }) {
  const levels = [
    { id: 0, name: 'Identity', icon: '🧑‍🚀', description: 'Create your explorer avatar' },
    { id: 1, name: 'Signal', icon: '📡', description: 'Establish communication' },
    { id: 2, name: 'Navigate', icon: '🧭', description: 'Chart your course' },
    { id: 3, name: 'Journey', icon: '🚀', description: 'Begin the voyage' },
    { id: 4, name: 'Challenge', icon: '⭐', description: 'Optional challenge' },
    { id: 5, name: 'Home', icon: '🏠', description: 'Reach your destination' },
  ]

  return (
    <div className="glass-panel p-4">
      <h3 className="font-display text-sm font-semibold text-space-lavender mb-3">
        Your Journey
      </h3>

      <div className="space-y-2">
        {levels.map((level, index) => {
          // Check if this specific level is completed (supports non-sequential completion)
          const isCompleted = completionStatus?.[level.id] ?? (currentLevel > level.id)
          const isCurrent = !isCompleted && (completionStatus?.[level.id - 1] ?? currentLevel === level.id)
          const isLocked = !isCompleted && !isCurrent

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-2 rounded-lg transition-colors
                ${isCurrent ? 'bg-space-orange/10' : ''}
                ${isLocked ? 'opacity-50' : ''}
              `}
            >
              {/* Status indicator */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${isCompleted
                    ? 'bg-space-mint text-space-void'
                    : isCurrent
                      ? 'bg-space-orange text-space-void animate-pulse-soft'
                      : 'bg-space-void-lighter text-space-lavender/40'
                  }
                `}
              >
                {isCompleted ? '✓' : level.icon}
              </div>

              {/* Level info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm font-medium
                    ${isCurrent ? 'text-space-orange' : 'text-space-cream'}
                  `}>
                    {level.name}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-space-orange/20 text-space-orange">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-space-lavender/50 truncate">
                  {level.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default ParticipantDetail