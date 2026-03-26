import { useEffect, useRef, useState } from 'react'
import './LiveMap.css'

function LiveMap({ 
  driverLocation = null, 
  userLocation = { lat: -1.2921, lng: 36.8219 }, // Default: Nairobi
  orderId,
  isExpanded = false
}) {
  const mapContainer = useRef(null)
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationRef = useRef(null)
  
  // Simulated driver position (for demo)
  const [simulatedDriverPos, setSimulatedDriverPos] = useState(
    driverLocation || { lat: -1.2950, lng: 36.8300 }
  )
  
  // Simulate driver movement
  useEffect(() => {
    if (!driverLocation) {
      // Simulate driver moving towards user
      const interval = setInterval(() => {
        setSimulatedDriverPos(prev => {
          const latDiff = userLocation.lat - prev.lat
          const lngDiff = userLocation.lng - prev.lng
          
          // Move 0.0005 degrees closer each update
          const newLat = prev.lat + (latDiff * 0.05)
          const newLng = prev.lng + (lngDiff * 0.05)
          
          return { lat: newLat, lng: newLng }
        })
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [driverLocation, userLocation.lat, userLocation.lng])
  
  // Draw map on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { width, height } = dimensions
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw background (road map style)
    ctx.fillStyle = '#F5F5F0'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid lines (roads)
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1
    
    // Vertical roads
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal roads
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Draw main road
    ctx.strokeStyle = '#D0D0D0'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(0, height * 0.7)
    ctx.lineTo(width, height * 0.3)
    ctx.stroke()
    
    // Calculate positions based on coordinates
    // Map bounds
    const latRange = 0.01
    const lngRange = 0.02
    const userX = ((userLocation.lng - (userLocation.lng - lngRange)) / (lngRange * 2)) * width
    const userY = height - ((userLocation.lat - (userLocation.lat - latRange)) / (latRange * 2)) * height
    
    const driverX = ((simulatedDriverPos.lng - (userLocation.lng - lngRange)) / (lngRange * 2)) * width
    const driverY = height - ((simulatedDriverPos.lat - (userLocation.lat - latRange)) / (latRange * 2)) * height
    
    // Draw route line
    ctx.strokeStyle = 'rgba(246, 174, 45, 0.4)'
    ctx.lineWidth = 4
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(driverX, driverY)
    ctx.lineTo(userX, userY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw user location (home icon)
    const drawUserMarker = () => {
      // Outer circle
      ctx.fillStyle = '#0B2B26'
      ctx.beginPath()
      ctx.arc(userX, userY, 16, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner circle
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(userX, userY, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // Home icon
      ctx.fillStyle = '#0B2B26'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🏠', userX, userY)
    }
    
    // Draw driver marker (car icon)
    const drawDriverMarker = () => {
      // Outer glow
      ctx.fillStyle = 'rgba(246, 174, 45, 0.3)'
      ctx.beginPath()
      ctx.arc(driverX, driverY, 20, 0, Math.PI * 2)
      ctx.fill()
      
      // Main marker
      ctx.fillStyle = '#F6AE2D'
      ctx.beginPath()
      ctx.arc(driverX, driverY, 14, 0, Math.PI * 2)
      ctx.fill()
      
      // Border
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(driverX, driverY, 14, 0, Math.PI * 2)
      ctx.stroke()
      
      // Car icon
      ctx.fillStyle = '#0B2B26'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🚚', driverX, driverY)
    }
    
    drawUserMarker()
    drawDriverMarker()
    
    // Calculate distance and ETA
    const distance = calculateDistance(
      simulatedDriverPos.lat, simulatedDriverPos.lng,
      userLocation.lat, userLocation.lng
    )
    
    // Draw info overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 10
    
    const infoBoxY = 10
    ctx.beginPath()
    ctx.roundRect(10, infoBoxY, width - 20, 50, 8)
    ctx.fill()
    ctx.shadowBlur = 0
    
    // Draw ETA text
    ctx.fillStyle = '#0B2B26'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`🚚 ${distance.toFixed(1)} km away`, 25, infoBoxY + 20)
    
    ctx.fillStyle = '#5A6B70'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Driver is on the way', 25, infoBoxY + 38)
    
    // Draw legend
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.beginPath()
    ctx.roundRect(width - 120, height - 70, 110, 60, 8)
    ctx.fill()
    
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🏠 Your Location', width - 105, height - 45)
    ctx.fillText('🚚 Driver', width - 105, height - 25)
    
  }, [simulatedDriverPos, userLocation, dimensions])
  
  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  const toRad = (deg) => deg * (Math.PI/180)
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  return (
    <div 
      ref={mapContainer} 
      className={`live-map-container ${isExpanded ? 'expanded' : ''}`}
    >
      <canvas 
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="live-map-canvas"
      />
      
      <div className="map-overlay">
        <div className="eta-overlay">
          <span className="eta-icon">🚚</span>
          <div className="eta-info">
            <span className="eta-value">
              {calculateDistance(
                simulatedDriverPos.lat, simulatedDriverPos.lng,
                userLocation.lat, userLocation.lng
              ).toFixed(1)} km
            </span>
            <span className="eta-label">away</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMap

