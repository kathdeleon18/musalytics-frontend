<template>
  <div class="min-h-screen bg-white text-gray-900 pt-16">
    <UserNavbar
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :profile-image="profileImage"
      @sign-out="showSignOutConfirmation = true"
    />

    <div class="pt-2 md:pl-64 flex">
      <UserSidebar />

      <main class="flex-1 p-6 overflow-auto">
        <div class="md:hidden mb-6">
          <h2 class="text-4xl font-semibold mb-1">
              <span class="text-[#283618]">{{ $t('dashboard.header.welcome') }}</span>
              <span class="text-[#ffb902]">{{ firstName }}</span>
          </h2>
          <p class="text-gray-400 text-base">{{ $t('dashboard.header.overview') }}</p>
        </div>

        <div v-if="isLoading">
          <SkeletonLoader />
        </div>

        <div v-else-if="error" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-lg mx-auto">
            <h3 class="font-medium text-lg mb-2">{{ $t('dashboard.errorTitle') }}</h3>
            <p>{{ error }}</p>
            <button
              @click="fetchUserData"
              class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors"
            >
              {{ $t('common.tryAgain') }}
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="hidden md:block md:col-span-12">
            <h2 class="text-4xl font-semibold mb-1">
              <span class="text-[#283618]">{{ $t('dashboard.header.welcome') }}</span>
              <span class="text-[#ffb902]">{{ firstName }}</span>
            </h2>

            <p class="text-gray-400">{{ $t('dashboard.header.overview') }}</p>
          </div>

          <!-- CTA Section -->
          <div class="md:col-span-12">
            <div class="p-6 rounded-xl shadow" style="background-color: #283618;">
              <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="mb-4 md:mb-0 md:mr-6">
                  <h3 class="text-xl font-semibold mb-2 text-white">{{ $t('dashboard.cta.title') }}</h3>
                  <p class="text-gray-300 max-w-2xl">{{ $t('dashboard.cta.description') }}</p>
                </div>
                <router-link
                  to="/user/scan"
                  class="px-6 py-3 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ $t('dashboard.cta.button') }}
                </router-link>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="md:col-span-4">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">{{ $t('dashboard.stats.totalScans') }}</h3>
                <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">{{ $t('dashboard.stats.allTime') }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-3xl font-bold text-emerald-600">{{ stats.totalScans }}</div>
                <div class="text-sm text-gray-600">
                  <div class="mb-1">{{ $t('dashboard.stats.scansThisWeek') }}: {{ stats.weeklyScans }}</div>
                  <div class="h-2 w-36 bg-gray-400 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-600 rounded-full" :style="{ width: Math.min((stats.weeklyScans / Math.max(stats.totalScans, 1)) * 100, 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-4">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">{{ $t('dashboard.stats.plantationHealth') }}</h3>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="stats.healthScore > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'"
                >
                  {{ stats.healthScore > 70 ? $t('dashboard.stats.good') : $t('dashboard.stats.attention') }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-3xl font-bold" :class="stats.healthScore > 70 ? 'text-emerald-400' : 'text-yellow-400'">{{ stats.healthScore }}%</div>
                <div class="text-sm text-gray-600">
                  <div>{{ $t('dashboard.stats.healthy') }}: <span class="text-emerald-400">{{ 100 - stats.detectionRate }}%</span></div>
                  <div>{{ $t('dashboard.stats.atRisk') }}: <span class="text-yellow-400">{{ stats.detectionRate }}%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-4">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">{{ $t('dashboard.stats.weeklyStats') }}</h3>
                <span class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">{{ $t('dashboard.stats.thisWeek') }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-3xl font-bold text-purple-400">{{ stats.weeklyScans }}</div>
                <div class="text-sm text-gray-600">
                  <div>{{ $t('dashboard.stats.scansCompleted') }}</div>
                  <div>{{ $t('dashboard.stats.issuesDetected') }}: <span class="text-purple-400">{{ stats.weeklyDetections }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Analytics Section -->
          <div class="md:col-span-8">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-lg">{{ $t('dashboard.analytics.title') }}</h3>
                <div class="flex items-center space-x-2">
                  <button 
                    @click="setAnalyticsTimeframe('week')" 
                    class="px-3 py-1 text-xs rounded-md transition-colors"
                    :class="analyticsTimeframe === 'week' ? 'bg-[#606c38] text-white' : 'bg-gray-400 text-white hover:bg-gray-400/20'"
                  >
                    {{ $t('dashboard.analytics.week') }}
                  </button>
                  <button 
                    @click="setAnalyticsTimeframe('month')" 
                    class="px-3 py-1 text-xs rounded-md transition-colors"
                    :class="analyticsTimeframe === 'month' ? 'bg-[#606c38] text-white' : 'bg-gray-400 text-white hover:bg-gray-400/20'"
                  >
                    {{ $t('dashboard.analytics.month') }}
                  </button>
                  <button 
                    @click="setAnalyticsTimeframe('year')" 
                    class="px-3 py-1 text-xs rounded-md transition-colors"
                    :class="analyticsTimeframe === 'year' ? 'bg-[#606c38] text-white' : 'bg-gray-400 text-white hover:bg-gray-400/20'"
                  >
                    {{ $t('dashboard.analytics.year') }}
                  </button>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Disease Distribution Chart -->
                <div class="h-52">
                  <div class="text-xs text-gray-500 mb-2">{{ $t('dashboard.analytics.distributionTitle') }}</div>
                  <div v-if="diseaseDistribution.length > 0" class="h-full flex flex-col justify-center">
                    <div class="flex items-end justify-between h-40 px-4 border-b border-gray-600">
                      <div
                        v-for="(disease, index) in diseaseDistribution.slice(0, 5)"
                        :key="disease.name"
                        class="flex flex-col items-center justify-end"
                        :style="{ height: (disease.percentage * 0.8) + 20 + '%' }"
                      >
                        <div class="text-xs text-gray-400 mb-1">{{ disease.percentage }}%</div>
                        <div class="w-8 rounded-t-sm" :style="{ height: disease.percentage * 0.8 + '%', backgroundColor: disease.color }"></div>
                        <div class="mt-1 text-xs text-gray-400 truncate w-16 text-center">{{ disease.name }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="h-full flex items-center justify-center text-gray-500 text-sm">
                    {{ $t('dashboard.analytics.noData') }}
                  </div>
                </div>

                <!-- Disease Stats with Trends -->
                <div class="flex flex-col justify-center">
                  <div class="text-xs text-gray-500 mb-4">{{ $t('dashboard.analytics.statsTitle') }}</div>
                  <div v-if="diseaseDistribution.length > 0" class="space-y-4">
                    <div v-for="disease in diseaseDistribution.slice(0, 4)" :key="disease.name" class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: disease.color }"></div>
                        <span class="text-sm">{{ disease.name }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium">{{ disease.percentage }}%</span>
                        <span class="text-xs flex items-center" :class="disease.trend > 0 ? 'text-red-400' : 'text-green-400'">
                          <svg v-if="disease.trend > 0" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {{ Math.abs(disease.trend) }}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-gray-500 text-sm">
                    {{ $t('dashboard.analytics.noData') }}
                  </div>
                </div>
              </div>

              <!-- Additional Analytics Metrics -->
              <div class="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-400/50">
                <div class="text-center">
                  <div class="text-2xl font-bold text-emerald-400">{{ stats.healthScore }}%</div>
                  <div class="text-xs text-gray-400 mt-1">{{ $t('dashboard.analytics.healthScore') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-400">{{ stats.weeklyDetections }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ $t('dashboard.analytics.weeklyDetections') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-400">{{ stats.topDisease.count }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ $t('dashboard.analytics.topDisease') }}: {{ stats.topDisease.name }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-400">{{ stats.highRiskAreas }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ $t('dashboard.analytics.highRiskAreas') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Recommended Actions Section -->
          <div class="md:col-span-4">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-lg">{{ $t('dashboard.actions.title') }}</h3>
                <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{{ $t('dashboard.actions.priority') }}</span>
              </div>
              
              <div class="space-y-4">
                <!-- High Priority Actions -->
                <div v-if="highPriorityActions.length > 0">
                  <h4 class="text-sm font-medium text-red-400 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ $t('dashboard.actions.highPriority') }}
                  </h4>
                  <div v-for="action in highPriorityActions" :key="action.id" class="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div class="flex items-start">
                      <span class="h-2 w-2 rounded-full bg-red-400 mt-2 mr-2 flex-shrink-0"></span>
                      <div>
                        <p class="text-sm font-medium">{{ action.title }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ action.description }}</p>
                        <div class="mt-2 flex items-center text-xs text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ $t('dashboard.actions.timeframe') }}: {{ action.timeframe }}
                        </div>
                        <button v-if="action.actionLink" @click="navigateTo(action.actionLink)" class="mt-2 text-xs text-red-300 hover:text-red-200 flex items-center">
                          {{ $t('dashboard.actions.takeAction') }}
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Medium Priority Actions -->
                <div v-if="mediumPriorityActions.length > 0">
                  <h4 class="text-sm font-medium text-yellow-400 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ $t('dashboard.actions.mediumPriority') }}
                  </h4>
                  <div v-for="action in mediumPriorityActions" :key="action.id" class="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div class="flex items-start">
                      <span class="h-2 w-2 rounded-full bg-yellow-400 mt-2 mr-2 flex-shrink-0"></span>
                      <div>
                        <p class="text-sm font-medium">{{ action.title }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ action.description }}</p>
                        <div class="mt-2 flex items-center text-xs text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ $t('dashboard.actions.timeframe') }}: {{ action.timeframe }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Low Priority Actions -->
                <div v-if="lowPriorityActions.length > 0">
                  <h4 class="text-sm font-medium text-emerald-400 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ $t('dashboard.actions.lowPriority') }}
                  </h4>
                  <div v-for="action in lowPriorityActions" :key="action.id" class="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div class="flex items-start">
                      <span class="h-2 w-2 rounded-full bg-emerald-400 mt-2 mr-2 flex-shrink-0"></span>
                      <div>
                        <p class="text-sm font-medium">{{ action.title }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ action.description }}</p>
                        <div class="mt-2 flex items-center text-xs text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ $t('dashboard.actions.timeframe') }}: {{ action.timeframe }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="highPriorityActions.length === 0 && mediumPriorityActions.length === 0 && lowPriorityActions.length === 0" class="text-center py-4 text-gray-500 text-sm">
                  {{ $t('dashboard.actions.noActions') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Detections -->
          <div class="md:col-span-8">
            <div class="bg-white rounded-xl shadow p-5 h-full">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-lg">{{ $t('dashboard.recentDetections.title') }}</h3>
                <router-link to="/user/scan-history" class="text-sm text-[#283618] hover:text-[#606c38]">{{ $t('common.viewAll') }}</router-link>
              </div>
              <div v-if="recentDetections.length === 0" class="text-center py-8 text-gray-500">
                {{ $t('dashboard.recentDetections.noDetections') }}
              </div>
              <div v-else class="space-y-3 mt-2">
                <div v-for="detection in recentDetections" :key="detection.id" class="p-3 bg-white hover:bg-[#f7f2df] rounded-xl border border-gray-400 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="h-12 w-12 bg-gray-600 rounded-md flex-shrink-0 overflow-hidden">
                      <img :src="detection.imageUrl || '/placeholder.svg?height=48&width=48'" class="h-full w-full object-cover" :alt="detection.disease" />
                    </div>
                    <div>
                      <p class="font-medium text-[#606c38] ">{{ formatDiseaseName(detection.disease) }}</p>
                      <p class="text-xs text-gray-600">{{ detection.farmArea }} {{ formatDate(detection.timestamp) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <span class="px-2 py-1 text-xs rounded-full mr-3" :class="getSeverityClass(detection.severity)">
                      {{ $t(`reports.filters.severity.${detection.severity.toLowerCase()}`) }}
                    </span>
                    <router-link :to="`/user/report/${detection.id}`" class="p-1.5 rounded-md  transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weather and General Info -->
          <div class="md:col-span-4 space-y-6">
            <div class="bg-white rounded-xl shadow p-5 ">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-lg">{{ $t('dashboard.weather.title') }}</h3>
                <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{{ $t('dashboard.weather.region') }}</span>
              </div>
              <div class="flex items-center space-x-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <div>
                  <p class="font-medium">{{ $t('dashboard.weather.forecast') }}</p>
                  <p class="text-xs text-gray-400">{{ $t('dashboard.weather.duration') }}</p>
                </div>
              </div>
              <div class="text-sm text-gray-600 mb-3">
                <p>{{ $t('dashboard.weather.recommendation') }}</p>
              </div>
              <router-link
                to="/user/weather"
                class="block w-full py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm transition-colors text-center"
              >
                {{ $t('dashboard.weather.button') }}
              </router-link>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium">{{ $t('dashboard.quickStats.title') }}</h3>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-emerald-100/20 border border-emerald-600/50 rounded-xl">
                  <div class="text-2xl font-bold text-emerald-400">{{ stats.healthyPlants }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ $t('dashboard.quickStats.healthyPlants') }}</div>
                </div>
                <div class="text-center p-3 bg-yellow-100/20 border border-yellow-600/50 rounded-xl">
                  <div class="text-2xl font-bold text-yellow-400">{{ stats.atRiskPlants }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ $t('dashboard.quickStats.atRiskPlants') }}</div>
                </div>
                <div class="text-center p-3 bg-red-100/20 border border-red-600/50 rounded-xl">
                  <div class="text-2xl font-bold text-red-400">{{ stats.infectedPlants }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ $t('dashboard.quickStats.infectedPlants') }}</div>
                </div>
                <div class="text-center p-3 bg-purple-100/20 border border-purple-600/50 rounded-xl">
                  <div class="text-2xl font-bold text-purple-400">{{ stats.treatedPlants }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ $t('dashboard.quickStats.treatedPlants') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <SignOutConfirmation
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';

const router = useRouter();
const { t, te } = useI18n();

// State
const isLoading = ref(true);
const error = ref(null);
const showSignOutConfirmation = ref(false);
const userScans = ref([]);
const analyticsTimeframe = ref('month'); // week, month, year

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const userRole = ref('User');
const location = ref(null);
const createdAt = ref(null);
const profileImage = ref(null);
const notificationCount = ref(0);

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

// ---------- Helpers (with i18n-safe fallback) ----------
const formatDiseaseName = (disease) => {
  if (!disease) return t('common.na');
  const fallback = String(disease)
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
  const norm = String(disease).toLowerCase().replace(/\s+/g, '_');
  const key = `reports.filters.disease.${norm}`;
  return te(key) ? t(key) : fallback;
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const getSeverityClass = (severity) => {
  switch (severity) {
    case 'High': return 'bg-red-500/20 text-red-400';
    case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
    case 'Low': return 'bg-emerald-500/20 text-emerald-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getDiseaseColor = (disease) => {
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < disease.length; i++) {
    hash = disease.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const setAnalyticsTimeframe = (timeframe) => {
  analyticsTimeframe.value = timeframe;
};

const navigateTo = (path) => {
  router.push(path);
};

// ---------- Stats calculations ----------
const stats = computed(() => {
  const totalScans = userScans.value.length;
  const healthyScans = userScans.value.filter(scan =>
    scan.disease && scan.disease.toLowerCase().includes('healthy')
  ).length;

  // Weekly stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyScans = userScans.value.filter(scan => {
    const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
    return scanDate >= oneWeekAgo;
  });

  const weeklyDetections = weeklyScans.filter(scan =>
    scan.disease && !scan.disease.toLowerCase().includes('healthy')
  ).length;

  const healthScore = totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 100;
  const detectionRate = totalScans > 0 ? Math.round(((totalScans - healthyScans) / totalScans) * 100) : 0;

  // Top disease
  const diseaseCounts = {};
  userScans.value.forEach(scan => {
    if (scan.disease && !scan.disease.toLowerCase().includes('healthy')) {
      diseaseCounts[scan.disease] = (diseaseCounts[scan.disease] || 0) + 1;
    }
  });

  let topDisease = { name: 'None', count: 0 };
  if (Object.keys(diseaseCounts).length > 0) {
    const topEntry = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];
    topDisease = { name: formatDiseaseName(topEntry[0]), count: topEntry[1] };
  }

  // High risk areas (>= 3 detections)
  const areaCounts = {};
  userScans.value.forEach(scan => {
    if (scan.disease && !scan.disease.toLowerCase().includes('healthy') && scan.farmArea) {
      areaCounts[scan.farmArea] = (areaCounts[scan.farmArea] || 0) + 1;
    }
  });
  const highRiskAreas = Object.values(areaCounts).filter(count => count >= 3).length;

  // Simulated plant counts
 const healthyPlants = userScans.value.filter(scan => 
  scan.disease?.toLowerCase().includes('healthy')
).length;

const atRiskPlants = userScans.value.filter(scan => 
  scan.severity === 'Medium'
).length;

const infectedPlants = userScans.value.filter(scan => 
  scan.severity === 'High'
).length;

const treatedPlants = userScans.value.filter(scan => 
  scan.status === 'Treated'
).length;

  return {
    totalScans,
    weeklyScans: weeklyScans.length,
    weeklyDetections,
    healthScore,
    detectionRate,
    topDisease,
    highRiskAreas,
    healthyPlants,
    atRiskPlants,
    infectedPlants,
    treatedPlants
  };
});

// Recent detections (non-healthy)
const recentDetections = computed(() => {
  return userScans.value
    .filter(scan => scan.disease && !scan.disease.toLowerCase().includes('healthy'))
    .sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB - dateA;
    })
    .slice(0, 3);
});

// Disease distribution
const diseaseDistribution = computed(() => {
  const diseaseCounts = {};
  userScans.value.forEach(scan => {
    if (scan.disease && !scan.disease.toLowerCase().includes('healthy')) {
      diseaseCounts[scan.disease] = (diseaseCounts[scan.disease] || 0) + 1;
    }
  });

  const totalDetections = Object.values(diseaseCounts).reduce((sum, count) => sum + count, 0);
  if (totalDetections === 0) return [];

  return Object.entries(diseaseCounts)
    .map(([name, count]) => ({
      name: formatDiseaseName(name),
      count,
      percentage: Math.round((count / totalDetections) * 100),
      trend: Math.floor(Math.random() * 21) - 10, // -10..10 simulated trend
      color: getDiseaseColor(name)
    }))
    .sort((a, b) => b.count - a.count);
});

// Recommended actions
const highPriorityActions = computed(() => {
  const actions = [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentHighSeverity = userScans.value.filter(scan => {
    const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
    return scanDate >= oneWeekAgo && scan.severity === 'High' && scan.disease && !scan.disease.toLowerCase().includes('healthy');
  });

  if (recentHighSeverity.length > 0) {
    const diseases = {};
    recentHighSeverity.forEach(scan => {
      diseases[scan.disease] = (diseases[scan.disease] || 0) + 1;
    });

    Object.keys(diseases).forEach(disease => {
      actions.push({
        id: `high-${disease}`,
        title: t('dashboard.actions.highSeverityTitle', { disease: formatDiseaseName(disease) }),
        description: t('dashboard.actions.highSeverityDesc', {
          count: diseases[disease],
          disease: formatDiseaseName(disease)
        }),
        timeframe: t('dashboard.actions.timeframes.immediate'),
        priority: 'high',
        actionLink: '/user/learning'
      });
    });
  }

  const areaCounts = {};
  userScans.value.forEach(scan => {
    if (scan.disease && !scan.disease.toLowerCase().includes('healthy') && scan.farmArea) {
      areaCounts[scan.farmArea] = (areaCounts[scan.farmArea] || 0) + 1;
    }
  });

  Object.entries(areaCounts).forEach(([area, count]) => {
    if (count >= 3) {
      actions.push({
        id: `area-${area}`,
        title: t('dashboard.actions.hotspotTitle', { area: formatDiseaseName(area) }),
        description: t('dashboard.actions.hotspotDesc', {
          area: formatDiseaseName(area),
          count: count
        }),
        timeframe: t('dashboard.actions.timeframes.urgent'),
        priority: 'high',
        actionLink: '/user/analytics'
      });
    }
  });

  return actions;
});

const mediumPriorityActions = computed(() => {
  const actions = [];
  const trendingDiseases = diseaseDistribution.value.filter(d => d.trend > 5); // fixed threshold

  trendingDiseases.forEach(disease => {
    actions.push({
      id: `trend-${disease.name}`,
      title: t('dashboard.actions.trendingTitle', { disease: disease.name }),
      description: t('dashboard.actions.trendingDesc', {
        disease: disease.name,
        trend: disease.trend
      }),
      timeframe: t('dashboard.actions.timeframes.soon'),
      priority: 'medium'
    });
  });

  const mediumSeverity = userScans.value.filter(scan =>
    scan.severity === 'Medium' && scan.disease && !scan.disease.toLowerCase().includes('healthy')
  ).length;

  if (mediumSeverity > 2) {
    actions.push({
      id: 'medium-severity',
      title: t('dashboard.actions.mediumSeverityTitle'),
      description: t('dashboard.actions.mediumSeverityDesc', { count: mediumSeverity }),
      timeframe: t('dashboard.actions.timeframes.week'),
      priority: 'medium'
    });
  }

  return actions;
});

const lowPriorityActions = computed(() => {
  const actions = [];

  if (stats.value.healthScore < 80) {
    actions.push({
      id: 'improve-health',
      title: t('dashboard.actions.improveHealthTitle'),
      description: t('dashboard.actions.improveHealthDesc'),
      timeframe: t('dashboard.actions.timeframes.month'),
      priority: 'low'
    });
  }

  const lastScanDate = userScans.value.length > 0
    ? (userScans.value[0].timestamp?.toDate ? userScans.value[0].timestamp.toDate() : new Date(userScans.value[0].timestamp))
    : null;

  if (!lastScanDate || (new Date() - lastScanDate) > (7 * 24 * 60 * 60 * 1000)) {
    actions.push({
      id: 'regular-scanning',
      title: t('dashboard.actions.regularScanningTitle'),
      description: t('dashboard.actions.regularScanningDesc'),
      timeframe: t('dashboard.actions.timeframes.week'),
      priority: 'low',
      actionLink: '/user/scan'
    });
  }

  actions.push({
    id: 'best-practices',
    title: t('dashboard.actions.bestPracticesTitle'),
    description: t('dashboard.actions.bestPracticesDesc'),
    timeframe: t('dashboard.actions.timeframes.ongoing'),
    priority: 'low'
  });

  return actions;
});

// ---------- Data fetching ----------
const fetchUserData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (!auth.currentUser) {
      error.value = t('common.error.loginRequired');
      isLoading.value = false;
      router.push('/signin');
      return;
    }

    // User profile
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('authUid', '==', auth.currentUser.uid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error(t('common.error.profileNotFound'));
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    userRole.value = userData.role === 'professional' ? 'Professional' : 'User';
    location.value = userData.location || null;
    createdAt.value = userData.createdAt || null;
    profileImage.value = userData.profileImage || null;

    if (userData.role === 'professional') {
      router.push('/professional/dashboard');
      return;
    }

    // User scans
    const scansRef = collection(db, 'scan_history');
    const scansQuery = query(
      scansRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const scansSnapshot = await getDocs(scansQuery);
    userScans.value = scansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Notification count: high severity detections in last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    notificationCount.value = userScans.value.filter(scan => {
      const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
      return scanDate >= oneWeekAgo && scan.severity === 'High' && scan.disease && !scan.disease.toLowerCase().includes('healthy');
    }).length;

  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = err.message || t('common.error.userDataFailed');
  } finally {
    isLoading.value = false;
  }
};

// ---------- Sign out ----------
const handleSignOut = async () => {
  try {
    showSignOutConfirmation.value = false;
    localStorage.removeItem('user');
    await signOut(auth);
    window.location.href = '/signin';
  } catch (err) {
    console.error('Error signing out:', err);
    error.value = t('common.error.signOutFailed');
  }
};

onMounted(() => {
  fetchUserData();
});
</script>
