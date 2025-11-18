'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { TeamManager } from '@/components/team-manager'
import { Card } from '@/components/ui/card'
// import { useGetTeamsQuery } from '@/redux/api/teamApi'

export default function TeamsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  // const currentUserId = useAppSelector(state => state.auth.currentUserId)
  const [initialized, setInitialized] = useState(false)


  // useEffect(() => {
  //   dispatch(initializeAuth())
  //   setInitialized(true)
  // }, [dispatch])

  // useEffect(() => {
  //   if (initialized && !currentUserId) {
  //     router.push('/login')
  //   }
  // }, [initialized, currentUserId, router])

  // if (!initialized || !currentUserId) {
  //   return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  // }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:max-w-7xl lg:mx-auto">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Teams</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage your teams and team members</p>
          </div>
          <Card className="border-border/60 p-4 sm:p-6">
            <TeamManager />
          </Card>
        </main>
      </div>
    </div>
  )
}
