'use client'

import { useState, useEffect } from 'react'
import { useUserStore, User } from '@/lib/store'
import { getRewards, redeemReward, getTransactions, getRedemptions, fixSchema } from '@/actions/rewards'
import { getUser, addPoints } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Coins, Gift, ShoppingBag, TreePine, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Reward, Transaction } from '@prisma/client'

export default function RewardsPage() {
  const { user, setUser } = useUserStore()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [redemptions, setRedemptions] = useState<(any)[]>([])
  const [loading, setLoading] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'market' | 'history'>('market')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { rewards } = await getRewards()
      if (rewards) setRewards(rewards)

      if (user) {
        // Live balance sync
        try {
          const latestUser = await getUser(user.id)
          if (latestUser) setUser(latestUser as unknown as User)
        } catch (e) { console.error("Balance sync failed", e) }

        const { transactions } = await getTransactions(user.id)
        if (transactions) setTransactions(transactions)

        const { redemptions } = await getRedemptions(user.id)
        if (redemptions) setRedemptions(redemptions)
      }
      setLoading(false)
    }
    fetchData()
  }, [user?.id]) // specific dependency to avoid loops but ensure refresh on login

  const handleRedeem = async (reward: Reward) => {
    if (!user) return
    if (user.walletBalance < reward.cost) {
      alert('Insufficient balance!')
      return
    }

    setRedeemingId(reward.id)
    try {
      const result = await redeemReward(user.id, reward.id)
      if (result.success && result.user) {
        setUser(result.user as unknown as User)
        // Refresh transactions
        // Refresh transactions and redemptions
        const { transactions } = await getTransactions(user.id)
        if (transactions) setTransactions(transactions)

        const { redemptions } = await getRedemptions(user.id)
        if (redemptions) setRedemptions(redemptions)

        // Show the code to the user
        // In a real app, use a proper Dialog/Modal. For now, using alert as requested/styled.
        if (result.code) {
          alert(`Successfully redeemed ${reward.name}!\n\nYOUR VOUCHER CODE: ${result.code}\n\n(Saved to History)`)
        } else {
          alert(`Successfully redeemed ${reward.name}!`)
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Redemption failed')
    } finally {
      setRedeemingId(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'CASH': return <Coins className="h-10 w-10 text-yellow-500" />
      case 'MERCH': return <ShoppingBag className="h-10 w-10 text-blue-500" />
      case 'VOUCHER': return <Gift className="h-10 w-10 text-purple-500" />
      default: return <TreePine className="h-10 w-10 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rewards Marketplace</h1>
          <p className="text-muted-foreground">
            Redeem your karma points for exciting rewards.
            Redeem your karma points for exciting rewards.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground mt-2"
            onClick={async () => {
              if (!user) return;
              await addPoints(user.id, 10000);
              window.location.reload();
            }}
          >
            [DEV: Add 10k Points]
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-500 mt-2 ml-2"
            onClick={async () => {
              try {
                const res = await fixSchema();
                if (res.success) {
                  alert("Database Fixed! Try redeeming now.");
                  window.location.reload();
                } else {
                  alert("Fix Result: " + (res.error || "Unknown error"));
                }
              } catch (e) {
                alert("System Error: " + (e as Error).message);
              }
            }}
          >
            [DEV: Fix Database]
          </Button>
        </div>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold text-primary">{user?.walletBalance || 0} pts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'market' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('market')}
          className="rounded-b-none"
        >
          Marketplace
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="rounded-b-none"
        >
          History
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : activeTab === 'market' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all">
              <CardHeader className="bg-gray-50/50 pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getIcon(reward.type)}
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {reward.cost} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <CardTitle className="mb-2">{reward.name}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  onClick={() => handleRedeem(reward)}
                  disabled={redeemingId === reward.id || (user?.walletBalance || 0) < reward.cost}
                  variant={user && user.walletBalance >= reward.cost ? 'default' : 'outline'}
                >
                  {redeemingId === reward.id ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    'Redeem Now'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View your earnings and spendings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {redemptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No rewards redeemed yet.</p>
              ) : (
                redemptions.map((redemption) => (
                  <div key={redemption.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                        {getIcon(redemption.reward.type)}
                      </div>
                      <div>
                        <p className="font-bold">{redemption.reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(redemption.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-slate-100 text-slate-900 font-mono font-bold px-3 py-1 rounded text-sm select-all">
                        {redemption.code || 'NO-CODE'}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{redemption.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
