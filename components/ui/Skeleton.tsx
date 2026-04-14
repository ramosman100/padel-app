export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/50 ${className}`} />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`wii-card animate-pulse ${className}`} />
}
