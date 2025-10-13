import axios from "axios"
import { sendMessage } from "./websocketService"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"
import { query, where, orderBy, getDocs } from "firebase/firestore"

// API base URL - should be configurable based on environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

/**
 * Upload an image for analysis
 * @param {File|Blob} imageFile - The image file to upload
 * @param {Object} metadata - Additional metadata about the image
 * @returns {Promise<Object>} - The upload response
 */
export async function uploadImage(imageFile, metadata = {}) {
  try {
    // Get current user
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated. Please sign in again.")
    }
    console.log("Current user:", user.uid)

    // First upload to Firebase Storage
    const storage = getStorage()
    const timestamp = Date.now()
    // Use a path structure that matches your security rules
    // Using 'users/{uid}/images/{filename}' format
    const fileName = `users/${user.uid}/images/${timestamp}_${imageFile.name}`
    console.log("Uploading to path:", fileName)
    const storageRef = ref(storage, fileName)

    // Upload the file
    console.log("Starting upload to Firebase...")
    const uploadResult = await uploadBytes(storageRef, imageFile)
    console.log("Upload successful:", uploadResult)

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref)
    console.log("Download URL:", downloadURL)

    // Create metadata for backend
    const fullMetadata = {
      timestamp: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
      userId: user.uid,
      firebaseUrl: downloadURL,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      ...metadata,
    }

    // Register the image with the backend
    console.log("Registering image with backend...")
    const response = await axios.post(`${API_URL}/images/upload`, {
      firebaseUrl: downloadURL,
      metadata: fullMetadata,
    })
    console.log("Backend registration successful:", response.data)

    return response.data
  } catch (error) {
    console.error("Error uploading image:", error)
    // Provide more detailed error information
    if (error.code && error.code.includes("storage/")) {
      console.error("Firebase Storage error:", error.code)
      if (error.code === "storage/unauthorized") {
        throw new Error("Firebase Storage permission denied. Please check your Firebase security rules.")
      }
    }
    throw error
  }
}

/**
 * Request analysis of an uploaded image via WebSocket
 * @param {string} imageId - The ID of the uploaded image
 * @param {Object} options - Analysis options
 * @returns {boolean} - Whether the request was sent successfully
 */
export function requestImageAnalysis(imageId, options = {}) {
  return sendMessage("analyze_image", {
    imageId,
    options,
  })
}

/**
 * Get analysis results for an image
 * @param {string} analysisId - The ID of the analysis
 * @returns {Promise<Object>} - The analysis results
 */
export async function getAnalysisResults(analysisId) {
  try {
    const response = await axios.get(`${API_URL}/analysis/${analysisId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching analysis results:", error)
    throw error
  }
}

/**
 * Save analysis to the 'reports' collection using the provided data
 * @param {string} analysisId - The ID to use for the new report document
 * @param {Object} reportData - The complete object of data to save
 * @returns {Promise<Object>} - A confirmation object
 */
export async function saveAnalysisToReports(analysisId, reportData) {
  try {
    // 1. Check if the data contains a userId, which is required for security rules.
    if (!reportData.userId) {
      throw new Error("User ID is missing from the report data. Cannot save.");
    }

    // 2. Create a reference to the document in the 'reports' collection,
    //    using the analysisId as the document's unique ID to prevent duplicates.
    const reportRef = doc(db, "reports", analysisId);

    // 3. Save the complete data object directly.
    //    There is no need to fetch from another collection because you've already sent all the data.
    await setDoc(reportRef, reportData, { merge: true });

    console.log("Analysis successfully saved to reports with ID:", analysisId);

    return {
      success: true,
      reportId: analysisId,
    };
  } catch (error) {
    // This will catch and log the detailed Firebase error (like permissions)
    console.error("Error in saveAnalysisToReports service:", error);
    throw error; // Re-throw the error so the Vue component can display it
  }
}
/**
 * Get recent scans for the current user
 * @param {number} limit - Maximum number of scans to retrieve
 * @returns {Promise<Array>} - The recent scans
 */
export async function getRecentScans(limit = 10) {
  try {
    // Get current user
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    const response = await axios.get(`${API_URL}/scans/recent`, {
      params: {
        limit,
        userId: user.uid,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching recent scans:", error)
    throw error
  }
}

/**
 * Save scan data to Firestore scan_history collection
 * @param {Object} scanData - The scan data to save
 * @returns {Promise<Object>} - The saved scan document reference
 */
export async function saveScanToFirestore(scanData) {
  try {
    // Get current user
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Check if analysisId is provided
    if (!scanData.analysisId) {
      throw new Error("Analysis ID is required to save scan history")
    }
    console.log("Saving scan with analysisId:", scanData.analysisId)

    // Prepare data for Firestore
    const firestoreData = {
      userId: user.uid,
      timestamp: serverTimestamp(),
      analysisId: scanData.analysisId,
      disease: scanData.disease || "Unknown",
      confidence: scanData.confidence || 0,
      severity: scanData.severity || "Unknown",
      imageUrl: scanData.imageUrl || null,
      description: scanData.description || null,
      deviceInfo: navigator.userAgent,
      deviceType: scanData.deviceType || "web",
      captureMethod: scanData.captureMethod || "upload",
      plantType: "banana",
      treatments: scanData.treatments || [],
      preventionTips: scanData.preventionTips || [],
      location: scanData.location || null, // Device/profile lat/lon
      notes: scanData.notes || "",
      saved: true,
      diseaseDetails: scanData.diseaseDetails || null,
      weather: scanData.weather || null, // Current real-time weather
      userLocationDetails: scanData.userLocationDetails || null, // User's profile location details
    }

    // Use the analysisId as the document ID to prevent duplicates
    const scanDocRef = doc(db, "scan_history", scanData.analysisId)

    // Set the document with the prepared data
    await setDoc(scanDocRef, firestoreData)

    console.log("Scan saved to Firestore history with ID:", scanData.analysisId)

    return {
      success: true,
      scanId: scanData.analysisId,
    }
  } catch (error) {
    console.error("Error saving scan to Firestore:", error)
    throw error
  }
}

// Add a function to fetch scan history for a user
export async function getUserScanHistory(userId, limit = 50) {
  try {
    const scanHistoryRef = collection(db, "scan_history")
    const q = query(scanHistoryRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(limit))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error fetching user scan history:", error)
    throw error
  }
}

// Add a function to get disease trend data
export async function getDiseaseTrendData(options = {}) {
  try {
    const {
      timeframe = "month", // day, week, month, year
      region = null,
      limit = 1000,
    } = options

    // Calculate the start date based on timeframe
    const now = new Date()
    const startDate = new Date()
    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Create the query
    const scanHistoryRef = collection(db, "scan_history")
    const constraints = [where("timestamp", ">=", startDate), orderBy("timestamp", "desc"), limit(limit)]

    // Add region filter if provided
    if (region) {
      constraints.unshift(where("region", "==", region))
    }

    const q = query(scanHistoryRef, ...constraints)
    const querySnapshot = await getDocs(q)

    // Process the data for trend analysis
    const results = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        disease: data.disease,
        confidence: data.confidence,
        severity: data.severity,
        timestamp: data.timestamp?.toDate() || new Date(),
        location: data.location,
        region: data.region,
        province: data.province,
      }
    })

    return results
  } catch (error) {
    console.error("Error fetching disease trend data:", error)
    throw error
  }
}
