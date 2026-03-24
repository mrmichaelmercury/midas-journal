import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Midas Journal — The Midas Touch Trading Group',
  description: 'Premium trading journal for The Midas Touch Trading Community. Track, analyze, and improve your Crazy Horse ORB strategy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0f0f0f] text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
