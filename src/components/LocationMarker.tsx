import React from 'react'
import { Location } from '../types/game'
import './LocationMarker.css'

interface LocationMarkerProps {
  location: Location
  isNearby: boolean
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ location, isNearby }) => {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <div className="location-icon">🏠</div>
      case 'garage':
        return <div className="location-icon">🚗</div>
      case 'coffee':
        return <div className="location-icon">☕</div>
      case 'grocery':
        return <div className="location-icon">🛒</div>
      case 'airport':
        return <div className="location-icon">✈️</div>
      default:
        return <div className="location-icon">📍</div>
    }
  }

  return (
    <div
      className={`location-marker ${location.type} ${isNearby ? 'nearby' : ''} ${location.completed ? 'completed' : ''}`}
      style={{
        left: location.position.x - 60,
        top: location.position.y - 60
      }}
    >
      {getLocationIcon(location.type)}
      <div className="location-label">{location.name}</div>
      {location.completed && <div className="completion-check">✓</div>}
      {isNearby && <div className="proximity-indicator"></div>}
    </div>
  )
}

export default LocationMarker
