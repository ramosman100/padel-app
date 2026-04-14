import { Skeleton } from '@/components/ui/Skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-64 mb-5" />
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-2.5 border-b border-white/60 bg-white/40">
            <Skeleton className="h-3 w-full" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/50">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1 max-w-[120px]" />
              <div className="flex gap-2 ml-auto">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-6" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
