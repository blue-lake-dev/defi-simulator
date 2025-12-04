'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  src: string | undefined
  alt: string
  size?: number
  className?: string
}

export function Logo({ src, alt, size = 20, className = '' }: LogoProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    // Fallback: show first letter in a circle
    return (
      <div
        className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setError(true)}
      unoptimized // External URLs need this
    />
  )
}
