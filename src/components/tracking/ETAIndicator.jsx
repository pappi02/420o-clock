import { useState, useEffect } from 'react'
import './ETAIndicator.css'

function ETAIndicator({ minutes = 0, distance = '0', compact = false }) {
  const [displayMinutes, setDisplayMinutes] = useState(minutes)
  
  useEffect(() => {
    setDisplayMinutes(minutes)
  }, [minutes])
  
  // Animated countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayMinutes(prev => Math.max(0, prev - 1/60))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Visual representation based on ETA
  const getEtaColor = () => {
    if (displayMinutes < 2) return '#D32F2F' // Red - very close
    if (displayMinutes < 5) return '#ED6A02' // Orange - getting close
    if (displayMinutes < 10) return '#F6AE2D' // Gold - on the way
    return '#879F85' // Sage - normal
  }
  
  const getEtaLabel = () => {
    if (displayMinutes < 2) return 'Almost there!'
    if (displayMinutes < 5) return 'Getting close!'
    if (displayMinutes < 10) return 'On the way'
    return 'Driver dispatched'
  }
  
  const etaColor = getEtaColor()
  const progressPercent = Math.min(100, (15 - displayMinutes) / 15 * 100)
  
  if (compact) {
    return (
      <div className="eta-indicator compact" style={{ borderColor: etaColor }}>
        <div className="eta-compact-content">
          <span className="eta-icon">🚚</span>
          <span className="eta-compact-value" style={{ color: etaColor }}>
            {Math.round(displayMinutes)} min
          </span>
          <span className="eta-compact-distance">{distance}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="eta-indicator" style={{ borderColor: etaColor }}>
      <div className="eta-icon-wrapper" style={{ backgroundColor: etaColor }}>
        <span className="eta-icon">🚚</span>
      </div>
      
      <div className="eta-details">
        <div className="eta-main">
          <span 
            className="eta-value" 
            style={{ color: etaColor }}
          >
            {Math.round(displayMinutes)}
          </span>
          <span className="eta-unit">minutes</span>
        </div>
        
        <div className="eta-sub">
          <span className="eta-distance">{distance} away</span>
          <span className="eta-status" style={{ color: etaColor }}>
            {getEtaLabel()}
          </span>
        </div>
      </div>
      
      <div className="eta-progress">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: etaColor
          }} 
        />
      </div>
    </div>
  )
}

export default ETAIndicator

