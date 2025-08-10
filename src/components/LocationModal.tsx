import React, { useState, useEffect } from 'react'
import { LocationModalProps, Achievement } from '../types/game'
import { calculateEmissions } from '../utils/emissionsCalculator'
import './LocationModal.css'

type ModalStep = 'input' | 'tips' | 'congratulations'

const LocationModal: React.FC<LocationModalProps> = ({
  location,
  isOpen,
  onClose,
  onSubmit,
  onAchievementEarned,
  initialData
}) => {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState<ModalStep>('input')
  const [emissionsData, setEmissionsData] = useState<any>(null)

  // Achievement emoji mapping
  const achievementEmojis = {
    house: '☀️',
    garage: '🔋',
    coffee: '♻️',
    grocery: '🥦',
    airport: '💨'
  }

  const achievementNames = {
    house: 'Solar Champion',
    garage: 'Electric Driver',
    coffee: 'Recycling Hero',
    grocery: 'Green Eater',
    airport: 'Carbon Conscious Traveler'
  }

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCurrentStep('input')
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    switch (location.type) {
      case 'house':
        if (!formData.zipCode || formData.zipCode.toString().length !== 5) {
          newErrors.zipCode = 'Please enter a valid 5-digit ZIP code'
        }
        if (!formData.squareFootage || formData.squareFootage < 500 || formData.squareFootage > 10000) {
          newErrors.squareFootage = 'Square footage must be between 500 and 10,000'
        }
        break
      case 'garage':
        if (!formData.milesPerWeek || formData.milesPerWeek < 0 || formData.milesPerWeek > 2000) {
          newErrors.milesPerWeek = 'Miles per week must be between 0 and 2,000'
        }
        break
      case 'coffee':
        if (!formData.daysPerWeek || formData.daysPerWeek < 0 || formData.daysPerWeek > 7) {
          newErrors.daysPerWeek = 'Days per week must be between 0 and 7'
        }
        break
      case 'grocery':
        if (!formData.nightsPerWeek || formData.nightsPerWeek < 0 || formData.nightsPerWeek > 7) {
          newErrors.nightsPerWeek = 'Nights per week must be between 0 and 7'
        }
        break
      case 'airport':
        if (!formData.flightsPerYear || formData.flightsPerYear < 0 || formData.flightsPerYear > 100) {
          newErrors.flightsPerYear = 'Flights per year must be between 0 and 100'
        }
        if (!formData.origin || !formData.destination) {
          newErrors.origin = 'Please select both origin and destination airports'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculateEmissions = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Calculate real emissions using the emissions calculator
      const emissionsData = calculateEmissions(location.type, formData)
      setEmissionsData(emissionsData)
      setCurrentStep('tips')
    }
  }

  const getTipsForLocation = (type: string): string[] => {
    const tipsMap = {
      house: [
        'Switch to LED light bulbs to reduce energy consumption by up to 80%',
        'Install a programmable thermostat to optimize heating and cooling',
        'Consider solar panels for renewable energy generation',
        'Improve insulation to reduce heating and cooling needs'
      ],
      garage: [
        'Switch to an electric vehicle to eliminate tailpipe emissions',
        'Use public transportation or carpool when possible',
        'Maintain your vehicle properly for optimal fuel efficiency',
        'Consider biking or walking for short trips'
      ],
      coffee: [
        'Bring your own reusable cup to avoid disposable waste',
        'Choose coffee shops that use sustainable practices',
        'Support fair trade and organic coffee options',
        'Compost coffee grounds for your garden'
      ],
      grocery: [
        'Choose locally grown and seasonal produce',
        'Reduce meat consumption, especially red meat',
        'Buy in bulk to reduce packaging waste',
        'Bring reusable bags and containers'
      ],
      airport: [
        'Consider video conferencing instead of business travel',
        'Choose direct flights when possible to reduce emissions',
        'Offset your carbon footprint through verified programs',
        'Pack light to reduce fuel consumption'
      ]
    }
    return tipsMap[type as keyof typeof tipsMap] || []
  }

  const handleNext = () => {
    if (currentStep === 'tips') {
      setCurrentStep('congratulations')
      // Create and award achievement
      const achievement: Achievement = {
        id: `${location.type}-achievement`,
        type: location.type,
        emoji: achievementEmojis[location.type as keyof typeof achievementEmojis],
        name: achievementNames[location.type as keyof typeof achievementNames],
        earnedAt: Date.now()
      }
      onAchievementEarned(achievement)
    }
  }

  const handleComplete = () => {
    onSubmit(formData)
  }

  // Handle cancel button click - move avatar outside proximity and close modal
  const handleCancel = () => {
    onClose()
    // The avatar repositioning will be handled by the parent component
    // when onClose is called, similar to form submission
  }

  const renderFormFields = () => {
    switch (location.type) {
      case 'house':
        return (
          <>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="12345"
                maxLength={5}
                className={errors.zipCode ? 'error' : ''}
              />
              {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="squareFootage">Home Square Footage</label>
              <input
                type="number"
                id="squareFootage"
                value={formData.squareFootage || ''}
                onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value))}
                placeholder="2000"
                min="500"
                max="10000"
                className={errors.squareFootage ? 'error' : ''}
              />
              {errors.squareFootage && <span className="error-message">{errors.squareFootage}</span>}
            </div>
            
            {/* Guidelines for House */}
            <div className="guidelines-section">
              <h4>Averages:</h4>
              <div className="guidelines-table">
                <div className="guidelines-row">
                  <span className="guidelines-label">Studio apartment</span>
                  <span className="guidelines-value">~457 sq ft</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">1 bedroom apartment</span>
                  <span className="guidelines-value">~735 sq ft</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">2 bedroom apartment</span>
                  <span className="guidelines-value">~1097 sq ft</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">3 bedroom apartment</span>
                  <span className="guidelines-value">~1336 sq ft</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">Single-family home</span>
                  <span className="guidelines-value">~2200 sq ft</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">Large single family home</span>
                  <span className="guidelines-value">~4000 sq ft</span>
                </div>
              </div>
            </div>
          </>
        )
      
      case 'garage':
        return (
          <>
            <div className="form-group">
              <label htmlFor="milesPerWeek">Miles Driven Per Week</label>
              <input
                type="number"
                id="milesPerWeek"
                value={formData.milesPerWeek || ''}
                onChange={(e) => handleInputChange('milesPerWeek', parseInt(e.target.value))}
                placeholder="150"
                min="0"
                max="2000"
                className={errors.milesPerWeek ? 'error' : ''}
              />
              {errors.milesPerWeek && <span className="error-message">{errors.milesPerWeek}</span>}
            </div>
            
            {/* Guidelines for Garage */}
            <div className="guidelines-section">
              <div className="guidelines-table">
                <div className="guidelines-header">
                  <span className="guidelines-label">One Way commute time</span>
                  <span className="guidelines-value">Weekly miles</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">15 minutes</span>
                  <span className="guidelines-value">~75 miles</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">30 minutes</span>
                  <span className="guidelines-value">~150 miles</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">1 hour</span>
                  <span className="guidelines-value">~300 miles</span>
                </div>
                <div className="guidelines-row">
                  <span className="guidelines-label">2 hours</span>
                  <span className="guidelines-value">~600 miles</span>
                </div>
              </div>
            </div>
          </>
        )
      
      case 'coffee':
        return (
          <div className="form-group">
            <label htmlFor="daysPerWeek">Days Per Week Visiting Coffee Shop</label>
            <input
              type="number"
              id="daysPerWeek"
              value={formData.daysPerWeek || ''}
              onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
              placeholder="3"
              min="0"
              max="7"
              className={errors.daysPerWeek ? 'error' : ''}
            />
            {errors.daysPerWeek && <span className="error-message">{errors.daysPerWeek}</span>}
          </div>
        )
      
      case 'grocery':
        return (
          <div className="form-group">
            <label htmlFor="nightsPerWeek">Nights Per Week Eating Red Meat</label>
            <input
              type="number"
              id="nightsPerWeek"
              value={formData.nightsPerWeek || ''}
              onChange={(e) => handleInputChange('nightsPerWeek', parseInt(e.target.value))}
              placeholder="3"
              min="0"
              max="7"
              className={errors.nightsPerWeek ? 'error' : ''}
            />
            {errors.nightsPerWeek && <span className="error-message">{errors.nightsPerWeek}</span>}
          </div>
        )
      
      case 'airport':
        return (
          <>
            <div className="form-group">
              <label htmlFor="flightsPerYear">How many times do you fly per year on average?</label>
              <input
                type="number"
                id="flightsPerYear"
                value={formData.flightsPerYear || ''}
                onChange={(e) => handleInputChange('flightsPerYear', parseInt(e.target.value))}
                placeholder="4"
                min="0"
                max="100"
                className={errors.flightsPerYear ? 'error' : ''}
              />
              {errors.flightsPerYear && <span className="error-message">{errors.flightsPerYear}</span>}
            </div>
            
            <div className="form-group">
              <h4>Most common flight path</h4>
              <label htmlFor="origin">Origin Airport</label>
              <select
                id="origin"
                value={formData.origin || ''}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className={errors.origin ? 'error' : ''}
              >
                <option value="">Select origin</option>
                <option value="ATL">Atlanta (ATL)</option>
                <option value="AUS">Austin (AUS)</option>
                <option value="BNA">Nashville (BNA)</option>
                <option value="BOS">Boston (BOS)</option>
                <option value="BWI">Baltimore (BWI)</option>
                <option value="CLT">Charlotte (CLT)</option>
                <option value="CVG">Cincinnati (CVG)</option>
                <option value="DCA">Washington Reagan (DCA)</option>
                <option value="DEN">Denver (DEN)</option>
                <option value="DFW">Dallas (DFW)</option>
                <option value="DTW">Detroit (DTW)</option>
                <option value="EWR">Newark (EWR)</option>
                <option value="FLL">Fort Lauderdale (FLL)</option>
                <option value="IAD">Washington Dulles (IAD)</option>
                <option value="IAH">Houston (IAH)</option>
                <option value="JFK">New York (JFK)</option>
                <option value="LAS">Las Vegas (LAS)</option>
                <option value="LAX">Los Angeles (LAX)</option>
                <option value="LGA">New York LaGuardia (LGA)</option>
                <option value="MCI">Kansas City (MCI)</option>
                <option value="MCO">Orlando (MCO)</option>
                <option value="MIA">Miami (MIA)</option>
                <option value="MSP">Minneapolis (MSP)</option>
                <option value="ORD">Chicago (ORD)</option>
                <option value="PDX">Portland (PDX)</option>
                <option value="PHX">Phoenix (PHX)</option>
                <option value="PIT">Pittsburgh (PIT)</option>
                <option value="RDU">Raleigh-Durham (RDU)</option>
                <option value="SEA">Seattle (SEA)</option>
                <option value="SFO">San Francisco (SFO)</option>
                <option value="SLC">Salt Lake City (SLC)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="destination">Destination Airport</label>
              <select
                id="destination"
                value={formData.destination || ''}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className={errors.origin ? 'error' : ''}
              >
                <option value="">Select destination</option>
                <option value="ATL">Atlanta (ATL)</option>
                <option value="AUS">Austin (AUS)</option>
                <option value="BNA">Nashville (BNA)</option>
                <option value="BOS">Boston (BOS)</option>
                <option value="BWI">Baltimore (BWI)</option>
                <option value="CLT">Charlotte (CLT)</option>
                <option value="CVG">Cincinnati (CVG)</option>
                <option value="DCA">Washington Reagan (DCA)</option>
                <option value="DEN">Denver (DEN)</option>
                <option value="DFW">Dallas (DFW)</option>
                <option value="DTW">Detroit (DTW)</option>
                <option value="EWR">Newark (EWR)</option>
                <option value="FLL">Fort Lauderdale (FLL)</option>
                <option value="IAD">Washington Dulles (IAD)</option>
                <option value="IAH">Houston (IAH)</option>
                <option value="JFK">New York (JFK)</option>
                <option value="LAS">Las Vegas (LAS)</option>
                <option value="LAX">Los Angeles (LAX)</option>
                <option value="LGA">New York LaGuardia (LGA)</option>
                <option value="MCI">Kansas City (MCI)</option>
                <option value="MCO">Orlando (MCO)</option>
                <option value="MIA">Miami (MIA)</option>
                <option value="MSP">Minneapolis (MSP)</option>
                <option value="ORD">Chicago (ORD)</option>
                <option value="PDX">Portland (PDX)</option>
                <option value="PHX">Phoenix (PHX)</option>
                <option value="PIT">Pittsburgh (PIT)</option>
                <option value="RDU">Raleigh-Durham (RDU)</option>
                <option value="SEA">Seattle (SEA)</option>
                <option value="SFO">San Francisco (SFO)</option>
                <option value="SLC">Salt Lake City (SLC)</option>
              </select>
            </div>
          </>
        )
      
      default:
        return null
    }
  }

  const renderTips = () => (
    <div className="tips-section">
      {/* Emissions Summary */}
      <div className="emissions-summary">
        <h3>Your Carbon Impact</h3>
        <div className="emissions-display">
          <div className="emissions-value">
            <span className="emissions-number">
              {emissionsData?.emissions >= 1000 
                ? emissionsData.emissions.toLocaleString() 
                : emissionsData?.emissions}
            </span>
            <span className="emissions-unit">{emissionsData?.unit}</span>
          </div>
          <div className="emissions-timeframe">{emissionsData?.timeframe}</div>
        </div>
        <p className="emissions-description">
          Based on your inputs for {location.name}
        </p>
      </div>

      {/* Tips Section */}
      <div className="tips-content">
        <h3>Tips for a More Sustainable {location.name}</h3>
        <div className="tips-list">
          {emissionsData?.tips.slice(0, 3).map((tip: string, index: number) => (
            <div key={index} className="tip-item">
              <span className="tip-bullet">•</span>
              <span className="tip-text">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="primary-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  )

  const renderCongratulations = () => (
    <div className="congratulations-section">
      <div className="achievement-display">
        <div className="achievement-emoji-large">
          {achievementEmojis[location.type as keyof typeof achievementEmojis]}
        </div>
        <h2>Congratulations!</h2>
        <p>You have earned the <strong>{achievementNames[location.type as keyof typeof achievementNames]}</strong> badge for completing this location!</p>
        <p className="achievement-description">
          Keep exploring to collect all 5 sustainability badges and become a Carbon Quest champion!
        </p>
      </div>
      <div className="modal-actions">
        <button type="button" className="primary-button" onClick={handleComplete}>
          OK
        </button>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{location.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {currentStep === 'input' && (
          <form onSubmit={handleCalculateEmissions}>
            <div className="form-fields">
              {renderFormFields()}
            </div>
            
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Calculate Impact
              </button>
            </div>
          </form>
        )}
        
        {currentStep === 'tips' && renderTips()}
        {currentStep === 'congratulations' && renderCongratulations()}
      </div>
    </div>
  )
}

export default LocationModal
