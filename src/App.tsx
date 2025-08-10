import React, { useState, useEffect, useCallback } from 'react'
import GameWorld from './components/GameWorld'
import ProgressPanel from './components/ProgressPanel'
import OnboardingModal from './components/OnboardingModal'
import CompletionBanner from './components/CompletionBanner'
import { GameState, Location, EmissionsData, Achievement } from './types/game'
import { calculateEmissions } from './utils/emissionsCalculator'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    isOnboarding: true,
    isComplete: false,
    avatarPosition: { x: 50, y: 550 }, // Will be updated dynamically to center of Start Here square
    visitedLocations: new Set(),
    emissionsData: {},
    currentModal: null,
    achievements: []
  })

  const [locations, setLocations] = useState<Location[]>([])

  // Update locations and avatar position based on game world size
  useEffect(() => {
    const updateGameLayout = () => {
      const gameContainer = document.querySelector('.game-container')
      if (gameContainer) {
        const rect = gameContainer.getBoundingClientRect()
        const gameWidth = Math.max(600, rect.width - 40)
        const gameHeight = Math.max(400, rect.height - 40)
        
        // Calculate dynamic positions based on game world size
        const newLocations: Location[] = [
          {
            id: 'suburban-house',
            name: 'House',
            type: 'house',
            position: { 
              x: gameWidth * 0.15, 
              y: gameHeight * 0.50 
            },
            completed: false
          },
          {
            id: 'garage',
            name: 'Garage',
            type: 'garage',
            position: { 
              x: gameWidth * 0.30, 
              y: gameHeight * 0.63 
            },
            completed: false
          },
          {
            id: 'coffee-shop',
            name: 'Coffee Shop',
            type: 'coffee',
            position: { 
              x: gameWidth * 0.45, 
              y: gameHeight * 0.37 
            },
            completed: false
          },
          {
            id: 'grocery-store',
            name: 'Grocery Store',
            type: 'grocery',
            position: { 
              x: gameWidth * 0.60, 
              y: gameHeight * 0.63 
            },
            completed: false
          },
          {
            id: 'airport',
            name: 'Airport',
            type: 'airport',
            position: { 
              x: gameWidth * 0.65, 
              y: gameHeight * 0.20 
            },
            completed: false
          }
        ]
        
        setLocations(newLocations)
        
        // Update avatar position to bottom-left starting area
        setGameState(prev => ({
          ...prev,
          avatarPosition: { 
            x: gameWidth * 0.04, // Bottom-left area
            y: gameHeight * 0.80 // Bottom area
          }
        }))
      }
    }

    // Initial layout
    updateGameLayout()
    
    // Update on window resize
    window.addEventListener('resize', updateGameLayout)
    return () => window.removeEventListener('resize', updateGameLayout)
  }, [])

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, isOnboarding: false }))
  }

  const handleLocationVisit = (locationId: string, data: any) => {
    const emissions = calculateEmissions(locationId, data)
    const newEmissionsData = { ...gameState.emissionsData, [locationId]: emissions }
    
    const newVisitedLocations = new Set(gameState.visitedLocations)
    newVisitedLocations.add(locationId)
    
    const updatedLocations = locations.map(loc => 
      loc.id === locationId ? { ...loc, completed: true } : loc
    )
    
    const isComplete = newVisitedLocations.size === locations.length
    
    setGameState(prev => ({
      ...prev,
      visitedLocations: newVisitedLocations,
      emissionsData: newEmissionsData,
      isComplete
    }))
    
    // Update locations state
    setLocations(updatedLocations)
  }

  const handleAchievementEarned = (achievement: Achievement) => {
    setGameState(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }))
  }

  const handleModalClose = () => {
    setGameState(prev => ({ ...prev, currentModal: null }))
  }

  const handleModalOpen = (locationId: string) => {
    setGameState(prev => ({ ...prev, currentModal: locationId }))
  }

  const handleAvatarMove = useCallback((newPosition: { x: number, y: number }) => {
    setGameState(prev => ({ ...prev, avatarPosition: newPosition }))
  }, [])

  const handleReset = () => {
    window.location.reload()
  }

  return (
    <div className="app">
      {gameState.isOnboarding && (
        <OnboardingModal onStart={handleStartGame} />
      )}
      
      <div className="game-container">
        <GameWorld
          avatarPosition={gameState.avatarPosition}
          locations={locations}
          achievements={gameState.achievements}
          onAvatarMove={handleAvatarMove}
          onLocationVisit={handleLocationVisit}
          onModalOpen={handleModalOpen}
          currentModal={gameState.currentModal}
          onModalClose={handleModalClose}
          onAchievementEarned={handleAchievementEarned}
        />
        
        <ProgressPanel
          locations={locations}
          emissionsData={gameState.emissionsData}
          achievements={gameState.achievements}
          onReset={handleReset}
        />
      </div>
      
      {gameState.isComplete && (
        <CompletionBanner
          emissionsData={gameState.emissionsData}
          locations={locations}
          achievements={gameState.achievements}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App
