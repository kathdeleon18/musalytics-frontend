// Utility to get a unique device identifier

// Generate a random device ID if not already stored
export const getDeviceId = async () => {
    // Check if device ID is already stored in localStorage
    let deviceId = localStorage.getItem("device_id")
  
    if (!deviceId) {
      // Generate a random device ID
      deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
      // Store it in localStorage
      localStorage.setItem("device_id", deviceId)
    }
  
    return deviceId
  }
  
  // Get basic device information
  export const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const vendor = navigator.vendor
    const language = navigator.language
  
    return {
      userAgent,
      platform,
      vendor,
      language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
  
  