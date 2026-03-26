import { getTimelineEvents } from '../../utils/deliveryUtils'
import './DeliveryTimeline.css'

function DeliveryTimeline({ order, compact = false }) {
  const events = getTimelineEvents(order)
  
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    })
  }
  
  if (compact) {
    return (
      <div className="delivery-timeline compact">
        {events.slice(0, 5).map((event, index) => (
          <div 
            key={event.status}
            className={`timeline-step compact ${event.completed ? 'completed' : ''} ${event.current ? 'current' : ''}`}
          >
            <div className="step-marker">
              {event.completed ? '✓' : event.current ? '●' : '○'}
            </div>
            <div className="step-content">
              <span className="step-label">{event.label}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="delivery-timeline">
      <div className="timeline-header">
        <h4>⏱️ DELIVERY TIMELINE</h4>
      </div>
      
      <div className="timeline-track">
        {events.map((event, index) => (
          <div 
            key={event.status}
            className={`timeline-step 
              ${event.completed ? 'completed' : ''} 
              ${event.current ? 'current' : ''}`}
          >
            <div className="step-connector">
              <div className="step-marker">
                {event.completed ? (
                  <span className="marker-icon">✓</span>
                ) : event.current ? (
                  <span className="marker-icon current">●</span>
                ) : (
                  <span className="marker-icon">○</span>
                )}
              </div>
              {index < events.length - 1 && (
                <div className={`step-line ${event.completed ? 'completed' : ''}`} />
              )}
            </div>
            
            <div className="step-content">
              <div className="step-header">
                <span className="step-icon">{event.icon}</span>
                <span className="step-label">{event.label}</span>
                {event.current && (
                  <span className="current-badge">NOW</span>
                )}
              </div>
              
              {event.timestamp && (
                <span className="step-time">{formatTime(event.timestamp)}</span>
              )}
              
              {event.current && (
                <div className="step-description">
                  {event.status === 'out_for_delivery' && 'Your driver is on the way!'}
                  {event.status === 'nearby' && 'Driver is almost at your location'}
                  {event.status === 'preparing' && 'Your order is being prepared'}
                  {event.status === 'driver_assigned' && 'A driver has been assigned to your order'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeliveryTimeline

