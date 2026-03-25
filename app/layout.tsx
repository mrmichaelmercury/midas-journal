import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Midas AI — The Complete Trading Toolkit',
  description: 'The complete trading platform for Midas Touch members. Journal, copy trade, AI assistant, analytics, and payout tracking — all in one place.',
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
