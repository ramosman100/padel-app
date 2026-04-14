import type { Metadata, Viewport } from 'next'
import './globals.css'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/ui/BottomNav'

export const metadata: Metadata = {
  title: 'Padel Club',
  description: 'Track padel tennis matches, rankings and upcoming games with your crew',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Padel Club',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#4CAF88',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="hidden md:block">
          <NavBar user={user} />
        </div>
        <main className="flex-1 page-content">{children}</main>
        <div className="md:hidden">
          <BottomNav user={user} />
        </div>
      </body>
    </html>
  )
}
