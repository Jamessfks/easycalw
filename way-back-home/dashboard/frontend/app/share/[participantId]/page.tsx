
import { Metadata } from 'next'
import { getParticipant } from '@/lib/api'
import { redirect } from 'next/navigation'

interface Props {
    params: {
        participantId: string
    }
    searchParams: {
        eventCode?: string
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const participant = await getParticipant(params.participantId)

        // Default to banner if no icon
        const images = participant.icon_url
            ? [participant.icon_url]
            : ['/banner.png']

        return {
            title: `${participant.username}'s Journey | Way Back Home`,
            description: `Follow ${participant.username}'s progress in the Way Back Home mission.`,
            openGraph: {
                title: `${participant.username}'s Journey | Way Back Home`,
                description: `Follow ${participant.username}'s progress in the Way Back Home mission.`,
                images: images,
            },
            twitter: {
                card: 'summary_large_image',
                title: `${participant.username}'s Journey | Way Back Home`,
                description: `Follow ${participant.username}'s progress in the Way Back Home mission.`,
                images: images,
            },
        }
    } catch (error) {
        return {
            title: 'Way Back Home',
            description: 'An immersive AI-powered workshop.',
        }
    }
}

export default async function SharePage({ params, searchParams }: Props) {
    let destination = '/'

    try {
        const participant = await getParticipant(params.participantId)

        // Prefer participant's event_code but fallback to searchParam if somehow mismatch (unlikely)
        const eventCode = participant.event_code || searchParams.eventCode

        if (eventCode) {
            destination = `/e/${eventCode}?share=${params.participantId}`
        }
    } catch (error) {
        // If fetch fails, try to use the provided eventCode from query info
        if (searchParams.eventCode) {
            destination = `/e/${searchParams.eventCode}?share=${params.participantId}`
        }
    }

    redirect(destination)
}
