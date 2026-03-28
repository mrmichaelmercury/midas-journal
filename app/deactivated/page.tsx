'use client'

import Link from 'next/link'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function DeactivatedPage() {
  useEffect(() => {
    // Sign out the user so their session is cleared
    signOut({ redirect: false })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/30">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h1 className="text-2xl font-black text-gray-900">Access Deactivated</h1>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Your Midas Edge account has been deactivated. This typically happens when your Midas Touch membership is no longer active.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          To restore access, please contact an admin or rejoin the Midas Touch community.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://www.skool.com/midas-touch-challenge-5991/about"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            Rejoin Midas Touch
          </a>
          <Link
            href="/login"
            className="bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
