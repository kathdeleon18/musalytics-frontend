<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-white">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-green-900 mb-4">
          {{ stepTitle }}
        </h1>
        <p class="text-gray-600 text-center mb-4">
          {{ stepDescription }}
        </p>
      </div>
      
      <div class="p-2">
        <!-- Step 1: Email Input -->
        <div v-if="currentStep === 'email'">
          <form @submit.prevent="handleEmailSubmit" class="space-y-6">
            <div v-if="error" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>
        
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <button 
              type="submit" 
              class="w-full px-4 py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium  border-none cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              <span v-if="isLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
              <span v-else>Verify Email</span>
            </button>
          </form>
        </div>

        <!-- Step 2: Account Confirmation -->
        <div v-else-if="currentStep === 'confirm'" class="text-center py-4">
          <div class="mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Account Found</h2>
            <div class="mb-4">
              <p class="text-gray-600 mb-2">
                We found an account associated with <span class="font-medium">{{ email }}</span>
              </p>
              <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-green-800 font-medium">{{ foundUser.displayName }}</p>
                <p class="text-green-600 text-sm">{{ foundUser.firstName }} {{ foundUser.lastName }}</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <button 
              @click="sendOTP" 
              class="w-full px-4 py-2.5 text-white font-medium rounded-xl bg-green-700 border-none cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Sending OTP...</span>
              <span v-else>Send OTP Code</span>
            </button>
            
            <button 
              @click="goBack" 
              class="px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 bg-white cursor-pointer transition-colors duration-200 hover:bg-gray-50"
            >
              Use Different Email
            </button>
          </div>
        </div>

        <!-- Step 3: OTP Verification -->
        <div v-else-if="currentStep === 'otp'">
          <form @submit.prevent="handleOTPSubmit" class="space-y-6">
            <div v-if="error" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>

            <div class="text-center mb-6">
              <p class="text-gray-600 mb-4">
                We've sent a 6-digit code to <span class="font-medium">{{ email }}</span>
              </p>
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Enter OTP Code</label>
              <div class="flex gap-2 justify-center">
                <input 
                  v-for="(digit, index) in otpDigits" 
                  :key="index"
                  v-model="otpDigits[index]"
                  @input="handleOTPInput(index, $event)"
                  @keydown="handleOTPKeydown(index, $event)"
                  :ref="el => otpInputs[index] = el"
                  type="text" 
                  maxlength="1"
                  class="w-12 h-12 text-center text-xl font-bold border border-green-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              class="w-full px-4 py-2.5 text-white font-medium rounded-xl bg-green-700 border-none cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading || !isOTPComplete"
            >
              <span v-if="isLoading">Verifying...</span>
              <span v-else>Verify Code</span>
            </button>

            <div class="flex gap-3">
              <button 
                @click="goBackToConfirm" 
                class="flex-1 px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 bg-white cursor-pointer transition-colors duration-200 hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                @click="resendOTP" 
                :disabled="resendTimer > 0"
                class="flex-1 px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 bg-white cursor-pointer transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <span v-if="resendTimer > 0">Resend ({{ resendTimer }}s)</span>
                <span v-else>Resend Code</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Step 4: New Password Creation -->
        <div v-else-if="currentStep === 'newPassword'">
          <form @submit.prevent="handlePasswordSubmit" class="space-y-6">
            <div v-if="error" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>

            <div class="space-y-2">
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                id="newPassword" 
                v-model="newPassword" 
                type="password" 
                required 
                minlength="8"
                class="w-full px-3 py-2 bg-white border border-green-700 rounded-xl text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                id="confirmPassword" 
                v-model="confirmPassword" 
                type="password" 
                required 
                class="w-full px-3 py-2 bg-white border border-green-700 rounded-xl text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <div v-if="passwordError" class="text-red-600 text-sm">
              {{ passwordError }}
            </div>
            
            <div class="flex gap-3">
              <button 
                type="button"
                @click="goBackToOTP" 
                class="flex-1 px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 bg-white cursor-pointer transition-colors duration-200 hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                type="submit" 
                class="flex-1 px-4 py-2.5 text-white font-medium rounded-xl bg-green-700 border-none cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="isLoading || !isPasswordValid"
              >
                <span v-if="isLoading">Updating...</span>
                <span v-else>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Success State -->
        <div v-else-if="currentStep === 'success'" class="text-center py-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Password Updated!</h2>
          <p class="text-gray-600 mb-6">
            Your password has been successfully updated, {{ foundUser.firstName }}!
          </p>
          <button 
            @click="navigateToSignIn" 
            class="w-full px-4 py-2.5 text-white font-medium rounded-xl bg-green-700 border-none cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Sign In Now
          </button>
        </div>
        
        <!-- Back to Sign In Link -->
        <div v-if="currentStep === 'email'" class="mt-6 text-center text-sm">
          <button 
            type="button" 
            @click="navigateToSignIn" 
            class="text-sm text-gray-600 hover:underline transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive state
const currentStep = ref('email')
const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')
const foundUser = ref({})
const error = ref('')
const isLoading = ref(false)
const resendTimer = ref(0)
const otpInputs = ref([])
const generatedOTP = ref('')

// Computed properties
const isOTPComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

const isPasswordValid = computed(() => {
  return newPassword.value.length >= 8 && newPassword.value === confirmPassword.value
})

const passwordError = computed(() => {
  if (newPassword.value && newPassword.value.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    return 'Passwords do not match'
  }
  return ''
})

const stepTitle = computed(() => {
  const titles = {
    email: 'Reset your password',
    confirm: 'Confirm Account',
    otp: 'Enter Verification Code',
    newPassword: 'Create New Password',
    success: 'Password Reset Complete'
  }
  return titles[currentStep.value]
})

const stepDescription = computed(() => {
  const descriptions = {
    email: 'Enter your email address to begin the password reset process.',
    confirm: 'We found your account. Confirm to proceed with password reset.',
    otp: 'Enter the 6-digit code we sent to your email.',
    newPassword: 'Create a strong new password for your account.',
    success: 'Your password has been successfully updated.'
  }
  return descriptions[currentStep.value]
})

// Focus first OTP input when step changes
const focusFirstOTPInput = () => {
  if (currentStep.value === 'otp') {
    setTimeout(() => {
      otpInputs.value[0]?.focus()
    }, 100)
  }
}

// Navigation functions
const navigateToSignIn = () => {
  router.push('/signin')
}

const goBack = () => {
  currentStep.value = 'email'
  error.value = ''
  foundUser.value = {}
}

const goBackToConfirm = () => {
  currentStep.value = 'confirm'
  error.value = ''
  otpDigits.value = ['', '', '', '', '', '']
}

const goBackToOTP = () => {
  currentStep.value = 'otp'
  error.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

// Mock user database for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'aclanrenz12@gmail.com',
    displayName: 'renz aclan',
    firstName: 'renz',
    lastName: 'aclan'
  }
]

// Step handlers
const handleEmailSubmit = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check mock users database
    const user = mockUsers.find(u => u.email.toLowerCase() === email.value.toLowerCase())
    
    if (user) {
      foundUser.value = user
      currentStep.value = 'confirm'
    } else {
      error.value = 'No account found with this email address.'
    }
  } catch (err) {
    console.error('Error checking email:', err)
    error.value = 'An error occurred while verifying your email. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const sendOTP = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    generatedOTP.value = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated OTP for', email.value, ':', generatedOTP.value)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    currentStep.value = 'otp'
    startResendTimer()
  } catch (err) {
    console.error('Error sending OTP:', err)
    error.value = 'Failed to send OTP. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleOTPInput = (index, event) => {
  const value = event.target.value.replace(/[^0-9]/g, '')
  otpDigits.value[index] = value
  
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

const handleOTPKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}

const handleOTPSubmit = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    const otpCode = otpDigits.value.join('')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (otpCode === generatedOTP.value) {
      currentStep.value = 'newPassword'
    } else {
      error.value = 'Invalid OTP code. Please try again.'
      otpDigits.value = ['', '', '', '', '', '']
      otpInputs.value[0]?.focus()
    }
  } catch (err) {
    console.error('Error verifying OTP:', err)
    error.value = 'An error occurred while verifying the code. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const resendOTP = async () => {
  if (resendTimer.value > 0) return
  
  try {
    generatedOTP.value = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('New OTP for', email.value, ':', generatedOTP.value)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    startResendTimer()
    otpDigits.value = ['', '', '', '', '', '']
    otpInputs.value[0]?.focus()
  } catch (err) {
    console.error('Error resending OTP:', err)
    error.value = 'Failed to resend OTP. Please try again.'
  }
}

const startResendTimer = () => {
  resendTimer.value = 60
  const interval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

const handlePasswordSubmit = async () => {
  if (!isPasswordValid.value) return
  
  error.value = ''
  isLoading.value = true
  
  try {
    console.log('Updating password for user:', foundUser.value.id)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    currentStep.value = 'success'
  } catch (err) {
    console.error('Error updating password:', err)
    error.value = 'Failed to update password. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Watchers and lifecycle
watch(currentStep, focusFirstOTPInput)

onMounted(() => {
  // Component initialization
})

onUnmounted(() => {
  // Cleanup
})
</script>
