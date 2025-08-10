import React from 'react'
import './OnboardingModal.css'

interface OnboardingModalProps {
  onStart: () => void
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onStart }) => {
  return (
    <div className="onboarding-modal">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>🌱 Carbon Quest</h1>
          <p className="subtitle">Discover your carbon footprint and find ways to reduce it!</p>
        </div>
        
        <div className="onboarding-body">
          <div className="section">
            <h2>🎯 How to Play</h2>
            <ul>
              <li>Use <strong>arrow keys</strong> to move your avatar</li>
              <li>Visit different locations to learn about carbon emissions</li>
            </ul>
          </div>
          
          <div className="section">
            <h2>💡 What You'll Learn</h2>
            <p>Each location will show you:</p>
            <ul>
              <li>Your current carbon footprint</li>
              <li>Potential savings from changes</li>
              <li>Practical tips to reduce emissions</li>
            </ul>
          </div>
        </div>
        
        <div className="onboarding-footer">
          <button className="start-button" onClick={onStart}>
            Start Your Quest! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
