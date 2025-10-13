// Add otpExpiresAt ref to track expiration time
import { ref } from "vue"
import { auth, db } from "../firebase/config"
import { createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier } from "firebase/auth"
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from "firebase/firestore"
import { getDeviceId } from "../utils/device"
import axios from "axios"

// API base URL - make sure this points to your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

export function useCreateAccount() {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const verificationId = ref(null)
  const verificationMethod = ref(null) // 'email' or 'phone'
  const isVerificationSent = ref(false)
  const isVerified = ref(false)
  const userDocId = ref(null) // Store the document ID
  const otpExpiresAt = ref(null) // Store OTP expiration time

  // Recaptcha verifier instance
  let recaptchaVerifier = null

  // Initialize recaptcha verifier for phone auth
  const initRecaptcha = (containerId) => {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear()
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      "expired-callback": () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        error.value = "reCAPTCHA expired. Please try again."
      },
    })
  }

  // Generate a custom user ID with a simpler format
  const generateCustomUserId = () => {
    // Get current year
    const currentYear = new Date().getFullYear()

    // Generate a random 3-digit number with leading zeros
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")

    // Generate a random uppercase letter
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))

    // Combine all parts to create the custom ID
    return `USR-${randomNumber}${randomLetter}-${currentYear}`
  }

  // Update the registerUser function to use the custom ID
  const registerUser = async (userData) => {
    error.value = null
    isLoading.value = true

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      user.value = userCredential.user

      // Update user profile with display name
      await updateProfile(user.value, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      })

      // Get device ID
      const deviceId = await getDeviceId()

      // Generate custom ID for document
      const customDocId = generateCustomUserId()
      userDocId.value = customDocId

      // Store user data in Firestore using the custom ID as document ID
      await setDoc(doc(db, "users", customDocId), {
        // User identification
        authUid: user.value.uid, // Store Firebase Auth UID for reference
        email: userData.email,
        phoneNumber: userData.phoneNumber,

        // Personal information
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,

        // Location data
        location: userData.location,

        // Device information
        deviceId: deviceId,
        deviceInfo: userData.deviceInfo || null,

        // Account status
        role: "user",
        isVerified: false,
        emailVerified: false,
        phoneVerified: false,
        verificationMethod: null,
        fcmToken: null,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return { user: user.value, documentId: customDocId }
    } catch (e) {
      console.error("Error during registration:", e)
      error.value = e.message || "An error occurred during registration."
      return { error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Helper function to get user document ID from auth UID
  const getUserDocId = async (authUid) => {
    if (userDocId.value) return userDocId.value

    try {
      const q = query(collection(db, "users"), where("authUid", "==", authUid))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id
        userDocId.value = docId
        return docId
      }

      throw new Error("User document not found")
    } catch (e) {
      console.error("Error finding user document:", e)
      throw e
    }
  }

  // Get user data by document ID
  const getUserById = async (docId) => {
    try {
      const docRef = doc(db, "users", docId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id, // This is the user ID (USR-XXXL-YYYY)
          ...docSnap.data(),
        }
      }

      throw new Error("User not found")
    } catch (e) {
      console.error("Error getting user data:", e)
      throw e
    }
  }

  // Get current user data
  const getCurrentUser = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("No authenticated user")
      }

      // Get the document ID for the current user
      const docId = await getUserDocId(auth.currentUser.uid)

      // Get the user data
      return await getUserById(docId)
    } catch (e) {
      console.error("Error getting current user:", e)
      throw e
    }
  }

  // Send verification code via email - MODIFIED to work without authentication token and store expiration time
  const sendEmailVerificationCode = async () => {
    error.value = null
    isLoading.value = true
    otpExpiresAt.value = null

    try {
      if (!user.value) {
        throw new Error("User not authenticated")
      }

      // Get the document ID
      const docId = await getUserDocId(user.value.uid)

      // Get user data
      const userData = await getUserById(docId)

      console.log(`Sending email verification to ${userData.email} for user ${docId}`)
      console.log(`API endpoint: ${API_BASE_URL}/auth/send-email-otp`)

      // Send request to backend to send verification email - WITHOUT authentication token
      const response = await axios.post(`${API_BASE_URL}/auth/send-email-otp`, {
        userId: docId,
        authUid: user.value.uid,
        email: userData.email,
        firstName: userData.firstName,
      })

      console.log("Email verification response:", response.data)

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to send verification email")
      }

      // Store the expiration time
      if (response.data.expiresAt) {
        otpExpiresAt.value = response.data.expiresAt
      }

      // Update verification method
      verificationMethod.value = "email"
      isVerificationSent.value = true

      // Update user document
      await setDoc(
        doc(db, "users", docId),
        {
          verificationMethod: "email",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      return { success: true, expiresAt: otpExpiresAt.value }
    } catch (e) {
      console.error("Error sending email verification:", e)
      error.value = e.message || "Failed to send verification email."
      return { error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Send verification code via SMS - MODIFIED to store expiration time
  const sendPhoneVerificationCode = async (phoneNumber) => {
    error.value = null
    isLoading.value = true
    otpExpiresAt.value = null

    try {
      if (!user.value) {
        throw new Error("User not authenticated")
      }

      // Get the document ID
      const docId = await getUserDocId(user.value.uid)

      console.log(`Sending SMS verification to ${phoneNumber} for user ${docId}`)
      console.log(`API endpoint: ${API_BASE_URL}/auth/send-sms-otp`)

      // Send request to backend to send verification SMS - WITHOUT authentication token
      const response = await axios.post(`${API_BASE_URL}/auth/send-sms-otp`, {
        userId: docId,
        authUid: user.value.uid,
        phoneNumber: phoneNumber,
      })

      console.log("SMS verification response:", response.data)

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to send verification SMS")
      }

      // Store the expiration time
      if (response.data.expiresAt) {
        otpExpiresAt.value = response.data.expiresAt
      }

      // Update verification method
      verificationMethod.value = "phone"
      isVerificationSent.value = true

      // Update user document
      await setDoc(
        doc(db, "users", docId),
        {
          verificationMethod: "phone",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      return { success: true, expiresAt: otpExpiresAt.value }
    } catch (e) {
      console.error("Error sending phone verification:", e)
      error.value = e.message || "Failed to send verification code."
      return { error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Verify OTP code (both email and phone) - MODIFIED to handle error types
  const verifyOTP = async (otpType, code) => {
    error.value = null
    isLoading.value = true

    try {
      if (!user.value) {
        throw new Error("User not authenticated")
      }

      // Get the document ID
      const docId = await getUserDocId(user.value.uid)

      // Get user data to get email/phone
      const userData = await getUserById(docId)

      console.log(`Verifying ${otpType} OTP for user ${docId}`)
      console.log(`API endpoint: ${API_BASE_URL}/auth/verify-otp`)

      // Send request to backend to verify OTP - WITHOUT authentication token
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId: docId,
        authUid: user.value.uid,
        otpType: otpType,
        code: code,
        // Include the identifier based on otpType
        email: otpType === "email" ? userData.email : undefined,
        phoneNumber: otpType === "phone" ? userData.phoneNumber : undefined,
      })

      console.log("OTP verification response:", response.data)

      if (!response.data.verified) {
        // Clear expiration time if code is expired
        if (response.data.errorType === "expired") {
          otpExpiresAt.value = null
        }
        throw new Error(response.data.error || "Invalid verification code")
      }

      // Update verification status
      isVerified.value = true
      otpExpiresAt.value = null // Clear expiration time after successful verification

      // Update user document to mark as verified
      await setDoc(
        doc(db, "users", docId),
        {
          isVerified: true,
          [`${otpType}Verified`]: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      // Reload user to get updated custom claims
      await user.value.getIdTokenResult(true)

      return { verified: true }
    } catch (e) {
      console.error("Error verifying OTP:", e)
      error.value = e.message || "Invalid verification code."
      return { error: error.value, errorType: e.response?.data?.errorType }
    } finally {
      isLoading.value = false
    }
  }

  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      if (!user.value) {
        throw new Error("User not authenticated")
      }

      // Get the document ID
      const docId = await getUserDocId(user.value.uid)

      // Get user data
      const userData = await getUserById(docId)

      return {
        isVerified: userData.isVerified || false,
        emailVerified: userData.emailVerified || false,
        phoneVerified: userData.phoneVerified || false,
      }
    } catch (e) {
      console.error("Error checking verification status:", e)
      error.value = e.message || "Failed to check verification status."
      return { error: error.value }
    }
  }

  // Update FCM token
  const updateFcmToken = async (token) => {
    try {
      if (!user.value) {
        throw new Error("User not authenticated")
      }

      // Get the document ID
      const docId = await getUserDocId(user.value.uid)

      await setDoc(
        doc(db, "users", docId),
        {
          fcmToken: token,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      return { success: true }
    } catch (e) {
      console.error("Error updating FCM token:", e)
      return { error: e.message }
    }
  }

  return {
    user,
    isLoading,
    error,
    verificationMethod,
    isVerificationSent,
    isVerified,
    userDocId,
    otpExpiresAt,
    registerUser,
    getUserDocId,
    getUserById,
    getCurrentUser,
    sendEmailVerificationCode,
    sendPhoneVerificationCode,
    verifyOTP,
    checkVerificationStatus,
    updateFcmToken,
  }
}

