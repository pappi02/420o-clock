import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getAvailableDates, getAvailableSlots, getDeliveryFee } from '../utils/deliveryUtils'

const ScheduleContext = createContext()

export const useSchedule = () => {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }
  return context
}

export const ScheduleProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedWindow, setSelectedWindow] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(true)

  const computedDates = useMemo(() => getAvailableDates(), [])
  
  // Initialize available dates
  useEffect(() => {
    setAvailableDates(computedDates)
    
    // Default to tomorrow
    if (computedDates.length > 1) {
      setSelectedDate(computedDates[1])
    }
  }, [computedDates])
  
  // Update available slots when date changes
  useEffect(() => {
    if (selectedDate?.fullDate) {
      const slots = getAvailableSlots(selectedDate.fullDate)
      setAvailableSlots(slots)
    }
  }, [selectedDate])
  
  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date)
    // Reset window when date changes
    setSelectedWindow(null)
  }, [])
  
  // Handle window selection
  const handleWindowSelect = useCallback((window) => {
    if (window.available > 0) {
      setSelectedWindow(window)
    }
  }, [])
  
  // Get the delivery fee based on selected window
  const getCurrentDeliveryFee = useCallback(() => {
    if (selectedWindow) {
      return getDeliveryFee(selectedWindow.id)
    }
    return 500 // Default delivery fee
  }, [selectedWindow])
  
  // Clear schedule
  const clearSchedule = useCallback(() => {
    setSelectedDate(null)
    setSelectedWindow(null)
  }, [])
  
  // Get schedule summary
  const getScheduleSummary = useCallback(() => {
    if (!selectedDate || !selectedWindow) return null
    
    return {
      date: selectedDate.label,
      dateFull: selectedDate.date,
      window: selectedWindow.label,
      time: selectedWindow.displayTime,
      fee: getCurrentDeliveryFee(),
      isPremium: selectedWindow.premium
    }
  }, [selectedDate, selectedWindow, getCurrentDeliveryFee])
  
  // Check if schedule is complete
  const isScheduleComplete = useCallback(() => {
    return selectedDate && selectedWindow && selectedWindow.available > 0
  }, [selectedDate, selectedWindow])
  
  // Toggle schedule mode (for later integration with instant delivery)
  const toggleScheduleMode = useCallback(() => {
    setIsScheduleEnabled(!isScheduleEnabled)
    if (isScheduleEnabled) {
      clearSchedule()
    }
  }, [isScheduleEnabled, clearSchedule])
  
  const value = useMemo(() => ({
    // State
    selectedDate,
    selectedWindow,
    availableDates,
    availableSlots,
    isScheduleEnabled,
    
    // Actions
    handleDateSelect,
    handleWindowSelect,
    clearSchedule,
    toggleScheduleMode,
    
    // Computed
    getCurrentDeliveryFee,
    getScheduleSummary,
    isScheduleComplete
  }), [
    selectedDate,
    selectedWindow,
    availableDates,
    availableSlots,
    isScheduleEnabled,
    handleDateSelect,
    handleWindowSelect,
    clearSchedule,
    toggleScheduleMode,
    getCurrentDeliveryFee,
    getScheduleSummary,
    isScheduleComplete
  ])
  
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}

export default ScheduleContext

