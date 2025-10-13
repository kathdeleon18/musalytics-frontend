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
        <!-- Page Header -->
        <header class="mb-4 sm:mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 class="mb-2 text-2xl font-semibold text-[#283618]">
                {{ $t('reports.title') }}
              </h1>
              <p class="text-sm  text-gray-400">{{ $t('reports.description') }}</p>
            </div>
            <div class="mt-3 sm:mt-0 flex space-x-2">
              <button 
                @click="exportReports" 
                class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-sm font-medium transition-all duration-200 transform  shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('reports.export') }}
              </button>
              <router-link 
                to="/user/scan" 
                class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-all duration-200 transform shadow-lg "
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('reports.newScan') }}
              </router-link>
            </div>
          </div>
  
          <!-- Stats Cards -->
          <div v-if="reports.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div class=" bg-white p-5 flex items-center space-x-4 shadow-lg rounded-xl">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-emerald-500/20 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{{ $t('reports.stats.total') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ reports.length }}</p>
                </div>
              </div>
            </div>
            
            <div class=" bg-white p-5 flex items-center space-x-4 shadow-lg rounded-xl">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-red-500/20 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{{ $t('reports.stats.highSeverity') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ highSeverityCount }}</p>
                </div>
              </div>
            </div>
            
            <div class=" bg-white p-5 flex items-center space-x-4 shadow-lg rounded-xl">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-yellow-500/20 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{{ $t('reports.stats.tagged') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ taggedReportsCount }}</p>
                </div>
              </div>
            </div>
            
            <div class=" bg-white p-5 flex items-center space-x-4 shadow-lg rounded-xl">
              <div class="flex items-center">
                <div class="p-2 rounded-xl bg-green-500/20 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{{ $t('reports.stats.withNotes') }}</p>
                  <p class="text-lg sm:text-xl font-bold">{{ reportsWithNotesCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
  
        <!-- Charts Section -->
        <!-- Disease Insights Section -->
        <div v-if="reports.length > 0" class="p-4  mb-6 shadow-lg rounded-xl" style="background-color: #f7f2df;">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-[#283618]">{{ $t('reports.insights.title') }}</h3>
            <button 
              @click="showCharts = !showCharts" 
              class="text-xs text-[#606c38] flex items-center"
            >
              {{ showCharts ? $t('reports.insights.hide') : $t('reports.insights.show') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform duration-300" :class="{'rotate-180': showCharts}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div v-if="showCharts" class="space-y-6 animate-fadeIn">
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white rounded-xl p-3 border border-gray-600/30 flex flex-col items-center justify-center">
                <div class="text-2xl font-bold text-emerald-400 mb-1">{{ reports.length }}</div>
                <div class="text-xs text-gray-400">{{ $t('reports.stats.total') }}</div>
              </div>
              <div class="bg-white rounded-xl p-3 border border-gray-600/30 flex flex-col items-center justify-center">
                <div class="text-2xl font-bold text-red-400 mb-1">{{ highSeverityCount }}</div>
                <div class="text-xs text-gray-400">{{ $t('reports.stats.highSeverity') }}</div>
              </div>
              <div class="bg-white rounded-xl p-3 border border-gray-600/30 flex flex-col items-center justify-center">
                <div class="text-2xl font-bold text-yellow-400 mb-1">{{ mediumSeverityCount }}</div>
                <div class="text-xs text-gray-400">{{ $t('reports.stats.mediumSeverity') }}</div>
              </div>
              <div class="bg-white rounded-xl p-3 border border-gray-600/30 flex flex-col items-center justify-center">
                <div class="text-2xl font-bold text-blue-400 mb-1">{{ lowSeverityCount }}</div>
                <div class="text-xs text-gray-400">{{ $t('reports.stats.lowSeverity') }}</div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Disease Distribution Chart -->
              <div class="bg-white rounded-xl p-4 border border-gray-600/30">
                <h4 class="text-sm font-bold mb-3 text-[#283618]">{{ $t('reports.insights.distribution') }}</h4>
                <div class="h-64 flex flex-col justify-center">
                  <div v-if="Object.keys(diseaseDistribution).length > 0" class="flex items-end space-x-1 h-[180px]">
                    <div v-for="(count, disease) in diseaseDistribution" :key="disease" class="flex flex-col items-center flex-1 min-w-0">
                      <div class="w-full flex justify-center mb-1">
                        <div 
                          class="w-full max-w-[50px] bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-md transition-all duration-300 relative group cursor-pointer"
                          :style="{ height: `${(count / maxDiseaseCount) * 180}px` }"
                          @mouseenter="activeDisease = disease"
                          @mouseleave="activeDisease = null"
                        >
                          <div v-if="activeDisease === disease" class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                            {{ formatDiseaseName(disease) }}: {{ count }} reports
                          </div>
                        </div>
                      </div>
                      <div class="text-xs text-gray-400 mt-1 truncate max-w-full px-1 text-center" :title="formatDiseaseName(disease)">
                        {{ formatDiseaseName(disease).split(' ')[0] }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
                    {{ $t('reports.insights.noDiseaseData') }}<
                  </div>
                </div>
              </div>
              
              <!-- Severity Distribution Chart -->
              <div class="bg-white rounded-xl p-4 border border-gray-600/30">
                <h4 class="text-sm font-bold mb-3 text-[#283618]">{{ $t('reports.insights.severityDistribution') }}</h4>
                <div class="flex flex-col justify-between h-64">
                  <div v-if="reports.length > 0" class="flex-1 flex items-center justify-center">
                    <!-- Pie Chart Visualization -->
                    <div class="relative w-48 h-48">
                      <!-- High Severity Slice -->
                      <div v-if="highSeverityCount > 0" 
                        class="absolute inset-0 bg-red-500 rounded-full"
                        :style="{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * highSeverityCount / reports.length)}% ${50 - 50 * Math.sin(2 * Math.PI * highSeverityCount / reports.length)}%, 50% 0)`
                        }"
                      ></div>
                      
                      <!-- Medium Severity Slice -->
                      <div v-if="mediumSeverityCount > 0" 
                        class="absolute inset-0 bg-yellow-500 rounded-full"
                        :style="{
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * highSeverityCount / reports.length)}% ${50 - 50 * Math.sin(2 * Math.PI * highSeverityCount / reports.length)}%, ${50 + 50 * Math.cos(2 * Math.PI * (highSeverityCount + mediumSeverityCount) / reports.length)}% ${50 - 50 * Math.sin(2 * Math.PI * (highSeverityCount + mediumSeverityCount) / reports.length)}%)`
                        }"
                      ></div>
                      
                      <!-- Low Severity Slice -->
                      <div v-if="lowSeverityCount > 0" 
                        class="absolute inset-0 bg-emerald-500 rounded-full"
                        :style="{
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * (highSeverityCount + mediumSeverityCount) / reports.length)}% ${50 - 50 * Math.sin(2 * Math.PI * (highSeverityCount + mediumSeverityCount) / reports.length)}%, 50% 0)`
                        }"
                      ></div>
                      
                      <!-- Inner Circle (hole) -->
                      <div class="absolute inset-[25%] bg-gray-800 rounded-full z-10 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">{{ reports.length }} Reports</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2 mt-4">
                    <!-- Legend -->
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                      <span class="text-xs text-gray-400">{{ $t('reports.filters.severity.high') }} {{ highSeverityCount }}</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
                      <span class="text-xs text-gray-400">{{ $t('reports.filters.severity.medium') }} {{ mediumSeverityCount }}</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></div>
                      <span class="text-xs text-gray-400">{{ $t('reports.filters.severity.low') }} {{ lowSeverityCount }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time Trend Chart -->
              <div class="bg-white rounded-xl p-4 border border-gray-600/30">
                <h4 class="text-sm font-bold mb-3 text-[#283618]">{{ $t('reports.insights.overTime') }}</h4>
                <div class="h-64 flex items-end space-x-1">
                  <div v-for="(count, month) in monthlyReports" :key="month" class="flex flex-col items-center flex-1 min-w-0">
                    <div class="w-full flex justify-center mb-1">
                      <div 
                        class="w-full max-w-[30px] bg-gradient-to-t from-teal-600 to-teal-400 hover:from-teal-500 hover:to-teal-300 rounded-t-md transition-all duration-300 relative group cursor-pointer"
                        :style="{ height: `${(count / Math.max(...Object.values(monthlyReports), 1)) * 180}px` }"
                        @mouseenter="activeMonth = month"
                        @mouseleave="activeMonth = null"
                      >
                        <div v-if="activeMonth === month" class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                          {{ formatMonthName(month) }}: {{ count }} reports
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-400 mt-1 truncate max-w-full px-1 text-center">
                      {{ formatMonthShort(month) }}
                    </div>
                  </div>
                </div>
                <div v-if="Object.keys(monthlyReports).length === 0" class="h-64 flex items-center justify-center text-gray-500 text-sm">
                  {{ $t('reports.insights.noTimeData') }}
                </div>
              </div>

              <!-- Tag Distribution -->
              <div class="bg-white rounded-xl p-4 border border-gray-600/30">
                <h4 class="text-sm font-bold mb-3 text-[#283618]">{{ $t('reports.insights.tagDistribution') }}</h4>
                <div class="h-64 flex items-center justify-center">
                  <div class="w-full max-w-xs">
                    <div v-for="(count, tag) in tagDistribution" :key="tag" class="mb-3">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-gray-300">{{ tag }}</span>
                        <span class="text-xs text-emerald-400 font-medium">{{ count }}</span>
                      </div>
                      <div class="w-full bg-gray-600/50 rounded-full h-2 overflow-hidden">
                        <div 
                          class="h-2 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                          :style="{ width: `${(count / Math.max(...Object.values(tagDistribution), 1)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="Object.keys(tagDistribution).length === 0" class="text-center text-gray-500 text-sm">
                      {{ $t('reports.insights.noTagsData') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Key Insights -->
            <div class="bg-white rounded-xl p-4 border border-gray-600/30">
              <h4 class="text-sm font-bold mb-3 text-[#283618]">{{ $t('reports.insights.keyInsights') }}</h4>
              <ul class="space-y-2 text-sm">
                <li v-if="mostCommonDisease" class="flex items-start">
                  <div class="bg-emerald-500/20 p-1 rounded-full mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="text-gray-500">
                    {{ $t('reports.insights.commonDisease') }}:
                    <span class="text-emerald-400 font-medium">
                      {{ formatDiseaseName(mostCommonDisease) }}
                    </span>
                    ({{ diseaseDistribution[mostCommonDisease] }} {{ $t('reports.insights.reports') }})
                  </span>
                </li>
                <li v-if="highSeverityCount > 0" class="flex items-start">
                  <div class="bg-red-500/20 p-1 rounded-full mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="text-gray-500">
                    {{ highSeverityCount }} {{ $t('reports.insights.highSeverityWarning') }}
                  </span>
                </li>
                <li v-if="mostCommonTag" class="flex items-start">
                  <div class="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span class="text-gray-500">
                    {{ $t('reports.insights.commonTag') }}:
                    <span class="text-blue-400 font-medium">
                      {{ mostCommonTag }}
                    </span>
                    ({{ tagDistribution[mostCommonTag] }} {{ $t('reports.insights.reports') }})
                  </span>
                </li>
                <li v-if="recentTrend" class="flex items-start">
                  <div class="bg-yellow-500/20 p-1 rounded-full mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span class="text-gray-500" v-html="recentTrend"></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <!-- Loading State with Skeleton -->
        <div v-if="isLoading">
          <SkeletonLoader />
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center py-8 sm:py-12">
          <div class="rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-700/50 text-red-200 px-6 py-5 rounded-xl max-w-lg mx-auto shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto sm:mx-0 sm:mr-4 mb-3 sm:mb-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-center sm:text-left">
                <h3 class="font-bold text-lg sm:text-xl mb-2">{{ $t('reports.errorLoading') }}</h3>
                <p class="mb-4">{{ error }}</p>
                <button 
                  @click="fetchReports" 
                  class="px-4 py-2 bg-red-600/60 hover:bg-red-600/80 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {{ $t('common.tryAgain') }}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="reports.length === 0" class="flex items-center justify-center py-8 sm:py-12">
          <div class="bg-white rounded-xl p-6 shadow-lg text-center max-w-md">
            <h3 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-[#606c38]">{{ $t('reports.empty.title') }}</h3>
            <p class="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">{{ $t('reports.empty.description') }}</p>
            <router-link to="/user/scan-history" class="px-5 py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center">
              {{ $t('reports.viewScanHistory') }}
            </router-link>
          </div>
        </div>
  
        <!-- Reports Content -->
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
                    :placeholder="$t('reports.filters.searchPlaceholder')" 
                    class="w-full bg-white border border-gray-300 rounded-xl  py-2 pl-9 pr-3 text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <!-- View Toggle -->
                <div class="flex bg-gray-300 border rounded-lg overflow-hidden">
                  <button 
                    @click="viewMode = 'card'" 
                    class="p-2 transition-colors duration-200"
                    :class="viewMode === 'card' ? 'bg-[#606c38] text-white' : 'text-gray-400'"
                    title="Card View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    @click="viewMode = 'table'" 
                    class="p-2 transition-colors duration-200"
                    :class="viewMode === 'table' ? 'bg-[#606c38] text-white' : 'text-gray-400'"
                    title="Table View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <!-- Filters -->
              <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <!-- Farm/Area Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="farmAreaFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('reports.filters.area.allArea') }}</option>
                    <option value="main_plantation">{{ $t('reports.filters.area.mainPlantation') }}</option>
                    <option value="east_field">{{ $t('reports.filters.area.eastField') }}</option>
                    <option value="west_field">{{ $t('reports.filters.area.westField') }}</option>
                    <option value="north_section">{{ $t('reports.filters.area.northSection') }}</option>
                    <option value="south_section">{{ $t('reports.filters.area.southSection') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
                <!-- Date Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="dateFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('reports.filters.date.label') }}</option>
                    <option value="today">{{ $t('reports.filters.date.today') }}</option>
                    <option value="week">{{ $t('reports.filters.date.week') }}</option>
                    <option value="month">{{ $t('reports.filters.date.month') }}</option>
                    <option value="year">{{ $t('reports.filters.date.year') }}</option>
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
                    <option value="all">All Diseases</option>
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
                    <option value="all">{{ $t('reports.filters.severity.label') }}</option>
                    <option value="High">{{ $t('reports.filters.severity.high') }}</option>
                    <option value="Medium">{{ $t('reports.filters.severity.medium') }}</option>
                    <option value="Low">{{ $t('reports.filters.severity.low') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
  
                <!-- Tag Filter -->
                <div class="relative flex-1 min-w-[120px]">
                  <select 
                    v-model="tagFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="all">{{ $t('reports.filters.tag.label') }}</option>
                    <option value="Urgent">{{ $t('reports.filters.tag.urgent') }}</option>
                    <option value="Follow-up">{{ $t('reports.filters.tag.followUp') }}</option>
                    <option value="Treated">{{ $t('reports.filters.tag.treated') }}</option>
                    <option value="For Expert">{{ $t('reports.filters.tag.forExpert') }}</option>
                    <option value="Research">{{ $t('reports.filters.tag.research') }}</option>
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
              <span class="text-xs text-gray-400">{{ $t('reports.filters.active') }}</span>
              
              <div v-if="farmAreaFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                {{ formatFarmArea(farmAreaFilter) }}
                <button @click="farmAreaFilter = 'all'" class="ml-1 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="dateFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                {{ formatDateFilter(dateFilter) }}
                <button @click="dateFilter = 'all'" class="ml-1 text-gray-400 ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="diseaseFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                {{ formatDiseaseName(diseaseFilter) }}
                <button @click="diseaseFilter = 'all'" class="ml-1 text-gray-400 ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="severityFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                {{ severityFilter }} Severity
                <button @click="severityFilter = 'all'" class="ml-1 text-gray-400 ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="tagFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                Tag: {{ tagFilter }}
                <button @click="tagFilter = 'all'" class="ml-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div v-if="searchQuery" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                "{{ searchQuery }}"
                <button @click="searchQuery = ''" class="ml-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <button 
                @click="clearAllFilters" 
                class="text-xs text-red-500 ml-1"
              >
                {{ $t('common.clearAll') }}
              </button>
            </div>
          </div>
  
          <!-- No Results Message -->
          <div v-if="filteredReports.length === 0" class="bg-white backdrop-blur-sm rounded-xl shadow-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="text-lg font-medium mb-1 text-black">{{ $t('reports.noResults.title') }}</h3>
            <p class="text-gray-400 text-sm">{{ $t('reports.noReports.description') }}</p>
            <button 
              @click="clearAllFilters" 
              class="mt-2 px-4 py-2 bg-red-100 text-red-400 text-sm font-medium rounded-xl transition-all duration-200"
            >
              {{ $t('clearAllFilters') }}
            </button>
          </div>
  
          <!-- Card View -->
          <div v-else-if="viewMode === 'card'" class="block">
            <!-- Mobile: Horizontal scrollable cards -->
            <div class="sm:hidden">
              <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style="scrollbar-width: none; -ms-overflow-style: none;">
            <div 
              v-for="(report, index) in paginatedReports" 
              :key="report.id || index"
                  class="group bg-white backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-lg transform hover:bg-gray-500 hover:-translate-y-1 flex-shrink-0 w-80 snap-center"
                >
                  <!-- Report Image with Overlay -->
                  <div class="relative h-48 bg-gray-700 overflow-hidden">
                    <img 
                      :src="report.imageUrl" 
                      :alt="`Report from ${formatDate(report.timestamp)}`" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      @error="handleImageError($event, index)"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                    
                    <!-- Severity Badge -->
                    <div 
                      class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold shadow-lg"
                      :class="getSeverityClass(report.severity).badge"
                    >
                      {{ report.severity }}
                    </div>
                    
                    <!-- Date Badge -->
                    <div class="absolute bottom-2 left-2 px-2 py-1 rounded-xl text-xs font-medium bg-black text-white backdrop-blur-sm">
                      {{ formatDate(report.timestamp) }}
                    </div>
                  </div>

                  <!-- Report Details -->
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="text-medium font-semibold group-hover:text-[#283618] transition-colors duration-300 line-clamp-1">
                        {{ formatDiseaseName(report.disease) }}
                      </h3>
                      <div 
                        class="text-xs font-medium px-2 py-1 rounded-xl"
                        :class="getConfidenceClass(report.confidence).bg"
                      >
                        {{ report.confidence }}%
                      </div>
                    </div>

                    <!-- Tags -->
                    <div v-if="report.tags && report.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
                      <span 
                        v-for="(tag, tagIndex) in report.tags" 
                        :key="tagIndex"
                        class="px-2 py-0.5 text-xs rounded-full bg-gray-700/70 text-gray-300"
                      >
                        {{ tag }}
                      </span>
                    </div>

                    <!-- Status Badge -->
                    <div v-if="report.status" class="flex items-center text-xs text-gray-300 mb-3">
                      <span 
                        class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(report.status)"
                      >
                        {{ report.status }}
                      </span>
                    </div>

                    <!-- Notes Preview -->
                    <div v-if="report.notes" class="text-xs text-gray-300 mb-3 line-clamp-2">
                      <span class="text-gray-500">{{ $t('reports.card.notesLabel') }}</span> {{ report.notes }}
                    </div>
                    <div v-else class="text-xs text-gray-400 mb-3 italic">
                      {{ $t('reports.card.noNotes') }}
                    </div>

                    <!-- Location -->
                    <div v-if="report.location" class="flex items-center text-xs text-gray-500 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ formatLocation(report.location) }}
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between items-center">
                      <button 
                        @click="viewReportDetails(report)"
                        class="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-blue-600/50 text-xs font-medium transition-all duration-200"
                      >
                        {{ $t('reports.card.viewReport') }}
                      </button>
                      <button 
                        @click="confirmDelete(report)"
                        class="inline-flex items-center p-1.5 text-red-600 hover:text-red-600/50 transition-colors duration-200"
                        :title="$t('reports.card.deleteReport')"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop: Grid layout -->
            <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div 
                v-for="(report, index) in paginatedReports" 
                :key="report.id || index"
                class="group bg-white backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-lg transform hover:bg-gray-500 hover:-translate-y-1"
            >
              <!-- Report Image with Overlay -->
              <div class="relative h-40 sm:h-48 bg-gray-700 overflow-hidden">
                <img 
                  :src="report.imageUrl" 
                  :alt="`Report from ${formatDate(report.timestamp)}`" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  @error="handleImageError($event, index)"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                
                <!-- Severity Badge -->
                <div 
                  class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold shadow-lg"
                  :class="getSeverityClass(report.severity).badge"
                >
                  {{ report.severity }}
                </div>
                
                <!-- Date Badge -->
                <div class="absolute bottom-2 left-2 px-2 py-1 rounded-xl text-xs font-medium bg-black text-white backdrop-blur-sm">
                  {{ formatDate(report.timestamp) }}
                </div>
              </div>
  
              <!-- Report Details -->
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-medium font-semibold group-hover:text-[#283618] transition-colors duration-300 line-clamp-1">
                    {{ formatDiseaseName(report.disease) }}
                  </h3>
                  <div 
                    class="text-xs font-medium px-2 py-1 rounded-xl"
                    :class="getConfidenceClass(report.confidence).bg"
                  >
                    {{ report.confidence }}%
                  </div>
                </div>
  
                <!-- Tags -->
                <div v-if="report.tags && report.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
                  <span 
                    v-for="(tag, tagIndex) in report.tags" 
                    :key="tagIndex"
                    class="px-2 py-0.5 text-xs rounded-full bg-gray-700/70 text-gray-300"
                  >
                    {{ tag }}
                  </span>
                </div>
  
                <!-- Status Badge -->
                <div v-if="report.status" class="flex items-center text-xs text-gray-300 mb-3">
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(report.status)"
                  >
                    {{ report.status }}
                  </span>
                </div>
  
                <!-- Notes Preview -->
                <div v-if="report.notes" class="text-xs text-gray-300 mb-3 line-clamp-2">
                  <span class="text-gray-500">{{ $t('reports.card.notesLabel') }}</span> {{ report.notes }}
                </div>
                <div v-else class="text-xs text-gray-400 mb-3 italic">
                 {{ $t('reports.card.noNotes') }}
                </div>
  
                <!-- Location -->
                <div v-if="report.location" class="flex items-center text-xs text-gray-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ formatLocation(report.location) }}
                </div>
  
                <!-- Actions -->
                <div class="flex justify-between items-center">
                  <button 
                    @click="viewReportDetails(report)"
                      class="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-blue-600/50 text-xs font-medium transition-all duration-200"
                  >
                    {{ $t('reports.card.viewReport') }}
                  </button>
                  <button 
                    @click="confirmDelete(report)"
                    class="inline-flex items-center p-1.5 text-red-600 hover:text-red-600/50 transition-colors duration-200"
                    :title="$t('reports.card.deleteReport')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Table View -->
          <div v-else class="overflow-x-auto">
            <table class="w-full bg-white backdrop-blur-sm rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#283618] border-b border-gray-700/50">
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.image') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.disease') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.date') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.severity') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.confidence') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.tags') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.status') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{{ $t('reports.table.action') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700/50">
                <tr v-for="(report, index) in paginatedReports" :key="report.id || index" class="hover:bg-[#f7f2df] transition-colors duration-200">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex-shrink-0 h-14 w-14 rounded-md overflow-hidden bg-gray-700">
                      <img 
                        :src="report.imageUrl" 
                        :alt="`Report from ${formatDate(report.timestamp)}`" 
                        class="h-full w-full object-cover"
                        @error="handleImageError($event, index)"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-[#606c38]">{{ formatDiseaseName(report.disease) }}</div>
                    <div v-if="report.notes" class="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{{ report.notes }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(report.timestamp) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span 
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getSeverityClass(report.severity).badge"
                    >
                      {{ report.severity }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <div 
                        class="text-xs font-medium"
                        :class="getConfidenceClass(report.confidence).text"
                      >
                        {{ report.confidence }}%
                      </div>
                      <div class="ml-2 w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-1000 ease-out"
                          :class="getConfidenceClass(report.confidence).bar"
                          :style="{ width: `${report.confidence}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="report.tags && report.tags.length > 0" class="flex flex-wrap gap-1">
                      <span 
                        v-for="(tag, tagIndex) in report.tags" 
                        :key="tagIndex"
                        class="px-1.5 py-0.5 text-xs rounded-full bg-gray-700/70 text-gray-300 whitespace-nowrap"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    <div v-else class="text-xs text-gray-500 italic">{{ $t('reports.table.noTags') }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span 
                      v-if="report.status"
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusClass(report.status)"
                    >
                      {{ report.status }}
                    </span>
                    <span v-else class="text-xs text-gray-500 italic">{{ $t('reports.table.noStatus') }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="viewReportDetails(report)"
                        class="text-blue-400  transition-colors duration-200"
                        title="View Full Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        @click="confirmDelete(report)"
                        class="text-red-400 transition-colors duration-200"
                        title="Delete Report"
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
            <nav class="inline-flex rounded-lg shadow-lg overflow-hidden bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center text-sm"
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
                  :class="page === '...' ? 'text-gray-500 cursor-default' : (currentPage === page ? 'bg-emerald-600 text-white font-medium' : 'text-gray-300 hover:text-white hover:bg-gray-700/50')"
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
                class="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center text-sm"
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
          class="absolute top-3 right-3 text-gray-400 transition-colors duration-200"
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
          <h3 class="text-lg font-bold mb-2">{{ $t('reports.deleteModal.title') }}</h3>
        </div>
        
        <p class="text-gray-400 mb-5 text-center text-sm">{{ $t('reports.deleteModal.confirm') }}</p>
  
        <div class="flex justify-center space-x-3">
          <button 
            @click="showDeleteConfirmation = false"
            class="px-4 py-2 bg-gray-600 rounded-xl text-white text-sm font-medium transition-all duration-200"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="deleteReport"
            class="px-4 py-2 bg-red-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
    <!-- Delete Status Modal -->
    <div
      v-if="showDeleteStatus"
      class="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center relative">
        <button
          @click="showDeleteStatus = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- ✅ Success -->
        <div v-if="deleteStatus === 'success'" class="flex flex-col items-center">
          <div class="bg-green-100 p-3 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-800">{{ $t('reports.successModal.deleteSuccessTitle') }}</h3>
          <p class="text-sm text-gray-500">{{ $t('reports.successModal.deleteSuccessMessage') }}</p>
        </div>

        <!-- ❌ Error -->
        <div v-else-if="deleteStatus === 'error'" class="flex flex-col items-center">
          <div class="bg-red-100 p-3 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14a7 7 0 000-14z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-800">{{ $t('reports.deleteErrorTitle') }}</h3>
          <p class="text-sm text-gray-500">{{ $t('reports.deleteErrorMessage') }}</p>
        </div>
      </div>
    </div>

  
    <!-- Report Details Modal -->
    <div v-if="showReportDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        class="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative transform transition-all duration-300 flex flex-col max-h-[95vh] overflow-hidden"
        :class="{ 'scale-100 opacity-100': showReportDetails, 'scale-95 opacity-0': !showReportDetails }"
      >
        <!-- Fixed Header -->
        <div class="sticky top-0 z-10 bg-[#283618] p-3 flex items-center justify-between">
          <h3 class="text-lg sm:text-xl md:text-2xl font-semibold text-white truncate">
            {{ selectedReport ? formatDiseaseName(selectedReport.disease) : 'Report Details' }}
          </h3>
          <div class="flex items-center space-x-2">
            <button 
              @click="printReport" 
              class="text-white transition-colors duration-200 p-1"
              title="Print Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button 
              @click="closeReportDetails" 
              class="text-white transition-colors duration-200 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
  
        <!-- Scrollable Content -->
        <div v-if="selectedReport" class="flex-1 overflow-y-auto p-3 sm:p-4">
                      <div v-if="isLoadingReportDetails" class="flex items-center justify-center h-[200px] w-full">
              <div class="flex flex-col items-center space-y-3 text-gray-300 animate-pulse">
                <svg class="w-10 h-10 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 4v1m0 14v1m7.071-7.071h1M4.929 12H4m12.02-4.95l.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l.707-.707" />
                </svg>
                <p class="text-sm text-gray-400">{{ $t('reports.detailsModal.loading') }}</p>
              </div>
            </div>
          <div v-else class="space-y-4 sm:space-y-6">
            <!-- Left Column: Report Image and Metadata -->
            <div class="space-y-4">
              <!-- Image with Lightbox -->
              <div class="bg-gray-700/50 rounded-lg overflow-hidden shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer relative">
                <img 
                  :src="selectedReport.imageUrl" 
                  :alt="`Report from ${formatDate(selectedReport.timestamp)}`" 
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
              
              <!-- Report Metadata -->
              <div class="p-3 sm:p-4 rounded-xl shadow-lg bg-[#f7f2df]">
                <h4 class="font-medium mb-3 text-sm sm:text-base">{{ $t('reports.detailsModal.infoTitle') }}</h4>
                
                <div class="space-y-2 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.reportId') }}</span>
                    <span class="font-mono text-xs truncate">{{ selectedReport.id }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.created') }}</span>
                    <span>{{ formatDate(selectedReport.timestamp, true) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.scanDate') }}</span>
                    <span>{{ formatDate(selectedReport.scanTimestamp, true) }}</span>
                  </div>
                  
                  <div v-if="selectedReport.location" class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.location') }}</span>
                    <span class="truncate">{{ formatLocation(selectedReport.location) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.severity') }}</span>
                    <span :class="getSeverityClass(selectedReport.severity).text" class="font-medium">
                      {{ selectedReport.severity }}
                    </span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">{{ $t('reports.detailsModal.confidence') }}</span>
                    <span :class="getConfidenceClass(selectedReport.confidence).text" class="font-medium">
                      {{ selectedReport.confidence }}%
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- User Notes -->
              <div class="bg-white backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-sm sm:text-base">{{ $t('reports.detailsModal.notesTitle') }}</h4>
                  <button 
                    @click="editNotes" 
                    class="text-xs text-gray-400"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                
                <div v-if="isEditingNotes" class="space-y-3">
                  <textarea 
                    v-model="editedNotes" 
                    rows="4" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    :placeholder="$t('reports.detailsModal.notesPlaceholder')"
                  ></textarea>
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="cancelEditNotes" 
                      class="px-3 py-1.5 bg-gray-500 rounded-xl text-white text-sm font-medium transition-all duration-200"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button 
                      @click="saveNotes" 
                      class="px-3 py-1.5 bg-[#606c38] rounded-xl text-white text-sm font-medium transition-all duration-200"
                    >
                      {{ $t('common.save') }}
                    </button>
                  </div>
                </div>
                
                <div v-else-if="selectedReport.notes" class="text-xs sm:text-sm text-gray-300 whitespace-pre-line">
                  {{ selectedReport.notes }}
                </div>
                <div v-else class="text-xs sm:text-sm text-gray-500 italic">
                  {{ $t('reports.detailsModal.noNotes') }}
                </div>
              </div>
              
              <!-- Tags -->
              <div class="bg-white backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-sm sm:text-base">{{ $t('reports.detailsModal.tagsTitle') }}</h4>
                  <button 
                    @click="editTags" 
                    class="text-xs text-gray-400"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                
                <div v-if="isEditingTags" class="space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="tag in availableTags" 
                      :key="tag"
                      type="button"
                      @click="toggleTag(tag)"
                      class="px-2 py-1 rounded-full text-xs font-medium transition-all duration-200"
                      :class="editedTags.includes(tag) 
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-700'"
                    >
                      {{ tag }}
                    </button>
                  </div>
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="cancelEditTags" 
                      class="px-3 py-1.5 bg-gray-500 rounded-xl text-white text-xs font-medium transition-all duration-200"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button 
                      @click="saveTags" 
                      class="px-3 py-1.5 bg-[#606c38] rounded-xl text-white text-sm font-medium transition-all duration-200"
                    >
                      {{ $t('common.save') }}
                    </button>
                  </div>
                </div>
                
                <div v-else-if="selectedReport.tags && selectedReport.tags.length > 0" class="flex flex-wrap gap-2">
                  <span 
                    v-for="(tag, tagIndex) in selectedReport.tags" 
                    :key="tagIndex"
                    class="px-2 py-1 text-xs rounded-full bg-gray-700/70 text-gray-300"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div v-else class="text-xs sm:text-sm text-gray-500 italic">
                  {{ $t('reports.detailsModal.noTags') }}
                </div>
              </div>
              
              <!-- Status -->
              <div class="bg-white backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-sm sm:text-base">{{ $t('reports.detailsModal.statusTitle') }}</h4>
                  <button 
                    @click="editStatus" 
                    class="text-xs text-gray-400"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                
                <div v-if="isEditingStatus" class="space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="status in availableStatuses" 
                      :key="status"
                      type="button"
                      @click="selectStatus(status)"
                      class="px-2 py-1 rounded-full text-xs font-medium transition-all duration-200"
                      :class="editedStatus === status 
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-700'"
                    >
                      {{ status }}
                    </button>
                  </div>
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="cancelEditStatus" 
                      class="px-3 py-1.5 bg-gray-500 rounded-xl text-white text-xs font-medium transition-all duration-200"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button 
                      @click="saveStatus" 
                      class="px-3 py-1.5 bg-[#606c38] rounded-xl text-white text-sm font-medium transition-all duration-200"
                    >
                      {{ $t('common.save') }}
                    </button>
                  </div>
                </div>
                
                <div v-else>
                  <span 
                    v-if="selectedReport.status" 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(selectedReport.status)"
                  >
                    {{ selectedReport.status }}
                  </span>
                  <div v-else class="text-xs sm:text-sm text-gray-500 italic">
                    {{ $t('reports.detailsModal.noStatus') }}
                  </div>
                </div>
              </div>

              <!-- Action Taken -->
              <div class="bg-white backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-sm sm:text-base">{{ $t('reports.detailsModal.actionTitle') }}</h4>
                  <button 
                    @click="editAction" 
                    class="text-xs text-gray-400"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                
                <div v-if="isEditingAction" class="space-y-3">
                  <textarea 
                    v-model="editedAction" 
                    rows="3" 
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                    :placeholder="$t('reports.detailsModal.actionPlaceholder')"
                  ></textarea>
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="cancelEditAction" 
                      class="px-3 py-1.5 bg-gray-500 rounded-xl text-white text-xs font-medium transition-all duration-200"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button 
                      @click="saveAction" 
                      class="px-3 py-1.5 bg-[#606c38] rounded-xl text-white text-sm font-medium transition-all duration-200"
                    >
                      {{ $t('common.save') }}
                    </button>
                  </div>
                </div>
                
                <div v-else-if="selectedReport.actionTaken" class="text-xs sm:text-sm text-gray-300 whitespace-pre-line">
                  {{ selectedReport.actionTaken }}
                </div>
                <div v-else class="text-xs sm:text-sm text-gray-500 italic">
                  {{ $t('reports.detailsModal.noAction') }}
                </div>
              </div>
            </div>
            
            <!-- Right Column: Disease Information -->
            <div class="space-y-4">
              <!-- Confidence Meter -->
              <div class="bg-white backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-medium text-sm">{{ $t('reports.detailsModal.confidenceTitle') }}</h4>
                  <span 
                    class="text-lg font-bold"
                    :class="getConfidenceClass(selectedReport.confidence).text"
                  >
                    {{ selectedReport.confidence }}%
                  </span>
                </div>
                
                <div class="w-full bg-gray-700 rounded-full h-2 mb-1 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all duration-1000 ease-out"
                    :class="getConfidenceClass(selectedReport.confidence).bar"
                    :style="{ width: `${selectedReport.confidence}%` }"
                  ></div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ $t('reports.filters.severity.low') }}</span>
                  <span>{{ $t('reports.filters.severity.medium') }}</span>
                  <span>{{ $t('reports.filters.severity.high') }}</span>
                </div>
              </div>
              
              <!-- Disease Information -->
              <div class="bg-white">
                <div class="border-b border-gray-700/50">
                  <nav class="flex overflow-x-auto">
                    <button 
                      @click="activeTab = 'description'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'description' ? 'text-[#606c38] border-b-2 border-[#606c38] bg-white': 'text-gray-400'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('reports.detailsModal.tabs.overview') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'symptoms'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'symptoms' ? 'text-[#606c38] border-b-2 border-[#606c38] bg-white': 'text-gray-400'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('reports.detailsModal.tabs.symptoms') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'treatment'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'treatment' ? 'text-[#606c38] border-b-2 border-[#606c38] bg-white': 'text-gray-400'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('reports.detailsModal.tabs.treatment') }}
                      </div>
                    </button>
                    <button 
                      @click="activeTab = 'prevention'" 
                      class="flex-1 px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap"
                      :class="activeTab === 'prevention' ? 'text-[#606c38] border-b-2 border-[#606c38] bg-white': 'text-gray-400'"
                    >
                      <div class="flex items-center justify-center">
                        {{ $t('reports.detailsModal.tabs.prevention') }}
                      </div>
                    </button>
                  </nav>
                </div>
                
                <div class="p-3 sm:p-4 overflow-y-auto max-h-[200px] sm:max-h-[250px]">
                  <!-- Description Tab -->
                  <div v-if="activeTab === 'description'" class="space-y-3 animate-fadeIn">
                    <div class="prose prose-invert max-w-none prose-sm">
                      <p class="leading-relaxed text-xs sm:text-sm">{{ diseaseDetails?.description || $t('reports.detailsModal.diseaseInfo.noDescription') }}</p>
                      
                      <!-- Scientific Name -->
                      <div v-if="diseaseDetails && diseaseDetails.scientificName" class="mt-4 bg-white rounded-xl p-3 border border-gray-400">
                        <h6 class="text-xs mb-1 text-gray-600">{{ $t('reports.detailsModal.diseaseInfo.scientificName') }}</h6>
                        <p class="text-gray-600 italic font-medium text-sm">{{ diseaseDetails.scientificName }}</p>
                      </div>
                      
                      <!-- Category Badge -->
                      <div v-if="diseaseDetails && diseaseDetails.category" class="mt-3 flex items-center">
                        <span class="text-xs text-gray-400 mr-2">{{ $t('reports.detailsModal.diseaseInfo.category') }}</span>
                        <span class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-medium">
                          {{ diseaseDetails.category.charAt(0).toUpperCase() + diseaseDetails.category.slice(1) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Symptoms Tab -->
                  <div v-if="activeTab === 'symptoms'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">{{ $t('reports.detailsModal.diseaseInfo.symptomsTitle') }}</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.symptoms" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.symptoms" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-white rounded-xl border border-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">{{ $t('reports.detailsModal.diseaseInfo.noSymptoms') }}</p>
                      <p class="text-gray-500 text-xs">{{ $t('reports.detailsModal.diseaseInfo.updatesSoon') }}</p>
                    </div>
                    
                    <!-- Affected Parts section -->
                    <div v-if="diseaseDetails && diseaseDetails.affectedCrops && diseaseDetails.affectedCrops.length > 0" class="mt-4 pt-4 border-t border-gray-700/50">
                      <h6 class="font-medium mb-2 text-xs text-gray-300">{{ $t('reports.detailsModal.diseaseInfo.affectedParts') }}</h6>
                      <div class="flex flex-wrap gap-1.5">
                        <span 
                          v-for="(crop, index) in diseaseDetails.affectedCrops" 
                          :key="index"
                          class="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full border border-gray-600/30"
                        >
                          {{ crop }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Treatment Tab -->
                  <div v-if="activeTab === 'treatment'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">{{ $t('reports.detailsModal.diseaseInfo.treatmentTitle') }}</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.treatment" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.treatment" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-white rounded-xl border border-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">{{ $t('reports.detailsModal.diseaseInfo.noTreatment') }}</p>
                      <p class="text-gray-500 text-xs">{{ $t('reports.detailsModal.diseaseInfo.updatesSoon') }}</p>
                    </div>
                  </div>
                  
                  <!-- Prevention Tab -->
                  <div v-if="activeTab === 'prevention'" class="space-y-3 animate-fadeIn">
                    <h5 class="font-semibold text-sm mb-3 text-[#606c38]">{{ $t('reports.detailsModal.diseaseInfo.preventionTitle') }}</h5>
                    
                    <div v-if="diseaseDetails && diseaseDetails.prevention" class="prose prose-invert max-w-none prose-sm">
                      <div v-html="diseaseDetails.prevention" class="leading-relaxed text-xs sm:text-sm"></div>
                    </div>
                    
                    <div v-else class="text-center py-6 bg-white rounded-xl border border-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p class="text-gray-400 mb-1 text-xs">{{ $t('reports.detailsModal.diseaseInfo.noPrevention') }}</p>
                      <p class="text-gray-500 text-xs">{{ $t('reports.detailsModal.diseaseInfo.updatesSoon') }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Location Map -->
              <div v-if="selectedReport.location" class="p-3 sm:p-4 rounded-xl bg-white border border-gray-500">
                <h4 class="font-medium mb-3 text-sm sm:text-base">{{ $t('reports.detailsModal.mapTitle') }}</h4>
                
                <div class="rounded-lg overflow-hidden h-48 bg-gray-700 mb-2 border border-gray-500">
                  <div id="map-container" class="w-full h-full"></div>
                </div>
                
                <div class="text-xs text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ formatLocation(selectedReport.location) }}
                </div>
              </div>
              
              <!-- Actions -->
              <div class="grid grid-cols-2 gap-2 sm:gap-3">
                <button 
                  @click="exportSingleReport(selectedReport)"
                  class="px-2 py-1.5 sm:px-3 sm:py-2  bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span class="hidden sm:inline">{{ $t('reports.detailsModal.exportPDF') }}</span>
                  <span class="sm:hidden">Export</span>
                </button>
                <button 
                  @click="shareReport(selectedReport)"
                  class="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-white rounded-xl text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {{ $t('reports.detailsModal.share') }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { auth, db, storage } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import 'leaflet/dist/leaflet.css';

// Router
const router = useRouter();
const { t } = useI18n()

// State
const isLoading = ref(true);
const error = ref(null);
const reports = ref([]);
const searchQuery = ref('');
const dateFilter = ref('all');
const diseaseFilter = ref('all');
const severityFilter = ref('all');
const tagFilter = ref('all');
const sortBy = ref('date-desc');
const currentPage = ref(1);
const itemsPerPage = 9; // Fewer items per page for larger cards
const showDeleteConfirmation = ref(false);
const reportToDelete = ref(null);
const showReportDetails = ref(false);
const selectedReport = ref(null);
const showSignOutConfirmation = ref(false);
const notificationCount = ref(3); // For the navbar
const diseaseDetails = ref(null); // Added for disease details
const activeTab = ref('description'); // Default active tab
const isLoadingReportDetails = ref(false);
const viewMode = ref('card'); // 'card' or 'table'
const showDeleteStatus = ref(false);
const deleteStatus = ref(null); // 'success' or 'error'

// Editing state
const isEditingNotes = ref(false);
const editedNotes = ref('');
const isEditingTags = ref(false);
const editedTags = ref([]);
const availableTags = ref(['Urgent', 'Follow-up', 'Treated', 'For Expert', 'Research']);

// Status and action editing
const isEditingStatus = ref(false);
const editedStatus = ref('');
const isEditingAction = ref(false);
const editedAction = ref('');
const availableStatuses = ref(['Needs Action', 'In Progress', 'Treated', 'Monitoring', 'Resolved']);
const farmAreaFilter = ref('all');
const showCharts = ref(false);

// Add these new refs
const activeDisease = ref(null);
const activeMonth = ref(null);

// Computed properties for charts
const diseaseDistribution = computed(() => {
  const distribution = {};
  reports.value.forEach(report => {
    if (report.disease) {
      distribution[report.disease] = (distribution[report.disease] || 0) + 1;
    }
  });
  return distribution;
});

const mediumSeverityCount = computed(() => {
  return reports.value.filter(report => report.severity === 'Medium').length;
});

const lowSeverityCount = computed(() => {
  return reports.value.filter(report => report.severity === 'Low').length;
});

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const profileImage = ref(null);

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
  return searchQuery.value || dateFilter.value !== 'all' || diseaseFilter.value !== 'all' || 
         severityFilter.value !== 'all' || tagFilter.value !== 'all' || farmAreaFilter.value !== 'all';
});

// Computed properties for statistics
const highSeverityCount = computed(() => {
  return reports.value.filter(report => report.severity === 'High').length;
});

const taggedReportsCount = computed(() => {
  return reports.value.filter(report => report.tags && report.tags.length > 0).length;
});

const reportsWithNotesCount = computed(() => {
  return reports.value.filter(report => report.notes && report.notes.trim() !== '').length;
});

// Add these new computed properties
const statusDistribution = computed(() => {
  const distribution = {};
  reports.value.forEach(report => {
    if (report.status) {
      distribution[report.status] = (distribution[report.status] || 0) + 1;
    }
  });
  return distribution;
});

const tagDistribution = computed(() => {
  const distribution = {};
  reports.value.forEach(report => {
    if (report.tags && report.tags.length > 0) {
      report.tags.forEach(tag => {
        distribution[tag] = (distribution[tag] || 0) + 1;
      });
    }
  });
  return distribution;
});

const monthlyReports = computed(() => {
  const distribution = {};
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  
  // Initialize with last 6 months
  for (let i = 0; i < 6; i++) {
    const month = new Date();
    month.setMonth(now.getMonth() - i);
    const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
    distribution[monthKey] = 0;
  }
  
  // Count reports by month
  reports.value.forEach(report => {
    if (report.timestamp) {
      const date = new Date(report.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (date >= sixMonthsAgo) {
        distribution[monthKey] = (distribution[monthKey] || 0) + 1;
      }
    }
  });
  
  // Sort by month (oldest to newest)
  return Object.fromEntries(
    Object.entries(distribution).sort(([a], [b]) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return (yearA - yearB) || (monthA - monthB);
    })
  );
});

const mostCommonDisease = computed(() => {
  if (Object.keys(diseaseDistribution.value).length === 0) return null;
  return Object.entries(diseaseDistribution.value)
    .sort((a, b) => b[1] - a[1])[0][0];
});

const mostCommonTag = computed(() => {
  if (Object.keys(tagDistribution.value).length === 0) return null;
  return Object.entries(tagDistribution.value)
    .sort((a, b) => b[1] - a[1])[0][0];
});

const recentTrend = computed(() => {
  const months = Object.keys(monthlyReports.value);
  if (months.length < 2) return null;
  
  const lastMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];
  
  const lastCount = monthlyReports.value[lastMonth];
  const previousCount = monthlyReports.value[previousMonth];
  
  if (lastCount > previousCount) {
    const increase = ((lastCount - previousCount) / previousCount * 100) || 0;
    return t('reports.insights.trendIncrease', {
      percent: `<span class="text-red-400 font-medium">${Math.round(increase)}%</span>`,
      last: formatMonthName(lastMonth),
      prev: formatMonthName(previousMonth)
    });
  } else if (lastCount < previousCount) {
    const decrease = ((previousCount - lastCount) / previousCount * 100) || 0;
    return t('reports.insights.trendDecrease', {
      percent: `<span class="text-emerald-400 font-medium">${Math.round(decrease)}%</span>`,
      last: formatMonthName(lastMonth),
      prev: formatMonthName(previousMonth)
    });
  } else {
    return t('reports.insights.trendStable', {
      last: formatMonthName(lastMonth),
      prev: formatMonthName(previousMonth)
    });
  }
});

// Add this computed property to avoid division by zero
const maxDiseaseCount = computed(() => {
  const values = Object.values(diseaseDistribution.value);
  return values.length > 0 ? Math.max(...values) : 1;
});

// Filter reports based on search query, date filter, disease filter, and severity filter
const filteredReports = computed(() => {
  let filtered = [...reports.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(report => 
      (report.disease && report.disease.toLowerCase().includes(query)) ||
      (report.notes && report.notes.toLowerCase().includes(query)) ||
      (report.severity && report.severity.toLowerCase().includes(query))
    );
  }
  
  // Apply date filter
  if (dateFilter.value !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter.value === 'today') {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= today;
      });
    } else if (dateFilter.value === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= weekStart;
      });
    } else if (dateFilter.value === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= monthStart;
      });
    } else if (dateFilter.value === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= yearStart;
      });
    }
  }
  
  // Apply disease filter
  if (diseaseFilter.value !== 'all') {
    filtered = filtered.filter(report => 
      report.disease && report.disease.toLowerCase() === diseaseFilter.value.toLowerCase()
    );
  }
  
  // Apply severity filter
  if (severityFilter.value !== 'all') {
    filtered = filtered.filter(report => 
      report.severity && report.severity === severityFilter.value
    );
  }
  
  // Apply tag filter
  if (tagFilter.value !== 'all') {
    filtered = filtered.filter(report => 
      report.tags && report.tags.includes(tagFilter.value)
    );
  }

  // Apply farm/area filter
  if (farmAreaFilter.value !== 'all') {
    filtered = filtered.filter(report => 
      report.farmArea && report.farmArea === farmAreaFilter.value
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
const paginatedReports = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredReports.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / itemsPerPage);
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

// Handle map image error
const handleMapImageError = (event) => {
  // Replace with placeholder map image
  event.target.src = `/placeholder.svg?height=300&width=600&query=Map+Location`;
};

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  dateFilter.value = 'all';
  diseaseFilter.value = 'all';
  severityFilter.value = 'all';
  tagFilter.value = 'all';
  farmAreaFilter.value = 'all';
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
    profileImage.value = userData.profileImage || null;

    console.log("User data loaded successfully");

  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  }
};

// Fetch reports from Firestore
const fetchReports = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    console.log("Fetching reports...");

    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }

    // Get reports from Firestore
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef, 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process report data
    const reportsList = [];
    querySnapshot.forEach((doc) => {
      const reportData = doc.data();
      
      // Convert Firestore timestamp to JavaScript Date
      let timestamp = reportData.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      }
      
      let scanTimestamp = reportData.scanTimestamp;
      if (scanTimestamp && typeof scanTimestamp.toDate === 'function') {
        scanTimestamp = scanTimestamp.toDate();
      }
      
      reportsList.push({
        ...reportData,
        timestamp: timestamp,
        scanTimestamp: scanTimestamp,
        id: doc.id // Store the document ID for deletion and updates
      });
    });
    
    console.log(`Retrieved ${reportsList.length} reports`);
    reports.value = reportsList;

  } catch (err) {
    console.error("Error fetching reports:", err);
    error.value = err.message || "Failed to load reports. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

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

// Initialize map
const initMap = () => {
  if (!selectedReport.value || !selectedReport.value.location) return;
  
  // Import Leaflet dynamically to avoid SSR issues
  import('leaflet').then(L => {
    // Clear previous map instance if it exists
    if (window.reportMap) {
      window.reportMap.remove();
    }
    
    // Create map
    setTimeout(() => {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return;
      
      const { latitude, longitude } = selectedReport.value.location;
      const map = L.map('map-container').setView([latitude, longitude], 13);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add marker
      L.marker([latitude, longitude]).addTo(map);
      
      // Store map instance for cleanup
      window.reportMap = map;
    }, 100);
  }).catch(err => {
    console.error("Error loading Leaflet:", err);
  });
};

// View report details
const viewReportDetails = async (report) => {
  try {
    // Show loading state
    isLoadingReportDetails.value = true;
    showReportDetails.value = true;
    
    // Reset disease details and active tab
    diseaseDetails.value = null;
    activeTab.value = 'description';
    
    // Set selected report
    selectedReport.value = report;
    
    // Fetch disease details
    if (report.disease) {
      await fetchDiseaseDetails(report.disease);
    }
    
    // Hide loading state
    isLoadingReportDetails.value = false;
    
    // Initialize map after the modal is shown
    if (report.location) {
      setTimeout(initMap, 300);
    }
  } catch (err) {
    console.error("Error viewing report details:", err);
    error.value = "Failed to load report details. Please try again.";
    isLoadingReportDetails.value = false;
  }
};

// Close report details modal
const closeReportDetails = () => {
  showReportDetails.value = false;
  selectedReport.value = null;
  diseaseDetails.value = null;
  isEditingNotes.value = false;
  isEditingTags.value = false;
};

// Edit notes
const editNotes = () => {
  editedNotes.value = selectedReport.value.notes || '';
  isEditingNotes.value = true;
};

// Cancel edit notes
const cancelEditNotes = () => {
  isEditingNotes.value = false;
};

// Save notes
const saveNotes = async () => {
  try {
    // Update the local report
    selectedReport.value.notes = editedNotes.value;
    
    // Update in Firestore (in a real implementation)
    // const reportRef = doc(db, "reports", selectedReport.value.id);
    // await updateDoc(reportRef, {
    //   notes: editedNotes.value
    // });
    
    isEditingNotes.value = false;
  } catch (err) {
    console.error("Error saving notes:", err);
    alert("Failed to save notes. Please try again.");
  }
};

// Edit tags
const editTags = () => {
  editedTags.value = [...(selectedReport.value.tags || [])];
  isEditingTags.value = true;
};

// Cancel edit tags
const cancelEditTags = () => {
  isEditingTags.value = false;
};

// Save tags
const saveTags = async () => {
  try {
    // Update the local report
    selectedReport.value.tags = [...editedTags.value];
    
    // Update in Firestore (in a real implementation)
    // const reportRef = doc(db, "reports", selectedReport.value.id);
    // await updateDoc(reportRef, {
    //   tags: editedTags.value
    // });
    
    isEditingTags.value = false;
  } catch (err) {
    console.error("Error saving tags:", err);
    alert("Failed to save tags. Please try again.");
  }
};

// Toggle tag selection
const toggleTag = (tag) => {
  const index = editedTags.value.indexOf(tag);
  if (index === -1) {
    editedTags.value.push(tag);
  } else {
    editedTags.value.splice(index, 1);
  }
};

// Confirm delete
const confirmDelete = (report) => {
  reportToDelete.value = report;
  showDeleteConfirmation.value = true;
};

// Delete report
const deleteReport = async () => {
  if (!reportToDelete.value) return;

  try {
    // Delete from Firestore
    const reportRef = doc(db, "reports", reportToDelete.value.id);
    await deleteDoc(reportRef);

    // Remove from local array
    reports.value = reports.value.filter(
      (report) => report.id !== reportToDelete.value.id
    );

    showDeleteConfirmation.value = false;
    reportToDelete.value = null;

    // ✅ Show success modal
    deleteStatus.value = "success";
    showDeleteStatus.value = true;

  } catch (err) {
    console.error("Error deleting report:", err);

    // ❌ Show error modal
    deleteStatus.value = "error";
    showDeleteStatus.value = true;
  }

  // Auto-close modal after 2.5 seconds
  setTimeout(() => {
    showDeleteStatus.value = false;
  }, 2500);
};


// Export reports
const exportReports = () => {
  alert("Export functionality will be implemented in a future update.");
};

// Export single report
const exportSingleReport = (report) => {
  alert(`Export functionality for ${formatDiseaseName(report.disease)} will be implemented in a future update.`);
};

// Print report
const printReport = () => {
  alert("Print functionality will be implemented in a future update.");
};

// Share report
const shareReport = (report) => {
  alert(`Sharing functionality for ${formatDiseaseName(report.disease)} will be implemented in a future update.`);
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

// Format farm area
const formatFarmArea = (area) => {
  if (!area) return 'Unknown area';
  
  // Replace underscores with spaces and capitalize each word
  return area
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get status class
const getStatusClass = (status) => {
  if (!status) return 'bg-gray-500/20 text-gray-400';
  
  switch (status) {
    case 'Needs Action':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'In Progress':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'Treated':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'Monitoring':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'Resolved':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

// Edit status
const editStatus = () => {
  editedStatus.value = selectedReport.value.status || '';
  isEditingStatus.value = true;
};

// Cancel edit status
const cancelEditStatus = () => {
  isEditingStatus.value = false;
};

// Select status
const selectStatus = (status) => {
  editedStatus.value = status;
};

// Save status
const saveStatus = async () => {
  try {
    // Update the local report
    selectedReport.value.status = editedStatus.value;
    
    // Update in Firestore (in a real implementation)
    // const reportRef = doc(db, "reports", selectedReport.value.id);
    // await updateDoc(reportRef, {
    //   status: editedStatus.value
    // });
    
    isEditingStatus.value = false;
  } catch (err) {
    console.error("Error saving status:", err);
    alert("Failed to save status. Please try again.");
  }
};

// Edit action
const editAction = () => {
  editedAction.value = selectedReport.value.actionTaken || '';
  isEditingAction.value = true;
};

// Cancel edit action
const cancelEditAction = () => {
  isEditingAction.value = false;
};

// Save action
const saveAction = async () => {
  try {
    // Update the local report
    selectedReport.value.actionTaken = editedAction.value;
    
    // Update in Firestore (in a real implementation)
    // const reportRef = doc(db, "reports", selectedReport.value.id);
    // await updateDoc(reportRef, {
    //   actionTaken: editedAction.value
    // });
    
    isEditingAction.value = false;
  } catch (err) {
    console.error("Error saving action:", err);
    alert("Failed to save action. Please try again.");
  }
};

// Reset pagination when filters change
watch([searchQuery, dateFilter, diseaseFilter, severityFilter, tagFilter, farmAreaFilter, sortBy], () => {
  currentPage.value = 1;
});

// Add these new helper functions
const formatMonthName = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const formatMonthShort = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

// Lifecycle hooks
onMounted(async () => {
  console.log("Reports component mounted");
  await fetchUserData();
  await fetchReports();
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

/* Hide scrollbar for mobile horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
