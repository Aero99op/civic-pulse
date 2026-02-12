'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/lib/store'
import { getGuestUser } from '@/actions/user'

export default function AutoLogin() {
    const { user, setUser } = useUserStore()

    useEffect(() => {
        async function initUser() {
            if (!user) {
                const guest = await getGuestUser()
                if (guest) {
                    // @ts-ignore
                    setUser(guest)
                }
            }
        }
        initUser()
    }, [user, setUser])

    return null
}
