<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background-color: white;">
    <!-- Back Button -->
    <button 
      @click="navigateToLanding"
      class="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
      aria-label="Back to home"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
    
    <div class="w-full max-w-[870px]">
  
        <!-- Logo and Title - only show during registration -->
        <div v-if="currentStep === 'register'" class="text-center mb-8">
               <img
                src="/images/musaLogo.svg"
                alt="MUSALYTICS Logo"
                class="mx-auto h-12 w-auto"
              />
          <h1 class="text-3xl font-bold mt-6" style="color:#283618;">Get Started</h1>
          <p class="text-gray-600 text-base">Enter your details to proceed further.</p>
        </div>
        
        <!-- Registration Form -->
        <div v-if="currentStep === 'register'" class="p-6">
          <form @submit.prevent="handleSignUp" class="space-y-2">
            <!-- Alert for errors -->
            <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-600 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>
            
        <div class="flex gap-4">
          <div class="w-1/2 space-y-2">
            <!-- First Name Field -->
            <label for="firstName" class="block text-sm font-medium text-gray-600">First Name</label>
            <input 
              id="firstName" 
              v-model="firstName" 
              type="text" 
              required 
              class="w-full px-3 py-2 bg-transparent rounded-xl text-black"
              style="border: 1px solid #606c38;"
              placeholder="Juan"
            />
          </div>
          <div class="w-1/2 space-y-2">
            <!-- Last Name Field -->
            <label for="lastName" class="block text-sm font-medium text-gray-600">Last Name</label>
            <input 
              id="lastName" 
              v-model="lastName" 
              type="text" 
              required 
              class="w-full px-3 py-2 bg-transparent rounded-xl text-black"
              style="border: 1px solid #606c38;"
              placeholder="Dela Cruz"
            />
          </div>
        </div>
  
            
          <div class="flex gap-4">
            <!-- Email Field -->
            <div class="w-1/2 space-y-2">
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
  
            <!-- Phone Number Field -->
            <div class="w-1/2 space-y-2 text-black">
              <label for="phoneNumber" class="block text-sm font-medium text-gray-600">Phone Number</label>
              <div class="relative">
                <input 
                  id="phoneNumber" 
                  ref="phoneInputRef"
                  type="tel" 
                  required 
                  class="w-full px-3 py-2 bg-transparent rounded-xl text-black"
                  style="border: 1px solid #606c38;"
                  placeholder="Enter phone number "
                />
              </div>
              
              <div v-if="phoneValidationMessage" :class="phoneIsValid ? 'text-emerald-400' : 'text-red-400'" class="text-xs flex items-center gap-1">
                <svg v-if="phoneIsValid" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                {{ phoneValidationMessage }}
              </div>
            </div>
          </div>
  
            
          <!-- Location Fields -->
          <div class="space-y-2">
            <!-- Country Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600 mb-2">Country</label>
              <div class="relative">
                <button 
                  type="button" 
                  @click="showCountryDropdown = !showCountryDropdown"
                  class="w-full px-3 py-2 bg-white border border-[#606c38] rounded-xl text-left text-black focus:outline-none focus:ring-1 focus:ring-[#606c38] focus:border-[#606c38] transition-all duration-200 flex items-center justify-between"
                  :class="{ 'text-gray-500': !selectedLocationCountry }"
                >
                  <span>{{ getCountryLabel(selectedLocationCountry) || 'Select' }}</span>
                  <svg class="w-5 h-5 text-[#606c38] transition-transform duration-200" :class="{ 'rotate-180': showCountryDropdown }" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>

                <transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 transform scale-95 -translate-y-2" leave-to-class="opacity-0 transform scale-95 -translate-y-2">
                  <div v-if="showCountryDropdown" class="absolute z-50 w-full mt-1 bg-white border border-[#606c38] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    <div class="py-1">
                      <button 
                        v-for="country in countries" 
                        :key="country.code" 
                        type="button" 
                        @click="selectCountry(country.code)" 
                        class="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 flex items-center"
                        :class="{ 'bg-green-50 text-[#606c38]': selectedLocationCountry === country.code }"
                      >
                        <div>
                          <div class="font-semibold text-gray-900 text-sm">{{ country.flag }} {{ country.name }}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
  
            <!-- Province and Municipality in one line -->
            <div class="flex gap-4">
              <div class="w-1/2 space-y-2">
                <label class="block text-sm font-medium text-gray-600 mb-2">Province</label>
                <div class="relative">
                  <button 
                    type="button" 
                    @click="showProvinceDropdown = !showProvinceDropdown"
                    class="w-full px-3 py-2 bg-white border border-[#606c38] rounded-xl text-left text-black focus:outline-none focus:ring-1 focus:ring-[#606c38] focus:border-[#606c38] transition-all duration-200 flex items-center justify-between"
                    :class="{ 'text-gray-500': !selectedProvince }"
                    :disabled="!selectedLocationCountry"
                  >
                    <span>{{ getProvinceLabel(selectedProvince) || 'Select' }}</span>
                    <svg class="w-5 h-5 text-[#606c38] transition-transform duration-200" :class="{ 'rotate-180': showProvinceDropdown }" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 transform scale-95 -translate-y-2" leave-to-class="opacity-0 transform scale-95 -translate-y-2">
                    <div v-if="showProvinceDropdown" class="absolute z-50 w-full mt-1 bg-white border border-[#606c38] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <div class="py-1">
                        <button 
                          v-for="province in provinces" 
                          :key="province.code" 
                          type="button" 
                          @click="selectProvince(province.code)" 
                          class="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 flex items-center"
                          :class="{ 'bg-green-50 text-[#606c38]': selectedProvince === province.code }"
                        >
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ province.name }}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
              <div class="w-1/2 space-y-2">
                <label class="block text-sm font-medium text-gray-600 mb-2">Municipality</label>
                <div class="relative">
                  <button 
                    type="button" 
                    @click="showMunicipalityDropdown = !showMunicipalityDropdown"
                    class="w-full px-3 py-2 bg-white border border-[#606c38] rounded-xl text-left text-black focus:outline-none focus:ring-1 focus:ring-[#606c38] focus:border-[#606c38] transition-all duration-200 flex items-center justify-between"
                    :class="{ 'text-gray-500': !selectedMunicipality }"
                    :disabled="!selectedProvince"
                  >
                    <span>{{ getMunicipalityLabel(selectedMunicipality) || 'Select' }}</span>
                    <svg class="w-5 h-5 text-[#606c38] transition-transform duration-200" :class="{ 'rotate-180': showMunicipalityDropdown }" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 transform scale-95 -translate-y-2" leave-to-class="opacity-0 transform scale-95 -translate-y-2">
                    <div v-if="showMunicipalityDropdown" class="absolute z-50 w-full mt-1 bg-white border border-[#606c38] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <div class="py-1">
                        <button 
                          v-for="municipality in municipalities" 
                          :key="municipality.code" 
                          type="button" 
                          @click="selectMunicipality(municipality.code)" 
                          class="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 flex items-center"
                          :class="{ 'bg-green-50 text-[#606c38]': selectedMunicipality === municipality.code }"
                        >
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ municipality.name }}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
  
            <!-- Barangay and Street Address in one line -->
            <div class="flex gap-4">
              <div class="w-1/2 space-y-2">
                <label class="block text-sm font-medium text-gray-600 mb-2">Barangay</label>
                <div class="relative">
                  <button 
                    type="button" 
                    @click="showBarangayDropdown = !showBarangayDropdown"
                    class="w-full px-3 py-2 bg-white border border-[#606c38] rounded-xl text-left text-black focus:outline-none focus:ring-1 focus:ring-[#606c38] focus:border-[#606c38] transition-all duration-200 flex items-center justify-between"
                    :class="{ 'text-gray-500': !selectedBarangay }"
                    :disabled="!selectedMunicipality"
                  >
                    <span>{{ getBarangayLabel(selectedBarangay) || 'Select' }}</span>
                    <svg class="w-5 h-5 text-[#606c38] transition-transform duration-200" :class="{ 'rotate-180': showBarangayDropdown }" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 transform scale-95 -translate-y-2" leave-to-class="opacity-0 transform scale-95 -translate-y-2">
                    <div v-if="showBarangayDropdown" class="absolute z-50 w-full mt-1 bg-white border border-[#606c38] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <div class="py-1">
                        <button 
                          v-for="barangay in barangays" 
                          :key="barangay.code" 
                          type="button" 
                          @click="selectBarangay(barangay.code)" 
                          class="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 flex items-center"
                          :class="{ 'bg-green-50 text-[#606c38]': selectedBarangay === barangay.code }"
                        >
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ barangay.name }}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
              <div class="w-1/2 space-y-2">
                <label class="block text-sm font-medium text-gray-600">Sitio(Optional)</label>
                <input 
                  id="streetAddress" 
                  v-model="streetAddress" 
                  type="text" 
                  class="w-full text-base px-3 py-2 text-black bg-transparent rounded-xl"
                  style="border:  1px solid #606c38;"
                  placeholder="Enter your Sitio"
                />
              </div>
            </div>
          </div>
  
            
            <div class="flex gap-4">
              <!-- Password Field -->
            <div class="w-1/2 space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-600">Password</label>
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
              <p class="text-xs text-gray-400">Password must be at least 8 characters long</p>
            </div>
  
  
            <div class="w-1/2 space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-600">Confirm Password</label>
              <div class="relative">
                <input 
                  id="confirmPassword" 
                  v-model="confirmPassword" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  required 
                  class="w-full px-3 py-2 bg-transparent rounded-xl text-black pr-10"
                  style="border: 1px solid #606c38;"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  @click="showConfirmPassword = !showConfirmPassword"
                  tabindex="-1"
                >
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  
            </div>
           <div class="flex items-start"></div>
            
            <!-- Submit Button -->
            <button 
              type="submit" 
              class="w-full py-2.5 px-4 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style="background-color: #606c38;"
              :disabled="isLoading"
            >
              <span v-if="isLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account</span>
            </button>
          </form>
          
          <!-- Sign In Link -->
          <div class="mt-4 text-center text-sm">
            <span class="text-gray-600">Already have an account?</span>
            <button type="button" 
            @click="navigateToSignIn" 
            class="ml-1 text-[#606c38] hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
        
        <!-- Email Verification -->
        <div v-if="currentStep === 'email-verification'" class="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div class="text-center mb-6 w-full max-w-md">
            <p class="text-gray-600 mb-4">
              We've sent a 6-digit code to <span class="font-semibold">{{ email }}</span>
            </p>
            
            <!-- OTP Expiration Timer -->
            <div v-if="otpExpirationTime > 0" class="mb-4 text-sm">
              <p class="text-gray-400">
                Code expires in: <span class="font-medium text-red-400">{{ formatTime(otpExpirationTime) }}</span>
              </p>
            </div>
            <div v-else-if="otpExpirationTime === 0 && otpExpiresAt !== null" class="mb-4 text-sm">
              <p class="text-yellow-400 font-medium flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Code has expired. Please request a new one.
              </p>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>
          
          <!-- OTP Input -->
          <div class="space-y-4">
            <label for="otpCode" class="block text-sm text-gray-600">Enter Verification Code</label>
            <div class="flex gap-2 justify-between">
              <input 
                v-for="(digit, index) in 6" 
                :key="index"
                :ref="el => { if(el) otpInputRefs[index] = el }"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                class="w-12 h-12 text-center text-xl bg-white border border-gray-400 rounded-xl font-semibold text-[#606c38] focus:outline-none focus:ring-1 focus:ring-[#283618]"
                @input="handleOtpInput(index)"
                @keydown="handleOtpKeydown($event, index)"
              />
            </div>
            
            <!-- Resend Code Button -->
            <button 
              @click="resendEmailVerification" 
              class="w-full py-3 px-4 bg-red-600  text-white font-medium rounded-xl transition-colors mt-4"
              :disabled="isResending || emailResendCooldown > 0 || isVerifying || resendAttemptsExceeded"
            >
              <span v-if="isResending">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else-if="resendAttemptsExceeded">
                Try again later ({{ formatTime(lockoutTimeRemaining) }})
              </span>
              <span v-else-if="emailResendCooldown > 0">
                Resend Code ({{ formatTime(emailResendCooldown) }})
              </span>
              <span v-else>Resend Verification Code</span>
            </button>
            
            <!-- Verify Button -->
            <button 
              @click="verifyEmailCode" 
              class="w-full py-3 px-4 bg-[#606c38] text-white font-medium rounded-xl transition-colors"
              :disabled="isVerifying || !isOtpComplete || (otpExpirationTime === 0 && otpExpiresAt !== null)"
            >
              <span v-if="isVerifying">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
              <span v-else-if="otpExpirationTime === 0 && otpExpiresAt !== null">Code Expired - Resend</span>
              <span v-else>Verify Code</span>
            </button>
          </div>
          
          <!-- Back Button -->
          <div class="mt-6 text-center">
            <button 
              @click="currentStep = 'register'" 
              class="text-gray-600 font-medium"
            >
              Back to registration
            </button>
          </div>
        </div>
        
        <!-- Verification Success -->
        <div v-if="currentStep === 'verification-success'" class="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div class="text-center mb-6 w-full max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 mb-2 font-semibold">
              Your account has been successfully verified.
            </p>
            <p class="text-gray-400 text-sm">
              Redirecting to login in <span class="font-medium text-[#c9d4a3]">{{ redirectCountdown }}</span> seconds...
            </p>
          </div>
          
          <!-- Continue to Login Button -->
          <button 
            @click="navigateToSignIn" 
            class="w-full py-3 px-4 font-medium text-[#606c38] transition-colors"
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCreateAccount } from '../composables/useCreateAccount';
  import { getDeviceInfo } from '../utils/device';
  import axios from 'axios';
  
  // Import intl-tel-input library
  import intlTelInput from 'intl-tel-input';
  import 'intl-tel-input/build/css/intlTelInput.css';
  
  const router = useRouter();
  const { 
    registerUser, 
    sendEmailVerificationCode, 
    verifyOTP,
    checkVerificationStatus,
    isLoading: accountLoading,
    error: accountError,
    otpExpiresAt
  } = useCreateAccount();
  
  // Form steps
  const currentStep = ref('register');
  
  // Phone input
  const phoneInputRef = ref(null);
  let phoneInput = null; // Will hold the intl-tel-input instance
  
  // OTP input
  const otpDigits = ref(['', '', '', '', '', '']);
  const otpInputRefs = ref([]);
  const isOtpComplete = computed(() => {
    return otpDigits.value.every(digit => digit !== '');
  });
  
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  
  // Cooldown timers
  const emailResendCooldown = ref(0);
  let emailCooldownTimer = null;
  
  // OTP expiration timer
  const otpExpirationTime = ref(0);
  let otpExpirationTimer = null;
  
  // Add a local ref to track if we've received an expiration time
  const localOtpExpiresAt = ref(null);
  
  // Form data
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const acceptTerms = ref(false);
  const error = ref('');
  const isLoading = ref(false);
  
  // Phone validation state
  const phoneIsValid = ref(false);
  const phoneValidationMessage = ref('');
  let formattedPhoneNumber = ''; // Changed from ref to regular variable
  
  // Location selection state
  const selectedLocationCountry = ref('');
  const selectedProvince = ref('');
  const selectedMunicipality = ref('');
  const selectedBarangay = ref('');
  const streetAddress = ref('');
  
  // Dropdown visibility states
  const showCountryDropdown = ref(false);
  const showProvinceDropdown = ref(false);
  const showMunicipalityDropdown = ref(false);
  const showBarangayDropdown = ref(false);
  
  // Loading states
  const loadingCountries = ref(false);
  const loadingProvinces = ref(false);
  const loadingMunicipalities = ref(false);
  const loadingBarangays = ref(false);
  
  // Location data
  const countries = ref([]);
  const provinces = ref([]);
  const municipalities = ref([]);
  const barangays = ref([]);
  
  // API base URLs
  const psgcApiBaseUrl = 'https://psgc.gitlab.io/api';
  const countriesApiBaseUrl = 'https://restcountries.com/v3.1';
  
  // Add these variables to the existing refs
  const redirectCountdown = ref(5);
  let redirectTimer = null;
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
  
  // Watch for account loading and error states
  watch(() => accountLoading.value, (newValue) => {
    isLoading.value = newValue;
  });
  
  watch(() => accountError.value, (newValue) => {
    if (newValue) {
      error.value = newValue;
    }
  });
  
  // Navigation functions
  const navigateToLanding = () => {
    router.push('/');
  };
  
  const navigateToSignIn = () => {
    router.push('/signin');
  };
  
  // Update the navigateToDashboard function to navigateToSignIn
  const navigateToDashboard = () => {
    router.push('/dashboard');
  };
  
  // Dropdown label getter functions
  const getCountryLabel = (code) => {
    const country = countries.value.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : '';
  };
  
  const getProvinceLabel = (code) => {
    const province = provinces.value.find(p => p.code === code);
    return province ? province.name : '';
  };
  
  const getMunicipalityLabel = (code) => {
    const municipality = municipalities.value.find(m => m.code === code);
    return municipality ? municipality.name : '';
  };
  
  const getBarangayLabel = (code) => {
    const barangay = barangays.value.find(b => b.code === code);
    return barangay ? barangay.name : '';
  };
  
  // Dropdown selection functions
  const selectCountry = (code) => {
    selectedLocationCountry.value = code;
    showCountryDropdown.value = false;
    handleCountryChange();
  };
  
  const selectProvince = (code) => {
    selectedProvince.value = code;
    showProvinceDropdown.value = false;
    handleProvinceChange();
  };
  
  const selectMunicipality = (code) => {
    selectedMunicipality.value = code;
    showMunicipalityDropdown.value = false;
    handleMunicipalityChange();
  };
  
  const selectBarangay = (code) => {
    selectedBarangay.value = code;
    showBarangayDropdown.value = false;
  };

  // Initialize libraries and fetch data on component mount
  onMounted(() => {
    // Initialize intl-tel-input
    initIntlTelInput();
  
    // Fetch countries
    fetchCountries();
  
    // Add event listener to handle Enter key in the form
    document.addEventListener('keydown', handleEnterKey);
  
    // Close dropdowns when clicking outside
    document.addEventListener('click', handleOutsideClick);
  });
  
  // Clean up on component unmount
  onBeforeUnmount(() => {
    // Destroy intl-tel-input instance
    if (phoneInput) {
      phoneInput.destroy();
    }
  
    // Clear all timers
    if (emailCooldownTimer) {
      clearInterval(emailCooldownTimer);
    }
  
    if (otpExpirationTimer) {
      clearInterval(otpExpirationTimer);
    }
    
    if (redirectTimer) {
      clearInterval(redirectTimer);
    }
    
    if (lockoutTimer) {
      clearInterval(lockoutTimer);
    }
  
    // Remove event listeners
    document.removeEventListener('keydown', handleEnterKey);
    document.removeEventListener('click', handleOutsideClick);
  });
  
  // Handle Enter key in form fields
  const handleEnterKey = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        if (index !== -1 && form.elements[index + 1]) {
          form.elements[index + 1].focus();
        }
      }
    }
  };
  
  // Handle clicks outside dropdowns
  const handleOutsideClick = (e) => {
    if (!e.target.closest('.relative')) {
      // Close any open dropdowns
    }
  };
  
  // Initialize intl-tel-input
  const initIntlTelInput = () => {
    if (!phoneInputRef.value) return;
  
    // Initialize with options
    phoneInput = intlTelInput(phoneInputRef.value, {
      initialCountry: 'ph', // Default to Philippines
      preferredCountries: ['ph', 'us', 'gb', 'au', 'sg'],
      separateDialCode: true, // Show the country code separately
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js',
      customContainer: 'w-full',
    });
  
    // Apply custom styling to match our dark theme
    const container = phoneInputRef.value.closest('.iti');
    if (container) {
      container.classList.add('w-full');
    }
  
    // Add validation on input
    phoneInputRef.value.addEventListener('input', validatePhone);
    phoneInputRef.value.addEventListener('countrychange', () => {
      // Clear the input when country changes
      phoneInputRef.value.value = '';
      phoneValidationMessage.value = '';
      phoneIsValid.value = false;
      validatePhone();
    });
  
    // Initial validation
    validatePhone();
  };
  
  // Validate phone number
  const validatePhone = () => {
    if (!phoneInput) return;
  
    if (phoneInputRef.value.value.trim()) {
      // Get the selected country code
      const countryCode = phoneInput.getSelectedCountryData().iso2;
      
      // Special validation for Philippines
      if (countryCode === 'ph') {
        let phoneValue = phoneInputRef.value.value.trim();
        
        // Remove leading zero if present
        if (phoneValue.startsWith('0')) {
          phoneValue = phoneValue.substring(1);
        }
        
        // Check if it's exactly 10 digits for PH
        if (/^\d{10}$/.test(phoneValue)) {
          phoneIsValid.value = true;
          phoneValidationMessage.value = 'Valid Philippine number';
        } else {
          phoneIsValid.value = false;
          phoneValidationMessage.value = 'Philippine numbers must be 10 digits (without leading 0)';
        }
      } else {
        // For other countries, use the library's validation
        if (phoneInput.isValidNumber()) {
          phoneIsValid.value = true;
          phoneValidationMessage.value = 'Valid phone number';
        } else {
          phoneIsValid.value = false;
          
          const errorCode = phoneInput.getValidationError();
          switch(errorCode) {
            case 1:
              phoneValidationMessage.value = 'Invalid country code';
              break;
            case 2:
              phoneValidationMessage.value = 'Phone number too short';
              break;
            case 3:
              phoneValidationMessage.value = 'Phone number too long';
              break;
            case 4:
              phoneValidationMessage.value = 'Invalid phone number';
              break;
            default:
              phoneValidationMessage.value = 'Please enter a valid phone number';
          }
        }
      }
    } else {
      phoneIsValid.value = false;
      phoneValidationMessage.value = '';
    }
  };
  
  // Fetch countries from REST Countries API
  const fetchCountries = async () => {
    loadingCountries.value = true;
    countries.value = [];
  
    try {
      const response = await fetch(`${countriesApiBaseUrl}/all?fields=name,cca2,flag`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform the data to our format
        countries.value = data.map(country => ({
          code: country.cca2,
          name: country.name.common,
          flag: country.flag
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        // Move Philippines to the top if it exists
        const phIndex = countries.value.findIndex(c => c.code === 'PH');
        if (phIndex !== -1) {
          const ph = countries.value.splice(phIndex, 1)[0];
          countries.value.unshift(ph);
        }
      } else {
        console.error('Failed to fetch countries');
        error.value = 'Failed to load countries. Please try again.';
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      error.value = 'Network error while loading countries.';
    } finally {
      loadingCountries.value = false;
    }
  };
  
  // Handle country change
  const handleCountryChange = async () => {
    selectedProvince.value = '';
    selectedMunicipality.value = '';
    selectedBarangay.value = '';
  
    provinces.value = [];
    municipalities.value = [];
    barangays.value = [];
  
    if (selectedLocationCountry.value === 'PH') {
      // For Philippines, first fetch regions
      loadingProvinces.value = true;
      try {
        // First fetch all regions
        const regionsResponse = await fetch(`${psgcApiBaseUrl}/regions`);
        if (!regionsResponse.ok) {
          throw new Error('Failed to fetch regions');
        }
        
        const regionsData = await regionsResponse.json();
        
        // Then fetch all provinces
        const provincesResponse = await fetch(`${psgcApiBaseUrl}/provinces`);
        if (!provincesResponse.ok) {
          throw new Error('Failed to fetch provinces');
        }
        
        const provincesData = await provincesResponse.json();
        
        // Combine regions and provinces for the dropdown
        provinces.value = [
          ...provincesData.map(province => ({
            code: province.code,
            name: province.name,
            type: 'province'
          }))
        ];
        
        // Sort provinces alphabetically
        provinces.value.sort((a, b) => a.name.localeCompare(b.name));
        
        // Move Oriental Mindoro and Occidental Mindoro to the top if they exist
        const orientalIndex = provinces.value.findIndex(p => p.name.includes('Oriental Mindoro'));
        const occidentalIndex = provinces.value.findIndex(p => p.name.includes('Occidental Mindoro'));
        
        if (orientalIndex !== -1) {
          const oriental = provinces.value.splice(orientalIndex, 1)[0];
          provinces.value.unshift(oriental);
        }
        
        if (occidentalIndex !== -1) {
          const occidental = provinces.value.splice(occidentalIndex, 1)[0];
          provinces.value.unshift(occidental);
        }
      } catch (err) {
        console.error('Error fetching Philippine locations:', err);
        error.value = 'Network error while loading provinces.';
      } finally {
        loadingProvinces.value = false;
      }
    } else {
      // For other countries, fetch states/provinces from an appropriate API
      // For this example, we'll use the REST Countries API to get states for the US
      if (selectedLocationCountry.value === 'US') {
        loadingProvinces.value = true;
        try {
          // This is a simplified example - in a real app, you'd use a more comprehensive API
          const response = await fetch('https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json');
          if (response.ok) {
            const data = await response.json();
            provinces.value = Object.entries(data).map(([code, name]) => ({
              code,
              name
            }));
          } else {
            console.error('Failed to fetch US states');
            error.value = 'Failed to load states. Please try again.';
          }
        } catch (err) {
          console.error('Error fetching US states:', err);
          error.value = 'Network error while loading states.';
        } finally {
          loadingProvinces.value = false;
        }
      } else {
        // For other countries, we could use a different API or fallback to a simple input
        // For now, we'll use a simple fallback
        provinces.value = [
          { code: 'GENERIC', name: 'Enter your province/state' }
        ];
        
        // Auto-select the generic option
        selectedProvince.value = 'GENERIC';
        handleProvinceChange();
      }
    }
  };
  
  // Handle province change
  const handleProvinceChange = async () => {
    selectedMunicipality.value = '';
    selectedBarangay.value = '';
  
    municipalities.value = [];
    barangays.value = [];
  
    if (selectedLocationCountry.value === 'PH' && selectedProvince.value) {
      // Fetch municipalities for the selected province from PSGC API
      loadingMunicipalities.value = true;
      try {
        // Fetch cities and municipalities for the selected province
        const response = await fetch(`${psgcApiBaseUrl}/provinces/${selectedProvince.value}/cities-municipalities`);
        if (response.ok) {
          const data = await response.json();
          municipalities.value = data.map(municipality => ({
            code: municipality.code,
            name: municipality.name
          }));
          
          // Sort municipalities alphabetically
          municipalities.value.sort((a, b) => a.name.localeCompare(b.name));
          
          // If no municipalities found, show an error
          if (municipalities.value.length === 0) {
            console.error('No municipalities found for this province');
            error.value = 'No municipalities found for this province.';
          }
        } else {
          console.error('Failed to fetch municipalities');
          error.value = 'Failed to load municipalities. Please try again.';
        }
      } catch (err) {
        console.error('Error fetching municipalities:', err);
        error.value = 'Network error while loading municipalities.';
      } finally {
        loadingMunicipalities.value = false;
      }
    } else if (selectedProvince.value === 'GENERIC') {
      // For generic provinces, provide a generic city input
      municipalities.value = [
        { code: 'GENERIC_CITY', name: 'Enter your city/municipality' }
      ];
      
      // Auto-select the generic option
      selectedMunicipality.value = 'GENERIC_CITY';
      handleMunicipalityChange();
    } else {
      // For other specific countries, we could implement specific APIs
      // For now, we'll use a simple fallback
      municipalities.value = [
        { code: 'GENERIC_CITY', name: 'Enter your city/municipality' }
      ];
    }
  };
  
  // Handle municipality change
  const handleMunicipalityChange = async () => {
    selectedBarangay.value = '';
    barangays.value = [];
  
    if (selectedLocationCountry.value === 'PH' && selectedMunicipality.value && selectedMunicipality.value !== 'GENERIC_CITY') {
      // Fetch barangays for the selected municipality from PSGC API
      loadingBarangays.value = true;
      try {
        const response = await fetch(`${psgcApiBaseUrl}/cities-municipalities/${selectedMunicipality.value}/barangays`);
        if (response.ok) {
          const data = await response.json();
          barangays.value = data.map(barangay => ({
            code: barangay.code,
            name: barangay.name
          }));
          
          // Sort barangays alphabetically
          barangays.value.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          console.error('Failed to fetch barangays');
          error.value = 'Failed to load barangays. Please try again.';
        }
      } catch (err) {
        console.error('Error fetching barangays:', err);
        error.value = 'Network error while loading barangays.';
      } finally {
        loadingBarangays.value = false;
      }
    } else if (selectedMunicipality.value === 'GENERIC_CITY') {
      // For generic cities, provide a generic neighborhood input
      barangays.value = [
        { code: 'GENERIC_NEIGHBORHOOD', name: 'Enter your neighborhood/district' }
      ];
      
      // Auto-select the generic option
      selectedBarangay.value = 'GENERIC_NEIGHBORHOOD';
    } else {
      // Fallback for other countries
      barangays.value = [
        { code: 'GENERIC_NEIGHBORHOOD', name: 'Enter your neighborhood/district' }
      ];
    }
  };
  
  // Format location data for submission
  const getFormattedLocation = () => {
    const countryName = countries.value.find(c => c.code === selectedLocationCountry.value)?.name || '';
    const provinceName = provinces.value.find(p => p.code === selectedProvince.value)?.name || '';
    const municipalityName = municipalities.value.find(m => m.code === selectedMunicipality.value)?.name || '';
    const barangayName = barangays.value.find(b => b.code === selectedBarangay.value)?.name || '';
  
    return {
      country: {
        code: selectedLocationCountry.value,
        name: countryName
      },
      province: {
        code: selectedProvince.value,
        name: provinceName
      },
      municipality: {
        code: selectedMunicipality.value,
        name: municipalityName
      },
      barangay: {
        code: selectedBarangay.value,
        name: barangayName
      },
      streetAddress: streetAddress.value,
      formattedAddress: `${streetAddress.value ? streetAddress.value + ', ' : ''}${barangayName ? barangayName + ', ' : ''}${municipalityName ? municipalityName + ', ' : ''}${provinceName ? provinceName + ', ' : ''}${countryName}`
    };
  };
  
  // Sign up form submission with Firebase
  const handleSignUp = async () => {
    error.value = '';
    isLoading.value = true;
  
    try {
      // Basic form validation
      if (password.value !== confirmPassword.value) {
        throw new Error('Passwords do not match.');
      }
  
      if (password.value.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
  
      if (!phoneIsValid.value) {
        throw new Error('Please enter a valid phone number.');
      }
      
      if (!selectedLocationCountry.value || !selectedProvince.value || !selectedMunicipality.value || !selectedBarangay.value) {
        throw new Error('Please select your complete location (country, province/state, municipality/city, and barangay/neighborhood).');
      }
  
      // Get formatted phone number with country code
      if (phoneInput) {
        // For Philippine numbers, ensure correct format
        if (phoneInput.getSelectedCountryData().iso2 === 'ph') {
          let phoneValue = phoneInputRef.value.value.trim();
          // Remove leading zero if present
          if (phoneValue.startsWith('0')) {
            phoneValue = phoneValue.substring(1);
          }
          formattedPhoneNumber = `+63${phoneValue}`;
        } else {
          // For other countries, use the library's formatting
          formattedPhoneNumber = phoneInput.getNumber();
        }
      }
  
      // Format location data
      const locationData = getFormattedLocation();
  
      // Get device info
      const deviceInfo = getDeviceInfo();
  
      // Register user with our composable - this will save all user data
      const result = await registerUser({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phoneNumber: formattedPhoneNumber,
        password: password.value,
        location: locationData,
        deviceInfo
      });
  
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log("User registered successfully with document ID:", result.documentId);
  
      // Send email verification immediately after registration
      const verificationResult = await sendEmailVerificationCode();
      
      if (verificationResult.error) {
        throw new Error(verificationResult.error);
      }
      
      // Start cooldown timer
      startEmailCooldown();
      
      // Start OTP expiration timer if expiresAt is returned
      if (verificationResult.expiresAt) {
        startOtpExpirationTimer(verificationResult.expiresAt);
      }
  
      // Move directly to email verification
      currentStep.value = 'email-verification';
      
    } catch (e) {
      console.error('Error during sign up:', e);
      error.value = e.message || 'An error occurred during registration. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Add a separate loading state for resending vs verifying
  const isVerifying = ref(false);
  const isResending = ref(false);
  
  // Add this computed property
  const getProgressiveCooldown = computed(() => {
    switch (resendAttempts.value) {
      case 0: return 60; // 1 minute
      case 1: return 120; // 2 minutes
      case 2: return 300; // 5 minutes
      case 3: return 600; // 10 minutes
      default: return 1800; // 30 minutes (lockout)
    }
  });
  
  // Update the resendEmailVerification function to use the dedicated loading state
  const resendEmailVerification = async () => {
    if (emailResendCooldown.value > 0) return;
  
    error.value = '';
    isResending.value = true;
  
    try {
      const result = await sendEmailVerificationCode();
      
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
      console.error('Error resending email verification:', e);
      error.value = e.message || 'Failed to resend verification email. Please try again.';
    } finally {
      isResending.value = false;
    }
  };
  
  // Update the verifyEmailCode function to use the dedicated loading state
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
      // Combine OTP digits
      const code = otpDigits.value.join('');
      
      const result = await verifyOTP('email', code);
      
      if (result.error) {
        // If code expired, show a more user-friendly message
        if (result.errorType === 'expired') {
          localOtpExpiresAt.value = null; // Mark as expired
          throw new Error('Verification code has expired. Please request a new code.');
        }
        throw new Error(result.error);
      }
      
      // Move to success screen and start redirect countdown
      currentStep.value = 'verification-success';
      startRedirectCountdown();
    } catch (e) {
      console.error('Error verifying email code:', e);
      error.value = e.message || 'Invalid verification code. Please try again.';
    } finally {
      isVerifying.value = false;
    }
  };
  
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
  
  // Add this function to start the redirect countdown
  const startRedirectCountdown = () => {
    // Clear any existing timer
    if (redirectTimer) {
      clearInterval(redirectTimer);
    }
    
    // Set initial countdown (5 seconds)
    redirectCountdown.value = 5;
    
    // Start the timer
    redirectTimer = setInterval(() => {
      if (redirectCountdown.value > 0) {
        redirectCountdown.value--;
      } else {
        clearInterval(redirectTimer);
        navigateToSignIn();
      }
    }, 1000);
  };
  </script>
  
  <style>
  /* Custom styles for intl-tel-input to match our dark theme */
  .iti {
    width: 100%;
  }
  
  .iti__flag-container {
    background-color: #374151 !important; /* bg-gray-700 */
  }
  
  .iti__selected-flag {
    background-color: #374151 !important; /* bg-gray-700   /* bg-gray-700 */
  }
  
  .iti__selected-flag {
    background-color: #374151 !important; /* bg-gray-700 */
    border-radius: 0.5rem 0 0 0.5rem !important; /* rounded-l-lg */
  }
  
  .iti__country-list {
    background-color: #4B5563 !important; /* bg-gray-600 */
    color: white !important;
    border: 1px solid #6B7280 !important; /* border-gray-500 */
  }
  
  .iti__country {
    color: white !important;
  }
  
  .iti__country:hover {
    background-color: #6B7280 !important; /* bg-gray-500 */
  }
  
  .iti__country.iti__highlight {
    background-color: #10B981 !important; /* bg-emerald-500 */
  }
  
  .iti__dial-code {
    color: #D1D5DB !important; /* text-gray-300 */
  }
  </style>
  
  