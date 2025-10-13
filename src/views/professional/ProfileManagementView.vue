```vue type="vue" project="Learning Management" file="frontend/src/views/professional/ProfileManagementView.vue"
[v0-no-op-code-block-prefix]



<template>
  <!-- Make the component take up the full viewport height and width -->
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-2">
    <!-- Top Navigation Bar -->
    <ProfessionalNavbar 
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="0"
      :photoURL="profileData.photoURL"
      @sign-out="showSignOutConfirmation = true"
    />
    
    <!-- Success/Error Notification -->
    <NotificationToast
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
    
    <!-- Main Content - Adjusted to take full width and proper spacing -->
    <main class="p-4 md:p-6 overflow-auto mt-16 w-full max-w-none">
      <!-- Enhanced Back Button -->
      <div class="mb-2">
        <button 
          @click="goBack" 
          class="inline-flex items-center py-2.5 text-black transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
      
      <!-- Page Header - Increased text size -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Profile Management</h1>
        <p class="text-sm sm:text-base text-gray-400">Update your personal information and professional details</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="h-[calc(100vh-150px)] flex items-center justify-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-16 w-16 text-emerald-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-400 text-xl">Loading your profile...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-4xl mx-auto">
        <h3 class="font-medium text-xl mb-2">Error</h3>
        <p class="text-lg">{{ error }}</p>
        <button 
          @click="fetchProfileData" 
          class="mt-4 px-6 py-3 bg-red-500/30 hover:bg-red-500/50 rounded-md text-base transition-colors"
        >
          Try Again
        </button>
      </div>
      
      <!-- Profile Content - Adjusted for full width -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mx-auto">
        <!-- Left Column - Profile Overview -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Profile Header -->
            <div class="bg-[#283618] p-6 flex flex-col items-center border-b border-gray-700">
              <div class="relative group mb-4">
                <div class="h-32 w-32 rounded-full  flex items-center justify-center text-emerald-400 text-4xl font-bold  overflow-hidden" style="background-color: #dfe8d4; color: #606c38; border: 5px solid #606c38;">
                  <img 
                    v-if="profileData.photoURL" 
                    :src="profileData.photoURL" 
                    alt="Profile Photo" 
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <label class="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-[#606c38] flex items-center justify-center cursor-pointer hover:bg-[#c9d4a3] transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleProfilePhotoChange"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <h2 class="text-3xl font-semibold mt-2 text-white">{{ userDisplayName }}</h2>
              <p class="text-emerald-500 text-lg mt-1">{{ profileData.title || 'Professional' }}</p>
              <div class="mt-3 flex items-center text-white text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-white">{{ formattedLocation }}</span>
              </div>
            </div>
            
            <!-- Profile Stats -->
            <div class="p-5 border-b border-gray-300">
              <h3 class="text-base font-medium text-gray-500 mb-4">Profile Stats</h3>
              <div class="grid grid-cols-3 gap-3 text-center ">
                <div class="bg-[#c9d4a3] rounded-xl p-4 border-2 border-[#606c38] shadow">
                  <div class="text-xl font-semibold text-[#606c38]">{{ profileData.materialsCount || 0 }}</div>
                  <div class="text-sm text-white">Materials</div>
                </div>
                <div class="bg-[#c9d4a3] rounded-xl p-4 border-2 border-[#606c38] shadow">
                  <div class="text-xl font-semibold text-[#606c38]">{{ profileData.consultationsCount || 0 }}</div>
                  <div class="text-sm text-white">Consultations</div>
                </div>
                <div class="bg-[#c9d4a3] rounded-xl p-4 border-2 border-[#606c38] shadow">
                  <div class="text-xl font-semibold text-[#606c38]">{{ profileData.rating || '0.0' }}</div>
                  <div class="text-sm text-white">Rating</div>
                </div>
              </div>
            </div>
            
            <!-- Account Status -->
            <div class="p-5 border-b border-gray-300">
              <h3 class="text-base font-medium text-gray-500 mb-4">Account Status</h3>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
                  <span class="text-base">Active</span>
                </div>
                <span class="text-sm text-gray-500">Since {{ formatDate(profileData.createdAt) }}</span>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="p-5">
              <h3 class="text-base font-medium text-gray-500 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button 
                  @click="activeTab = 'security'" 
                  type="button"
                  class="w-full py-3 px-4 bg-white hover:bg-gray-200/50 text-base text-left border border-gray-400  rounded-xl flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-[#606c38]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
                <button 
                  @click="activeTab = 'privacy'" 
                  type="button"
                  class="w-full py-3 px-4 bg-white hover:bg-gray-200/50 text-base text-left border border-gray-400  rounded-xl flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-[#606c38]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Privacy Settings
                </button>
                <button 
                  @click="downloadProfileData" 
                  type="button"
                  class="w-full py-3 px-4 bg-white hover:bg-gray-200/50 text-base text-left border border-gray-400  rounded-xl flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-[#606c38]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download My Data
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Column - Profile Details -->
        <div class="lg:col-span-2">
          <!-- Tab Navigation - Increased text size and padding -->
          <div class="mb-6 overflow-x-auto">
            <div class="flex">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                type="button"
                :class="[
                  'px-6 py-4 text-base font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id 
                    ? 'text-[#606c38] border-b-2 border-[#606c38]' 
                    : 'text-gray-400 hover:text-[#606c38] hover:font-medium'
                ]"
              >
                {{ tab.name }}
              </button>
            </div>
          </div>
          
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Personal Information</h2>
            
            <form @submit.prevent="savePersonalInfo">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name -->
                <div>
                  <label for="firstName" class="block text-base font-medium text-gray-500 mb-2">First Name</label>
                  <input 
                    id="firstName"
                    v-model="profileData.firstName"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <!-- Last Name -->
                <div>
                  <label for="lastName" class="block text-base font-medium text-gray-500 mb-2">Last Name</label>
                  <input 
                    id="lastName"
                    v-model="profileData.lastName"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <!-- Email -->
                <div>
                  <label for="email" class="block text-base font-medium text-gray-500 mb-2">Email Address</label>
                  <input 
                    id="email"
                    v-model="profileData.email"
                    type="email" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your email"
                    disabled
                  />
                  <p class="text-sm text-gray-500 mt-1">Email cannot be changed. Contact support for assistance.</p>
                </div>
                
                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-base font-medium text-gray-500 mb-2">Phone Number</label>
                  <input 
                    id="phone"
                    v-model="profileData.phoneNumber"
                    type="tel" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <!-- Street Address -->
                <div>
                  <label for="streetAddress" class="block text-base font-medium text-gray-500 mb-2">Street Address</label>
                  <input 
                    id="streetAddress"
                    v-model="profileData.location.streetAddress"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <!-- Barangay -->
                <div>
                  <label for="barangay" class="block text-base font-medium text-gray-500 mb-2">Barangay</label>
                  <input 
                    id="barangay"
                    v-model="profileData.location.barangay.name"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your barangay"
                  />
                </div>
                
                <!-- Municipality -->
                <div>
                  <label for="municipality" class="block text-base font-medium text-gray-500 mb-2">Municipality</label>
                  <input 
                    id="municipality"
                    v-model="profileData.location.municipality.name"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your municipality"
                  />
                </div>
                
                <!-- Province -->
                <div>
                  <label for="province" class="block text-base font-medium text-gray-500 mb-2">Province</label>
                  <input 
                    id="province"
                    v-model="profileData.location.province.name"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your province"
                  />
                </div>
                
                <!-- Country -->
                <div>
                  <label for="country" class="block text-base font-medium text-gray-500 mb-2">Country</label>
                  <input 
                    id="country"
                    v-model="profileData.location.country.name"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
              
              <div class="mt-8 flex justify-end">
                <button 
                  type="button" 
                  @click="resetPersonalInfo"
                  class="px-6 py-3 mr-3 bg-gray-300 hover:bg-gray-200 rounded-xl text-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 text-white hover:text-white rounded-xl text-base transition-colors flex items-center"
                  :disabled="isSaving"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Professional Details Tab -->
          <div v-if="activeTab === 'professional'" class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Professional Details</h2>
            
            <form @submit.prevent="saveProfessionalInfo">
              <div class="space-y-6">
                <!-- Professional Title -->
                <div>
                  <label for="title" class="block text-base font-medium text-gray-500 mb-2">Professional Title</label>
                  <input 
                    id="title"
                    v-model="profileData.title"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="e.g. Agricultural Scientist, Plant Pathologist"
                  />
                </div>
                
                <!-- Specialization -->
                <div>
                  <label for="specialization" class="block text-base font-medium text-gray-400 mb-2">Specialization</label>
                  <select 
                    id="specialization"
                    v-model="profileData.specialization"
                    class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="">Select specialization</option>
                    <option value="plant_pathology">Plant Pathology</option>
                    <option value="entomology">Entomology</option>
                    <option value="soil_science">Soil Science</option>
                    <option value="agronomy">Agronomy</option>
                    <option value="horticulture">Horticulture</option>
                    <option value="agricultural_engineering">Agricultural Engineering</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <!-- Years of Experience -->
                <div>
                  <label for="experience" class="block text-base font-medium text-gray-400 mb-2">Years of Experience</label>
                  <input 
                    id="experience"
                    v-model="profileData.yearsOfExperience"
                    type="number" 
                    min="0"
                    max="70"
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter years of experience"
                  />
                </div>
                
                <!-- Qualifications -->
                <div>
                  <label class="block text-base font-medium text-gray-400 mb-2">Qualifications</label>
                  <div class="space-y-3">
                    <div 
                      v-for="(qualification, index) in profileData.qualifications" 
                      :key="index"
                      class="flex items-center space-x-3"
                    >
                      <input 
                        v-model="profileData.qualifications[index]"
                        type="text" 
                        class="flex-1 bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="e.g. Ph.D. in Agricultural Sciences"
                      />
                      <button 
                        type="button"
                        @click="removeQualification(index)"
                        class="p-3 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 hover:text-red-300 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      @click="addQualification"
                      class="px-5 py-3 text-gray-500 hover:text-gray-300 rounded-md text-base transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Qualification
                    </button>
                  </div>
                </div>
                
                <!-- Bio -->
                <div>
                  <label for="bio" class="block text-base font-medium text-gray-400 mb-2">Professional Bio</label>
                  <textarea 
                    id="bio"
                    v-model="profileData.bio"
                    rows="5" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Write a brief professional bio..."
                  ></textarea>
                  <p class="text-xs text-gray-500">{{ bioCharactersLeft }} characters left</p>
                </div>
              </div>
              
              <div class="mt-8 flex justify-end">
                <button 
                  type="button" 
                  @click="resetProfessionalInfo"
                  class="px-6 py-3 mr-3 bg-gray-300 hover:bg-gray-200 rounded-xl text-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 text-white hover:text-white rounded-xl text-base transition-colors flex items-center"
                  :disabled="isSaving"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Contact Information Tab -->
          <div v-if="activeTab === 'contact'" class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Contact Information</h2>
            
            <form @submit.prevent="saveContactInfo">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Work Email -->
                <div>
                  <label for="workEmail" class="block text-base font-medium text-gray-500 mb-2">Work Email</label>
                  <input 
                    id="workEmail"
                    v-model="profileData.workEmail"
                    type="email" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your work email"
                  />
                </div>
                
                <!-- Work Phone -->
                <div>
                  <label for="workPhone" class="block text-base font-medium text-gray-500 mb-2">Work Phone</label>
                  <input 
                    id="workPhone"
                    v-model="profileData.workPhone"
                    type="tel" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your work phone"
                  />
                </div>
                
                <!-- Organization -->
                <div>
                  <label for="organization" class="block text-base font-medium text-gray-500 mb-2">Organization</label>
                  <input 
                    id="organization"
                    v-model="profileData.organization"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your organization"
                  />
                </div>
                
                <!-- Department -->
                <div>
                  <label for="department" class="block text-base font-medium text-gray-500 mb-2">Department</label>
                  <input 
                    id="department"
                    v-model="profileData.department"
                    type="text" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your department"
                  />
                </div>
                
                <!-- Address -->
                <div class="md:col-span-2">
                  <label for="address" class="block text-base font-medium text-gray-500 mb-2">Work Address</label>
                  <textarea 
                    id="address"
                    v-model="profileData.workAddress"
                    rows="3" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your work address"
                  ></textarea>
                </div>
                
                <!-- Website -->
                <div class="md:col-span-2">
                  <label for="website" class="block text-base font-medium text-gray-500 mb-2">Website</label>
                  <input 
                    id="website"
                    v-model="profileData.website"
                    type="url" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="https://example.com"
                  />
                </div>
                
                <!-- Social Media Links -->
                <div class="md:col-span-2">
                  <label class="block text-base font-medium text-gray-500 mb-3">Social Media</label>
                  
                  <!-- LinkedIn -->
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </div>
                    <input 
                      v-model="profileData.socialMedia.linkedin"
                      type="text" 
                      class="flex-1 bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm
"
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  
                  <!-- Twitter -->
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </div>
                    <input 
                      v-model="profileData.socialMedia.twitter"
                      type="text" 
                      class="flex-1 bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm
"
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  
                  <!-- ResearchGate -->
                  <div class="flex items-center">
                    <div class="w-12 h-12  flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#00CCBB]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.586 0c-2.123 0-4.095 1.527-4.71 3.405-1.348-.587-2.647-.89-4.125-.89-1.469 0-2.913.3-4.333.93C3.151 4.759.686 7.515.686 11.86c0 4.32 2.529 7.179 5.898 8.27 1.36.441 2.935.659 4.464.659 1.571 0 3.192-.218 4.598-.68 3.231-1.061 5.723-3.929 5.723-8.25 0-4.348-2.456-7.036-5.759-8.17-.115-.042-.233-.082-.355-.12.077-.518.196-1.042.533-1.604.487-.814 1.41-1.533 2.625-1.533 1.348 0 2.253.784 2.253 2.023 0 1.186-.726 2.17-1.773 2.582v1.023c1.878-.688 3.256-2.341 3.256-4.511C22.15 1.249 21.039 0 19.586 0zm-7.171 15.089c-.944.66-2.397 1.11-4.124 1.11-1.724 0-3.18-.45-4.124-1.11-1.666-1.17-2.221-2.489-2.221-4.32 0-1.833.558-3.152 2.221-4.32.944-.66 2.397-1.11 4.124-1.11 1.724 0 3.18.45 4.124 1.11 1.666 1.17 2.221 2.489 2.221 4.32 0 1.833-.558 3.152-2.221 4.32z"/>
                      </svg>
                    </div>
                    <input 
                      v-model="profileData.socialMedia.researchGate"
                      type="text" 
                      class="flex-1 bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="ResearchGate profile URL"
                    />
                  </div>
                </div>
              </div>
              
              <div class="mt-8 flex justify-end">
                <button 
                  type="button" 
                  @click="resetContactInfo"
                  class="px-6 py-3 mr-3 bg-gray-300 hover:bg-gray-200 rounded-xl text-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 text-white hover:text-white rounded-xl text-base transition-colors flex items-center"
                  :disabled="isSaving"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Security Settings</h2>
            
            <form @submit.prevent="changePassword">
              <div class="space-y-5">
                <!-- Current Password -->
                <div>
                  <label for="currentPassword" class="block text-base font-medium text-gray-500 mb-2">Current Password</label>
                  <input 
                    id="currentPassword"
                    v-model="passwordData.currentPassword"
                    type="password" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <!-- New Password -->
                <div>
                  <label for="newPassword" class="block text-base font-medium text-gray-500 mb-2">New Password</label>
                  <input 
                    id="newPassword"
                    v-model="passwordData.newPassword"
                    type="password" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Enter new password"
                  />
                  <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters and include uppercase, lowercase, number, and special character.</p>
                </div>
                
                <!-- Confirm New Password -->
                <div>
                  <label for="confirmPassword" class="block text-base font-medium text-gray-500 mb-2">Confirm New Password</label>
                  <input 
                    id="confirmPassword"
                    v-model="passwordData.confirmPassword"
                    type="password" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div class="mt-8 flex justify-end">
                <button 
                  type="button" 
                  @click="resetPasswordForm"
                  class="px-6 py-3 mr-3 bg-gray-300 hover:bg-gray-200 rounded-xl text-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 text-white hover:text-white rounded-xl text-base transition-colors flex items-center"
                  :disabled="isSaving"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSaving ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </form>
            
            <div class="mt-10 pt-6 border-t border-gray-300">
              <h3 class="text-2xl font-bold mb-4">Two-Factor Authentication</h3>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-base">Enhance your account security</p>
                  <p class="text-sm text-gray-400 mt-1">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                </div>
                <button 
                  type="button"
                  @click="setup2FA"
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 rounded-xl text-white text-base transition-colors"
                >
                  {{ profileData.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Privacy Tab -->
          <div v-if="activeTab === 'privacy'" class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Privacy Settings</h2>
            
            <form @submit.prevent="savePrivacySettings">
              <div class="space-y-8">
                <!-- Profile Visibility -->
                <div>
                  <h3 class="text-lg font-medium mb-4">Profile Visibility</h3>
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <input 
                        id="visibility-public" 
                        v-model="profileData.privacySettings.profileVisibility" 
                        type="radio" 
                        value="public"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="visibility-public" class="ml-3">
                        <span class="block text-base font-medium">Public</span>
                        <span class="block text-sm text-gray-400">Your profile is visible to everyone</span>
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="visibility-registered" 
                        v-model="profileData.privacySettings.profileVisibility" 
                        type="radio" 
                        value="registered"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="visibility-registered" class="ml-3">
                        <span class="block text-base font-medium">Registered Users Only</span>
                        <span class="block text-sm text-gray-400">Only registered users can view your profile</span>
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="visibility-private" 
                        v-model="profileData.privacySettings.profileVisibility" 
                        type="radio" 
                        value="private"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="visibility-private" class="ml-3">
                        <span class="block text-base font-medium">Private</span>
                        <span class="block text-sm text-gray-400">Only you and administrators can view your profile</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- Contact Information Visibility -->
                <div>
                  <h3 class="text-lg font-medium mb-4">Contact Information Visibility</h3>
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <input 
                        id="contact-public" 
                        v-model="profileData.privacySettings.contactVisibility" 
                        type="radio" 
                        value="public"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="contact-public" class="ml-3">
                        <span class="block text-base font-medium">Public</span>
                        <span class="block text-sm text-gray-400">Your contact information is visible to everyone</span>
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="contact-registered" 
                        v-model="profileData.privacySettings.contactVisibility" 
                        type="radio" 
                        value="registered"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="contact-registered" class="ml-3">
                        <span class="block text-base font-medium">Registered Users Only</span>
                        <span class="block text-sm text-gray-400">Only registered users can see your contact information</span>
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="contact-private" 
                        v-model="profileData.privacySettings.contactVisibility" 
                        type="radio" 
                        value="private"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700"
                      />
                      <label for="contact-private" class="ml-3">
                        <span class="block text-base font-medium">Private</span>
                        <span class="block text-sm text-gray-400">Your contact information is hidden from all users</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- Communication Preferences -->
                <div>
                  <h3 class="text-lg font-medium mb-4">Communication Preferences</h3>
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <input 
                        id="email-notifications" 
                        v-model="profileData.privacySettings.emailNotifications" 
                        type="checkbox"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700 rounded"
                      />
                      <label for="email-notifications" class="ml-3 text-base">
                        Receive email notifications
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="system-notifications" 
                        v-model="profileData.privacySettings.systemNotifications" 
                        type="checkbox"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700 rounded"
                      />
                      <label for="system-notifications" class="ml-3 text-base">
                        Receive system notifications
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input 
                        id="marketing-emails" 
                        v-model="profileData.privacySettings.marketingEmails" 
                        type="checkbox"
                        class="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-gray-600 bg-gray-700 rounded"
                      />
                      <label for="marketing-emails" class="ml-3 text-base">
                        Receive marketing emails
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-8 flex justify-end">
                <button 
                  type="button" 
                  @click="resetPrivacySettings"
                  class="px-6 py-3 mr-3 bg-gray-300 hover:bg-gray-200 rounded-xl text-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#606c38]/80 text-white hover:text-white rounded-xl text-base transition-colors flex items-center"
                  :disabled="isSaving"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  
    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation 
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../../firebase/config';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, getCountFromServer } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import NotificationToast from '../../components/professional/NotificationToast.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';

// Router
const router = useRouter();

// State
const isLoading = ref(true);
const isSaving = ref(false); // Fixed: Initialize with false instead of self-reference
const error = ref(null);
const showSignOutConfirmation = ref(false);
const activeTab = ref('personal');

// User data
const email = ref('');

// Profile data
const profileData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  displayName: '',
  photoURL: '',
  title: '',
  specialization: '',
  yearsOfExperience: '',
  qualifications: [''],
  bio: '',
  workEmail: '',
  workPhone: '',
  organization: '',
  department: '',
  workAddress: '',
  website: '',
  location: {
    streetAddress: '',
    barangay: {
      code: '',
      name: ''
    },
    municipality: {
      code: '',
      name: ''
    },
    province: {
      code: '',
      name: ''
    },
    country: {
      code: '',
      name: ''
    },
    formattedAddress: ''
  },
  socialMedia: {
    linkedin: '',
    twitter: '',
    researchGate: ''
  },
  privacySettings: {
    profileVisibility: 'public',
    contactVisibility: 'registered',
    emailNotifications: true,
    systemNotifications: true,
    marketingEmails: false
  },
  twoFactorEnabled: false,
  createdAt: null,
  updatedAt: null,
  lastLoginAt: null,
  materialsCount: 0,
  consultationsCount: 0,
  rating: '0.0',
  authUid: '',
  role: 'professional',
  isVerified: true,
  emailVerified: true,
  phoneVerified: false,
  verificationMethod: 'email'
});

// Original profile data for reset functionality
const originalProfileData = ref({});

// Password change data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success',
  timeout: null
});

// Tabs
const tabs = [
  { id: 'personal', name: 'Personal Information' },
  { id: 'professional', name: 'Professional Details' },
  { id: 'contact', name: 'Contact Information' },
  { id: 'security', name: 'Security' },
  { id: 'privacy', name: 'Privacy' }
];

// Computed properties
const userDisplayName = computed(() => {
  if (profileData.firstName && profileData.lastName) {
    return `${formatName(profileData.firstName)} ${formatName(profileData.lastName)}`;
  }
  return formatName(profileData.firstName) || profileData.displayName || 'Professional';
});

const userInitials = computed(() => {
  if (profileData.firstName && profileData.lastName) {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`;
  }
  return profileData.firstName.charAt(0) || profileData.displayName?.charAt(0) || 'P';
});

const formattedLocation = computed(() => {
  if (profileData.location?.formattedAddress) {
    return profileData.location.formattedAddress;
  }
  
  const parts = [];
  if (profileData.location?.streetAddress) parts.push(profileData.location.streetAddress);
  if (profileData.location?.barangay?.name) parts.push(profileData.location.barangay.name);
  if (profileData.location?.municipality?.name) parts.push(profileData.location.municipality.name);
  if (profileData.location?.province?.name) parts.push(profileData.location.province.name);
  if (profileData.location?.country?.name) parts.push(profileData.location.country.name);
  
  return parts.length > 0 ? parts.join(', ') : 'Location not set';
});

const bioCharactersLeft = computed(() => {
  const maxLength = 500;
  return maxLength - (profileData.bio?.length || 0);
});

// Methods
const goBack = () => {
  router.push('/professional/dashboard');
};

const fetchProfileData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }
    
    // Get user data from Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("User profile not found. Please contact support.");
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Update profile data state
    Object.keys(profileData).forEach(key => {
      if (userData[key] !== undefined) {
        profileData[key] = userData[key];
      }
    });
    
    // Set email
    email.value = profileData.email;

    const currentUserName = `${formatName(profileData.firstName)} ${formatName(profileData.lastName)}`;

    // 1. Create a query to find materials created by the current user
    const materialsRef = collection(db, "learningMaterials");
    const materialsQuery = query(materialsRef, where("uploadedBy", "==", currentUserName));

    // 2. Use getCountFromServer for an efficient count
    const materialsSnapshot = await getCountFromServer(materialsQuery);
    
    // 3. Update the profileData with the count
    profileData.materialsCount = materialsSnapshot.data().count;
    
    
    
    // Ensure location object exists with all nested properties
    if (!profileData.location) {
      profileData.location = {
        streetAddress: '',
        barangay: { code: '', name: '' },
        municipality: { code: '', name: '' },
        province: { code: '', name: '' },
        country: { code: '', name: '' },
        formattedAddress: ''
      };
    } else {
      // Ensure all nested objects exist
      if (!profileData.location.barangay) profileData.location.barangay = { code: '', name: '' };
      if (!profileData.location.municipality) profileData.location.municipality = { code: '', name: '' };
      if (!profileData.location.province) profileData.location.province = { code: '', name: '' };
      if (!profileData.location.country) profileData.location.country = { code: '', name: '' };
    }
    
    // Ensure social media object exists
    if (!profileData.socialMedia) {
      profileData.socialMedia = {
        linkedin: '',
        twitter: '',
        researchGate: ''
      };
    }
    
    // Ensure privacy settings object exists
    if (!profileData.privacySettings) {
      profileData.privacySettings = {
        profileVisibility: 'public',
        contactVisibility: 'registered',
        emailNotifications: true,
        systemNotifications: true,
        marketingEmails: false
      };
    }
    
    // Ensure qualifications array exists
    if (!profileData.qualifications || !Array.isArray(profileData.qualifications)) {
      profileData.qualifications = [''];
    }
    
    // Store original data for reset functionality
    originalProfileData.value = JSON.parse(JSON.stringify(profileData));
    
    // Check if user has correct role for this dashboard
    if (userData.role !== 'professional') {
      router.push('/user/dashboard');
      return;
    }
    
  } catch (err) {
    console.error("Error fetching profile data:", err);
    error.value = err.message || "Failed to load profile data. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Format name (capitalize first letter)
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  // If it's a Firestore timestamp, convert to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Show notification
const showNotification = (message, type = 'success', duration = 5000) => {
  // Clear any existing timeout
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }

  // Set notification
  notification.value = {
    show: true,
    message,
    type,
    timeout: setTimeout(() => {
      hideNotification();
    }, duration)
  };
};

// Hide notification
const hideNotification = () => {
  notification.value.show = false;
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
    notification.value.timeout = null;
  }
};

// Handle profile photo change
const handleProfilePhotoChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type and size
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showNotification('Image size should be less than 5MB', 'error');
    return;
  }

  try {
    isSaving.value = true;
    
    // Create a reference to the storage location
    const fileRef = storageRef(storage, `profile-photos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
    
    // Upload the file
    await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(fileRef);
    
    // Update profile data
    profileData.photoURL = downloadURL;
    
    // Update in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });
      
      showNotification('Profile photo updated successfully', 'success');
    }
  } catch (err) {
    console.error("Error updating profile photo:", err);
    showNotification('Failed to update profile photo', 'error');
  } finally {
    isSaving.value = false;
  }
};

// Save personal information
const savePersonalInfo = async () => {
  try {
    isSaving.value = true;
    
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName) {
      showNotification('First name and last name are required', 'error');
      return;
    }
    
    // Update in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        location: profileData.location,
        updatedAt: serverTimestamp()
      });
      
      // Update original data
      originalProfileData.value = JSON.parse(JSON.stringify(profileData));
      
      showNotification('Personal information updated successfully', 'success');
    }
  } catch (err) {
    console.error("Error updating personal information:", err);
    showNotification('Failed to update personal information', 'error');
  } finally {
    isSaving.value = false;
  }
};

// Reset personal information form
const resetPersonalInfo = () => {
  // Reset to original values
  profileData.firstName = originalProfileData.value.firstName || '';
  profileData.lastName = originalProfileData.value.lastName || '';
  profileData.phoneNumber = originalProfileData.value.phoneNumber || '';
  
  // Reset location data
  if (originalProfileData.value.location) {
    profileData.location = JSON.parse(JSON.stringify(originalProfileData.value.location));
  } else {
    profileData.location = {
      streetAddress: '',
      barangay: { code: '', name: '' },
      municipality: { code: '', name: '' },
      province: { code: '', name: '' },
      country: { code: '', name: '' },
      formattedAddress: ''
    };
  }
};

// Add qualification field
const addQualification = () => {
  profileData.qualifications.push('');
};

// Remove qualification field
const removeQualification = (index) => {
  profileData.qualifications.splice(index, 1);

  // Ensure at least one qualification field
  if (profileData.qualifications.length === 0) {
    profileData.qualifications.push('');
  }
};

// Save professional information
const saveProfessionalInfo = async () => {
  try {
    isSaving.value = true;
    
    // Filter out empty qualifications
    const filteredQualifications = profileData.qualifications.filter(q => q.trim() !== '');
    
    // Ensure at least one qualification (even if empty)
    if (filteredQualifications.length === 0) {
      filteredQualifications.push('');
    }
    
    // Update in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        title: profileData.title,
        specialization: profileData.specialization,
        yearsOfExperience: profileData.yearsOfExperience,
        qualifications: filteredQualifications,
        bio: profileData.bio,
        updatedAt: serverTimestamp()
      });
      
      // Update qualifications in profile data
      profileData.qualifications = filteredQualifications;
      
      // Update original data
      originalProfileData.value = JSON.parse(JSON.stringify(profileData));
      
      showNotification('Professional details updated successfully', 'success');
    }
  } catch (err) {
    console.error("Error updating professional details:", err);
    showNotification('Failed to update professional details', 'error');
  } finally {
    isSaving.value = false;
  }
};

// Reset professional information form
const resetProfessionalInfo = () => {
  // Reset to original values
  profileData.title = originalProfileData.value.title || '';
  profileData.specialization = originalProfileData.value.specialization || '';
  profileData.yearsOfExperience = originalProfileData.value.yearsOfExperience || '';
  profileData.qualifications = [...(originalProfileData.value.qualifications || [''])];
  profileData.bio = originalProfileData.value.bio || '';
};

// Save contact information
const saveContactInfo = async () => {
  try {
    isSaving.value = true;
    
    // Validate website URL if provided
    if (profileData.website && !isValidUrl(profileData.website)) {
      showNotification('Please enter a valid website URL', 'error');
      return;
    }
    
    // Update in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        workEmail: profileData.workEmail,
        workPhone: profileData.workPhone,
        organization: profileData.organization,
        department: profileData.department,
        workAddress: profileData.workAddress,
        website: profileData.website,
        socialMedia: profileData.socialMedia,
        updatedAt: serverTimestamp()
      });
      
      // Update original data
      originalProfileData.value = JSON.parse(JSON.stringify(profileData));
      
      showNotification('Contact information updated successfully', 'success');
    }
  } catch (err) {
    console.error("Error updating contact information:", err);
    showNotification('Failed to update contact information', 'error');
  } finally {
    isSaving.value = false;
  }
};

// Reset contact information form
const resetContactInfo = () => {
  // Reset to original values
  profileData.workEmail = originalProfileData.value.workEmail || '';
  profileData.workPhone = originalProfileData.value.workPhone || '';
  profileData.organization = originalProfileData.value.organization || '';
  profileData.department = originalProfileData.value.department || '';
  profileData.workAddress = originalProfileData.value.workAddress || '';
  profileData.website = originalProfileData.value.website || '';
  profileData.socialMedia = {
    linkedin: originalProfileData.value.socialMedia?.linkedin || '',
    twitter: originalProfileData.value.socialMedia?.twitter || '',
    researchGate: originalProfileData.value.socialMedia?.researchGate || ''
  };
};

// Change password
const changePassword = async () => {
  try {
    isSaving.value = true;
    
    // Validate password fields
    if (!passwordData.currentPassword) {
      showNotification('Current password is required', 'error');
      return;
    }
    
    if (!passwordData.newPassword) {
      showNotification('New password is required', 'error');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return;
    }
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      passwordData.currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // Update password
    await updatePassword(auth.currentUser, passwordData.newPassword);
    
    // Reset form
    resetPasswordForm();
    
    showNotification('Password updated successfully', 'success');
  } catch (err) {
    console.error("Error updating password:", err);
    
    if (err.code === 'auth/wrong-password') {
      showNotification('Current password is incorrect', 'error');
    } else if (err.code === 'auth/weak-password') {
      showNotification('New password is too weak', 'error');
    } else {
      showNotification('Failed to update password', 'error');
    }
  } finally {
    isSaving.value = false;
  }
};

// Reset password form
const resetPasswordForm = () => {
  passwordData.currentPassword = '';
  passwordData.newPassword = '';
  passwordData.confirmPassword = '';
};

// Setup 2FA
const setup2FA = () => {
  // This would typically open a modal or navigate to a 2FA setup page
  showNotification('Two-factor authentication setup will be available soon', 'info');
};

// Save privacy settings
const savePrivacySettings = async () => {
  try {
    isSaving.value = true;
    
    // Update in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        privacySettings: profileData.privacySettings,
        updatedAt: serverTimestamp()
      });
      
      // Update original data
      originalProfileData.value = JSON.parse(JSON.stringify(profileData));
      
      showNotification('Privacy settings updated successfully', 'success');
    }
  } catch (err) {
    console.error("Error updating privacy settings:", err);
    showNotification('Failed to update privacy settings', 'error');
  } finally {
    isSaving.value = false;
  }
};

// Reset privacy settings
const resetPrivacySettings = () => {
  // Reset to original values
  profileData.privacySettings = {
    profileVisibility: originalProfileData.value.privacySettings?.profileVisibility || 'public',
    contactVisibility: originalProfileData.value.privacySettings?.contactVisibility || 'registered',
    emailNotifications: originalProfileData.value.privacySettings?.emailNotifications !== false,
    systemNotifications: originalProfileData.value.privacySettings?.systemNotifications !== false,
    marketingEmails: originalProfileData.value.privacySettings?.marketingEmails === true
  };
};

// Download profile data
const downloadProfileData = () => {
  try {
    // Create a JSON blob with profile data
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-data-${Date.now()}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Profile data downloaded successfully', 'success');
  } catch (err) {
    console.error("Error downloading profile data:", err);
    showNotification('Failed to download profile data', 'error');
  }
};

// Validate URL
const isValidUrl = (url) => {
  if (!url) return true; // Empty URL is valid (not required)

  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

// Handle sign out
const handleSignOut = async () => {
  try {
    // First close the confirmation dialog
    showSignOutConfirmation.value = false;
    
    // Sign out from Firebase Auth
    await signOut(auth);
    
    // Navigate to sign in page
    router.push('/signin');
  } catch (err) {
    console.error("Error signing out:", err);
    showNotification('Failed to sign out', 'error');
  }
};

// Fetch profile data on component mount
onMounted(() => {
  fetchProfileData();
});
</script>