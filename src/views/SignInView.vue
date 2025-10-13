<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background-color: white;">
    <!-- Back Button -->
    <button 
      @click="navigateToLanding"
      class="absolute top-4 left-4 p-2 transition-colors group"
      aria-label="Back to home"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
    
    <div class="w-full max-w-md">
      <!-- Login Form -->
      <div v-if="currentStep === 'login'" class="p-6">
          <div class="text-center mb-6">
            <img
              src="/images/musaLogo.svg"
              alt="MUSALYTICS Logo"
              class="mx-auto h-12 w-auto"
            />
            <h1 class="text-3xl font-bold mt-6" style="color:#283618;">Welcome Back</h1>
            <p class="text-gray-600 text-base">Sign in to your account</p>
          </div>
        
        <form @submit.prevent="handleSignIn" class="space-y-4">
          <!-- Error Alert -->
          <div v-if="error" class="border border-red-600 text-red-600 bg-red-100/30 px-4 py-3 rounded-xl text-sm">
            {{ error }}
          </div>
          
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-600">Email</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required
              class="w-full px-3 py-2 bg-transparent rounded-xl text-black"
              style="border: 1px solid #606c38;"
              placeholder="your@email.com"
            />
          </div>
          
          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex justify-between">
              <label for="password" class="block text-sm font-medium text-gray-600">Password</label>
              <router-link
                to="/reset-password"
                class="text-sm"
                style="color: #606c38;"
                @mouseover="$event.target.style.textDecoration = 'underline'"
                @mouseleave="$event.target.style.textDecoration = 'none'"
              >
                Forgot password?
              </router-link>
            </div>

            <div class="relative">
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full px-3 py-2 bg-transparent rounded-xl text-black pr-10"
                style="border: 1px solid #606c38;"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-3 flex items-center text-gray-400"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.963 9.963 0 012.303-3.568M15 12a3 3 0 00-4.243-2.828M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          
          <!-- Remember Me -->
          <div class="flex items-center">
            <input 
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 rounded border-[#606c38] bg-white checked:bg-[#606c38] checked:border-[#606c38] checked:text-white focus:ring-[#606c38] focus:ring-offset-gray-800"
            />
            <label 
              for="remember-me"
              :class="['ml-2 block text-sm', rememberMe ? 'text-[#606c38]' : 'text-gray-400']"
            >

              Remember me
            </label>
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full py-2.5 px-4 text-white font-medium  rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style="background-color: #606c38; "
            :disabled="isLoading"
          >
            <span v-if="isLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Log In</span>
          </button>
          
          <!-- Sign Up Link -->
          <div class="text-center mt-4 text-sm text-gray-600">
            Don't have an account?
            <router-link
              to="/signup"
              class="ml-1"
              style="color: #606c38;"
              @mouseover="$event.target.style.textDecoration = 'underline'"
              @mouseleave="$event.target.style.textDecoration = 'none'"
            >
              Sign up
            </router-link>
          </div>
        </form>
      </div>
      
      <!-- Email Verification Form -->
      <div v-else-if="currentStep === 'email-verification'" class="p-6">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold" style="color: #283618;">Verify Your Email</h1>
          <p class="text-gray-400 mt-2">We've sent a verification code to {{ email }}</p>
        </div>
        
        <!-- Error Alert -->
        <div v-if="error" class="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md text-sm mb-4">
          {{ error }}
        </div>
        
        <!-- OTP Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-2">Enter verification code</label>
          <div class="flex justify-between gap-2">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              :class="[
                'w-full aspect-square text-center text-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#606c38]',
                'border rounded-xl bg-transparent',
                otpDigits[index] ? 'text-[#283618]' : 'text-gray-400',
              ]"
              style="border-color: #606c38;"
              @input="handleOtpInput(index)"
              @keydown="handleOtpKeydown($event, index)"
              :ref="el => { if (el) otpInputRefs[index] = el }"
            />
          </div>
        </div>
        
        <!-- Timer -->
        <div v-if="otpExpirationTime > 0" class="text-center text-sm text-gray-400 mb-4">
          Code expires in: <span class="font-medium text-emerald-400">{{ formatTime(otpExpirationTime) }}</span>
        </div>
        
        <!-- Verify Button -->
        <button 
          @click="verifyEmailCode" 
          class="w-full py-2.5 px-4 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors mb-4"
          style="background-color: #606c38;"
          :disabled="!isOtpComplete || isVerifying"
        >
          <span v-if="isVerifying">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
          <span v-else>Verify Code</span>
        </button>
        
        <!-- Resend Code -->
        <div class="text-center">
        <button 
          @click="resendEmailVerification" 
          class="text-sm"
          style="color: #606c38;"
          :disabled="emailResendCooldown > 0 || isResending || resendAttemptsExceeded"
          @mouseover="$event.target.style.textDecoration = 'underline'"
          @mouseleave="$event.target.style.textDecoration = 'none'"
        >
            <span v-if="isResending">
              <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-emerald-400 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
            <span v-else-if="emailResendCooldown > 0">
              Resend code in {{ formatTime(emailResendCooldown) }}
            </span>
            <span v-else-if="resendAttemptsExceeded">
              Too many attempts. Try again in {{ formatTime(lockoutTimeRemaining) }}
            </span>
            <span v-else>Resend verification code</span>
          </button>
        </div>
        
        <!-- Back to Login -->
        <div class="text-center mt-4">
          <button 
            @click="currentStep = 'login'" 
            class="text-sm text-gray-400"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useCreateAccount } from '../composables/useCreateAccount';

const router = useRouter();
const { 
  sendEmailVerificationCode, 
  verifyOTP,
  otpExpiresAt
} = useCreateAccount();

// Navigation function
const navigateToLanding = () => {
  router.push('/');
};

// Form steps
const currentStep = ref('login');

const showPassword = ref(false);

// Form data
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');
const isLoading = ref(false);

// User data
const userData = ref(null);
const userDocId = ref(null);

// OTP input
const otpDigits = ref(['', '', '', '', '', '']);
const otpInputRefs = ref([]);
const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

// Verification states
const isVerifying = ref(false);
const isResending = ref(false);
const otpExpirationTime = ref(0);
let otpExpirationTimer = null;
const localOtpExpiresAt = ref(null);

// Cooldown timers
const emailResendCooldown = ref(0);
let emailCooldownTimer = null;
const resendAttempts = ref(0);
const resendAttemptsExceeded = ref(false);
const lockoutTimeRemaining = ref(0);
let lockoutTimer = null;

// Format time function for the timer display
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Watch for changes in otpExpiresAt from the composable
watch(() => otpExpiresAt.value, (newValue) => {
  if (newValue) {
    localOtpExpiresAt.value = newValue;
    startOtpExpirationTimer(newValue);
  } else {
    // If otpExpiresAt is cleared (e.g., after successful verification)
    if (otpExpirationTimer) {
      clearInterval(otpExpirationTimer);
      otpExpirationTime.value = 0;
      localOtpExpiresAt.value = null;
    }
  }
});

// Start OTP expiration timer
const startOtpExpirationTimer = (expiresAt) => {
  // Clear any existing timer
  if (otpExpirationTimer) {
    clearInterval(otpExpirationTimer);
  }

  if (!expiresAt) return;

  // Calculate initial time remaining in seconds
  const now = Date.now();
  const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

  otpExpirationTime.value = timeRemaining;

  // Start the timer
  otpExpirationTimer = setInterval(() => {
    if (otpExpirationTime.value > 0) {
      otpExpirationTime.value--;
    } else {
      // When timer reaches 0, clear the interval
      clearInterval(otpExpirationTimer);
      // Optionally show a notification that the code has expired
      if (currentStep.value === 'email-verification') {
        error.value = "Verification code has expired. Please request a new code.";
      }
    }
  }, 1000);
};

// Clean up on component unmount
onBeforeUnmount(() => {
  // Clear all timers
  if (emailCooldownTimer) {
    clearInterval(emailCooldownTimer);
  }

  if (otpExpirationTimer) {
    clearInterval(otpExpirationTimer);
  }

  if (lockoutTimer) {
    clearInterval(lockoutTimer);
  }
});

// Handle OTP input
const handleOtpInput = (index) => {
  // Ensure only digits
  otpDigits.value[index] = otpDigits.value[index].replace(/\D/g, '');

  // Move to next input if current is filled
  if (otpDigits.value[index] && index < 5) {
    otpInputRefs.value[index + 1].focus();
  }
};

// Handle OTP keydown
const handleOtpKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      // If current input is empty, move to previous input
      otpInputRefs.value[index - 1].focus();
    }
  }
};

// Progressive cooldown for resend attempts
const getProgressiveCooldown = computed(() => {
  switch (resendAttempts.value) {
    case 0: return 60; // 1 minute
    case 1: return 120; // 2 minutes
    case 2: return 300; // 5 minutes
    case 3: return 600; // 10 minutes
    default: return 1800; // 30 minutes (lockout)
  }
});

// Start email cooldown timer
const startEmailCooldown = () => {
  // Clear any existing timer
  if (emailCooldownTimer) {
    clearInterval(emailCooldownTimer);
  }

  // Increment resend attempts
  resendAttempts.value++;

  // Check if max attempts reached
  if (resendAttempts.value >= 5) {
    resendAttemptsExceeded.value = true;
    lockoutTimeRemaining.value = 1800; // 30 minutes lockout
    
    // Start lockout timer
    lockoutTimer = setInterval(() => {
      if (lockoutTimeRemaining.value > 0) {
        lockoutTimeRemaining.value--;
      } else {
        clearInterval(lockoutTimer);
        resendAttemptsExceeded.value = false;
        resendAttempts.value = 0; // Reset attempts after lockout
      }
    }, 1000);
    
    return;
  }

  // Set cooldown based on attempt number
  emailResendCooldown.value = getProgressiveCooldown.value;

  // Start the timer
  emailCooldownTimer = setInterval(() => {
    if (emailResendCooldown.value > 0) {
      emailResendCooldown.value--;
    } else {
      clearInterval(emailCooldownTimer);
    }
  }, 1000);
};

// Find user document by authUid - ONLY CALL THIS WHEN AUTHENTICATED
const findUserByAuthUid = async (authUid) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", authUid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error("Error finding user by authUid:", error);
    throw error;
  }
};

// Save user data to localStorage for persistence
const saveUserToLocalStorage = (user) => {
  if (!user) return;

  // Only save non-sensitive data
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role || 'user',
    isVerified: user.isVerified
  };

  localStorage.setItem('user', JSON.stringify(userData));
};

// Update the handleSignIn function to ensure proper redirection
const handleSignIn = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    console.log(`Attempting to sign in with email: ${email.value}`);
    
    // First authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const authUser = userCredential.user;
    console.log(`Successfully authenticated with Firebase Auth: ${authUser.uid}`);
    
    // Now that we're authenticated, fetch the user document
    const user = await findUserByAuthUid(authUser.uid);
    
    if (!user) {
      // This is an unusual case - authenticated but no Firestore document
      console.error("User authenticated but no Firestore document found");
      await signOut(auth);
      error.value = "Your account is not properly set up. Please contact support.";
      isLoading.value = false;
      return;
    }
    
    console.log(`Found user document: ${user.id}, role: ${user.role || 'user'}, isVerified: ${user.isVerified}`);
    
    // Store user document ID for later use
    userDocId.value = user.id;
    userData.value = user;
    
    // Check if user is verified
    if (!user.isVerified) {
      console.log("User is not verified, showing verification screen");
      // User exists but is not verified, show verification screen
      await signOut(auth); // Sign out until verified
      currentStep.value = 'email-verification';
      isLoading.value = false;
      
      // Send verification code
      await resendEmailVerification();
      return;
    }
    
    // Update last login timestamp
    await updateDoc(doc(db, "users", user.id), {
      lastLoginAt: serverTimestamp()
    });
    console.log("Updated last login timestamp");
    
    // Save user data to localStorage for persistence
    saveUserToLocalStorage(user);
    console.log("Saved user data to localStorage");
    
    // Determine the correct dashboard URL based on role
    const dashboardUrl = user.role === 'professional' ? '/professional/dashboard' : '/user/dashboard';
    console.log(`Redirecting to ${dashboardUrl}`);
    
    // Force a complete page reload to ensure fresh authentication state
    window.location.href = dashboardUrl;
  } catch (authError) {
    console.error("Error during sign in:", authError);
    isLoading.value = false;
    
    // Handle specific auth errors
    if (authError.code === 'auth/user-not-found') {
      error.value = "No account found with this email. Please sign up first.";
    } else if (authError.code === 'auth/wrong-password') {
      error.value = "Incorrect password. Please try again.";
    } else if (authError.code === 'auth/too-many-requests') {
      error.value = "Too many failed login attempts. Please try again later.";
    } else if (authError.code === 'auth/invalid-credential') {
      error.value = "Invalid credentials. Please check your email and password.";
    } else {
      error.value = "Failed to sign in. Please check your credentials.";
    }
  }
};

// Resend email verification
const resendEmailVerification = async () => {
  if (emailResendCooldown.value > 0 || resendAttemptsExceeded.value) return;

  error.value = '';
  isResending.value = true;

  try {
    console.log("Attempting to resend email verification");
    // We need to temporarily sign in to send the verification code
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      console.log("Signed in temporarily for verification");
    } catch (authError) {
      console.error("Failed to sign in for verification:", authError);
      throw new Error("Failed to authenticate for verification. Please check your credentials.");
    }
    
    // Send verification code
    const result = await sendEmailVerificationCode();
    console.log("Verification code sent:", result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Clear OTP inputs
    otpDigits.value = ['', '', '', '', '', ''];
    
    // Start cooldown timer
    startEmailCooldown();
    
    // Restart OTP expiration timer if expiresAt is returned
    if (result.expiresAt) {
      startOtpExpirationTimer(result.expiresAt);
    }
    
  } catch (e) {
    console.error("Error resending verification:", e);
    error.value = e.message || "Failed to send verification code.";
  } finally {
    isResending.value = false;
  }
};

// Verify email code
const verifyEmailCode = async () => {
  if (!isOtpComplete.value) return;

  error.value = '';
  isVerifying.value = true;

  // Check if code has expired before sending request
  if (otpExpirationTime.value === 0 && localOtpExpiresAt.value !== null) {
    error.value = 'Verification code has expired. Please request a new code.';
    isVerifying.value = false;
    return;
  }

  try {
    console.log("Attempting to verify email code");
    // Combine OTP digits
    const code = otpDigits.value.join('');
    
    // We need to temporarily sign in to verify the code
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      console.log("Signed in temporarily for verification");
    } catch (authError) {
      console.error("Failed to sign in for verification:", authError);
      throw new Error("Failed to authenticate for verification. Please check your credentials.");
    }
    
    // Verify OTP
    const result = await verifyOTP('email', code);
    console.log("Verification result:", result);
    
    if (result.error) {
      // If code expired, show a more user-friendly message
      if (result.errorType === 'expired') {
        localOtpExpiresAt.value = null; // Mark as expired
        throw new Error('Verification code has expired. Please request a new code.');
      }
      throw new Error(result.error);
    }
    
    // Now that we're authenticated, fetch the user document
    const user = await findUserByAuthUid(auth.currentUser.uid);
    console.log("User document after verification:", user);
    
    if (user) {
      // Update user data
      userData.value = user;
      userData.value.isVerified = true;
      
      // Save user data to localStorage for persistence
      saveUserToLocalStorage(userData.value);
      console.log("Saved verified user data to localStorage");
      
      // Force navigation based on role - use window.location for direct navigation
      if (user.role === 'professional') {
        console.log('Redirecting to professional dashboard after verification');
        window.location.href = '/professional/dashboard';
      } else {
        console.log('Redirecting to user dashboard after verification');
        window.location.href = '/user/dashboard';
      }
    } else {
      throw new Error("User profile not found after verification.");
    }
    
  } catch (e) {
    console.error("Error verifying email code:", e);
    error.value = e.message || "Invalid verification code. Please try again.";
    isVerifying.value = false;
    
    // Sign out if verification failed
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error("Error signing out:", signOutError);
    }
  }
};
</script>

