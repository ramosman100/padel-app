import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <Skeleton className="h-9 w-48 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-36 rounded-3xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/50">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
