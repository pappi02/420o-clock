import { useState } from 'react'
import './LocationPicker.css'

const locations = [
  { id: 1, name: 'Maseno', address: 'Maseno', time: '20-35 min' },
  { id: 2, name: 'Kisumu and Environs', address: 'Kisumu', time: '25-40 min' },
  { id: 3, name: 'Lela', address: 'Lela', time: '15-25 min' },
  { id: 4, name: 'Luanda', address: 'Luanda', time: '30-45 min' },
]

function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(locations[0])

  const handleSelect = (location) => {
    setSelected(location)
    setIsOpen(false)
  }

  return (
    <div className="location-picker">
      <button 
        className="location-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select location"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="location-icon"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="location-label">{selected.address}</span>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="location-dropdown">
          <div className="location-dropdown-header">
            <span className="location-current">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="clock-icon-small"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Estimated: {selected.time}
            </span>
          </div>
          <ul className="location-list">
            {locations.map((location) => (
              <li key={location.id}>
                <button
                  className={`location-option ${selected.id === location.id ? 'active' : ''}`}
                  onClick={() => handleSelect(location)}
                >
                  <span className="location-name">{location.name}</span>
                  <span className="location-time">{location.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default LocationPicker

