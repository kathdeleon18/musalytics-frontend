import { ref } from "vue"

// WebSocket connection state
const socket = ref(null)
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const reconnectTimeout = ref(null)
const listeners = ref({})

// WebSocket server URL - should be configurable based on environment
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080"

/**
 * Initialize WebSocket connection
 */
export function initializeWebSocket() {
  if (socket.value) {
    console.log("WebSocket already initialized")
    return
  }

  console.log("Initializing WebSocket connection to:", WS_URL)

  try {
    socket.value = new WebSocket(WS_URL)

    socket.value.onopen = () => {
      console.log("WebSocket connection established")
      isConnected.value = true
      reconnectAttempts.value = 0

      // Clear any reconnect timeout
      if (reconnectTimeout.value) {
        clearTimeout(reconnectTimeout.value)
        reconnectTimeout.value = null
      }
    }

    socket.value.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason)
      isConnected.value = false

      // Attempt to reconnect if not a clean close
      if (event.code !== 1000) {
        attemptReconnect()
      }
    }

    socket.value.onerror = (error) => {
      console.error("WebSocket error:", error)
      isConnected.value = false
    }

    socket.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log("WebSocket message received:", message)

        // Handle message based on type
        if (message.type && listeners.value[message.type]) {
          listeners.value[message.type].forEach((callback) => {
            try {
              callback(message.data)
            } catch (err) {
              console.error(`Error in listener for ${message.type}:`, err)
            }
          })
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err)
      }
    }
  } catch (err) {
    console.error("Failed to initialize WebSocket:", err)
    attemptReconnect()
  }
}

/**
 * Attempt to reconnect to WebSocket server
 */
function attemptReconnect() {
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    console.error(`Maximum reconnect attempts (${maxReconnectAttempts}) reached`)
    return
  }

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
  console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.value + 1}/${maxReconnectAttempts})`)

  reconnectTimeout.value = setTimeout(() => {
    reconnectAttempts.value++
    initializeWebSocket()
  }, delay)
}

/**
 * Send a message through the WebSocket connection
 * @param {string} type - Message type
 * @param {any} data - Message data
 * @returns {boolean} - Whether the message was sent successfully
 */
export function sendMessage(type, data) {
  if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected")
    return false
  }

  try {
    const message = JSON.stringify({ type, data })
    socket.value.send(message)
    return true
  } catch (err) {
    console.error("Error sending WebSocket message:", err)
    return false
  }
}

/**
 * Add a listener for a specific message type
 * @param {string} type - Message type to listen for
 * @param {Function} callback - Function to call when message is received
 */
export function addListener(type, callback) {
  if (!listeners.value[type]) {
    listeners.value[type] = []
  }

  listeners.value[type].push(callback)
}

/**
 * Remove a listener for a specific message type
 * @param {string} type - Message type
 * @param {Function} callback - Function to remove
 */
export function removeListener(type, callback) {
  if (!listeners.value[type]) return

  listeners.value[type] = listeners.value[type].filter((cb) => cb !== callback)
}

/**
 * Close the WebSocket connection
 */
export function closeConnection() {
  if (socket.value) {
    socket.value.close(1000, "User initiated disconnect")
    socket.value = null
  }

  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value)
    reconnectTimeout.value = null
  }

  isConnected.value = false
}

/**
 * Get the current connection status
 * @returns {boolean} - Whether the WebSocket is connected
 */
export function getConnectionStatus() {
  return isConnected.value
}

