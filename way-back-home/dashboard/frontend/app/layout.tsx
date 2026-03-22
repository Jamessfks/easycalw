import type { Metadata } from 'next'
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Display font - playful, rounded, perfect for headers
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// Body font - clean, readable
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Mono font - for coordinates and data
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://waybackhome.dev'

export const metadata: Metadata = {
  metadataBase: new URL(frontendUrl),
  title: 'Way Back Home | Find Your Way Through the Stars',
  description: 'An immersive AI-powered workshop where stranded space explorers collaborate to find their way home.',
  keywords: ['AI', 'workshop', 'Gemini', 'Google Cloud', 'space', 'adventure'],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Way Back Home',
    description: 'An immersive AI-powered workshop where stranded space explorers use AI to find their way home.',
    type: 'website',
    url: frontendUrl,
    siteName: 'Way Back Home',
    images: [
      {
        url: '/banner.png',
        width: 2560,
        height: 1440,
        alt: 'Way Back Home - Find Your Way Through the Stars',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Way Back Home',
    description: 'An immersive AI-powered workshop where stranded space explorers use AI to find their way home.',
    images: ['/banner.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-space-void overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}