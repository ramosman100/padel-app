import { Skeleton } from '@/components/ui/Skeleton'

export default function MatchDetailLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-sm mx-auto space-y-3">
        <Skeleton className="h-9 w-24 rounded-2xl" />
        {/* Date card */}
        <div className="wii-card p-4 flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Score hero */}
        <div className="wii-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="animate-pulse rounded-full bg-white/50" style={{ width: 52, height: 52 }} />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="animate-pulse rounded-full bg-white/50" style={{ width: 52, height: 52 }} />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        {/* Sets */}
        <div className="wii-card p-4 space-y-3">
          <Skeleton className="h-3 w-20 mb-1" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-6 shrink-0" />
              <Skeleton className="h-6 flex-1 rounded-full" />
              <Skeleton className="h-4 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
