'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { createReport } from '@/actions/createReport'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MapPin, Camera, AlertTriangle, Trash2, Lightbulb, HelpCircle, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'POTHOLE', label: 'Pothole', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'GARBAGE', label: 'Garbage Dump', icon: Trash2, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'LIGHTING', label: 'Street Light', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'OTHER', label: 'Other Issue', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
]

export default function NewReportPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState('POTHOLE')
  const [address, setAddress] = useState('')

  const handleGetLocation = () => {
    setLocationStatus('Getting location...')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          setLocation({ lat, lng })
          setLocationStatus('Coordinates acquired. Fetching address...')

          try {
            // Reverse Geocoding using OpenStreetMap (Nominatim)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            const data = await response.json()

            if (data && data.display_name) {
              setAddress(data.display_name)
              setLocationStatus('Location and address acquired!')
            } else {
              setLocationStatus('Location acquired, but address lookup failed.')
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error)
            setLocationStatus('Location acquired. Could not fetch address.')
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationStatus('GPS failed. Trying IP location...')

          // IP Fallback
          fetch('https://ipwho.is/')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                const lat = data.latitude
                const lng = data.longitude
                setLocation({ lat, lng })
                setAddress(`${data.city}, ${data.region} (Approximate)`)
                setLocationStatus('Approximate location found via Network.')
              } else {
                throw new Error("IP Geolocation failed")
              }
            })
            .catch(ipError => {
              console.error("IP fallback error:", ipError)
              let errorMessage = 'Failed to get location.'
              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage = 'Location permission denied. Please enable it or try again.'
                  break
                case 2: // POSITION_UNAVAILABLE
                  errorMessage = 'Location signal unavailable.'
                  break
                case 3: // TIMEOUT
                  errorMessage = 'Location request timed out.'
                  break
              }
              setLocationStatus(errorMessage)
              // Only default if everything fails
              setLocation({ lat: 20.2961, lng: 85.8245 })
            })
        }
      )
    } else {
      setLocationStatus('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('authorId', user.id)
    formData.append('category', selectedCategory)
    // Ensure address is updated in formData since we use controlled state
    formData.set('address', address)

    if (location) {
      formData.append('latitude', location.lat.toString())
      formData.append('longitude', location.lng.toString())
    } else {
      // Default if user skipped location
      formData.append('latitude', '20.2961')
      formData.append('longitude', '85.8245')
    }

    try {
      const result = await createReport(formData)
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 px-4 md:px-0 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

          <CardHeader className="text-center pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-800 px-4 md:px-6">
            <CardTitle className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Submit New Report</CardTitle>
            <CardDescription className="text-sm md:text-lg mt-2">
              Found an issue? Report it here and earn karma points!
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

              {/* Category Selection */}
              <div className="space-y-3 md:space-y-4">
                <Label className="text-base md:text-lg font-semibold">What type of issue is it?</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = selectedCategory === cat.id
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "cursor-pointer relative flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95",
                          isSelected
                            ? `${cat.border} ${cat.bg}`
                            : "border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-blue-500">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div className={cn("p-2 md:p-3 rounded-full bg-white dark:bg-black shadow-sm", cat.color)}>
                          <Icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className={cn("font-medium text-xs md:text-sm text-center", isSelected ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                          {cat.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm md:text-base">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Large pothole on Main St"
                      required
                      className="h-10 md:h-12 text-base md:text-lg bg-white/50 dark:bg-black/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the issue in detail..."
                      required
                      className="min-h-[120px] md:min-h-[150px] text-sm md:text-base bg-white/50 dark:bg-black/20 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm md:text-base">Address / Landmark</Label>
                    <Input
                      id="address"
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near Central Park gate"
                      required
                      className="h-10 md:h-12 text-base md:text-lg bg-white/50 dark:bg-black/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Location</Label>
                    <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-3 md:gap-4 text-center min-h-[120px] md:min-h-[150px]">
                      {location ? (
                        <div className="flex flex-col items-center gap-1 md:gap-2 text-green-600">
                          <div className="p-2 md:p-3 bg-green-100 rounded-full">
                            <MapPin size={20} className="md:w-6 md:h-6" />
                          </div>
                          <span className="font-medium text-sm md:text-base">Location Pinned!</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MapPin size={24} className="opacity-20 md:w-8 md:h-8" />
                          <span className="text-sm md:text-base">We need your location to verify the report</span>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant={location ? "outline" : "default"}
                        onClick={handleGetLocation}
                        className="gap-2 h-9 md:h-10 text-xs md:text-sm"
                      >
                        <MapPin size={14} className="md:w-4 md:h-4" />
                        {location ? 'Update Location' : 'Get Current Location'}
                      </Button>
                      {locationStatus && (
                        <span className="text-[10px] md:text-xs text-muted-foreground animate-pulse">{locationStatus}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload Placeholder - Visual Only for now */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Evidence (Optional)</Label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-8 flex flex-col items-center justify-center gap-2 md:gap-4 text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer">
                  <Camera size={24} className="md:w-8 md:h-8" />
                  <span className="text-sm md:text-base">Click to upload photos of the issue</span>
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <Button type="submit" size="lg" className="w-full h-12 md:h-14 text-base md:text-lg gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
