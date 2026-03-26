import './ClockLogo.css'

function ClockLogo({ size = 'default', showTime = false }) {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // Calculate rotation for clock hands
  const hourRotation = ((hours % 12) + minutes / 60) * 30
  const minuteRotation = minutes * 6
  
  // Check if it's 4:20
  const is420 = hours === 4 && minutes >= 20 && minutes <= 20
  
  return (
    <div className={`clock-logo clock-logo--${size} ${is420 ? 'clock-logo--420' : ''}`}>
      <svg viewBox="0 0 40 40" className="clock-icon">
        {/* Clock face */}
        <circle 
          cx="20" 
          cy="20" 
          r="18" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="20"
            y1="4"
            x2="20"
            y2={i % 3 === 0 ? '8' : '6'}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? '2' : '1'}
            transform={`rotate(${i * 30} 20 20)`}
          />
        ))}
        
        {/* Hour hand */}
        <line
          className="clock-hand clock-hand--hour"
          x1="20"
          y1="20"
          x2="20"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${hourRotation} 20 20)`}
        />
        
        {/* Minute hand */}
        <line
          className="clock-hand clock-hand--minute"
          x1="20"
          y1="20"
          x2="20"
          y2="7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${minuteRotation} 20 20)`}
        />
        
        {/* Center dot */}
        <circle cx="20" cy="20" r="2" fill="currentColor" />
        
        {/* 420 indicator */}
        {is420 && (
          <text x="20" y="32" textAnchor="middle" className="clock-420">
            420
          </text>
        )}
      </svg>
    </div>
  )
}

export default ClockLogo

