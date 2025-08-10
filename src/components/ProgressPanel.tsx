import React from 'react'
import { Location, EmissionsData, Achievement } from '../types/game'
import { formatEmissionsForDisplay } from '../utils/emissionsCalculator'
import './ProgressPanel.css'

interface ProgressPanelProps {
  locations: Location[]
  emissionsData: Record<string, EmissionsData>
  achievements: Achievement[]
  onReset: () => void
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ 
  locations, 
  emissionsData, 
  achievements,
  onReset 
}) => {
  const completedCount = locations.filter(loc => loc.completed).length
  const totalCount = locations.length
  const progressPercentage = (completedCount / totalCount) * 100
  
  const totalEmissions = Object.values(emissionsData).reduce((sum, data) => sum + data.emissions, 0)
  const totalSavings = Object.values(emissionsData).reduce((sum, data) => sum + (data.savings || 0), 0)
  
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'house': return '🏠'
      case 'garage': return '🚗'
      case 'coffee': return '☕'
      case 'grocery': return '🛒'
      case 'airport': return '✈️'
      default: return '📍'
    }
  }

  const getLocationStatus = (location: Location) => {
    if (location.completed) {
      const data = emissionsData[location.id]
      return {
        status: 'completed',
        text: '', // Remove "Completed" text to prevent overlapping
        color: '#10b981'
      }
    }
    return {
      status: 'pending',
      text: 'Not visited',
      color: '#6b7280'
    }
  }

  return (
    <div className="progress-panel">
      <div className="panel-header">
        <h3>🌱 Progress Tracker</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedCount} of {totalCount} locations completed
        </div>
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="achievements-section">
          <h4>🏆 Achievements Earned</h4>
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-emoji">{achievement.emoji}</div>
                <div className="achievement-name">{achievement.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="locations-list">
        {locations.map(location => {
          const status = getLocationStatus(location)
          const data = emissionsData[location.id]
          
          return (
            <div 
              key={location.id} 
              className={`location-item ${status.status}`}
            >
              <div className="location-icon">
                {getLocationIcon(location.type)}
              </div>
              <div className="location-info">
                <div className="location-name">{location.name}</div>
                <div className="location-status" style={{ color: status.color }}>
                  {status.text}
                </div>
              </div>
              {data && (
                <div className="location-data">
                  <div className="emissions">
                    {formatEmissionsForDisplay(data.emissions)} {data.unit}
                  </div>
                  {data.savings && (
                    <div className="savings">
                      Save: {formatEmissionsForDisplay(data.savings)} {data.unit}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {Object.keys(emissionsData).length > 0 && (
        <div className="summary-section">
          <h4>📊 Summary</h4>
          <div className="summary-note">
            <p>💡 All emissions are calculated on an annual basis for consistent comparison</p>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Total Annual Emissions</div>
              <div className="summary-value emissions">
                {formatEmissionsForDisplay(totalEmissions)} kg CO2e
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Potential Annual Savings</div>
              <div className="summary-value savings">
                {formatEmissionsForDisplay(totalSavings)} kg CO2e
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="panel-footer">
        <button className="reset-button" onClick={onReset}>
          🔄 Reset Game
        </button>
      </div>
    </div>
  )
}

export default ProgressPanel
