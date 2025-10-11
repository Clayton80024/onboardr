'use client'

import { useState } from 'react'

interface UniversityLogoProps {
  university: {
    name: string
    logo_url?: string | null
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function UniversityLogo({ university, size = 'md', className = '' }: UniversityLogoProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-12 h-12 text-base'
  }
  
  const sizeClass = sizeClasses[size]
  
  if (university.logo_url && !imageError) {
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
        <img 
          src={university.logo_url} 
          alt={`${university.name} logo`}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }
  
  // Fallback to letter avatar
  return (
    <div className={`${sizeClass} bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center ${className}`}>
      <span className="text-green-600 font-bold">
        {university.name.charAt(0)}
      </span>
    </div>
  )
}
