import React from 'react'
import { AchievementBadgeProps } from '../types/game'
import './AchievementBadge.css'

const AchievementBadge: React.FC<AchievementBadgeProps> = React.memo(({
  achievement,
  avatarPosition,
  index,
  totalAchievements
}) => {
  // Calculate position in circular orbit around avatar
  const orbitRadius = 45 // Distance from avatar center
  const angleStep = (2 * Math.PI) / Math.max(totalAchievements, 1)
  const angle = index * angleStep
  
  const x = avatarPosition.x + Math.cos(angle) * orbitRadius
  const y = avatarPosition.y + Math.sin(angle) * orbitRadius

  return (
    <div 
      className="achievement-badge"
      style={{
        left: x - 15, // Center the badge (30px width / 2) - removed px for better performance
        top: y - 15,  // Center the badge (30px height / 2) - removed px for better performance
        animationDelay: `${index * 0.2}s` // Stagger animation
      }}
    >
      <span className="achievement-emoji">{achievement.emoji}</span>
    </div>
  )
})

AchievementBadge.displayName = 'AchievementBadge'

export default AchievementBadge
