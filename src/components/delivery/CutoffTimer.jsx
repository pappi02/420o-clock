import { useState, useEffect } from 'react'
import './CutoffTimer.css'

function CutoffTimer({ cutoffTime, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [isExpired, setIsExpired] = useState(false)
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const cutoff = new Date(cutoffTime)
      const diff = cutoff - now
      
      if (diff <= 0) {
        setIsExpired(true)
        onExpired?.()
        return null
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      return { hours, minutes, seconds }
    }
    
    setTimeLeft(calculateTimeLeft())
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (!newTimeLeft) {
        clearInterval(timer)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [cutoffTime, onExpired])
  
  if (isExpired || !timeLeft) {
    return (
      <div className="cutoff-timer expired">
        <span className="timer-icon">⏰</span>
        <span className="timer-message">
          Cutoff passed - please select a different time window
        </span>
      </div>
    )
  }
  
  // Determine urgency level
  const getUrgencyLevel = () => {
    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes
    if (totalMinutes <= 30) return 'critical'
    if (totalMinutes <= 60) return 'warning'
    return 'normal'
  }
  
  const urgencyLevel = getUrgencyLevel()
  
  return (
    <div className={`cutoff-timer ${urgencyLevel}`}>
      <div className="timer-icon-wrapper">
        <span className="timer-icon">⏳</span>
      </div>
      
      <div className="timer-content">
        <span className="timer-label">
          {urgencyLevel === 'critical' ? '🔥 Order soon!' : 
           urgencyLevel === 'warning' ? '⏰ Limited time!' : 
           'Order in the next'}
        </span>
        
        <div className="timer-values">
          {timeLeft.hours > 0 && (
            <>
              <div className="timer-unit">
                <span className="timer-value">{timeLeft.hours}</span>
                <span className="timer-unit-label">h</span>
              </div>
              <span className="timer-separator">:</span>
            </>
          )}
          <div className="timer-unit">
            <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="timer-unit-label">m</span>
          </div>
          <span className="timer-separator">:</span>
          <div className="timer-unit">
            <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="timer-unit-label">s</span>
          </div>
        </div>
        
        <span className="timer-sublabel">for this delivery window</span>
      </div>
      
      {urgencyLevel === 'critical' && (
        <div className="timer-pulse"></div>
      )}
    </div>
  )
}

export default CutoffTimer

