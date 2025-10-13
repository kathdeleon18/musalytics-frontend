<template>
<div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Top Navigation Bar -->
    <UserNavbar
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :profile-image="profileImage"
      @sign-out="showSignOutConfirmation = true"
    />
    <!-- The redundant NotificationPanel has been removed from here -->

    <!-- Main Content with Sidebar -->
   <div class="pt-2 md:pl-64 flex">
      <!-- Sidebar -->
      <UserSidebar />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Title - Mobile Only -->
        <div class="md:hidden mb-6">
          <h2 class="text-2xl font-semibold mb-1 text-[#283618]">{{ $t('scan.scanAndDetect') }}</h2>
          <p class="text-gray-400 text-base">{{ $t('scan.uploadInstructions') }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading">
          <SkeletonLoader />
        </div>
        <!-- Error State -->
        <div v-else-if="error" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class=" rounded-xl bg-red-500/20 border border-red-500 text-red-600 px-6 py-4 rounded-lg max-w-lg mx-auto">
            <h3 class="font-medium text-lg mb-2">{{ $t('scan.Error') }}</h3>
            <p>{{ error }}</p>
            <button
              @click="error = null"
              class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors"
            >
              {{ $t('scan.dismiss') }}
            </button>
          </div>
        </div>

        <!-- Connection Status Alert -->
        <div v-if="!isWebSocketConnected && !isLoading && !error" class="mb-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 p-3 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ $t('scan.notConnected') }}</span>
          <button
            @click="reconnectWebSocket"
            class="ml-auto px-3 py-1 bg-yellow-500/30 hover:bg-yellow-500/50 rounded-md text-xs transition-colors"
          >
            {{ $t('scan.reconnect') }}
          </button>
        </div>

        <!-- Main Content -->
        <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- Page Title - Desktop Only -->
          <div class="hidden md:block md:col-span-12">
            <div class="flex justify-between items-center mb-1">
              <h2 class="text-3xl font-semibold mb-1 text-[#283618]">{{ $t('scan.scanAndDetect') }}</h2>
              <!-- NEW: Location and Weather Display -->
              <div class="text-right text-sm text-gray-400">
                <p v-if="displayLocation" class="flex items-center justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ displayLocation }}
                </p>
                <p v-if="displayWeather" class="flex items-center justify-end mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 00-1.342-9.915 3.001 3.001 0 003.057-3.057A3 3 0 0012 3v1m-4 6h.01M12 10h.01M16 10h.01M12 14h.01M16 14h.01M12 18h.01M16 18h.01" />
                  </svg>
                  {{ displayWeather }}
                </p>
              </div>
            </div>
            <p class="text-gray-400">{{ $t('scan.uploadInstructions') }}</p>
          </div>

          <!-- Upload Section -->
          <div class="md:col-span-12">
            <div class="bg-white rounded-xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-[#283618]">{{ $t('scan.uploadForAnalysis') }}</h3>

              <!-- Upload/Capture Options -->
              <div v-if="!isAnalyzing && !analysisResult" class="mb-6">
                <div class="flex justify-center mb-4">
                  <div class="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      @click="captureMode = 'upload'"
                      type="button"
                      class="px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10 focus:outline-none transition-colors"
                      :class="captureMode === 'upload' ? 'bg-[#606c38] text-white' : 'bg-gray-600 text-white hover:bg-gray-400'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      {{ $t('scan.uploadImages') }}
                    </button>
                    <button
                      @click="captureMode = 'camera'"
                      type="button"
                      class="px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10 focus:outline-none transition-colors"
                      :class="captureMode === 'camera' ? 'bg-[#606c38] text-white' : 'bg-gray-600 text-white hover:bg-gray-400'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ $t('scan.useCamera') }}
                    </button>
                  </div>
                </div>

                  <!-- Upload Area -->
                <div v-if="captureMode === 'upload'" class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <div class="max-w-md mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>

                    <h4 class="text-lg font-medium mb-2">{{ $t('scan.dragAndDrop') }}</h4>
                    <p class="text-gray-400 mb-4">{{ $t('scan.uploadTips') }}</p>

                    <div class="flex flex-col items-center">
                      <label for="file-upload" class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-colors cursor-pointer">
                        {{ $t('scan.selectImages') }}
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        class="hidden"
                        @change="handleFileUpload"
                      />
                      <p class="text-xs text-gray-400 mt-2">{{ $t('scan.imageConstraints') }}</p>
                    </div>
                  </div>
                </div>

                  <!-- Camera Capture Area -->
                <div v-else-if="captureMode === 'camera'" class="border-2 border-gray-600 rounded-lg p-4 text-center">
                  <div class="max-w-2xl mx-auto">
                    <div v-if="!isCameraActive && !capturedImage" class="py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>

                      <h4 class="text-lg font-medium mb-2">{{ $t('scan.takeAPicture') }}</h4>

                      <div v-if="isRequestingPermission" class="text-center mb-4">
                        <div class="animate-pulse flex flex-col items-center">
                          <p class="text-[#606c38] font-medium">{{ $t('scan.requestingPermission') }}</p>
                          <p class="text-gray-400 text-sm mt-1">{{ $t('scan.allowAccess') }}</p>
                        </div>
                      </div>

                      <div v-else-if="permissionDenied" class="text-center mb-4">
                        <div class="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p class="text-red-400 font-medium">{{ $t('scan.permissionDemied') }}</p>
                          <p class="text-gray-400 text-sm mt-1 mb-3">{{ $t('scan.allowAccessSettings') }}</p>

                        <div class="bg-gray-700/50 p-3 rounded-md text-left text-sm mb-4 max-w-md">
                            <p class="font-medium mb-1">{{ $t('scan.howToEnable') }}</p>
                            <ol class="list-decimal list-inside space-y-1 text-gray-300">
                              <li>{{ $t('scan.howToStep1') }}</li>
                              <li>{{ $t('scan.howToStep2') }}</li>
                              <li>{{ $t('scan.howToStep3') }}</li>
                            </ol>
                          </div>

                          <button
                            @click="retryPermission"
                            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition-colors"
                          >
                            {{ $t('common.tryAgain') }}
                          </button>
                        </div>
                      </div>

                      <div v-else>
                        <p class="text-gray-400 mb-4">{{ $t('scan.cameraTip') }}</p>

                        <button
                          @click="startCamera"
                          class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-colors"
                        >
                          {{ $t('scan.startCamera') }}
                        </button>
                      </div>
                    </div>

                    <!-- Camera View -->
                    <div v-if="isCameraActive && !capturedImage" class="relative">
                      <div class="bg-black rounded-md overflow-hidden" style="height: 400px; width: 100%;">
                        <video
                          ref="videoElement"
                          class="h-full w-full object-cover"
                          autoplay
                          playsinline
                          muted
                        ></video>
                      </div>

                      <div class="absolute bottom-4 left-0 right-0 flex justify-center">
                        <button
                          @click="captureImage"
                          class="p-4 rounded-full shadow-lg bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] transition-colors"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                        </button>
                      </div>

                      <button
                        @click="stopCamera"
                        class="absolute top-4 right-4 p-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div class="absolute top-4 left-4 flex space-x-2">
                        <button
                          @click="switchCamera"
                          class="p-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-full  transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button
                          v-if="flashAvailable"
                          @click="toggleFlash"
                          class="p-2 bg-gray-800/70 rounded-full hover:bg-gray-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Captured Image Preview -->
                    <div v-if="capturedImage" class="relative">
                      <div class="bg-black rounded-md overflow-hidden" style="height: 400px; width: 100%;">
                        <img :src="capturedImage" class="h-full w-full object-contain" alt="Captured image" />
                      </div>

                      <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          @click="retakeImage"
                          class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-colors"
                        >
                          {{ $t('scan.retake') }}
                        </button>
                        <button
                          @click="acceptImage"
                          class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-colors"
                        >
                          {{ $t('scan.useThisImage') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Images Preview -->
              <div v-if="selectedFiles.length > 0 && !isAnalyzing && !analysisResult" class="mt-6">
                <h4 class="font-medium mb-3">Selected Images ({{ selectedFiles.length }})</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div v-for="(file, index) in selectedFiles" :key="index" class="relative group">
                    <div class="h-32 rounded-md overflow-hidden bg-gray-700">
                      <img :src="previewUrls[index]" class="w-full h-full object-cover" alt="Preview" />
                    </div>
                    <button
                      @click="removeFile(index)"
                      class="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p class="text-xs text-gray-400 mt-1 truncate">{{ file.name }}</p>
                  </div>
                </div>

                <div class="flex justify-end mt-4 space-x-3">
                  <button
                    @click="clearFiles"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-sm transition-colors"
                  >
                    {{ $t('common.clearAll') }}
                  </button>
                  <button
                    @click="startAnalysis"
                    class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors flex items-center"
                    :disabled="!isWebSocketConnected"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {{ $t('scan.startAnalysis') }}
                  </button>
                </div>
              </div>

              <!-- Analyzing State -->
              <div v-if="isAnalyzing" class="py-12 text-center">
                <div class="flex flex-col items-center">
                  <svg class="animate-spin h-12 w-12 text-[#606c38] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <h4 class="text-lg font-medium mb-2">{{ $t('scan.analyzingImages') }}</h4>
                  <p class="text-gray-400 max-w-md mx-auto">{{ $t('scan.analyzingDesc') }}</p>

                  <div class="w-full max-w-md mt-6">
                    <div class="h-2 bg-gray-400 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-[#606c38] rounded-full transition-all duration-300"
                        :style="{ width: `${analysisProgress}%` }"
                      ></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">{{ analysisProgressText }}</p>
                  </div>
                </div>
              </div>

              <!-- Analysis Results -->
              <div v-if="analysisResult" class="mt-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-lg font-medium text-[#606c38]">{{ $t('scan.analysisResults') }}</h4>
                  <button
                    @click="resetAnalysis"
                    class="text-sm text-[#606c38] hover:text-[#c9d4a3]/100"
                  >
                    {{ $t('scan.startNewScan') }}
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Image with Detection -->
                  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="relative">
                      <img :src="analysisResult.imageUrl" class="w-full h-64 object-cover" alt="Analyzed Image" />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div class="absolute bottom-0 left-0 p-4">
                        <div class="flex items-center space-x-2">
                          <span class="px-2 py-1 text-xs bg-red-500/80 text-white rounded-full">{{ analysisResult.confidence }}% Confidence</span>
                          <span class="px-2 py-1 text-xs bg-yellow-500/80 text-white rounded-full">{{ analysisResult.severity }} Severity</span>
                        </div>
                      </div>
                    </div>
                    <div class="p-4">
                      <h5 class="font-semibold text-2xl mb-1 text-[#606c38]">{{ diseaseDetails ? diseaseDetails.name : analysisResult.disease }}</h5>
                      <p v-if="diseaseDetails && diseaseDetails.scientificName" class="text-sm text-[#606c38] italic mb-2">
                        {{ diseaseDetails.scientificName }}
                      </p>
                      <p class="text-gray-600 text-sm">
                        {{ diseaseDetails ? diseaseDetails.shortDescription : analysisResult.description }}
                      </p>

                      <!-- Category Badge -->
                      <div v-if="diseaseDetails && diseaseDetails.category" class="mt-3">
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                          {{ diseaseDetails.category.charAt(0).toUpperCase() + diseaseDetails.category.slice(1) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Disease Information Tabs -->
                  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="border-b border-gray-600">
                      <nav class="flex">
                        <button
                          @click="activeTab = 'treatment'"
                          class="px-4 py-3 text-sm font-medium transition-colors"
                          :class="activeTab === 'treatment' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                        >
                          {{ $t('scan.treatment') }}
                        </button>
                        <button
                          @click="activeTab = 'symptoms'"
                          class="px-4 py-3 text-sm font-medium transition-colors"
                          :class="activeTab === 'symptoms' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                        >
                          {{ $t('scan.symptoms') }}
                        </button>
                        <button
                          @click="activeTab = 'prevention'"
                          class="px-4 py-3 text-sm font-medium transition-colors"
                          :class="activeTab === 'prevention' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                        >
                          {{ $t('scan.prevention') }}
                        </button>
                        <button
                          @click="activeTab = 'info'"
                          class="px-4 py-3 text-sm font-medium transition-colors"
                          :class="activeTab === 'info' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                        >
                          {{ $t('scan.info') }}
                        </button>
                      </nav>
                    </div>

                    <div class="p-4">
                      <!-- Treatment Tab -->
                      <div v-if="activeTab === 'treatment'" class="space-y-4">
                        <h5 class="font-semibold mb-2 text-[#606c38] text-lg">{{ $t('scan.treatmentRecommendations') }}</h5>

                          <div v-if="diseaseDetails && diseaseDetails.treatment" class="mb-4">
                          <div v-html="diseaseDetails.treatment" class="text-xs text-gray-600"></div>
                        </div>

                        <div v-else class="text-center py-6">
                          <p class="text-gray-500 mb-4">{{ $t('scan.noTreatmentInfo') }}</p>
                          <button
                            @click="openRequestInfoModal"
                            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {{ $t('scan.requestInformation') }}
                          </button>
                        </div>
                      </div>

                      <!-- Symptoms Tab -->
                      <div v-if="activeTab === 'symptoms'" class="space-y-4">
                        <h5 class="font-semibold mb-2 text-[#606c38] text-lg">{{ $t('scan.symptoms') }}</h5>

                        <div v-if="diseaseDetails && diseaseDetails.symptoms" class="mb-4">
                          <div v-html="diseaseDetails.symptoms" class="text-xs text-gray-600"></div>
                        </div>
                        <div v-else class="text-center py-6">
                          <p class="text-gray-500 mb-4">{{ $t('scan.noSymptomsInfo') }}</p>
                          <button
                            @click="openRequestInfoModal"
                            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {{ $t('scan.requestInformation') }}
                          </button>
                        </div>

                        <!-- Affected Crops section remains the same -->
                        <div v-if="diseaseDetails && diseaseDetails.affectedCrops && diseaseDetails.affectedCrops.length > 0" class="mt-4 pt-4 border-t border-gray-600">
                          <h6 class="font-medium mb-2 text-sm text-[#606c38]">{{ $t('scan.affectedParts') }}</h6>
                          <div class="flex flex-wrap gap-2">
                            <span
                              v-for="(crop, index) in diseaseDetails.affectedCrops"
                              :key="index"
                              class="px-2 py-1 text-xs bg-[#c9d4a3] text-[#606c38] rounded-full"
                            >
                              {{ crop }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Prevention Tab -->
                      <div v-if="activeTab === 'prevention'" class="space-y-4">
                        <h5 class="font-semibold mb-2 text-[#606c38] text-lg">{{ $t('scan.preventionTips') }}</h5>

                        <div v-if="diseaseDetails && diseaseDetails.prevention" class="mb-4">
                          <div v-html="diseaseDetails.prevention" class="text-xs text-gray-600"></div>
                        </div>

                        <div v-else class="text-center py-6">
                          <p class="text-gray-500 mb-4">{{ $t('scan.noPreventionInfo') }}</p>
                          <button
                            @click="openRequestInfoModal"
                            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {{ $t('scan.requestInformation') }}
                          </button>
                        </div>
                      </div>

                      <!-- Additional Info Tab -->
                      <div v-if="activeTab === 'info'" class="space-y-4">
                        <h5 class="font-semibold mb-2 text-[#606c38] text-lg">{{ $t('scan.additionalInformation') }}</h5>

                        <div v-if="diseaseDetails && diseaseDetails.causes" class="mb-4">
                          <h6 class="font-medium text-sm mb-1">{{ $t('scan.causes') }}</h6>
                          <div v-html="diseaseDetails.causes" class="text-xs text-gray-600"></div>
                        </div>

                      <div v-if="diseaseDetails && diseaseDetails.additionalInfo" class="mb-4">
                          <h6 class="font-semibold text-sm mb-1 text-[#606c38]">{{ $t('scan.additionalDetails') }}</h6>
                          <div v-html="diseaseDetails.additionalInfo" class="text-xs text-gray-600"></div>
                        </div>

                        <div v-if="(!diseaseDetails || (!diseaseDetails.causes && !diseaseDetails.additionalInfo))" class="text-center py-6">
                          <p class="text-gray-400 mb-4">{{ $t('scan.noAdditionalInfo') }}</p>
                          <button
                            @click="openRequestInfoModal"
                            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {{ $t('scan.requestInformation') }}
                          </button>
                        </div>
                      </div>
                    </div>

                  <div class="p-4 border-t border-gray-600">
                      <button
                        @click="saveToReports"
                        class="w-full py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors"
                        :disabled="isSaving"
                      >
                        <span v-if="isSaving">
                          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                        <span v-else>{{ $t('scan.saveToReports') }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Scans Section -->
          <div class="md:col-span-12">
            <div class="bg-white backdrop-blur-sm rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium">{{ $t('scan.recentScans') }}</h3>
                <button class="text-sm text-[#606c38] hover:text-[#c9d4a3]/100">{{ $t('common.viewAll') }}</button>
              </div>

              <div v-if="recentScans.length === 0" class="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-gray-400">No recent scans found</p>
                <p class="text-sm text-gray-500 mt-1">Upload and analyze images to see your scan history</p>
              </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-xs text-white bg-[#283618] border-b border-gray-700/50 ">
                      <th class="px-4 py-3 font-medium">{{ $t('scan.image') }}</th>
                      <th class="px-4 py-3 font-medium">{{ $t('scan.detection') }}</th>
                      <th class="px-4 py-3  font-medium">{{ $t('scan.date') }}</th>
                      <th class="px-4 py-3  font-medium">{{ $t('scan.confidence') }}</th>
                      <th class="px-4 py-3  font-medium">{{ $t('scan.severity') }}</th>
                      <th class="px-4 py-3  font-medium">{{ $t('common.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(scan, index) in recentScans" :key="index" class="border-b border-gray-700/50">
                      <td class="py-3 pr-4">
                        <div class="h-12 w-12 rounded-md overflow-hidden bg-gray-700">
                          <img :src="scan.imageUrl" class="w-full h-full object-cover" alt="Scan" />
                        </div>
                      </td>
                      <td class="py-3 pr-4">
                        <p class="font-medium text-[#606c38]">{{ scan.disease }}</p>
                        <p class="text-xs text-gray-400">{{ scan.location }}</p>
                      </td>
                      <td class="py-3 pr-4 text-sm text-gray-400">{{ scan.date }}</td>
                      <td class="py-3 pr-4">
                        <span class="px-2 py-1 text-xs rounded-full" :class="getConfidenceClass(scan.confidence)">
                          {{ scan.confidence }}%
                        </span>
                      </td>
                      <td class="py-3 pr-4">
                        <span class="px-2 py-1 text-xs rounded-full" :class="getSeverityClass(scan.severity)">
                          {{ scan.severity }}
                        </span>
                      </td>
                      <td class="py-3">
                        <div class="flex space-x-2">
                          <button
                            @click="viewScanDetails(scan.id)"
                            class="p-1.5 rounded-md  transition-colors"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 hover:text-blue-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button class="p-1.5 rounded-md  transition-colors" title="Download Report">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 hover:text-gray-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center relative">
        
        <button @click="closeSuccessModal" :title="$t('common.close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="bg-emerald-100 p-3 rounded-full inline-block mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 class="text-xl font-semibold mb-2 text-gray-800">{{ $t('scan.successModal.title') }}</h3>

        <p class="text-sm text-gray-500 mb-6">
          {{ $t('scan.successModal.message') }}
        </p>

        <button 
          @click="goToReports"
          class="w-full px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3] text-white hover:text-[#606c38] rounded-lg font-medium transition-colors"
        >
          {{ $t('scan.successModal.viewReportsButton') }}
        </button>
      </div>
    </div>

    <!-- WebSocket Connection Status Indicator -->
    <div class="fixed bottom-4 right-4 z-50">
      <div
        class="flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300"
        :class="isWebSocketConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'"
      >
        <div
          class="h-2.5 w-2.5 rounded-full animate-pulse"
          :class="isWebSocketConnected ? 'bg-emerald-400' : 'bg-red-400'"
        ></div>
        <span class="text-xs font-medium">
          {{ isWebSocketConnected ? t('scan.connected') : t('scan.disconnected') }}
        </span>
        <button
          v-if="!isWebSocketConnected"
          @click="reconnectWebSocket"
          class="ml-1 p-1 hover:bg-gray-700/50 rounded-full"
          title="Reconnect"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showRequestModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button
            @click="showRequestModal = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 class="text-xl font-semibold mb-4">{{ $t('scan.requestModal.title') }}</h3>
          <p class="text-gray-300 mb-6">
            {{ $t('scan.requestModal.description') }}
          </p>

          <form @submit.prevent="submitInfoRequest" class="space-y-4">
            <div>
              <label for="request-message" class="block text-sm font-medium text-gray-300 mb-1">
                {{ $t('scan.requestModal.messageLabel') }}
              </label>
              <textarea
                id="request-message"
                v-model="requestMessage"
                rows="4"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                :placeholder="$t('scan.requestModal.messagePlaceholder')"
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                id="notify-toggle"
                type="checkbox"
                v-model="notifyWhenAvailable"
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
              >
              <label for="notify-toggle" class="ml-2 block text-sm text-gray-300">
                {{ $t('scan.requestModal.notifyLabel') }}
              </label>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                @click="showRequestModal = false"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm mr-2"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors flex items-center"
                :disabled="isSubmittingRequest"
              >
                <svg v-if="isSubmittingRequest" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmittingRequest ? $t('scan.requestModal.submittingButton') : $t('scan.requestModal.submitButton') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>



<script setup>import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
// --- Make sure getAuth is imported for the simulateScan function ---
import { auth, db } from '../../firebase/config';
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useI18n } from 'vue-i18n';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
// NotificationPanel import is no longer needed here
import { initializeWebSocket, addListener, removeListener, getConnectionStatus, sendMessage } from '../../services/websocketService';
import { uploadImage, requestImageAnalysis, saveAnalysisToReports, getRecentScans, saveScanToFirestore } from '../../services/imageService';
import { fetchCurrentAndForecastWeatherData, getWeatherDescription } from '../../services/weatherService.js';

// Router
const router = useRouter();
const { t, te } = useI18n();

// State
const isLoading = ref(false);
const error = ref(null);
const showSignOutConfirmation = ref(false);
const isWebSocketConnected = ref(false);
const isSaving = ref(false);
const scanSaved = ref(false); // Track if the scan has been saved to prevent duplicates
const diseaseDetails = ref(null);
const activeTab = ref('treatment'); // Default active tab
const showRequestModal = ref(false);
const requestMessage = ref('');
const isSubmittingRequest = ref(false);
const notifyWhenAvailable = ref(true);
const showSuccessModal = ref(false);

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const profileImage = ref(null);
// NEW: User location details from profile
const userLocationDetails = ref({
  municipality: '',
  barangay: '',
  farmName: '',
  latitude: null,
  longitude: null,
});
// NEW: Real-time weather data
const currentWeather = ref(null);
let weatherPollingInterval = null; // For weather polling

// Camera state
const captureMode = ref('upload');
const isCameraActive = ref(false);
const videoElement = ref(null);
const capturedImage = ref(null);
const mediaStream = ref(null);
const hasMultipleCameras = ref(false);
const currentCameraIndex = ref(0);
const availableCameras = ref([]);
const flashAvailable = ref(false);
const flashOn = ref(false);
const isRequestingPermission = ref(false);
const permissionDenied = ref(false);
const currentCameraMode = ref('user'); // 'user' for front camera, 'environment' for back camera

// File upload state
const selectedFiles = ref([]);
const previewUrls = ref([]);
const isAnalyzing = ref(false);
const analysisProgress = ref(0);
const analysisResult = ref(null);
const currentAnalysisId = ref(null);

// Recent scans
const recentScans = ref([]);
const unsubscribeScans = ref(null);


// Test function to simulate a scan and add a notification to Firestore
const simulateScan = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Not logged in");
    return;
  }
  try {
    // This correctly adds a notification to the path the navbar is listening to.
    await addDoc(collection(db, "users", user.uid, "notifications"), {
      userId: user.uid,
      message: "⚠️ High Risk detected in your banana scan! Immediate attention needed.",
      type: "alert",
      timestamp: serverTimestamp(),
      isRead: false,
      link: '/user/scan-history'
    });
    console.log("Notification added to Firestore!");
  } catch (err)
{
    console.error("Error adding notification:", err);
  }
};

// Computed properties
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`;
  }
  return firstName.value || 'User';
});

const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'U';
});

const analysisProgressText = computed(() => {
  if (analysisProgress.value < 30) {
    return 'Preprocessing images...';
  } else if (analysisProgress.value < 60) {
    return 'Running detection model...';
  } else if (analysisProgress.value < 90) {
    return 'Analyzing results...';
  } else {
    return 'Finalizing report...';
  }
});

// NEW: Computed property for displaying location
const displayLocation = computed(() => {
  if (userLocationDetails.value.farmName) {
    return userLocationDetails.value.farmName;
  }
  if (userLocationDetails.value.barangay && userLocationDetails.value.municipality) {
    return `${userLocationDetails.value.barangay}, ${userLocationDetails.value.municipality}`;
  }
  if (userLocationDetails.value.municipality) {
    return userLocationDetails.value.municipality;
  }
  // Fallback to device location if available and no user profile location
  if (userLocationDetails.value.latitude && userLocationDetails.value.longitude) {
    return `${userLocationDetails.value.latitude.toFixed(2)}, ${userLocationDetails.value.longitude.toFixed(2)}`;
  }
  return 'Unknown Location';
});

// NEW: Computed property for displaying weather
const displayWeather = computed(() => {
  if (currentWeather.value) {
    const temp = currentWeather.value.temperature;
    const description = getWeatherDescription(currentWeather.value.weatherCode);
    return `${temp}°C, ${description}`;
  }
  return t('weather.loading');
});


// Methods
const fetchUserData = async () => {
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
      throw new Error(t('dashboard.loading.cta.userNotFound'));
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Update user data state
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    profileImage.value = userData.profileImage || null;

    // NEW: Populate user location details from profile
    userLocationDetails.value.municipality = userData.location?.municipality?.name || '';
    userLocationDetails.value.barangay = userData.location?.barangay?.name || '';
    userLocationDetails.value.farmName = userData.farmName || ''; // Assuming farmName might be directly on user doc
    userLocationDetails.value.latitude = userData.location?.latitude || null; // Assuming lat/lon might be in user profile
    userLocationDetails.value.longitude = userData.location?.longitude || null;

    // Check if user has correct role for this dashboard
    if (userData.role === 'professional') {
      router.push('/professional/dashboard');
      return;
    }

    // Set up real-time listener for recent scans
    if (unsubscribeScans.value) {
      unsubscribeScans.value();
    }
    unsubscribeScans.value = setupRecentScansListener();

    // NEW: Start weather polling after user data is fetched
    startWeatherPolling();

  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const setupRecentScansListener = () => {
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.error("User not authenticated");
    recentScans.value = [];
    return null;
  }

  console.log("Setting up real-time listener for recent scans...");

  const scanHistoryRef = collection(db, "scan_history");
  const q = query(
    scanHistoryRef,
    where("userId", "==", auth.currentUser.uid)
  );

  return onSnapshot(q, (querySnapshot) => {
    console.log(`Real-time update: Found ${querySnapshot.size} scans`);

    const scans = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate() || new Date(0);

        return {
          id: doc.id,
          data: data,
          timestamp: timestamp
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(item => {
        const data = item.data;
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(item.timestamp);

        // Display location from saved userLocationDetails or fallback to lat/lon
        let displayLoc = "Unknown";
        if (data.userLocationDetails?.farmName) {
          displayLoc = data.userLocationDetails.farmName;
        } else if (data.userLocationDetails?.barangay && data.userLocationDetails?.municipality) {
          displayLoc = `${data.userLocationDetails.barangay}, ${data.userLocationDetails.municipality}`;
        } else if (data.location) {
          displayLoc = `${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`;
        }

        return {
          id: item.id,
          disease: data.disease || "Unknown",
          imageUrl: data.imageUrl || null,
          date: formattedDate,
          confidence: data.confidence || 0,
          severity: data.severity || "High",
          location: displayLoc, // Use the formatted display location
          captureMethod: data.captureMethod || "upload",
        };
      });

    console.log("Real-time update: Formatted recent scans:", scans);
    recentScans.value = scans;
  }, (error) => {
    console.error("Error in real-time scans listener:", error);
  });
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);

  if (selectedFiles.value.length + files.length > 5) {
    error.value = 'You can upload a maximum of 5 images at once.';
    return;
  }

  const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024); // 10MB
  if (oversizedFiles.length > 0) {
    error.value = 'One or more files exceed the 10MB size limit.';
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...files];

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const clearFiles = () => {
  selectedFiles.value = [];
  previewUrls.value = [];
};

const startAnalysis = async () => {
  if (selectedFiles.value.length === 0) {
    error.value = "Please select at least one image to analyze.";
    return;
  }

  if (!isWebSocketConnected.value) {
    error.value = "Not connected to analysis server. Please try again later.";
    return;
  }

  try {
    isAnalyzing.value = true;
    analysisProgress.value = 0;
    error.value = null;
    scanSaved.value = false;
    diseaseDetails.value = null;

    const file = selectedFiles.value[0];

    const uploadResponse = await uploadImage(file, {
      userId: auth.currentUser.uid,
      deviceType: 'web',
      captureMethod: captureMode.value
    });

    console.log("Image uploaded successfully:", uploadResponse);

    const imageId = uploadResponse.imageId;
    currentAnalysisId.value = uploadResponse.analysisId || imageId;

    const requestSent = requestImageAnalysis(imageId, {
      modelType: 'banana_disease',
      priority: 'normal'
    });

    if (!requestSent) {
      throw new Error("Failed to send analysis request. Please try again.");
    }

    startProgressSimulation();

  } catch (err) {
    console.error("Error starting analysis:", err);
    error.value = err.message || "Failed to start analysis. Please try again.";
    isAnalyzing.value = false;
    analysisProgress.value = 0;
  }
};

let progressInterval = null;
const startProgressSimulation = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  let currentProgress = analysisProgress.value;

  progressInterval = setInterval(() => {
    if (currentProgress < 90) {
      const increment = Math.max(1, 10 - Math.floor(currentProgress / 10));
      currentProgress = Math.min(90, currentProgress + increment);
      analysisProgress.value = currentProgress;
    } else {
      clearInterval(progressInterval);
    }
  }, 500);
};

// NEW: Function to start weather polling
const startWeatherPolling = async () => {
  // Clear any existing interval to prevent duplicates
  if (weatherPollingInterval) {
    clearInterval(weatherPollingInterval);
  }

  const updateWeather = async () => {
    let lat = userLocationDetails.value.latitude;
    let lon = userLocationDetails.value.longitude;

    // If user profile doesn't have lat/lon, try device geolocation
    if (lat === null || lon === null) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        // Update userLocationDetails with device location if profile doesn't have it
        userLocationDetails.value.latitude = lat;
        userLocationDetails.value.longitude = lon;
        console.log("Using device geolocation for weather:", lat, lon);
      } catch (locErr) {
        console.warn("Could not get device location for weather:", locErr);
        currentWeather.value = null; // Clear weather if location not available
        return;
      }
    }

    if (lat !== null && lon !== null) {
      currentWeather.value = await fetchCurrentAndForecastWeatherData(lat, lon);
    } else {
      currentWeather.value = null;
    }
  };

  // Fetch weather immediately on mount
  await updateWeather();

  // Set up polling every 15 minutes (15 * 60 * 1000 ms)
  weatherPollingInterval = setInterval(updateWeather, 15 * 60 * 1000);
  console.log("Weather polling started.");
};


const handleAnalysisResults = (data) => {
  console.log("Received analysis results:", data);

  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }

  analysisProgress.value = 100;

  setTimeout(async () => {
    isAnalyzing.value = false;

    analysisResult.value = {
      imageUrl: previewUrls.value[0],
      disease: data.detection.name || "Unknown Disease",
      confidence: data.detection.confidence || 95,
      severity: data.detection.severity || "High",
      description: data.detection.description || "No description available.",
      treatments: data.treatments || [],
      preventionTips: data.preventionTips || [],
      analysisId: data.analysisId || currentAnalysisId.value
    };
    
    const severity = data.detection?.severity || "Unknown";
    let notificationMessage = "ℹ️ Scan completed successfully.";
    let notificationType = "info";

    if (severity === "High") {
      notificationMessage = "⚠️ High Risk detected in your banana scan! Immediate attention needed.";
      notificationType = "alert";
    } else if (severity === "Medium") {
      notificationMessage = "🟠 Medium Risk detected. Monitor your plants closely.";
      notificationType = "warning";
    } else if (severity === "Low") {
      notificationMessage = "✅ Low Risk detected. Your banana plants appear healthy.";
      notificationType = "success";
    }

    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'notifications'), {
          message: notificationMessage,
          type: notificationType,
          isRead: false,
          timestamp: serverTimestamp(),
          link: '/user/scan-history' // Optional link
        });
        console.log("Notification successfully added to Firestore.");
      } catch (err) {
        console.error("Error adding notification to Firestore:", err);
      }
    }

    await fetchDiseaseDetails(analysisResult.value.disease);

    // Prepare location data to be saved with the scan
    let scanLocationData = null;
    if (userLocationDetails.value.latitude && userLocationDetails.value.longitude) {
      scanLocationData = {
        latitude: userLocationDetails.value.latitude,
        longitude: userLocationDetails.value.longitude,
        accuracy: userLocationDetails.value.accuracy || null
      };
    } else if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 5000, maximumAge: 0
          });
        });
        scanLocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } catch (locErr) {
        console.log("Location not available for scan saving:", locErr);
      }
    }

    // Prepare user location details to be saved with the scan
    const scanUserLocationDetails = {
      municipality: userLocationDetails.value.municipality,
      barangay: userLocationDetails.value.barangay,
      farmName: userLocationDetails.value.farmName,
    };

    // Now that results are displayed, save scan to Firestore
    if (auth.currentUser && !scanSaved.value) {
      try {
        await saveScanToFirestore({
          ...analysisResult.value,
          userId: auth.currentUser.uid,
          location: scanLocationData,
          deviceType: captureMode.value,
          captureMethod: captureMode.value,
          imageUrl: previewUrls.value[0],
          diseaseDetails: diseaseDetails.value ? { ...diseaseDetails.value } : null,
          weather: currentWeather.value,
          userLocationDetails: scanUserLocationDetails,
        });
        console.log("Scan saved to Firestore successfully with ID:", analysisResult.value.analysisId);
        scanSaved.value = true;
      } catch (err) {
        console.error("Error saving scan to Firestore:", err);
      }
    }
  }, 500);
};

const openRequestInfoModal = () => {
  requestMessage.value = `I would like more information about "${analysisResult.value.disease}" disease.`;
  showRequestModal.value = true;
};

const submitInfoRequest = () => {
  isSubmittingRequest.value = true;
  setTimeout(() => {
    isSubmittingRequest.value = false;
    showRequestModal.value = false;
    alert("Your request has been submitted. You will be notified when information becomes available.");
    requestMessage.value = '';
  }, 1000);
};

const fetchDiseaseDetails = async (diseaseName) => {
  try {
    if (!diseaseName) return;

    const normalizeForComparison = (name) => name.toLowerCase().replace(/[_\-.\s]/g, '').replace(/s\b/g, '');
    const normalizedDiseaseName = normalizeForComparison(diseaseName);

    const diseasesRef = collection(db, "diseases");
    const querySnapshot = await getDocs(diseasesRef);

    let matchedDisease = null;
    let bestMatchScore = 0;

    querySnapshot.forEach((doc) => {
      const diseaseData = doc.data();
      const docDiseaseName = diseaseData.name || "";
      const normalizedDocName = normalizeForComparison(docDiseaseName);
      
      let score = 0;
      if (normalizedDocName === normalizedDiseaseName) {
        score = 100;
      } else if (normalizedDocName.includes(normalizedDiseaseName) || normalizedDiseaseName.includes(normalizedDocName)) {
        score = 80;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        matchedDisease = { id: doc.id, ...diseaseData };
      }
    });

    diseaseDetails.value = bestMatchScore >= 80 ? matchedDisease : null;

  } catch (err) {
    console.error("Error fetching disease details:", err);
    diseaseDetails.value = null;
  }
};

const saveToReports = async () => {
  if (!analysisResult.value) return;
  isSaving.value = true;
  try {
    await saveAnalysisToReports(analysisResult.value.analysisId, {
      ...analysisResult.value,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      scanTimestamp: new Date(),
      notes: "Saved from scan interface",
      tags: [],
      status: 'Needs Action',
      
      // --- FIX: Revert to the old, explicit object creation ---
      diseaseDetails: diseaseDetails.value ? {
        name: diseaseDetails.value.name,
        scientificName: diseaseDetails.value.scientificName,
        category: diseaseDetails.value.category,
        shortDescription: diseaseDetails.value.shortDescription,
        symptoms: diseaseDetails.value.symptoms,
        treatment: diseaseDetails.value.treatment,
        prevention: diseaseDetails.value.prevention,
        causes: diseaseDetails.value.causes,
        additionalInfo: diseaseDetails.value.additionalInfo,
        affectedCrops: diseaseDetails.value.affectedCrops,
        id: diseaseDetails.value.id // Also include the ID
      } : null
    });

    showSuccessModal.value = true;

  } catch (err) {
    console.error("Error saving analysis to reports:", err);
    error.value = "Failed to save analysis to reports. Please try again.";
  } finally {
    isSaving.value = false;
  }
};

const goToReports = () => {
  showSuccessModal.value = false;
  router.push('/user/reports');
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  resetAnalysis();
};

const resetAnalysis = () => {
    analysisResult.value = null;
    selectedFiles.value = [];
    previewUrls.value = [];
    isAnalyzing.value = false;
    analysisProgress.value = 0;
    currentAnalysisId.value = null;
    scanSaved.value = false;
    diseaseDetails.value = null;
    activeTab.value = 'treatment';
};

const startCamera = async () => {
  error.value = null;
  capturedImage.value = null;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Your browser doesn't support camera access.");
    }
    isRequestingPermission.value = true;
    if (mediaStream.value) mediaStream.value.getTracks().forEach(track => track.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    if (videoDevices.length === 0) throw new Error("No camera detected.");
    
    availableCameras.value = videoDevices;
    hasMultipleCameras.value = videoDevices.length > 1;

    const isMobile = /Mobi/i.test(navigator.userAgent);
    const facingMode = isMobile ? 'environment' : 'user';

    const constraints = {
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement.value) videoElement.value.srcObject = mediaStream.value;
    
    isCameraActive.value = true;
    permissionDenied.value = false;
  } catch (err) {
    console.error("Error accessing camera:", err);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      permissionDenied.value = true;
      error.value = "Camera access was denied. Please allow it in your browser settings.";
    } else {
      error.value = `Could not access camera: ${err.message}.`;
    }
  } finally {
    isRequestingPermission.value = false;
  }
};

const switchCamera = async () => {
  if (!isCameraActive.value) return;
  stopCamera();
  currentCameraMode.value = currentCameraMode.value === 'user' ? 'environment' : 'user';
  // A bit of a delay to ensure resources are released.
  setTimeout(startCamera, 100);
};

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
  isCameraActive.value = false;
};

const toggleFlash = async () => {
  if (!mediaStream.value) return;
  const track = mediaStream.value.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  if (capabilities.torch) {
    try {
      flashOn.value = !flashOn.value;
      await track.applyConstraints({ advanced: [{ torch: flashOn.value }] });
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  }
};

const captureImage = () => {
  if (!videoElement.value) return;
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;
  canvas.getContext('2d').drawImage(videoElement.value, 0, 0);
  capturedImage.value = canvas.toDataURL('image/jpeg', 0.9);
  stopCamera();
};

const retakeImage = () => {
  capturedImage.value = null;
  startCamera();
};

const acceptImage = () => {
  if (!capturedImage.value) return;
  const byteString = atob(capturedImage.value.split(',')[1]);
  const mimeString = capturedImage.value.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  const file = new File([blob], `capture-${Date.now()}.jpg`, { type: mimeString });
  
  selectedFiles.value = [file];
  previewUrls.value = [capturedImage.value];
  capturedImage.value = null;
};

const retryPermission = () => {
  permissionDenied.value = false;
  startCamera();
};

const setupWebSocket = () => {
  initializeWebSocket();
  isWebSocketConnected.value = getConnectionStatus();
  addListener('analysis_results', handleAnalysisResults);
  addListener('analysis_progress', (data) => {
    if (data.progress) analysisProgress.value = data.progress;
  });
};

const reconnectWebSocket = () => {
  initializeWebSocket();
};

watch(getConnectionStatus, (connected) => {
  isWebSocketConnected.value = connected;
});

const getConfidenceClass = (confidence) => {
  if (confidence >= 90) return 'bg-emerald-500/20 text-emerald-400';
  if (confidence >= 70) return 'bg-blue-500/20 text-blue-400';
  return 'bg-yellow-500/20 text-yellow-400';
};

const getSeverityClass = (severity) => {
  if (severity === 'High') return 'bg-red-500/20 text-red-400';
  if (severity === 'Medium') return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-green-500/20 text-green-400';
};

const handleSignOut = async () => {
  try {
    showSignOutConfirmation.value = false;
    localStorage.removeItem('user');
    await signOut(auth);
    window.location.href = '/signin';
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = "Failed to sign out. Please try again.";
  }
};

const viewScanDetails = async (scanId) => {
  try {
    const scanDocRef = doc(db, "scan_history", scanId);
    const scanDoc = await getDoc(scanDocRef);
    if (!scanDoc.exists()) return;

    const scanData = scanDoc.data();
    analysisResult.value = {
      imageUrl: scanData.imageUrl,
      disease: scanData.disease || "Unknown",
      confidence: scanData.confidence || 0,
      severity: scanData.severity || "Unknown",
      description: scanData.description || "",
      analysisId: scanId
    };
    await fetchDiseaseDetails(scanData.disease);
    
    userLocationDetails.value.farmName = scanData.userLocationDetails?.farmName || '';
    userLocationDetails.value.barangay = scanData.userLocationDetails?.barangay || '';
    userLocationDetails.value.municipality = scanData.userLocationDetails?.municipality || '';
    userLocationDetails.value.latitude = scanData.location?.latitude || null;
    userLocationDetails.value.longitude = scanData.location?.longitude || null;
    currentWeather.value = scanData.weather || null;

    selectedFiles.value = [];
    previewUrls.value = [];
    isAnalyzing.value = false;
    scanSaved.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error("Error viewing scan details:", err);
    error.value = "Failed to load scan details.";
  }
};

const connectionCheckInterval = ref(null);

onMounted(() => {
  fetchUserData();
  setupWebSocket();
  connectionCheckInterval.value = setInterval(() => {
    isWebSocketConnected.value = getConnectionStatus();
  }, 5000);
});

onBeforeUnmount(() => {
  stopCamera();
  if (progressInterval) clearInterval(progressInterval);
  if (connectionCheckInterval.value) clearInterval(connectionCheckInterval.value);
  if (weatherPollingInterval) clearInterval(weatherPollingInterval);
  if (unsubscribeScans.value) unsubscribeScans.value();
  removeListener('analysis_results', handleAnalysisResults);
});

</script>

<style scoped>
/* .user-navbar {
  
} */
</style>
