"use client"

import { ref, computed } from "vue"
import { auth } from "../firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  signInWithGoogle,
  signInWithFacebook,
} from "@/firebase/auth"

export function useAuth() {
  const user = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  // Initialize auth state
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isLoading.value = false
  })

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)

  // Register a new user
  const register = async (email, password, userData) => {
    error.value = null
    isLoading.value = true

    try {
      const result = await registerUser(email, password, userData)

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Login an existing user
  const login = async (email, password) => {
    error.value = null
    isLoading.value = true

    try {
      const result = await loginUser(email, password)

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Logout the current user
  const logout = async () => {
    error.value = null
    isLoading.value = true

    try {
      const result = await logoutUser()

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Reset password
  const sendPasswordReset = async (email) => {
    error.value = null
    isLoading.value = true

    try {
      const result = await resetPassword(email)

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Google sign in
  const loginWithGoogle = async () => {
    error.value = null
    isLoading.value = true

    try {
      const result = await signInWithGoogle()

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Facebook sign in
  const loginWithFacebook = async () => {
    error.value = null
    isLoading.value = true

    try {
      const result = await signInWithFacebook()

      if (result.error) {
        error.value = result.error.message
      }

      return result
    } catch (e) {
      error.value = e.message
      return { error: e }
    } finally {
      isLoading.value = false
    }
  }

  // Add this function to the useAuth composable to get the user's document ID
  const getUserId = async () => {
    if (!user.value) return null

    try {
      // Import the getUserDocId function from useCreateAccount
      const { getUserDocId } = require("./useCreateAccount")

      // Get the document ID for the current user
      return await getUserDocId(user.value.uid)
    } catch (e) {
      console.error("Error getting user ID:", e)
      return null
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    sendPasswordReset,
    loginWithGoogle,
    loginWithFacebook,
    getUserId,
  }
}

