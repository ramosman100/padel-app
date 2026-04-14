import { Skeleton } from '@/components/ui/Skeleton'

export default function HistoryLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-5 px-1">
          <Skeleton className="h-9 w-44 mb-1" />
          <Skeleton className="h-4 w-36" />
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/50">
              <Skeleton className="h-6 w-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
