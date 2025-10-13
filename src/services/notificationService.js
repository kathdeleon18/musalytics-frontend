import { ref } from "vue"
import { auth, db } from "../firebase/config"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"

// State
const notifications = ref([])
const unreadCount = ref(0)
const isLoading = ref(false)

/**
 * Initialize notification listeners for the current user
 */
export function initializeNotifications() {
  if (!auth.currentUser) {
    console.log("User not authenticated, skipping notification initialization")
    return
  }

  isLoading.value = true

  try {
    const userId = auth.currentUser.uid

    // Listen for user's notifications
    const userNotificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20),
    )

    const unsubscribe = onSnapshot(userNotificationsQuery, (snapshot) => {
      const notificationList = []
      let unread = 0

      snapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data(),
        }

        notificationList.push(notification)

        if (!notification.read) {
          unread++
        }
      })

      notifications.value = notificationList
      unreadCount.value = unread
      isLoading.value = false
    })

    return unsubscribe
  } catch (error) {
    console.error("Error initializing notifications:", error)
    isLoading.value = false
    return null
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId) {
  if (!auth.currentUser) return

  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date(),
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsRead() {
  if (!auth.currentUser) return

  try {
    const batch = db.batch()

    notifications.value.forEach((notification) => {
      if (!notification.read) {
        const notificationRef = doc(db, "notifications", notification.id)
        batch.update(notificationRef, {
          read: true,
          readAt: new Date(),
        })
      }
    })

    await batch.commit()
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}

/**
 * Subscribe to disease updates
 * @param {string} diseaseName - The name of the disease to subscribe to
 */
export async function subscribeToDisease(diseaseName) {
  if (!auth.currentUser) return false

  try {
    const userId = auth.currentUser.uid
    const subscriptionId = `${userId}_${diseaseName.toLowerCase()}`

    await setDoc(doc(db, "subscriptions", subscriptionId), {
      userId: userId,
      diseaseName: diseaseName.toLowerCase(),
      createdAt: new Date(),
      active: true,
    })

    return true
  } catch (error) {
    console.error("Error subscribing to disease:", error)
    return false
  }
}

/**
 * Unsubscribe from disease updates
 * @param {string} diseaseName - The name of the disease to unsubscribe from
 */
export async function unsubscribeFromDisease(diseaseName) {
  if (!auth.currentUser) return false

  try {
    const userId = auth.currentUser.uid
    const subscriptionId = `${userId}_${diseaseName.toLowerCase()}`

    await updateDoc(doc(db, "subscriptions", subscriptionId), {
      active: false,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error unsubscribing from disease:", error)
    return false
  }
}

/**
 * Check if user is subscribed to a disease
 * @param {string} diseaseName - The name of the disease to check
 * @returns {Promise<boolean>} - Whether the user is subscribed
 */
export async function isSubscribedToDisease(diseaseName) {
  if (!auth.currentUser) return false

  try {
    const userId = auth.currentUser.uid
    const subscriptionId = `${userId}_${diseaseName.toLowerCase()}`

    const subscriptionDoc = await getDoc(doc(db, "subscriptions", subscriptionId))

    if (subscriptionDoc.exists()) {
      const data = subscriptionDoc.data()
      return data.active === true
    }

    return false
  } catch (error) {
    console.error("Error checking disease subscription:", error)
    return false
  }
}

/**
 * Request information for an unknown disease
 * @param {string} diseaseName - The name of the disease
 * @param {string} imageId - The ID of the image showing the disease
 * @param {string} notes - Additional notes from the user
 */
export async function requestDiseaseInformation(diseaseName, imageId, notes = "") {
  if (!auth.currentUser) return null

  try {
    const userId = auth.currentUser.uid
    const requestId = `request_${Date.now()}`

    await setDoc(doc(db, "diseaseRequests", requestId), {
      userId,
      diseaseName: diseaseName.toLowerCase(),
      imageId,
      notes,
      status: "pending",
      createdAt: new Date(),
    })

    // Automatically subscribe the user to updates
    await subscribeToDisease(diseaseName)

    return requestId
  } catch (error) {
    console.error("Error requesting disease information:", error)
    return null
  }
}

export { notifications, unreadCount, isLoading }
