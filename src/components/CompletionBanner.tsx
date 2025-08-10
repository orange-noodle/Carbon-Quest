import React from 'react'
import { Location, EmissionsData, Achievement } from '../types/game'
import { formatEmissionsForDisplay } from '../utils/emissionsCalculator'
import './CompletionBanner.css'

interface CompletionBannerProps {
  emissionsData: Record<string, EmissionsData>
  locations: Location[]
  achievements: Achievement[]
  onReset: () => void
}

const CompletionBanner: React.FC<CompletionBannerProps> = ({ 
  emissionsData, 
  locations,
  achievements,
  onReset 
}) => {
  const totalEmissions = Object.values(emissionsData).reduce((sum, data) => sum + data.emissions, 0)
  const totalSavings = Object.values(emissionsData).reduce((sum, data) => sum + (data.savings || 0), 0)
  const savingsPercentage = totalSavings > 0 ? ((totalSavings / (totalEmissions + totalSavings)) * 100) : 0
  
  const getEmissionsMessage = () => {
    if (totalEmissions < 100) return "Excellent! You're already quite eco-friendly!"
    if (totalEmissions < 500) return "Good job! There's room for improvement."
    return "There's significant potential to reduce your carbon footprint!"
  }
  
  const getSavingsMessage = () => {
    if (savingsPercentage > 50) return "Amazing! You could save over half your emissions!"
    if (savingsPercentage > 25) return "Great potential! You could save a quarter of your emissions."
    return "Every little bit helps! Small changes add up."
  }

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

  return (
    <div className="completion-banner">
      <div className="completion-content">
        <div className="completion-header">
          <div className="trophy">🏆</div>
          <h2>Quest Complete!</h2>
          <p>Congratulations! You've explored all locations and discovered your annual carbon footprint.</p>
          <div className="completion-note">
            <p>💡 All emissions are calculated on an annual basis for consistent comparison across all activities</p>
          </div>
        </div>
        
        <div className="completion-layout">
          {/* Summary Section */}
          <div className="completion-summary">
            <div className="completion-stats">
              <div className="stat-card">
                <div className="stat-icon">🌍</div>
                <div className="stat-value">{formatEmissionsForDisplay(totalEmissions)}</div>
                <div className="stat-label">kg CO2e Total (Annual)</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💚</div>
                <div className="stat-value">{formatEmissionsForDisplay(totalSavings)}</div>
                <div className="stat-label">kg CO2e Potential Savings (Annual)</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{savingsPercentage.toFixed(0)}%</div>
                <div className="stat-label">Reduction Potential</div>
              </div>
            </div>
            
            <div className="completion-messages">
              <div className="message">
                <h4>📊 Your Impact</h4>
                <p>{getEmissionsMessage()}</p>
              </div>
              
              <div className="message">
                <h4>💡 Your Potential</h4>
                <p>{getSavingsMessage()}</p>
              </div>
            </div>
          </div>

          {/* Progress Breakdown Section */}
          <div className="completion-progress">
            <h3>🌱 Progress Breakdown</h3>
            
            {/* Locations Breakdown */}
            <div className="locations-breakdown">
              <h4>📍 Location Details</h4>
              <div className="locations-list">
                {locations.map(location => {
                  const data = emissionsData[location.id]
                  
                  return (
                    <div 
                      key={location.id} 
                      className={`location-item ${location.completed ? 'completed' : 'pending'}`}
                    >
                      <div className="location-icon">
                        {getLocationIcon(location.type)}
                      </div>
                      <div className="location-info">
                        <div className="location-name">{location.name}</div>
                        <div className="location-status">
                          {location.completed ? '' : 'Not visited'}
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
            </div>
          </div>
        </div>
        
        <div className="completion-actions">
          <button className="action-button primary" onClick={onReset}>
            🔄 Play Again
          </button>
          <button className="action-button secondary" onClick={() => window.print()}>
            🖨️ Print Summary
          </button>
        </div>
        
        <div className="completion-footer">
          <p>🌱 Keep learning and making sustainable choices!</p>
          <p>Share your results with friends and family to spread awareness.</p>
        </div>
      </div>
    </div>
  )
}

export default CompletionBanner
