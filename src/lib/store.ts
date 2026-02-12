import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'CITIZEN' | 'DEPARTMENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  walletBalance: number
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        // Clear persisted storage to prevent rehydration race condition
        if (typeof window !== 'undefined') {
          localStorage.removeItem('civic-pulse-user')
        }
      },
    }),
    {
      name: 'civic-pulse-user',
    }
  )
)
