import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { GameWorldProps, Location, Achievement } from '../types/game'
import Avatar from './Avatar'
import LocationMarker from './LocationMarker'
import LocationModal from './LocationModal'
import AchievementBadge from './AchievementBadge'
import './GameWorld.css'

const GameWorld: React.FC<GameWorldProps> = React.memo(({
  avatarPosition,
  locations,
  achievements,
  onAvatarMove,
  onLocationVisit,
  onModalOpen,
  currentModal,
  onModalClose,
  onAchievementEarned
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysPressed = useRef<Set<string>>(new Set())
  const lastFrameTime = useRef<number>(0)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  
  const MOVEMENT_SPEED = 150 // pixels per second - reduced from 200 for smoother movement
  const PROXIMITY_RADIUS = 120 // Increased to account for larger locations (1.5x from 80)

  // Update canvas size based on window size
  const updateCanvasSize = useCallback(() => {
    const container = canvasRef.current?.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      const newWidth = Math.max(600, rect.width - 40) // Min width 600px, account for padding
      const newHeight = Math.max(400, rect.height - 40) // Min height 400px, account for padding
      setCanvasSize({ width: newWidth, height: newHeight })
    }
  }, [])

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
      event.preventDefault()
      keysPressed.current.add(event.code)
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.code)
  }, [])

  // Check if avatar is near a location
  const checkProximity = useCallback((avatarPos: { x: number, y: number }, location: Location) => {
    const distance = Math.sqrt(
      Math.pow(avatarPos.x - location.position.x, 2) + 
      Math.pow(avatarPos.y - location.position.y, 2)
    )
    return distance <= PROXIMITY_RADIUS
  }, [])

  // Move avatar outside proximity after form submission
  const moveAvatarOutsideProximity = useCallback((location: Location) => {
    const currentPos = avatarPosition
    const locationPos = location.position
    
    // Calculate direction from location to avatar
    const dx = currentPos.x - locationPos.x
    const dy = currentPos.y - locationPos.y
    
    // Normalize and move outside proximity radius
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      const newX = locationPos.x + (dx / distance) * (PROXIMITY_RADIUS + 60) // Increased offset for larger locations
      const newY = locationPos.y + (dy / distance) * (PROXIMITY_RADIUS + 60) // Increased offset for larger locations
      
      // Clamp to canvas bounds
      const clampedX = Math.max(25, Math.min(canvasSize.width - 25, newX))
      const clampedY = Math.max(25, Math.min(canvasSize.height - 25, newY))
      
      onAvatarMove({ x: clampedX, y: clampedY })
    }
  }, [avatarPosition, canvasSize, onAvatarMove])

  // Game loop for smooth movement
  const gameLoop = useCallback((currentTime: number) => {
    if (!lastFrameTime.current) {
      lastFrameTime.current = currentTime
    }
    
    const deltaTime = (currentTime - lastFrameTime.current) / 1000
    
    // Frame rate limiting for consistent performance
    if (deltaTime < 1/60) { // Cap at 60 FPS
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    lastFrameTime.current = currentTime

    let newX = avatarPosition.x
    let newY = avatarPosition.y
    let moved = false

    // Handle movement based on pressed keys
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) {
      newY -= MOVEMENT_SPEED * deltaTime
      moved = true
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) {
      newY += MOVEMENT_SPEED * deltaTime
      moved = true
    }
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) {
      newX -= MOVEMENT_SPEED * deltaTime
      moved = true
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
      newX += MOVEMENT_SPEED * deltaTime
      moved = true
    }

    // Clamp position to canvas bounds
    newX = Math.max(25, Math.min(canvasSize.width - 25, newX))
    newY = Math.max(25, Math.min(canvasSize.height - 25, newY))

    // Update position if moved
    if (moved) {
      onAvatarMove({ x: newX, y: newY })
    }

    // Check proximity to locations
    locations.forEach(location => {
      if (checkProximity({ x: newX, y: newY }, location) && !currentModal && !location.completed) {
        onModalOpen(location.id)
      }
    })

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [avatarPosition, locations, currentModal, onAvatarMove, onModalOpen, checkProximity, canvasSize])

  // Set up keyboard listeners and game loop
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    animationRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [handleKeyDown, handleKeyUp, gameLoop])

  // Handle window resize
  useEffect(() => {
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [updateCanvasSize])

  // Draw the game world
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create beautiful gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#87CEEB') // Sky blue at top
    gradient.addColorStop(0.6, '#98FB98') // Light green in middle
    gradient.addColorStop(1, '#90EE90') // Light green at bottom
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw clouds in the sky
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    const cloudPositions = [
      { x: canvas.width * 0.1, y: canvas.height * 0.15, size: 60 },
      { x: canvas.width * 0.7, y: canvas.height * 0.1, size: 80 },
      { x: canvas.width * 0.85, y: canvas.height * 0.25, size: 50 },
      { x: canvas.width * 0.3, y: canvas.height * 0.08, size: 70 }
    ]
    
    cloudPositions.forEach(cloud => {
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.3, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.size * 0.4, cloud.y, cloud.size * 0.4, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.3, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.size * 0.2, cloud.y - cloud.size * 0.1, cloud.size * 0.25, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.15, cloud.size * 0.3, 0, Math.PI * 2)
      ctx.fill()
    })



    // Draw subtle grid pattern with better styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([8, 8])
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 60) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 60) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])

    // Draw decorative grass patches
    ctx.fillStyle = 'rgba(34, 139, 34, 0.4)'
    const grassPatches = [
      { x: canvas.width * 0.1, y: canvas.height * 0.95, width: 80, height: 20 },
      { x: canvas.width * 0.3, y: canvas.height * 0.92, width: 60, height: 25 },
      { x: canvas.width * 0.6, y: canvas.height * 0.94, width: 70, height: 18 },
      { x: canvas.width * 0.8, y: canvas.height * 0.93, width: 50, height: 22 }
    ]
    
    grassPatches.forEach(patch => {
      ctx.fillRect(patch.x, patch.y, patch.width, patch.height)
    })

    // Draw start area with enhanced styling
    const startSize = 60
    const startX = canvas.width * 0.05 - startSize/2
    const startY = canvas.height * 0.9 - startSize/2
    
    // Add shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Start area background with gradient
    const startGradient = ctx.createRadialGradient(
      startX + startSize/2, startY + startSize/2, 0,
      startX + startSize/2, startY + startSize/2, startSize/2
    )
    startGradient.addColorStop(0, '#22c55e')
    startGradient.addColorStop(1, '#16a34a')
    
    ctx.fillStyle = startGradient
    ctx.fillRect(startX, startY, startSize, startSize)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Start area border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(startX, startY, startSize, startSize)
    
    // Start area text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Start', startX + startSize/2, startY + startSize/2 - 8)
    ctx.fillText('Here', startX + startSize/2, startY + startSize/2 + 8)

    // Add some floating particles for atmosphere
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    for (let i = 0; i < 15; i++) {
      const x = (i * 37) % canvas.width
      const y = (i * 23) % (canvas.height * 0.6)
      const size = (i % 3 + 1) * 2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [canvasSize])

  const currentLocation = locations.find(loc => loc.id === currentModal)

  // Handle form submission with avatar repositioning
  const handleFormSubmit = (data: any) => {
    onLocationVisit(currentLocation!.id, data)
    onModalClose()
    if (currentLocation) {
      moveAvatarOutsideProximity(currentLocation)
    }
  }

  // Handle modal close with avatar repositioning
  const handleModalClose = () => {
    onModalClose()
    if (currentLocation) {
      moveAvatarOutsideProximity(currentLocation)
    }
  }

  return (
    <div className="game-world">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="game-canvas"
      />
      
      <Avatar position={avatarPosition} />
      
      {/* Render achievement badges orbiting around avatar */}
      {achievements.map((achievement, index) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          avatarPosition={avatarPosition}
          index={index}
          totalAchievements={achievements.length}
        />
      ))}
      
      {locations.map(location => (
        <LocationMarker
          key={location.id}
          location={location}
          isNearby={checkProximity(avatarPosition, location)}
        />
      ))}
      
      {currentLocation && (
        <LocationModal
          location={currentLocation}
          isOpen={!!currentModal}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
          onAchievementEarned={onAchievementEarned}
        />
      )}
    </div>
  )
})

export default GameWorld

GameWorld.displayName = 'GameWorld'
