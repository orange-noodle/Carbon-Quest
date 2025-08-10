export interface Position {
  x: number
  y: number
}

export interface Location {
  id: string
  name: string
  type: 'house' | 'garage' | 'coffee' | 'grocery' | 'airport'
  position: Position
  completed: boolean
}

export interface Achievement {
  id: string
  type: 'house' | 'garage' | 'coffee' | 'grocery' | 'airport'
  emoji: string
  name: string
  earnedAt: number
}

export interface EmissionsData {
  locationId: string
  locationName: string
  inputs: Record<string, any>
  emissions: number
  savings?: number
  unit: string
  timeframe: string
  tips: string[]
  timestamp: number
}

export interface GameState {
  isOnboarding: boolean
  isComplete: boolean
  avatarPosition: Position
  visitedLocations: Set<string>
  emissionsData: Record<string, EmissionsData>
  currentModal: string | null
  achievements: Achievement[]
}

export interface LocationModalProps {
  location: Location
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  onAchievementEarned: (achievement: Achievement) => void
  initialData?: any
}

export interface ProgressPanelProps {
  locations: Location[]
  emissionsData: Record<string, EmissionsData>
  onReset: () => void
}

export interface GameWorldProps {
  avatarPosition: Position
  locations: Location[]
  achievements: Achievement[]
  onAvatarMove: (position: Position) => void
  onLocationVisit: (locationId: string, data: any) => void
  onModalOpen: (locationId: string) => void
  currentModal: string | null
  onModalClose: () => void
  onAchievementEarned: (achievement: Achievement) => void
}

export interface AchievementBadgeProps {
  achievement: Achievement
  avatarPosition: Position
  index: number
  totalAchievements: number
}

export interface OnboardingModalProps {
  onStart: () => void
}

export interface CompletionBannerProps {
  emissionsData: Record<string, EmissionsData>
  onReset: () => void
}
