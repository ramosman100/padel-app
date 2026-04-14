import { Skeleton } from '@/components/ui/Skeleton'

export default function CalendarLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="wii-card p-4">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-14 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-1.5 mt-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/60 flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
