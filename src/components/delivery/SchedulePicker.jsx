import { useSchedule } from '../../context/ScheduleContext'
import { getTimeUntilCutoff } from '../../utils/deliveryUtils'
import './SchedulePicker.css'

function SchedulePicker({ compact = false, onScheduleSelect }) {
  const {
    selectedDate,
    selectedWindow,
    availableDates,
    availableSlots,
    handleDateSelect,
    handleWindowSelect,
    isScheduleComplete,
    getScheduleSummary
  } = useSchedule()
  
  const cutoffInfo = selectedWindow ? getTimeUntilCutoff(selectedWindow.id, selectedDate?.fullDate) : null
  
  const handleConfirm = () => {
    if (isScheduleComplete() && onScheduleSelect) {
      onScheduleSelect(getScheduleSummary())
    }
  }
  
  if (compact) {
    return (
      <div className="schedule-picker-compact">
        <div className="schedule-compact-header">
          <span className="schedule-icon">⏰</span>
          <span className="schedule-title">SCHEDULE DELIVERY</span>
        </div>
        
        <div className="schedule-compact-fields">
          <div className="schedule-compact-field">
            <label>📅 DATE</label>
            <select 
              value={selectedDate?.id || ''}
              onChange={(e) => {
                const date = availableDates.find(d => d.id === e.target.value)
                handleDateSelect(date)
              }}
            >
              {availableDates.map(date => (
                <option key={date.id} value={date.id}>
                  {date.label}, {date.date}
                </option>
              ))}
            </select>
          </div>
          
          <div className="schedule-compact-field">
            <label>⏱️ TIME WINDOW</label>
            <select 
              value={selectedWindow?.id || ''}
              onChange={(e) => {
                const window = availableSlots.find(w => w.id === e.target.value)
                handleWindowSelect(window)
              }}
              disabled={!selectedDate}
            >
              <option value="">Select time...</option>
              {availableSlots
                .filter(w => w.available > 0)
                .map(window => (
                  <option key={window.id} value={window.id}>
                    {window.label} ({window.displayTime}) - {window.available} slots
                  </option>
                ))
              }
            </select>
          </div>
        </div>
        
        {selectedWindow && (
          <div className="schedule-compact-info">
            <span className="slots-info">
              Available slots: {selectedWindow.available} remaining
            </span>
            {cutoffInfo && (
              <span className="cutoff-info">
                🕒 Cutoff: Order in next {cutoffInfo.hours}h {cutoffInfo.minutes}m for this window
              </span>
            )}
          </div>
        )}
        
        {selectedWindow?.premium && (
          <div className="schedule-compact-premium">
            🌅 Golden Hour Premium +KES {selectedWindow.fee}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="schedule-picker">
      <div className="schedule-header">
        <h3>⏰ WHEN SHOULD WE DELIVER?</h3>
        <p className="schedule-subtitle">
          Choose your preferred delivery time window
        </p>
      </div>
      
      {/* Date Selector */}
      <div className="date-selector">
        <h4>SELECT DATE</h4>
        <div className="date-cards">
          {availableDates.slice(0, 5).map(date => (
            <button
              key={date.id}
              className={`date-card ${selectedDate?.id === date.id ? 'selected' : ''}`}
              onClick={() => handleDateSelect(date)}
            >
              <span className="date-label">{date.label}</span>
              <span className="date-value">{date.date}</span>
              {date.isWeekend && <span className="weekend-badge">Weekend</span>}
            </button>
          ))}
        </div>
      </div>
      
      {/* Time Window Selector */}
      <div className="time-selector">
        <h4>
          SELECT TIME WINDOW
          {selectedDate && (
            <span className="selected-date-label">
              - {selectedDate.label}, {selectedDate.date}
            </span>
          )}
        </h4>
        
        <div className="time-windows">
          {availableSlots.map(window => (
            <button
              key={window.id}
              className={`time-card 
                ${selectedWindow?.id === window.id ? 'selected' : ''} 
                ${window.available === 0 ? 'unavailable' : ''}
                ${window.premium ? 'premium' : ''}`}
              onClick={() => window.available > 0 && handleWindowSelect(window)}
              disabled={window.available === 0}
            >
              <div className="time-header">
                <span className="time-icon">{window.icon}</span>
                <span className="time-label">{window.label}</span>
                {window.premium && (
                  <span className="premium-badge">✨ GOLDEN HOUR</span>
                )}
              </div>
              
              <div className="time-range">{window.displayTime}</div>
              
              <div className="time-availability">
                {window.available > 0 ? (
                  <>
                    <span className={`availability-indicator ${window.available <= 3 ? 'limited' : 'available'}`}>
                      {window.available <= 3 ? '🟡 Limited' : '🟢 Available'}
                    </span>
                    <span className="slots-count">
                      ({window.available} of {window.total} slots)
                    </span>
                  </>
                ) : (
                  <span className="full-badge">🔴 Fully Booked</span>
                )}
              </div>
              
              {window.premium && (
                <div className="premium-features">
                  <span>• Exact 4:20 delivery window</span>
                  <span>• Priority dispatching</span>
                  <span>• Special golden packaging</span>
                </div>
              )}
              
              {window.premium && (
                <div className="premium-fee">
                  +KES {window.fee} premium
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected Summary */}
      {selectedDate && selectedWindow && (
        <div className="schedule-summary">
          <div className="summary-content">
            <span className="summary-icon">📦</span>
            <div className="summary-details">
              <span className="summary-label">SELECTED DELIVERY</span>
              <span className="summary-value">
                {selectedWindow.icon} {selectedWindow.label} ({selectedWindow.displayTime}) - {selectedDate.label}, {selectedDate.date}
              </span>
              {selectedWindow.premium && (
                <span className="summary-premium">🌅 Golden Hour Premium Delivery</span>
              )}
            </div>
          </div>
          
          {cutoffInfo && cutoffInfo.hours >= 0 && cutoffInfo.minutes >= 0 && (
            <div className="cutoff-notice">
              <span className="cutoff-icon">⏳</span>
              <span>
                Order in the next <strong>{cutoffInfo.hours}h {cutoffInfo.minutes}m</strong> for this delivery window
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Confirm Button */}
      <button 
        className={`confirm-schedule-btn ${isScheduleComplete() ? 'active' : ''}`}
        onClick={handleConfirm}
        disabled={!isScheduleComplete()}
      >
        {selectedWindow?.premium ? '🌅' : '📦'} 
        {isScheduleComplete() 
          ? `Confirm ${selectedWindow?.premium ? 'Golden Hour ' : ''}Delivery Time`
          : 'Select Delivery Time'
        }
      </button>
    </div>
  )
}

export default SchedulePicker

