'use client'

import { useState, useEffect } from 'react'

export function useAutoReassign() {
  const [autoReassignEnabled, setAutoReassignEnabled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('autoReassignEnabled')
    setAutoReassignEnabled(saved === 'true')
  }, [])

  const updateAutoReassign = (value: boolean) => {
    setAutoReassignEnabled(value)
    localStorage.setItem('autoReassignEnabled', String(value))
  }

  return { autoReassignEnabled, setAutoReassignEnabled: updateAutoReassign }
}
