<template>
   <div class="min-h-screen bg-white text-gray-900 pt-16">
      <UserNavbar 
        :user-initials="userInitials"
        :user-display-name="userDisplayName"
        :email="email"
        :notification-count="3"
        :profile-image="profileImage" 
        @sign-out="showSignOutConfirmation = true"
      />
      
      <UserSidebar />
      
      <main class="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div class="mb-4 sm:mb-6 flex items-center justify-between">
            <div class="flex items-center">
                <button @click="goBack" class="mr-3 sm:mr-4 p-2 transition-colors group relative hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-gray-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span class="absolute -top-10 left-0 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg">
                        {{ $t('profile.header.backTooltip') }}
                    </span>
                </button>
                <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold">{{ $t('profile.header.title') }}</h2>
            </div>
        </div>
        
        <div v-if="isLoading" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-[#606c38] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-400">{{ $t('profile.loading') }}</p>
          </div>
        </div>
        
        <div v-else-if="error" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-lg mx-auto text-center">
            <h3 class="font-medium text-lg mb-2">{{ $t('common.error') }}</h3>
            <p>{{ error }}</p>
            <button @click="fetchUserData" class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors">
              {{ $t('common.tryAgain') }}
            </button>
          </div>
        </div>
        
        <div v-else>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div class="bg-white rounded-xl shadow p-4 sm:p-6 self-start">
              <div class="flex flex-col items-center mb-4 sm:mb-6">
                <div class="relative group">
                  <div class="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-[#c9d4a3] flex items-center justify-center text-[#606c38] shadow-lg text-2xl sm:text-3xl lg:text-4xl font-bold overflow-hidden">
                    <img v-if="profileImage" :src="profileImage" alt="Profile" class="h-full w-full object-cover" />
                    <span v-else>{{ userInitials }}</span>
                  </div>
                  <button @click="openImageUpload" class="absolute bottom-0 right-0 bg-gray-600 hover:bg-gray-700 rounded-full p-1.5 sm:p-2 transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                  <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload"/>
                </div>
                <h3 class="text-lg sm:text-xl lg:text-2xl text-gray-900 font-bold mt-3 sm:mt-4 text-center">{{ userDisplayName }}</h3>
                <p class="text-sm sm:text-base text-gray-600 font-medium text-center">{{ userRole === 'professional' ? $t('profile.userCard.roleProfessional') : $t('profile.userCard.roleFarmer') }}</p>
                <div class="mt-2 sm:mt-3 px-2 sm:px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">{{ $t('profile.status.active') }}</div>
              </div>
              
              <div class="mb-4 sm:mb-6">
                <h4 class="text-sm font-medium  mb-2">{{ $t('profile.userCard.about') }}</h4>
                <div v-if="!editingBio" class="relative group">
                  <p v-if="bio" class="text-sm sm:text-base text-gray-600 whitespace-pre-line">{{ bio }}</p>
                  <p v-else class="text-sm sm:text-base text-gray-600 italic">{{ $t('profile.userCard.noBio') }}</p>
                  <button @click="startEditingBio" class="absolute top-0 right-0 p-1 sm:p-1.5 opacity-60 hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 text-gray-900 hover:text-gray-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
                <div v-else>
                  <textarea v-model="editedBio" class="w-full px-3 py-2 bg-white border border-gray-400/50 rounded-xl text-black focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm sm:text-base" rows="3" :placeholder="$t('profile.userCard.editBioPlaceholder')"></textarea>
                  <div class="flex justify-end space-x-2 mt-2">
                    <button @click="cancelEditBio" :disabled="isSavingBio" class="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-full text-sm shadow-sm transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">{{ $t('common.cancel') }}</button>
                    <button @click="saveBio" :disabled="isSavingBio" class="px-5 py-2 bg-[#606c38] hover:bg-[#4a5a29] text-white font-medium rounded-full text-sm shadow-sm transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                      <div v-if="isSavingBio" class="inline-spinner mr-2"></div>
                      <span>{{ isSavingBio ? 'Saving...' : $t('common.save') }}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2 sm:space-y-3">
                   <div class="flex items-center space-x-2 sm:space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                   <span class="text-sm sm:text-base truncate">{{ email }}</span>
                 </div>
                 <div class="flex items-center space-x-2 sm:space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <span v-if="location.formattedAddress" class="text-sm sm:text-base truncate">{{ location.formattedAddress }}</span>
                   <span v-else class="text-sm sm:text-base text-gray-500 italic">{{ $t('profile.userCard.noLocation') }}</span>
                 </div>
                 <div class="flex items-center space-x-2 sm:space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                   <span v-if="phoneNumber" class="text-sm sm:text-base">{{ phoneNumber }}</span><span v-else class="text-sm sm:text-base text-gray-500 italic">{{ $t('profile.userCard.noPhone') }}</span>
                 </div>
                 <div class="flex items-center space-x-2 sm:space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span class="text-sm sm:text-base">{{ $t('profile.userCard.joined', { date: formattedJoinDate }) }}</span>
                 </div>
                 <div class="flex items-center space-x-2 sm:space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                   <span class="text-sm sm:text-base">{{ $t('profile.userCard.verification', { method: verificationMethod || 'N/A' }) }}</span>
                 </div>
              </div>
              
              <div class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-400/50">
                <h4 class="text-sm font-medium mb-2 sm:mb-3">{{ $t('profile.stats.title') }}</h4>
                <div class="grid grid-cols-2 gap-2 sm:gap-3 ">
                  <div class="bg-[#c9d4a3]/80 rounded-xl p-2 sm:p-3 text-center">
                    <div class="text-lg sm:text-xl font-bold text-[#283618]">{{ stats.scans }}</div>
                    <div class="text-xs text-gray-600">{{ $t('profile.stats.scans') }}</div>
                  </div>
                  <div class="bg-[#c9d4a3]/80 rounded-xl p-2 sm:p-3 text-center">
                    <div class="text-lg sm:text-xl font-bold text-[#283618]">{{ stats.reports }}</div>
                    <div class="text-xs text-gray-600">{{ $t('profile.stats.reports') }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="lg:col-span-2">
              <div class="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-medium mb-4 sm:mb-6">{{ $t('profile.account.title') }}</h3>
                <div class="space-y-4 sm:space-y-6">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label class="text-sm sm:text-base text-gray-600">{{ $t('profile.account.fullName') }}</label>
                    <div class="lg:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <input type="text" v-model="firstName" :placeholder="$t('profile.account.firstName')" class="flex-1 px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                      <input type="text" v-model="lastName" :placeholder="$t('profile.account.lastName')" class="flex-1 px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label class="text-sm sm:text-base text-gray-600">{{ $t('profile.account.email') }}</label>
                    <div class="lg:col-span-2">
                      <input type="email" v-model="email" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base" disabled/>
                      <p class="text-xs text-gray-500 mt-1">{{ $t('profile.account.emailImmutable') }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label class="text-sm sm:text-base text-gray-600">{{ $t('profile.account.phone') }}</label>
                    <div class="lg:col-span-2">
                      <input type="tel" v-model="phoneNumber" placeholder="+63 XXX XXX XXXX" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
                    <label class="text-sm sm:text-base text-gray-600 mt-2">{{ $t('profile.account.location') }}</label>
                    <div class="lg:col-span-2 space-y-2 sm:space-y-3">
                      <select v-model="location.country.code" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base">
                          <option value="PH">Philippines</option>
                          <option value="ID">Indonesia</option>
                      </select>
                      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <select v-model="location.province.code" class="flex-1 px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base">
                            <option value="175200000">Oriental Mindoro</option>
                            <option value="175100000">Occidental Mindoro</option>
                        </select>
                        <select v-model="location.municipality.code" class="flex-1 px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base">
                            <option value="175208000">Naujan</option>
                            <option value="175205000">Calapan City</option>
                        </select>
                      </div>
                      <input v-model="location.streetAddress" type="text" :placeholder="$t('profile.account.street')" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                    </div>
                  </div>
                </div>
                <div v-if="accountSuccess" class="mt-3 sm:mt-4 text-xs sm:text-sm text-green-400 bg-green-500/10 p-2 sm:p-3 rounded-md">{{ $t('profile.account.success') }}</div>
                <div v-if="accountError" class="mt-3 sm:mt-4 text-xs sm:text-sm text-red-400 bg-red-500/10 p-2 sm:p-3 rounded-md">{{ $t('profile.account.error') }}</div>
                <div class="flex justify-end mt-4 sm:mt-6">
                  <button @click="saveAccountChanges" class="px-4 sm:px-5 py-2 bg-[#283618] text-white rounded-xl text-sm transition-colors">
                    {{ $t('profile.account.save') }}
                  </button>
                </div>
              </div>
              
              <div class="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-medium mb-4 sm:mb-6">{{ $t('profile.password.title') }}</h3>
                <div class="space-y-3 sm:space-y-4">
                  <div>
                    <label class="block text-sm sm:text-base text-gray-600 mb-1">{{ $t('profile.password.current') }}</label>
                    <input v-model="currentPassword" type="password" placeholder="••••••••" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                  </div>
                  <div>
                    <label class="block text-sm sm:text-base text-gray-600 mb-1">{{ $t('profile.password.new') }}</label>
                    <input v-model="newPassword" type="password" placeholder="••••••••" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                  </div>
                  <div>
                    <label class="block text-sm sm:text-base text-gray-600 mb-1">{{ $t('profile.password.confirm') }}</label>
                    <input v-model="confirmNewPassword" type="password" placeholder="••••••••" class="w-full px-3 py-2 bg-white border border-gray-400 rounded-xl placeholder-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm sm:text-base"/>
                  </div>
                </div>
                 <div v-if="passwordSuccess" class="mt-3 sm:mt-4 text-xs sm:text-sm text-green-400 bg-green-500/10 p-2 sm:p-3 rounded-md">{{ $t('profile.password.success') }}</div>
                <div v-if="passwordError" class="mt-3 sm:mt-4 text-xs sm:text-sm text-red-400 bg-red-500/10 p-2 sm:p-3 rounded-md">{{ passwordError === 'New passwords do not match.' ? $t('profile.password.errorMatch') : (passwordError === 'New password must be at least 6 characters long.' ? $t('profile.password.errorLength') : $t('profile.password.errorUpdate')) }}</div>
                <div class="flex justify-end mt-4 sm:mt-6">
                  <button @click="updatePassword" class="px-4 sm:px-5 py-2 bg-[#283618] text-white rounded-xl text-sm transition-colors">
                    {{ $t('profile.password.save') }}
                  </button>
                </div>
              </div>
              
              <div class="bg-white rounded-xl shadow p-4 sm:p-6">
                <h3 class="text-base sm:text-lg font-medium mb-4 sm:mb-6">{{ $t('profile.notifications.title') }}</h3>
                <div class="space-y-3 sm:space-y-4">
                    <label class="flex items-center justify-between cursor-pointer"><span class="text-sm sm:text-base text-gray-600">{{ $t('profile.notifications.email') }}</span><input type="checkbox" v-model="emailNotifications" class="sr-only peer"><div class="relative w-10 h-5 sm:w-11 sm:h-6 bg-gray-400 rounded-full peer peer-focus:ring-1 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#606c38]"></div></label>
                    <label class="flex items-center justify-between cursor-pointer"><span class="text-sm sm:text-base text-gray-600">{{ $t('profile.notifications.sms') }}</span><input type="checkbox" v-model="smsNotifications" class="sr-only peer"><div class="relative w-10 h-5 sm:w-11 sm:h-6 bg-gray-400 rounded-full peer peer-focus:ring-1 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#606c38]"></div></label>
                    <label class="flex items-center justify-between cursor-pointer"><span class="text-sm sm:text-base text-gray-600">{{ $t('profile.notifications.weather') }}</span><input type="checkbox" v-model="weatherAlerts" class="sr-only peer"><div class="relative w-10 h-5 sm:w-11 sm:h-6 bg-gray-400 rounded-full peer peer-focus:ring-1 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#606c38]"></div></label>
                    <label class="flex items-center justify-between cursor-pointer"><span class="text-sm sm:text-base text-gray-600">{{ $t('profile.notifications.disease') }}</span><input type="checkbox" v-model="diseaseOutbreakAlerts" class="sr-only peer"><div class="relative w-10 h-5 sm:w-11 sm:h-6 bg-gray-400 rounded-full peer peer-focus:ring-1 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#606c38]"></div></label>
                </div>
                 <div v-if="notificationSuccess" class="mt-3 sm:mt-4 text-xs sm:text-sm text-green-400 bg-green-500/10 p-2 sm:p-3 rounded-md">{{ $t('profile.notifications.success') }}</div>
                <div v-if="notificationError" class="mt-3 sm:mt-4 text-xs sm:text-sm text-red-400 bg-red-500/10 p-2 sm:p-3 rounded-md">{{ $t('profile.notifications.error') }}</div>
                <div class="flex justify-end mt-4 sm:mt-6">
                  <button @click="saveNotificationPreferences" class="px-4 sm:px-5 py-2 bg-[#283618] text-white  rounded-xl  text-sm  transition-colors">
                    {{ $t('profile.notifications.save') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SignOutConfirmation 
        :show="showSignOutConfirmation"
        @confirm="handleSignOut"
        @cancel="showSignOutConfirmation = false"
      />

      <!-- Image Processing Modal -->
      <div v-if="isImageProcessing" class="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div class="mb-4">
            <div class="flex justify-center space-x-1">
              <div class="w-3 h-3 bg-[#606c38] rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-3 h-3 bg-[#606c38] rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-3 h-3 bg-[#606c38] rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Uploading profile picture...</h3>
          <p class="text-sm text-gray-600">Please wait while we process your image</p>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from '../../firebase/config';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n();

// --- Core State ---
const isLoading = ref(true);
const error = ref(null);
const showSignOutConfirmation = ref(false);
const editingBio = ref(false);
const isSavingBio = ref(false);
const isImageProcessing = ref(false);

// --- User Info ---
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phoneNumber = ref('');
const bio = ref('');
const editedBio = ref('');
const profileImage = ref(null);
const fileInput = ref(null);
const userRole = ref('user');
const createdAt = ref(null);
const verificationMethod = ref('');
const location = ref({
  country: { code: 'PH', name: 'Philippines' },
  province: { code: '175200000', name: 'Oriental Mindoro' },
  municipality: { code: '175208000', name: 'Naujan' },
  barangay: { code: '', name: '' },
  streetAddress: '',
  formattedAddress: ''
});

// --- Notification Settings ---
const emailNotifications = ref(true);
const smsNotifications = ref(false);
const weatherAlerts = ref(true);
const diseaseOutbreakAlerts = ref(true);

// --- UI Feedback ---
const accountSuccess = ref('');
const accountError = ref('');
const passwordSuccess = ref('');
const passwordError = ref('');
const notificationSuccess = ref('');
const notificationError = ref('');

// --- Computed ---
const userDisplayName = computed(() => `${firstName.value} ${lastName.value}`.trim() || 'User');
const userInitials = computed(() => (firstName.value.charAt(0) + lastName.value.charAt(0)).trim() || 'U');
const formattedJoinDate = computed(() => {
  if (!createdAt.value) return 'N/A';
  const date = createdAt.value.toDate ? createdAt.value.toDate() : new Date(createdAt.value);
  return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
});

// --- Dynamic Stats (Realtime) ---
const stats = ref({
  scans: 0,
  reports: 0
});
let unsubscribeScans = null;
let unsubscribeReports = null;

// --- Utility: Get user document ---
const getUserDoc = async () => {
  if (!auth.currentUser) throw new Error(t("auth.expired"));
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) throw new Error(t("profile.errorDocNotFound"));
  return querySnapshot.docs[0];
};

// --- Fetch user data ---
const fetchUserData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const userDoc = await getUserDoc();
    const userData = userDoc.data();
    
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || auth.currentUser.email;
    userRole.value = userData.role || 'user';
    phoneNumber.value = userData.phoneNumber || '';
    bio.value = userData.bio || '';
    profileImage.value = userData.profileImage || null;
    createdAt.value = userData.createdAt || null;
    verificationMethod.value = userData.verificationMethod || 'email';
    
    if (userData.location) {
      location.value = { ...location.value, ...userData.location };
    }

    emailNotifications.value = userData.notifications?.email ?? true;
    smsNotifications.value = userData.notifications?.sms ?? false;
    weatherAlerts.value = userData.notifications?.weather ?? true;
    diseaseOutbreakAlerts.value = userData.notifications?.disease ?? true;

  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || t("profile.errorLoading");
  } finally {
    isLoading.value = false;
  }
};

// --- Fetch realtime stats ---
const fetchUserStatsRealtime = () => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;

  // Stop previous listeners if any
  if (unsubscribeScans) unsubscribeScans();
  if (unsubscribeReports) unsubscribeReports();

  // Realtime Scans
  const scansQuery = query(collection(db, "scan_history"), where("userId", "==", userId));
  unsubscribeScans = onSnapshot(scansQuery, (snapshot) => {
    stats.value.scans = snapshot.size;
  }, (err) => console.error("Error listening to scans:", err));

  // Realtime Reports
  const reportsQuery = query(collection(db, "reports"), where("userId", "==", userId));
  unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
    stats.value.reports = snapshot.size;
  }, (err) => console.error("Error listening to reports:", err));
};

// --- Save account changes ---
const saveAccountChanges = async () => {
  accountError.value = '';
  accountSuccess.value = '';
  try {
    const userDoc = await getUserDoc();
    const updatedData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phoneNumber: phoneNumber.value.trim(),
      location: {
        country: location.value.country,
        province: location.value.province,
        municipality: location.value.municipality,
        barangay: location.value.barangay,
        streetAddress: location.value.streetAddress,
        formattedAddress: `${location.value.streetAddress}, ${location.value.municipality.name}, ${location.value.province.name}`.trim()
      }
    };
    await updateDoc(doc(db, "users", userDoc.id), updatedData);
    accountSuccess.value = t("profile.account.success");
    fetchUserData();
    setTimeout(() => accountSuccess.value = '', 3000);
  } catch (err) {
    console.error("Error updating account:", err);
    accountError.value = t("profile.account.error");
    setTimeout(() => accountError.value = '', 3000);
  }
};

// --- Update password ---
const updatePassword = async () => {
  passwordError.value = '';
  passwordSuccess.value = '';
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = t("profile.password.errorMatch");
    return;
  }
  if (!currentPassword.value || newPassword.value.length < 6) {
    passwordError.value = t("profile.password.errorLength");
    return;
  }

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword.value);
    
    passwordSuccess.value = t("profile.password.success");
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    setTimeout(() => passwordSuccess.value = '', 3000);
  } catch (err) {
    console.error("Error updating password:", err);
    passwordError.value = t("profile.password.errorUpdate");
    setTimeout(() => passwordError.value = '', 3000);
  }
};

// --- Notification Preferences ---
const saveNotificationPreferences = async () => {
  notificationError.value = '';
  notificationSuccess.value = '';
  try {
    const userDoc = await getUserDoc();
    const updatedData = {
      notifications: {
        email: emailNotifications.value,
        sms: smsNotifications.value,
        weather: weatherAlerts.value,
        disease: diseaseOutbreakAlerts.value,
      }
    };
    await updateDoc(doc(db, "users", userDoc.id), updatedData);
    notificationSuccess.value = t("profile.notifications.success");
    setTimeout(() => notificationSuccess.value = '', 3000);
  } catch (err) {
    console.error("Error saving preferences:", err);
    notificationError.value = t("profile.notifications.error");
    setTimeout(() => notificationError.value = '', 3000);
  }
};

// --- Bio Editing ---
const startEditingBio = () => {
  editedBio.value = bio.value;
  editingBio.value = true;
};
const cancelEditBio = () => { editingBio.value = false; };
const saveBio = async () => {
  isSavingBio.value = true;
  try {
    const userDoc = await getUserDoc();
    await updateDoc(doc(db, "users", userDoc.id), { bio: editedBio.value.trim() });
    bio.value = editedBio.value.trim();
    editingBio.value = false;
  } catch (err) {
    console.error("Error updating bio:", err);
  } finally {
    isSavingBio.value = false;
  }
};

// --- Image Upload ---
const openImageUpload = () => { fileInput.value?.click(); };
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || !auth.currentUser) return;

  isImageProcessing.value = true;
  try {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile_images/${auth.currentUser.uid}/${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);

    const userDoc = await getUserDoc();
    await updateDoc(doc(db, "users", userDoc.id), { profileImage: downloadURL });
    profileImage.value = downloadURL;
  } catch (err) {
    console.error("Error uploading image:", err);
    error.value = t("upload.error");
  } finally {
    isImageProcessing.value = false;
  }
};

// --- Navigation ---
const goBack = () => {
  // Check if there's a previous page in history
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    // Fallback to dashboard if no history
    router.push('/user/dashboard');
  }
};

// --- Sign Out ---
const handleSignOut = async () => {
  try {
    showSignOutConfirmation.value = false;
    await signOut(auth);
    window.location.href = '/signin';
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = t("auth.signOutError");
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchUserData();
  fetchUserStatsRealtime();
});

onBeforeUnmount(() => {
  if (unsubscribeScans) unsubscribeScans();
  if (unsubscribeReports) unsubscribeReports();
});
</script>


<style scoped>
/* Enhanced bouncing dots animation */
@keyframes bounce-dots {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce-dots 1.4s infinite;
}

/* Modal backdrop animation */
.fixed.inset-0 {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Inline spinner for loading states */
.inline-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>