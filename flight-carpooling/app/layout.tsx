import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEA Offsite Ride Share',
  description: 'Coordinate Uber groups for the company offsite in Seattle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              SEA Offsite Ride Share
            </Link>
            <nav className="flex gap-4 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-900 transition-colors">Register</Link>
              <Link href="/matches" className="hover:text-gray-900 transition-colors">Matches</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
