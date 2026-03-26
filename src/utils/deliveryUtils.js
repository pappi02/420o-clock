// Delivery Window Configuration
// 420o'clock "It's always time" brand - perfect for scheduled delivery!

export const DELIVERY_WINDOWS = {
  morning: {
    id: 'morning',
    label: 'Morning',
    icon: '☀️',
    start: '10:00',
    end: '13:00',
    maxOrders: 20,
    premium: false,
    displayTime: '10:00 AM - 1:00 PM'
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon',
    icon: '🌤️',
    start: '14:00',
    end: '17:00',
    maxOrders: 15,
    premium: false,
    displayTime: '2:00 PM - 5:00 PM'
  },
  evening: {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    start: '18:00',
    end: '21:00',
    maxOrders: 12,
    premium: false,
    displayTime: '6:00 PM - 9:00 PM'
  },
  night: {
    id: 'night',
    label: 'Night',
    icon: '🌃',
    start: '21:30',
    end: '23:30',
    maxOrders: 8,
    premium: false,
    displayTime: '9:30 PM - 11:30 PM'
  },
  goldenHour: {
    id: 'goldenHour',
    label: 'Golden Hour',
    icon: '🌅',
    start: '16:20',
    end: '17:20',
    maxOrders: 5,
    premium: true,
    fee: 800, // KES 800 premium fee
    displayTime: '4:20 PM - 5:20 PM'
  }
}

// Cutoff times (order by X for delivery window Y)
export const CUTOFF_RULES = {
  morning: { sameDay: '08:00', nextDay: '20:00' },
  afternoon: { sameDay: '12:00', nextDay: '23:59' },
  evening: { sameDay: '16:00', nextDay: '23:59' },
  night: { sameDay: '19:00', nextDay: '23:59' },
  goldenHour: { sameDay: '15:00', nextDay: '23:59' } // Special for 4:20
}

// Premium delivery fee
export const PREMIUM_DELIVERY_FEE = 800 // KES

// Get available dates for scheduling
export const getAvailableDates = () => {
  const dates = []
  const today = new Date()
  
  // Generate next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    dates.push({
      id: i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day_${i}`,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[date.getDay()],
      date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
      fullDate: date,
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
  
  return dates
}

// Get available slots for a specific date (simulated)
export const getAvailableSlots = (date) => {
  // Simulate some random availability based on date
  const seed = date.getDate() + date.getMonth()
  
  const windows = Object.values(DELIVERY_WINDOWS).map(window => {
    // Simulate booked slots (deterministic based on date)
    const booked = Math.floor((seed * window.maxOrders) % window.maxOrders * 0.7)
    const available = window.maxOrders - booked
    
    return {
      ...window,
      available: Math.max(0, available),
      total: window.maxOrders,
      availableLabel: available === 0 ? 'Fully Booked' : 
                      available <= 3 ? `Only ${available} left` :
                      `${available} slots left`
    }
  })
  
  return windows
}

// Get cutoff time for a specific window and date
export const getCutoffTime = (windowId, isSameDay) => {
  const rule = CUTOFF_RULES[windowId]
  if (!rule) return null
  
  const cutoffTime = rule[isSameDay ? 'sameDay' : 'nextDay']
  return cutoffTime
}

// Check if current time is past cutoff
export const isPastCutoff = (windowId, date) => {
  const now = new Date()
  const [hours, minutes] = getCutoffTime(windowId, true).split(':').map(Number)
  const cutoff = new Date(date)
  cutoff.setHours(hours, minutes, 0, 0)
  
  return now > cutoff
}

// Get time remaining until cutoff
export const getTimeUntilCutoff = (windowId, date) => {
  const now = new Date()
  const [hours, minutes] = getCutoffTime(windowId, true).split(':').map(Number)
  const cutoff = new Date(date)
  cutoff.setHours(hours, minutes, 0, 0)
  
  const diff = cutoff - now
  
  if (diff <= 0) return null
  
  const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return { hours: hoursLeft, minutes: minutesLeft }
}

// Get delivery fee based on window
export const getDeliveryFee = (windowId) => {
  const window = DELIVERY_WINDOWS[windowId]
  if (window?.premium) {
    return 500 + window.fee // Base delivery + premium
  }
  return 500 // Standard delivery fee
}

// Format time for display
export const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Get status display info
export const getStatusInfo = (status) => {
  const statusMap = {
    awaiting_location: { 
      label: 'Awaiting Location', 
      icon: '📍', 
      color: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.1)'
    },
    processing: { 
      label: 'Processing', 
      icon: '⚙️', 
      color: '#2196F3',
      bgColor: 'rgba(33, 150, 243, 0.1)'
    },
    preparing: { 
      label: 'Preparing', 
      icon: '📦', 
      color: '#9C27B0',
      bgColor: 'rgba(156, 39, 176, 0.1)'
    },
    ready: { 
      label: 'Ready for Pickup', 
      icon: '✅', 
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    driver_assigned: { 
      label: 'Driver Assigned', 
      icon: '🚗', 
      color: '#00BCD4',
      bgColor: 'rgba(0, 188, 212, 0.1)'
    },
    out_for_delivery: { 
      label: 'Out for Delivery', 
      icon: '🚚', 
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    nearby: { 
      label: 'Driver Nearby', 
      icon: '📍', 
      color: '#8BC34A',
      bgColor: 'rgba(139, 195, 74, 0.1)'
    },
    delivered: { 
      label: 'Delivered', 
      icon: '🎉', 
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: '❌', 
      color: '#F44336',
      bgColor: 'rgba(244, 67, 54, 0.1)'
    }
  }
  
  return statusMap[status] || { 
    label: status, 
    icon: '⏳', 
    color: '#757575',
    bgColor: 'rgba(117, 117, 117, 0.1)'
  }
}

// Order timeline status order
export const TIMELINE_STATUS_ORDER = [
  'order_placed',
  'payment_confirmed',
  'location_shared',
  'order_confirmed',
  'preparing',
  'ready',
  'driver_assigned',
  'out_for_delivery',
  'nearby',
  'delivered'
]

// Get timeline events based on order status
export const getTimelineEvents = (order) => {
  const events = [
    { status: 'order_placed', label: 'Order Placed', icon: '📝' },
    { status: 'payment_confirmed', label: 'Payment Confirmed', icon: '💳' },
    { status: 'location_shared', label: 'Location Shared', icon: '📍' },
    { status: 'order_confirmed', label: 'Order Confirmed', icon: '✅' },
    { status: 'preparing', label: 'Preparing Your Order', icon: '📦' },
    { status: 'ready', label: 'Ready for Delivery', icon: '🏠' },
    { status: 'driver_assigned', label: 'Driver Assigned', icon: '🚗' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { status: 'nearby', label: 'Driver Nearby', icon: '📍' },
    { status: 'delivered', label: 'Delivered', icon: '🎉' }
  ]
  
  const currentStatusIndex = TIMELINE_STATUS_ORDER.indexOf(order?.status)
  
  return events.map((event, index) => ({
    ...event,
    completed: index <= currentStatusIndex,
    current: index === currentStatusIndex,
    timestamp: index <= currentStatusIndex ? order?.timeline?.[event.status] : null
  }))
}

