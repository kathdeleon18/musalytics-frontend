<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useCreateAccount } from './composables/useCreateAccount'

// Use the composable directly instead of authStore
const { user } = useCreateAccount()

onMounted(() => {
  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    // We don't need to do anything here since the auth state
    // is already being tracked in the useCreateAccount composable
    console.log("Auth state changed:", currentUser ? "User logged in" : "User logged out")
  })
  
  // Clean up listener on component unmount
  return () => unsubscribe()
})
</script>