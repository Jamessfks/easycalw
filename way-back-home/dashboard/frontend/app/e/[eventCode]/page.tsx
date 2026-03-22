/**
 * Event Map Page
 * Server component that fetches initial data
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getEvent, getEventParticipants } from '@/lib/api'
import EventMapClient from '@/components/EventMapClient'
import { LoadingScreen } from '@/components/ui/Loading'

interface PageProps {
  params: {
    eventCode: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const event = await getEvent(params.eventCode)
    return {
      title: `${event.name} | Way Back Home`,
      description: event.description,
    }
  } catch {
    return {
      title: 'Event Not Found | Way Back Home',
    }
  }
}

export default async function EventPage({ params }: PageProps) {
  const { eventCode } = params
  
  try {
    // Fetch event and participants in parallel
    const [event, participants] = await Promise.all([
      getEvent(eventCode),
      getEventParticipants(eventCode),
    ])
    
    if (!event.active) {
      notFound()
    }
    
    return (
      <Suspense fallback={<LoadingScreen />}>
        <EventMapClient
          eventCode={eventCode}
          initialEvent={event}
          initialParticipants={participants}
        />
      </Suspense>
    )
  } catch (error) {
    notFound()
  }
}
