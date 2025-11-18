'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth, initializeActivity } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { ActivityPanel } from '@/components/activity-panel'

export default function ActivityPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentUserId = useAppSelector(state => state.auth.currentUserId)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    dispatch(initializeAuth())
    dispatch(initializeActivity())
    setInitialized(true)
  }, [dispatch])

  useEffect(() => {
    if (initialized && !currentUserId) {
      router.push('/login')
    }
  }, [initialized, currentUserId, router])

  if (!initialized || !currentUserId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:max-w-7xl lg:mx-auto">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Activity</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Track recent activities and updates</p>
          </div>
          <ActivityPanel fullPage={true} />
        </main>
      </div>
    </div>
  )
}
