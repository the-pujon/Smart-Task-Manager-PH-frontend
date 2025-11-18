import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/lib/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector as <T>(selector: (state: RootState) => T) => T
