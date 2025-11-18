'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentUserId = useAppSelector(state => state.auth.currentUserId)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (currentUserId) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [currentUserId, router])

  return null
}
