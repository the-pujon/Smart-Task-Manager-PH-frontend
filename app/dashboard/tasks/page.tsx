'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth, initializeTasks } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'

export default function TasksPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentUserId = useAppSelector(state => state.auth.currentUserId)
  const tasks = useAppSelector(state => state.tasks.tasks)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    dispatch(initializeAuth())
    dispatch(initializeTasks())
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-1 sm:mb-2 tracking-tight">Tasks</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">View and manage all tasks</p>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {tasks.length === 0 ? (
              <Card className="border-border/60 p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No tasks yet. Create one to get started.</p>
              </Card>
            ) : (
              tasks.map(task => (
                <Card key={task.id} className="border-border/60 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{task.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent whitespace-nowrap flex-shrink-0">
                      {task.status}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
