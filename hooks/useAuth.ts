'use client'

import { useAppSelector } from '@/redux/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuth = () => {
  const currentUser = useAppSelector((state) => state.authUI.currentUser)
  const accessToken = useAppSelector((state) => state.authUI.accessToken)
  
  const isAuthenticated = !!(currentUser && accessToken)
  
  return {
    currentUser,
    accessToken,
    isAuthenticated,
  }
}

export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])
  
  return { isAuthenticated }
}

export const useRedirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])
  
  return { isAuthenticated }
}
