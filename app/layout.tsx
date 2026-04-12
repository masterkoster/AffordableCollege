import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AffordableCollege',
  description: 'Transfer student platform for university admissions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
