import { ReactNode } from 'react'

interface WiiCardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function WiiCard({ children, className = '', padding = true }: WiiCardProps) {
  return (
    <div className={`wii-card ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  )
}
