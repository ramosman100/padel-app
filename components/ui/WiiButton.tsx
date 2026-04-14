'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface WiiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white shadow-lg shadow-wii-green/30 active:scale-95',
  secondary: 'wii-btn-primary bg-wii-blue hover:bg-wii-blue-dark text-white shadow-lg shadow-wii-blue/30 active:scale-95',
  danger: 'bg-wii-red hover:opacity-90 text-white shadow-lg shadow-wii-red/30 active:scale-95',
  ghost: 'bg-white/60 hover:bg-white/80 text-wii-text border border-white/80 active:scale-95',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm font-semibold',
  md: 'px-6 py-3 text-base font-bold',
  lg: 'px-8 py-4 text-lg font-bold',
}

export default function WiiButton({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: WiiButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        rounded-full transition-all duration-150 select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
