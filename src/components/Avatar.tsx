import React from 'react'
import { Position } from '../types/game'
import './Avatar.css'

interface AvatarProps {
  position: Position
}

const Avatar: React.FC<AvatarProps> = React.memo(({ position }) => {
  return (
    <div 
      className="avatar"
      style={{
        left: position.x - 32,
        top: position.y - 32
      }}
    >
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 64 64" 
        className="avatar-svg"
      >
        {/* Head */}
        <circle
          cx="32"
          cy="28"
          r="12"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="2"
          className="avatar-head"
        />
        
        {/* Body line */}
        <line
          x1="32"
          y1="38"
          x2="32"
          y2="58"
          stroke="#000000"
          strokeWidth="3"
          className="avatar-body"
        />
        
        {/* Arms */}
        <line
          x1="32"
          y1="42"
          x2="20"
          y2="52"
          stroke="#000000"
          strokeWidth="3"
          className="avatar-arm left"
        />
        <line
          x1="32"
          y1="42"
          x2="44"
          y2="52"
          stroke="#000000"
          strokeWidth="3"
          className="avatar-arm right"
        />
        
        {/* Legs */}
        <line
          x1="32"
          y1="58"
          x2="24"
          y2="68"
          stroke="#000000"
          strokeWidth="3"
          className="avatar-leg left"
        />
        <line
          x1="32"
          y1="58"
          x2="40"
          y2="68"
          stroke="#000000"
          strokeWidth="3"
          className="avatar-leg right"
        />
        
        {/* Green pants - left */}
        <ellipse
          cx="24"
          cy="68"
          rx="8"
          ry="6"
          fill="#22c55e"
          stroke="#000000"
          strokeWidth="2"
          className="avatar-pants left"
        />
        
        {/* Green pants - right */}
        <ellipse
          cx="40"
          cy="68"
          rx="8"
          ry="6"
          fill="#22c55e"
          stroke="#000000"
          strokeWidth="2"
          className="avatar-pants right"
        />
      </svg>
      
      {/* Shadow */}
      <div className="avatar-shadow"></div>
    </div>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar
