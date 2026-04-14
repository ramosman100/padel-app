import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header card */}
        <div className="wii-card p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="wii-card p-3 flex flex-col items-center gap-2">
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
        {/* Match list */}
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-white/60">
            <Skeleton className="h-3 w-32" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-white/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-14 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
