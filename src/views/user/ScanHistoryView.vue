<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Top Navigation Bar -->
    <UserNavbar 
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :profile-image="profileImage"
      :notification-count="notificationCount"
      @sign-out="showSignOutConfirmation = true"
    />
  
    <!-- Main Content with Sidebar -->
    <div class="pt-2 md:pl-64 flex">
      <!-- Sidebar -->
      <UserSidebar />
  
      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header with Stats -->
        <header class="mb-4 sm:mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 class="text-2xl font-semibold mb-1 text-[#283618]">
                {{ $t('scanHistory.scanHistoryTitle') }}
              </h1>
              <p class="text-base text-gray-400">{{ $t('scanHistory.scanHistoryDesc') }}</p>
            </div>
            <div class="mt-3 sm:mt-0">
              <router-link 
                to="/user/scan" 
                class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl  text-sm font-medium shadow-lg">
                <Camera class="h-4 w-4 mr-1.5" />
                {{ $t('scanHistory.scanNow') }}
              </router-link>
            </div>
          </div>
  
          <!-- Stats Cards -->
          <div v-if="scanHistory.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div class=" p-3 h-full shadow-lg rounded-xl" style="background-color: #fff;">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-purple-500/20 mr-3">
                  <ClipboardList class="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('scanHistory.totalScans') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ scanHistory.length }}</p>
                </div>
              </div>
            </div>
            
            <div class=" p-3 h-full shadow-lg rounded-xl" style="background-color: #fff;">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-red-500/20 mr-3">
                  <AlertCircle class="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('scanHistory.highSeverity') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ highSeverityCount }}</p>
                </div>
              </div>
            </div>
            
            <div class=" p-3 h-full shadow-lg rounded-xl" style="background-color: #fff;">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-yellow-500/20 mr-3">
                  <AlertTriangle class="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('scanHistory.mediumSeverity') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ mediumSeverityCount }}</p>
                </div>
              </div>
            </div>
            
            <div class=" p-3 h-full shadow-lg rounded-xl" style="background-color: #fff;">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-green-500/20 mr-3">
                  <CheckCircle2 class="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('scanHistory.healthyPlants') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ healthyCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
  
        <!-- Loading State -->
        <div v-if="isLoading">
          <SkeletonLoader />
        </div>
  
        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center py-8 sm:py-12">
          <div class="rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-700/50 text-red-200 px-6 py-5 rounded-xl max-w-lg mx-auto shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-start">
              <AlertCircle class="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto sm:mx-0 sm:mr-4 mb-3 sm:mb-0 flex-shrink-0" />
              <div class="text-center sm:text-left">
                <h3 class="font-bold text-lg sm:text-xl mb-2">{{ $t('scanHistory.errorTitle') }}</h3>
                <p class="mb-4">{{ error }}</p>
                <button 
                  @click="fetchScanHistory" 
                  class="px-4 py-2 bg-red-600/60 hover:bg-red-600/80 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {{ $t('common.tryAgain') }}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="scanHistory.length === 0" class="flex items-center justify-center py-8 sm:py-12">
          <div class="text-center max-w-md px-4">
            <h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[#606c38]">{{ $t('scanHistory.emptyTitle') }}</h3>
            <p class="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">{{ $t('scanHistory.emptyDesc') }}</p>
            <router-link to="/user/scan" class="px-5 py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center">
              <Camera class="h-5 w-5 mr-2" />
              {{ $t('scanHistory.scanNow') }}
            </router-link>
          </div>
        </div>
  
        <!-- Scan History Content -->
        <div v-else>
          <!-- Filters and Search -->
          <div class="bg-white p-3 sm:p-5 mb-4 sm:mb-8 rounded-xl shadow-lg">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <!-- Search and View Toggle -->
              <div class="flex items-center gap-3 w-full lg:w-auto">
                <div class="relative flex-1">
                  <input 
                    v-model="searchQuery"
                    type="text" 
                    :placeholder="$t('scanHistory.searchPlaceholder')"
                    class="w-full bg-white border border-gray-300 rounded-xl  py-2 pl-9 pr-3 text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <Search class="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
                
                <!-- View Toggle -->
                <div class="flex bg-gray-300 rounded-lg overflow-hidden">
                  <button 
                    @click="viewMode = 'card'" 
                    class="p-2 transition-colors duration-200"
                    :class="viewMode === 'card' ? 'bg-[#606c38] text-white' : 'text-gray-400'"
                    title="Card View"
                  >
                    <LayoutGrid class="h-5 w-5" />
                  </button>
                  <button 
                    @click="viewMode = 'table'" 
                    class="p-2 transition-colors duration-200"
                    :class="viewMode === 'table' ? 'bg-[#606c38] text-white' : 'text-gray-400'"
                    title="Table View"
                  >
                    <Table class="h-5 w-5" />
                  </button>
                </div>
              </div>
  
              <!-- Filters -->
              <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <!-- Date Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="dateFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('scanHistory.dateAll') }}</option>
                    <option value="today">{{ $t('scanHistory.dateToday') }}</option>
                    <option value="week">{{ $t('scanHistory.dateWeek') }}</option>
                    <option value="month">{{ $t('scanHistory.dateMonth') }}</option>
                    <option value="year">{{ $t('scanHistory.dateYear') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
  
                <!-- Disease Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="diseaseFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('scanHistory.diseaseAll') }}</option>
                    <option value="panama_disease">Panama Disease</option>
                    <option value="black_sigatoka">Black Sigatoka</option>
                    <option value="yellow_sigatoka">Yellow Sigatoka</option>
                    <option value="banana_bunchy_top">Banana Bunchy Top</option>
                    <option value="healthy">Healthy</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
  
                <!-- Severity Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="severityFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('scanHistory.severityAll') }}</option>
                    <option value="High">{{ $t('scanHistory.severityHigh') }}</option>
                    <option value="Medium">{{ $t('scanHistory.severityMedium') }}</option>
                    <option value="Low">{{ $t('scanHistory.severityLow') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
  
                <!-- Sort By -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="sortBy"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="date-desc">{{ $t('scanHistory.sortNewest') }}</option>
                    <option value="date-asc">{{ $t('scanHistory.sortOldest') }}</option>
                    <option value="confidence-desc">{{ $t('scanHistory.sortConfidenceHigh') }}</option>
                    <option value="confidence-asc">{{ $t('scanHistory.sortConfidenceLow') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
              <span class="text-xs text-gray-400">{{ $t('scanHistory') }}</span>
              
              <div v-if="dateFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-gray-300">
                {{ formatDateFilter(dateFilter) }}
                <button @click="dateFilter = 'all'" class="ml-1 text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="diseaseFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-gray-300">
                {{ formatDiseaseName(diseaseFilter) }}
                <button @click="diseaseFilter = 'all'" class="ml-1 text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="severityFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-gray-300">
                {{ severityFilter }} {{ $t('scanHistory.tableSeverity') }}
                <button @click="severityFilter = 'all'" class="ml-1 text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="searchQuery" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-gray-300">
                "{{ searchQuery }}"
                <button @click="searchQuery = ''" class="ml-1 text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <button 
                @click="clearAllFilters" 
                class="text-xs text-red-400 hover:text-red-200 ml-1"
              >
                {{ $t('common.clearAll') }}
              </button>
            </div>
          </div>
  
          <!-- No Results Message -->
          <div v-if="filteredScans.length === 0" class="bg-white rounded-xl p-6 shadow-lg text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="text-lg font-medium mb-2">{{ $t('scanHistory.noResultsTitle') }}</h3>
            <p class="text-gray-400 mb-4 text-sm">{{ $t('scanHistory.noResultsDesc') }}</p>
            <button 
              @click="clearAllFilters" 
              class="px-4 py-2 bg-red-600 hover:bg-red-600/50 text-white hover:text-red-600/50 rounded-xl text-sm font-medium  transition-all duration-200"
            >
              {{ $t('common.clearAllFilters') }}
            </button>
          </div>
  
          <!-- Scan History List -->
          <div v-if="viewMode === 'card'" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <!-- Card View (existing code) -->
            <div 
              v-for="(scan, index) in paginatedScans" 
              :key="scan.analysisId || index"
              class="group bg-white backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-lg transform hover: bg-gray-500 hover:-translate-y-1"
            >
              <!-- Scan Image with Overlay -->
              <div class="relative h-28 sm:h-36 bg-gray-700 overflow-hidden">
                <img 
                  :src="scan.imageUrl" 
                  :alt="`Scan from ${formatDate(scan.timestamp)}`" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  @error="handleImageError($event, index)"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                
                <!-- Severity Badge -->
                <div 
                  class="absolute top-2 right-2 px-1.5 py-0.5 rounded-xl text-xs font-semibold shadow-lg"
                  :class="getSeverityClass(scan.severity).badge"
                >
                  {{ scan.severity }}
                </div>
                
                <!-- Date Badge -->
                <div class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-xl text-xs font-medium bg-black text-white backdrop-blur-sm">
                  {{ formatDate(scan.timestamp) }}
                </div>
              </div>
  
              <!-- Scan Details -->
              <div class="p-3">
                <div class="flex justify-between items-start mb-1.5">
                  <h3 class="text-sm font-semibold group-hover:text-[#283618] transition-colors duration-300 line-clamp-1">
                    {{ formatDiseaseName(scan.disease) }}
                  </h3>
                  <div 
                    class="text-xs font-medium px-1.5 py-0.5 rounded-xl"
                    :class="getConfidenceClass(scan.confidence).bg"
                  >
                    {{ scan.confidence }}%
                  </div>
                </div>
  
                <div class="text-xs text-gray-500 mb-2.5 line-clamp-2 min-h-[32px]">
                  {{ scan.description || 'No additional details available for this scan.' }}
                </div>
  
                <!-- Actions -->
                <div class="flex justify-between items-center">
                  <button 
                    @click="viewScanDetails(scan)"
                    class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-600/50 transition-all duration-200"
                  >
                  {{ $t('scanHistory.viewDetails') }}
                  </button>
                  <button 
                    @click="confirmDelete(scan)"
                    class="inline-flex items-center p-1.5 text-red-600 hover:text-red-600/50 transition-colors duration-200"
                    title="Delete scan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Table View -->
          <div v-else class="overflow-x-auto">
            <table class="w-full bg-white backdrop-blur-sm rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#283618] border-b border-gray-700/50 ">
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableImage') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableDisease') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableDate') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableSeverity') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableConfidence') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('scanHistory.tableActions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <tr v-for="(scan, index) in paginatedScans" :key="scan.analysisId || index" class="hover:bg-[#f7f2df] duration-200">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-gray-700">
                      <img 
                        :src="scan.imageUrl" 
                        :alt="`Scan from ${formatDate(scan.timestamp)}`" 
                        class="h-full w-full object-cover"
                        @error="handleImageError($event, index)"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium text-[#606c38]">{{ formatDiseaseName(scan.disease) }}</div>
                    <div class="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{{ scan.description }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(scan.timestamp) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span 
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getSeverityClass(scan.severity).badge"
                    >
                      {{ scan.severity }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <div 
                        class="text-xs font-medium"
                        :class="getConfidenceClass(scan.confidence).text"
                      >
                        {{ scan.confidence }}%
                      </div>
                      <div class="ml-2 w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          class="h-1.5 rounded-full"
                          :class="getConfidenceClass(scan.confidence).bar"
                          :style="{ width: `${scan.confidence}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="viewScanDetails(scan)"
                        class="text-blue-600 hover:text-blue-600/50 transition-colors duration-200"
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        @click="confirmDelete(scan)"
                        class="text-red-600 hover:text-red-600/50 transition-colors duration-200"
                        title="Delete Scan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 sm:mt-8 flex justify-center">
            <nav class="inline-flex rounded-lg shadow-lg overflow-hidden bg-gray-300 backdrop-blur-sm border border-gray-300">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-[#283618] hover:text-[#283618] hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="hidden sm:inline">{{ $t('common.prev') }}</span>
              </button>
              
              <div class="hidden sm:flex">
                <button 
                  v-for="page in paginationRange" 
                  :key="page"
                  @click="page !== '...' ? currentPage = page : null"
                  class="px-3 py-2 transition-colors duration-200 text-sm"
                  :class="page === '...' ? 'text-gray-500 cursor-default' : (currentPage === page ? 'bg-[#606c38] text-white font-medium' : 'text-gray-500 hover:text-white hover:bg-gray-700/50')"
                >
                  {{ page }}
                </button>
              </div>
              
              <div class="flex sm:hidden items-center px-3 text-gray-300 text-sm">
                <span>{{ currentPage }} of {{ totalPages }}</span>
              </div>
              
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-[#283618] hover:text-[#283618] hover:bg-gray-400  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center text-sm"
              >
                <span class="hidden sm:inline">{{ $t('common.next') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </main>
    </div>
  
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        class="bg-white rounded-xl shadow-lg max-w-xs sm:max-w-sm w-full p-5 relative  transform transition-all duration-300"
        :class="{ 'scale-100 opacity-100': showDeleteConfirmation, 'scale-95 opacity-0': !showDeleteConfirmation }"
      >
        <button 
          @click="showDeleteConfirmation = false" 
          class="absolute top-3 right-3 text-gray-600 hover:text-gray-400 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
  
        <div class="text-center mb-4">
          <div class="bg-red-500/20 rounded-full p-3 inline-block mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-bold mb-2">{{ $t('scanHistory.deleteModalTitle') }}</h3>
        </div>
        
        <p class="text-gray-400 mb-5 text-center text-sm">{{ $t('scanHistory.deleteModalDesc') }}</p>
  
        <div class="flex justify-center space-x-3">
          <button 
            @click="showDeleteConfirmation = false"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-sm font-medium transition-all duration-200"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="deleteScan"
            class="px-4 py-2 bg-red-600 hover:bg-red-600/50 hover:text-red-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  
    <!-- Scan Details Modal -->
    <div v-if="showScanDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        class="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative transform transition-all duration-300 flex flex-col max-h-[95vh] overflow-hidden"
        :class="{ 'scale-100 opacity-100': showScanDetails, 'scale-95 opacity-0': !showScanDetails }"
      >
        <!-- Fixed Header -->
        <div class="sticky top-0 z-10 bg-[#283618] p-3 flex items-center justify-between">
          <h3 class="text-lg sm:text-xl md:text-2xl font-semibold text-white truncate">
            {{ selectedScan ? formatDiseaseName(selectedScan.disease) : 'Scan Details' }}
          </h3>
          <button 
            @click="closeScanDetails" 
            class="text-white hover:text-gray-400 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <!-- Scrollable Content -->
        <div v-if="selectedScan" class="flex-1 overflow-y-auto p-3 sm:p-4">
          <!-- Custom Loading State -->
            <div v-if="isLoadingScanDetails" class="flex items-center justify-center h-[200px] w-full">
              <div class="flex flex-col items-center space-y-3 text-gray-300 animate-pulse">
                <svg class="w-10 h-10 text-[bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 4v1m0 14v1m7.071-7.071h1M4.929 12H4m12.02-4.95l.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l.707-.707" />
                </svg>
                <p class="text-sm text-gray-400">{{ $t('scanHistory.loadingScanDetails') }}</p>
              </div>
            </div>

          <div v-else class="space-y-4 sm:space-y-6">
            <!-- Left Column: Scan Image and Metadata -->
            <div class="space-y-4">
              <!-- Image with Lightbox -->
              <div class="bg-gray-700/50 rounded-lg overflow-hidden shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer relative">
                <img 
                  :src="selectedScan.imageUrl" 
                  :alt="`Scan from ${formatDate(selectedScan.timestamp)}`" 
                  class="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  @error="handleDetailImageError"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center">
                  <div class="bg-white/20 backdrop-blur-sm rounded-full p-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Scan Metadata -->
              <div class="p-3 sm:p-4 rounded-xl shadow-lg bg-[#f7f2df]">
                <h4 class="font-medium mb-3 text-sm sm:text-base">{{ $t('scanHistory.scanInfoTitle') }}</h4>
                
                <div class="space-y-2 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.analysisId') }}</span>
                    <span class="font-mono text-xs truncate">{{ selectedScan.analysisId }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.dateLabel') }}</span>
                    <span>{{ formatDate(selectedScan.timestamp, true) }}</span>
                  </div>
                  
                  <div v-if="selectedScan.location" class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.locationLabel') }}</span>
                    <span class="truncate">{{ formatLocation(selectedScan.location) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.captureMethodLabel') }}</span>
                    <span>{{ formatCaptureMethod(selectedScan.captureMethod) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.deviceLabel') }}</span>
                    <span>{{ formatDeviceType(selectedScan.deviceType) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('scanHistory.severityLabel') }}</span>
                    <span :class="getSeverityClass(selectedScan.severity).text" class="font-medium">
                      {{ selectedScan.severity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right Column: Disease Information -->
            <div class="space-y-4">
              <!-- Confidence Meter at the top -->
              <div class="bg-white backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-medium text-sm">{{ $t('scanHistory.confidenceLabel') }}</h4>
                  <span 
                    class="text-lg font-bold"
                    :class="getConfidenceClass(selectedScan.confidence).text"
                  >
                    {{ selectedScan.confidence }}%
                  </span>
                </div>
                
                <div class="w-full bg-gray-700 rounded-full h-2 mb-1 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all duration-1000 ease-out"
                    :class="getConfidenceClass(selectedScan.confidence).bar"
                    :style="{ width: `${selectedScan.confidence}%` }"
                  ></div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ $t('scanHistory.confidenceLow') }}</span>
                  <span>{{ $t('scanHistory.confidenceMedium') }}</span>
                  <span>{{ $t('scanHistory.confidenceHigh') }}</span>
                </div>
              </div>
              
              <!-- Tabs Navigation -->
              <div class="rounded-xl shadow-lg bg-white">
                <div class="border-b border-gray-700/50">
                  <nav class="flex overflow-x-auto">
                    <button 
                      @click="activeTab = 'description'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'description' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('scanHistory.tabOverview') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'symptoms'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'symptoms' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('scanHistory.tabSymptoms') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'treatment'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'treatment' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('scanHistory.tabTreatment') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'prevention'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'prevention' ? 'text-[#606c38] border-b-2 border-[#606c38]' : 'text-gray-600/50 hover:text-gray-600'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('scanHistory.tabPrevention') }}
                      </div>
                    </button>
                  </nav>
                </div>
                
                <div class="p-3 sm:p-4 overflow-y-auto max-h-[200px] sm:max-h-[250px]">
                  <!-- Description Tab -->
                  <div v-if="activeTab === 'description'" class="space-y-3 animate-fadeIn">
                    <div class="prose prose-invert max-w-none prose-sm">
                      <p class="leading-relaxed text-xs sm:text-sm">{{ selectedScan.description || 'No description available.' }}</p>
                      
                      <!-- Scientific Name -->
                      <div v-if="diseaseDetails && diseaseDetails.scientificName" class="mt-4 p-3 rounded-xl border border-gray-400">
                        <h6 class="font-medium text-xs mb-1 text-gray-400">Scientific Name:</h6>
                        <p class="text-[#606c38] italic font-medium text-sm">{{ diseaseDetails.scientificName }}</p>
                      </div>
                      
                      <!-- Category Badge -->
                      <div v-if="diseaseDetails && diseaseDetails.category" class="mt-3 flex items-center">
                        <span class="text-xs text-gray-400 mr-2">Category:</span>
                        <span class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-medium">
                          {{ diseaseDetails.category.charAt(0).toUpperCase() + diseaseDetails.category.slice(1) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Symptoms Tab -->
                  <div v-if="activeTab === 'symptoms'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">Symptoms</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.symptoms" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.symptoms" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">No symptoms information is available yet for this disease.</p>
                      <p class="text-gray-600 text-xs">Check back later for updates.</p>
                    </div>
                    
                    <!-- Affected Parts section -->
                    <div v-if="diseaseDetails && diseaseDetails.affectedCrops && diseaseDetails.affectedCrops.length > 0" class="mt-4 pt-4 border-t border-gray-700/50">
                      <h6 class="font-medium mb-2 text-xs text-gray-600">Affected Parts:</h6>
                      <div class="flex flex-wrap gap-1.5">
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
                  
                  <!-- Treatment Tab -->
                  <div v-if="activeTab === 'treatment'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">Treatment Recommendations</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.treatment" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.treatment" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else-if="selectedScan.treatments && selectedScan.treatments.length > 0" class="space-y-2">
                      <div v-for="(treatment, index) in selectedScan.treatments" :key="index" class="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30 flex items-start">
                        <div class="bg-[#606c38] rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p class="text-gray-600 text-xs sm:text-sm">{{ treatment }}</p>
                      </div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">No treatment information is available yet for this disease.</p>
                      <p class="text-gray-500 text-xs">Check back later for updates.</p>
                    </div>
                  </div>
                  
                  <!-- Prevention Tab -->
                  <div v-if="activeTab === 'prevention'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">Prevention Tips</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.prevention" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.prevention" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else-if="selectedScan.preventionTips && selectedScan.preventionTips.length > 0" class="space-y-2">
                      <div v-for="(tip, index) in selectedScan.preventionTips" :key="index" class="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30 flex items-start">
                        <div class="bg-emerald-500/20 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p class="text-gray-600 text-xs sm:text-sm">{{ tip }}</p>
                      </div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">No prevention information is available yet for this disease.</p>
                      <p class="text-gray-500 text-xs">Check back later for updates.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="grid grid-cols-2 gap-2 sm:gap-3">
                <button 
                  @click="saveToReport(selectedScan)"
                  class="px-2 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center"
                >
                  {{ $t('scanHistory.saveToReport') }}
                </button>
                <button 
                  @click="shareScan(selectedScan)"
                  class="px-2 py-2 bg-blue-600 hover:bg-blue-600/50 rounded-xl text-white hover:text-blue-600 text-xs font-medium transition-all duration-200 flex items-center justify-center"
                >
                  {{ $t('scanHistory.share') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation 
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
  
  <!-- Save to Report Modal -->
  <div v-if="showSaveReportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div 
      class="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 relative  transform transition-all duration-300"
      :class="{ 'scale-100 opacity-100': showSaveReportModal, 'scale-95 opacity-0': !showSaveReportModal }"
    >
      <button 
        @click="showSaveReportModal = false" 
        class="absolute top-3 right-3 text-gray-600 hover:text-gray-400 transition-colors duration-200"
        :disabled="isSavingReport"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
  
      <div v-if="reportSaveSuccess" class="text-center py-8">
        <div class="bg-emerald-500/20 rounded-full p-3 inline-block mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-lg font-bold mb-2 text-[#606c38]">Report Saved Successfully</h3>
        <p class="text-gray-600 text-sm">You can access all your saved reports in the Reports section.</p>
      </div>
  
      <div v-else>
        <div class="text-center mb-4">
          <h3 class="text-2xl font-bold text-[#283618]">Save to Reports</h3>
          <p class="text-gray-600 text-sm">Add this scan to your reports collection for easy reference later.</p>
        </div>
        
        <form @submit.prevent="submitReport" class="space-y-4">
          <!-- Notes Field -->
          <div>
            <label for="report-notes" class="block text-sm font-medium text-gray-600 mb-1">Notes (Optional)</label>
            <textarea 
              id="report-notes" 
              v-model="reportNotes" 
              rows="3" 
              placeholder="Add any observations or notes about this scan..."
              class="w-full py-2 px-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
            ></textarea>
          </div>
          
          <!-- Tags Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Tags (Optional)</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="tag in availableTags" 
                :key="tag"
                type="button"
                @click="toggleTag(tag)"
                class="px-2 py-1 rounded-full text-xs font-medium transition-all duration-200"
                :class="selectedTags.includes(tag) 
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                  : 'bg-gray-600 hover:bg-gray-600/50 text-white'"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- Disease Info -->
          <div class="bg-white border border-gray-600/50 rounded-xl p-3 flex items-center space-x-3">
            <div class="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-md overflow-hidden">
              <img 
                v-if="selectedScan && selectedScan.imageUrl" 
                :src="selectedScan.imageUrl" 
                :alt="selectedScan.disease" 
                class="w-full h-full object-cover"
                @error="handleDetailImageError"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-semibold text-[#606c38] truncate">
                {{ selectedScan ? formatDiseaseName(selectedScan.disease) : 'Unknown Disease' }}
              </p>
              <p class="text-xs text-gray-600">
                {{ selectedScan ? `${selectedScan.severity} severity · ${selectedScan.confidence}% confidence` : '' }}
              </p>
            </div>
          </div>
          
          <!-- Submit Button -->
          <div class="flex justify-end pt-2">
            <button 
              type="submit"
              class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center"
              :disabled="isSavingReport"
            >
              <div v-if="isSavingReport" class="inline-spinner mr-2"></div>
              <span>{{ isSavingReport ? 'Saving...' : 'Save Report' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
    </div>
  </template>
  
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, addDoc } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import { 
  Camera, 
  ClipboardList, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  LayoutGrid, 
  Table, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  Eye, 
  ZoomIn, 
  Check, 
  Shield, 
  Lightbulb, 
  Loader2 
} from 'lucide-vue-next';

// Router
const router = useRouter();

// State
const isLoading = ref(true);
const error = ref(null);
const scanHistory = ref([]);
const searchQuery = ref('');
const dateFilter = ref('all');
const diseaseFilter = ref('all');
const severityFilter = ref('all');
const sortBy = ref('date-desc');
const currentPage = ref(1);

// Dropdown visibility states
const showDateDropdown = ref(false);
const showDiseaseDropdown = ref(false);
const showSeverityDropdown = ref(false);
const showSortDropdown = ref(false);
const itemsPerPage = 12; // Increased for smaller cards
const showDeleteConfirmation = ref(false);
const scanToDelete = ref(null);
const showScanDetails = ref(false);
const selectedScan = ref(null);
const showSignOutConfirmation = ref(false);
const notificationCount = ref(3); // For the navbar
const diseaseDetails = ref(null); // Added for disease details
const activeTab = ref('description'); // Default active tab
const isLoadingScanDetails = ref(false);
// View mode (card or table)
const viewMode = ref('card'); // 'card' or 'table'

const showSaveReportModal = ref(false);
const reportNotes = ref('');
const reportTags = ref([]);
const availableTags = ref(['Urgent', 'Follow-up', 'Treated', 'For Expert', 'Research']);
const selectedTags = ref([]);
const isSavingReport = ref(false);
const reportSaveSuccess = ref(false);

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const profileImage =  ref(null);

// Computed properties for user display
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`;
  }
  return firstName.value || 'User';
});

// Compute user initials for avatar
const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'U';
});

// Computed property for active filters
const hasActiveFilters = computed(() => {
  return searchQuery.value || dateFilter.value !== 'all' || diseaseFilter.value !== 'all' || severityFilter.value !== 'all';
});

// Computed properties for statistics
const highSeverityCount = computed(() => {
  return scanHistory.value.filter(scan => scan.severity === 'High').length;
});

const mediumSeverityCount = computed(() => {
  return scanHistory.value.filter(scan => scan.severity === 'Medium').length;
});

const healthyCount = computed(() => {
  return scanHistory.value.filter(scan => scan.disease === 'healthy').length;
});

// Filter scans based on search query, date filter, disease filter, and severity filter
const filteredScans = computed(() => {
  let filtered = [...scanHistory.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(scan => 
      (scan.disease && scan.disease.toLowerCase().includes(query)) ||
      (scan.description && scan.description.toLowerCase().includes(query)) ||
      (scan.severity && scan.severity.toLowerCase().includes(query))
    );
  }
  
  // Apply date filter
  if (dateFilter.value !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter.value === 'today') {
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= today;
      });
    } else if (dateFilter.value === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= weekStart;
      });
    } else if (dateFilter.value === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= monthStart;
      });
    } else if (dateFilter.value === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= yearStart;
      });
    }
  }
  
  // Apply disease filter
  if (diseaseFilter.value !== 'all') {
    filtered = filtered.filter(scan => 
      scan.disease && scan.disease.toLowerCase() === diseaseFilter.value.toLowerCase()
    );
  }
  
  // Apply severity filter
  if (severityFilter.value !== 'all') {
    filtered = filtered.filter(scan => 
      scan.severity && scan.severity === severityFilter.value
    );
  }
  
  // Apply sorting
  if (sortBy.value === 'date-desc') {
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (sortBy.value === 'date-asc') {
    filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else if (sortBy.value === 'confidence-desc') {
    filtered.sort((a, b) => b.confidence - a.confidence);
  } else if (sortBy.value === 'confidence-asc') {
    filtered.sort((a, b) => a.confidence - b.confidence);
  }
  
  return filtered;
});

// Pagination
const paginatedScans = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredScans.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredScans.value.length / itemsPerPage);
});

const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are fewer than maxVisiblePages
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    // Always show first page
    range.push(1);
    
    // Calculate start and end of visible pages
    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, start + 2);
    
    // Adjust start if end is too close to totalPages
    if (end === totalPages.value - 1) {
      start = Math.max(2, end - 2);
    }
    
    // Add ellipsis if needed
    if (start > 2) {
      range.push('...');
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis if needed
    if (end < totalPages.value - 1) {
      range.push('...');
    }
    
    // Always show last page
    range.push(totalPages.value);
  }
  
  return range;
});

// Format date filter
const formatDateFilter = (filter) => {
  switch (filter) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'year':
      return 'This Year';
    default:
      return 'All Time';
  }
};

// Helper functions for dropdown labels
const getDateLabel = (value) => {
  const labels = {
    'all': '',
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'year': 'This Year'
  };
  return labels[value] || '';
};

const getDiseaseLabel = (value) => {
  const labels = {
    'all': '',
    'panama_disease': 'Panama Disease',
    'black_sigatoka': 'Black Sigatoka',
    'yellow_sigatoka': 'Yellow Sigatoka',
    'banana_bunchy_top': 'Banana Bunchy Top',
    'healthy': 'Healthy'
  };
  return labels[value] || '';
};

const getSeverityLabel = (value) => {
  const labels = {
    'all': '',
    'High': 'High',
    'Medium': 'Medium',
    'Low': 'Low'
  };
  return labels[value] || '';
};

const getSortLabel = (value) => {
  const labels = {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'confidence-desc': 'Highest Confidence',
    'confidence-asc': 'Lowest Confidence'
  };
  return labels[value] || 'Newest First';
};

// Selection functions
const selectDate = (value) => {
  dateFilter.value = value;
  showDateDropdown.value = false;
};

const selectDisease = (value) => {
  diseaseFilter.value = value;
  showDiseaseDropdown.value = false;
};

const selectSeverity = (value) => {
  severityFilter.value = value;
  showSeverityDropdown.value = false;
};

const selectSort = (value) => {
  sortBy.value = value;
  showSortDropdown.value = false;
};

// Format date
const formatDate = (timestamp, includeTime = false) => {
  if (!timestamp) return 'Unknown date';
  
  let date;
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate) {
    // Firestore timestamp object
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    // String timestamp
    date = new Date(timestamp);
  } else {
    // Assume it's already a Date object
    date = new Date(timestamp);
  }
  
  if (includeTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format disease name
const formatDiseaseName = (disease) => {
  if (!disease) return 'Unknown Disease';
  
  // Replace underscores with spaces and capitalize each word
  return disease
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format location
const formatLocation = (location) => {
  if (!location) return 'Unknown location';
  
  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }
  
  return 'Unknown location';
};

// Format capture method
const formatCaptureMethod = (method) => {
  if (!method) return 'Unknown';
  
  if (method === 'upload') {
    return 'Uploaded Image';
  } else if (method === 'camera') {
    return 'Camera Capture';
  }
  
  return method.charAt(0).toUpperCase() + method.slice(1);
};

// Format device type
const formatDeviceType = (type) => {
  if (!type) return 'Unknown device';
  
  if (type === 'web') {
    return 'Web Browser';
  } else if (type === 'mobile') {
    return 'Mobile Device';
  } else if (type === 'tablet') {
    return 'Tablet Device';
  }
  
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Get severity class
const getSeverityClass = (severity) => {
  if (!severity) return {
    badge: 'bg-gray-500/20 text-gray-400',
    text: 'text-gray-400'
  };
  
  switch (severity) {
    case 'High':
      return {
        badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
        text: 'text-red-400'
      };
    case 'Medium':
      return {
        badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        text: 'text-yellow-400'
      };
    case 'Low':
      return {
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        text: 'text-emerald-400'
      };
    default:
      return {
        badge: 'bg-gray-500/20 text-gray-400',
        text: 'text-gray-400'
      };
  }
};

// Get confidence class
const getConfidenceClass = (confidence) => {
  if (confidence >= 80) {
    return { 
      bg: 'bg-emerald-500/20 text-emerald-400',
      bar: 'bg-emerald-500',
      text: 'text-emerald-400'
    };
  } else if (confidence >= 50) {
    return { 
      bg: 'bg-yellow-500/20 text-yellow-400',
      bar: 'bg-yellow-500',
      text: 'text-yellow-400'
    };
  } else {
    return { 
      bg: 'bg-red-500/20 text-red-400',
      bar: 'bg-red-500',
      text: 'text-red-400'
    };
  }
};

// Handle image error
const handleImageError = (event, index) => {
  // Replace with placeholder image using a different service
  event.target.src = `/placeholder.svg?height=300&width=400&query=Banana+Plant+Image`;
};

// Handle detail image error
const handleDetailImageError = (event) => {
  // Replace with placeholder image using a different service
  event.target.src = `/placeholder.svg?height=400&width=600&query=Banana+Plant+Image`;
};

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  dateFilter.value = 'all';
  diseaseFilter.value = 'all';
  severityFilter.value = 'all';
  sortBy.value = 'date-desc';
  currentPage.value = 1;
};

// Fetch user data from Firestore
const fetchUserData = async () => {
  try {
    console.log("Fetching user data...");

    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }

    console.log("Current user:", auth.currentUser.uid);

    // Get user data from Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No user document found for current auth user");
      throw new Error("User profile not found. Please contact support.");
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log("User data retrieved:", userData);

    // Update user data state
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    profileImage.value = userData.profileImage|| '';

    console.log("User data loaded successfully");

  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  }
};

// <CHANGE> Removed hardcoded sample data - fetchScanHistory now only shows real user data
// Fetch scan history from Firestore
const fetchScanHistory = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    console.log("Fetching scan history...");

    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }

    // Get scan history from Firestore - using a simple query without orderBy to avoid index requirements
    const scansRef = collection(db, "scan_history");
    const q = query(
      scansRef, 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process scan data
    const scans = [];
    querySnapshot.forEach((doc) => {
      const scanData = doc.data();
      
      // Convert Firestore timestamp to JavaScript Date
      let timestamp = scanData.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      }
      
      scans.push({
        ...scanData,
        timestamp: timestamp,
        id: doc.id // Store the document ID for deletion
      });
    });
    
    console.log(`Retrieved ${scans.length} scans`);
    scanHistory.value = scans;

  } catch (err) {
    console.error("Error fetching scan history:", err);
    error.value = err.message || "Failed to load scan history. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// <CHANGE> Removed generateSampleScans() function entirely - no more hardcoded sample data

// Fetch disease details from Firestore
const fetchDiseaseDetails = async (diseaseName) => {
  try {
    if (!diseaseName) {
      console.error("No disease name provided");
      return;
    }
    
    console.log("Fetching disease details for:", diseaseName);
    
    // Enhanced normalization function to handle various formats
    const normalizeForComparison = (name) => {
      return name
        .toLowerCase()                  // Convert to lowercase
        .replace(/[_\-\.]/g, ' ')       // Replace underscores, hyphens, and dots with spaces
        .replace(/[^\w\s]/g, '')        // Remove other special characters
        .replace(/\s+/g, ' ')           // Replace multiple spaces with a single space
        .replace(/s\b/g, '')            // Remove trailing 's' for plurals (diseases -> disease)
        .trim();                        // Trim whitespace
    };
    
    // Normalize the input disease name
    const normalizedDiseaseName = normalizeForComparison(diseaseName);
    console.log("Normalized input disease name:", normalizedDiseaseName);
    
    // Query the diseases collection
    const diseasesRef = collection(db, "diseases");
    const querySnapshot = await getDocs(diseasesRef);
    
    console.log("Total disease documents found:", querySnapshot.size);
    
    // Find a matching disease document
    let matchedDisease = null;
    let bestMatchScore = 0;
    
    querySnapshot.forEach((doc) => {
      const diseaseData = doc.data();
      const docDiseaseName = diseaseData.name || "";
      
      // Normalize the document disease name
      const normalizedDocName = normalizeForComparison(docDiseaseName);
      console.log(`Comparing with: ${docDiseaseName} (normalized: ${normalizedDocName})`);
      
      // Calculate match score (higher is better)
      let score = 0;
      
      // Exact match gets highest score
      if (normalizedDocName === normalizedDiseaseName) {
        score = 100;
      } 
      // One contains the other completely
      else if (normalizedDocName.includes(normalizedDiseaseName) || 
               normalizedDiseaseName.includes(normalizedDocName)) {
        // Longer containment is better (prevents matching "black" with "black sigatoka")
        const containedLength = Math.min(normalizedDocName.length, normalizedDiseaseName.length);
        const containerLength = Math.max(normalizedDocName.length, normalizedDiseaseName.length);
        score = 80 * (containedLength / containerLength);
      }
      // Check for word-by-word partial matches
      else {
        const docWords = normalizedDocName.split(' ');
        const inputWords = normalizedDiseaseName.split(' ');
        
        // Count matching words
        const matchingWords = docWords.filter(word => 
          inputWords.some(inputWord => 
            inputWord.includes(word) || word.includes(inputWord)
          )
        ).length;
        
        // Calculate percentage of matching words
        const totalWords = Math.max(docWords.length, inputWords.length);
        score = 60 * (matchingWords / totalWords);
      }
      
      console.log(`Match score for ${docDiseaseName}: ${score}`);
      
      // Update best match if this score is higher
      if (score > bestMatchScore) {
        bestMatchScore = score;
        matchedDisease = { id: doc.id, ...diseaseData };
        console.log("New best match:", docDiseaseName, "with score", score);
      }
    });
    
    // Consider it a match if the score is above a threshold
    if (bestMatchScore >= 60) {
      console.log(`Best match found: ${matchedDisease.name} with score ${bestMatchScore}`);
      console.log("Match details:", matchedDisease);
      diseaseDetails.value = matchedDisease;
    } else {
      console.log("No matching disease found in the database");
      diseaseDetails.value = null;
    }
  } catch (err) {
    console.error("Error fetching disease details:", err);
    diseaseDetails.value = null;
  }
};

// View scan details
const viewScanDetails = async (scan) => {
  try {
    // Show loading state
    isLoadingScanDetails.value = true;
    showScanDetails.value = true;
    
    // Reset disease details and active tab
    diseaseDetails.value = null;
    activeTab.value = 'description';
    
    // Set selected scan
    selectedScan.value = scan;
    
    // Fetch disease details
    if (scan.disease) {
      await fetchDiseaseDetails(scan.disease);
    }
    
    // Hide loading state
    isLoadingScanDetails.value = false;
  } catch (err) {
    console.error("Error viewing scan details:", err);
    error.value = "Failed to load scan details. Please try again.";
    isLoadingScanDetails.value = false;
  }
};

// Close scan details modal
const closeScanDetails = () => {
  showScanDetails.value = false;
  selectedScan.value = null;
  diseaseDetails.value = null;
};

// Confirm delete
const confirmDelete = (scan) => {
  scanToDelete.value = scan;
  showDeleteConfirmation.value = true;
};

// Delete scan
const deleteScan = async () => {
  if (!scanToDelete.value) return;
  try {
    // Ensure we have the Firestore document id
    const docId = scanToDelete.value.id;
    if (!docId) {
      throw new Error('Missing document id for deletion');
    }

    // Delete from Firestore collection "scan_history"
    await deleteDoc(doc(db, 'scan_history', docId));

    // Remove from local state
    scanHistory.value = scanHistory.value.filter(scan => scan.id !== docId);

    showDeleteConfirmation.value = false;
    scanToDelete.value = null;
  } catch (err) {
    console.error('Error deleting scan:', err);
    alert('Failed to delete scan. Please try again.');
  }
};

// Save to report
const saveToReport = (scan) => {
  // Reset form data
  reportNotes.value = '';
  selectedTags.value = [];
  reportSaveSuccess.value = false;
  
  // Show the modal
  showSaveReportModal.value = true;
};

// Submit report to Firestore
const submitReport = async () => {
  if (!selectedScan.value) return;
  
  try {
    isSavingReport.value = true;
    
    // Create a new report document
    const reportsRef = collection(db, "reports");
    
    // Prepare the report data
    const reportData = {
      userId: auth.currentUser.uid,
      analysisId: selectedScan.value.analysisId,
      disease: selectedScan.value.disease,
      imageUrl: selectedScan.value.imageUrl,
      severity: selectedScan.value.severity,
      confidence: selectedScan.value.confidence,
      timestamp: new Date(),
      scanTimestamp: selectedScan.value.timestamp,
      location: selectedScan.value.location || null,
      notes: reportNotes.value,
      tags: selectedTags.value,
    };
    
    // Add the document to Firestore
    await addDoc(reportsRef, reportData);
    
    // Show success message
    reportSaveSuccess.value = true;
    
    // Close the modal after a delay
    setTimeout(() => {
      showSaveReportModal.value = false;
    }, 2000);
    
  } catch (err) {
    console.error("Error saving report:", err);
    alert("Failed to save report. Please try again.");
  } finally {
    isSavingReport.value = false;
  }
};

// Toggle tag selection
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

// Share scan
const shareScan = (scan) => {
  alert(`Sharing functionality for ${formatDiseaseName(scan.disease)} will be implemented in a future update.`);
};

// Handle sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
    router.push('/signin');
  } catch (err) {
    console.error("Error signing out:", err);
    alert("Failed to sign out. Please try again.");
  }
};

// Reset pagination when filters change
watch([searchQuery, dateFilter, diseaseFilter, severityFilter, sortBy], () => {
  currentPage.value = 1;
});

// Lifecycle hooks
onMounted(async () => {
  console.log("Scan history component mounted");
  await fetchUserData();
  await fetchScanHistory();
});
</script>

  
  <style scoped>
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
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
