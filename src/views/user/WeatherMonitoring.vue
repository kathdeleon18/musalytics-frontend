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
      <!-- Main Weather Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <header class="mb-6">
          <h1 class="mb-2 text-2xl font-semibold text-[#283618]">{{ $t('weather.header.title') }}</h1>
          <p class="text-gray-400 text-base">{{ $t('weather.header.description') }}</p>
        </header>
        <!-- Loading State -->
        <div v-if="isLoading">
          <SkeletonLoader />
        </div>
        <!-- Error State -->
        <div v-else-if="error" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class="rounded-xl bg-red-500/20 border border-red-500 text-red-600 px-6 py-4 rounded-lg max-w-lg mx-auto">
            <h3 class="font-medium text-lg mb-2">{{ $t('weather.error') }}</h3>
            <p>{{ error }}</p>
            <button
              @click="refreshWeather"
              class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors"
            >
              {{ $t('common.tryAgain') }}
            </button>
          </div>
        </div>
        <!-- Weather Content -->
        <div v-else>
          <!-- Location Display -->
          <div class="bg-[#283618] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c9d4a3] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span class="text-white font-semibold text-lg">{{ userFarmLocation.name }}</span>
                <div class="text-xs text-white mt-0.5">{{ userFarmLocation.coordinates }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button
                @click="refreshWeather"
                class="flex items-center px-3 py-1.5 text-[#f7f2df] rounded-md text-sm transition-colors"
                :disabled="isRefreshing"
              >
                <svg v-if="isRefreshing" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ isRefreshing ? $t('weather.refreshing') : $t('weather.refresh') }}
              </button>
              <div class="text-sm text-gray-400 flex items-center">
                <span>{{ $t('weather.lastUpdated') }} {{ lastUpdated }}</span>
                <span v-if="autoRefreshEnabled" class="ml-2 text-xs flex items-center">

                  <span class="text-[#c9d4a3] font-bold">{{ countdownMinutes }}m</span>
                </span>
              </div>
            </div>
          </div>
          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- 2.5.1 Current Weather -->
            <div class="md:col-span-8">
              <!-- Mobile Layout: Separate sections -->
              <div class="block md:hidden space-y-6">
                <!-- Current Weather Card with Integrated Forecast -->
                <div class="bg-gradient-to-br from-[#606c38] to-[#283618] rounded-xl shadow-lg p-6 text-white">
                  <div class="mb-6">
                    <h3 class="text-xl font-medium text-white">{{ $t('weather.current.title') }}</h3>
                    <div class="text-sm text-white/80 mt-1">{{ currentDate }}</div>
                  </div>
                  <div class="grid grid-cols-1 gap-6">
                    <!-- Current Conditions -->
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="text-5xl font-bold text-white">{{ currentWeather.temperature }}°C</div>
                        <div class="text-base text-white/90">{{ currentWeather.condition }}</div>
                        <div class="text-sm text-white/80">{{ $t('weather.current.feelsLike') }} {{ currentWeather.feelsLike }}°C</div>
                      </div>
                      <div class="ml-4">
                        <img v-if="currentWeather.simplifiedCondition === 'Clear'" src="/images/clear.png" alt="Clear" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Partly Cloudy'" src="/images/partlycloudy.png" alt="Partly Cloudy" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Cloudy'" src="/images/cloudy.png" alt="Cloudy" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Rain'" src="/images/rain.png" alt="Rain" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Thunderstorm'" src="/images/thunderstorm.png" alt="Thunderstorm" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Snow'" src="/images/snow.png" alt="Snow" class="h-20 w-20" />
                        <img v-else-if="currentWeather.simplifiedCondition === 'Fog'" src="/images/fog.png" alt="Fog" class="h-20 w-20" />
                        <img v-else src="/images/partlycloudy.png" alt="Default Weather" class="h-20 w-20" />
                      </div>
                    </div>

                    <!-- Weather Details -->
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Humidity -->
                      <div class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div class="text-sm text-white/80 mb-1">{{ $t('weather.current.humidity') }}</div>
                        <div class="flex items-center">
                          <img src="/images/humidity.png" alt="Humidity" class="h-5 w-5 mr-2 brightness-0 invert" />
                          <span class="text-lg font-medium text-white">{{ currentWeather.humidity }}%</span>
                        </div>
                      </div>

                      <!-- Wind -->
                      <div class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div class="text-sm text-white/80 mb-1">{{ $t('weather.current.wind') }}</div>
                        <div class="flex items-center">
                          <img src="/images/wind.png" alt="Wind" class="h-5 w-5 mr-2 brightness-0 invert" />
                          <span class="text-lg font-medium text-white">{{ currentWeather.windSpeed }} km/h</span>
                        </div>
                      </div>

                      <!-- Rainfall -->
                      <div class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div class="text-sm text-white/80 mb-1">{{ $t('weather.current.rainfall') }}</div>
                        <div class="flex items-center">
                          <img src="/images/rainfall.png" alt="Rainfall" class="h-5 w-5 mr-2 brightness-0 invert" />
                          <span class="text-lg font-medium text-white">{{ currentWeather.rainfall }} mm</span>
                        </div>
                      </div>

                      <!-- UV Index -->
                      <div class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div class="text-sm text-white/80 mb-1">{{ $t('weather.current.uvIndex') }}</div>
                        <div class="flex items-center">
                          <img src="/images/uvindex.png" alt="UV Index" class="h-5 w-5 mr-2 brightness-0 invert" />
                          <span class="text-lg font-medium text-white">{{ currentWeather.uvIndex }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 7-Day Forecast Carousel -->
                    <div class="mt-6 pt-6 border-t border-white/20">
                      <h4 class="text-lg font-medium mb-4 text-white">{{ $t('weather.forecast.dailyTitle') }}</h4>
                      <div v-if="forecast.length > 0" class="relative overflow-hidden">
                        <div class="flex animate-scroll space-x-4">
                          <div
                            v-for="(day, index) in [...forecast, ...forecast]"
                            :key="`${index}-${day.day}`"
                            class="flex-shrink-0 w-28 forecast-card-3d group cursor-pointer"
                          >
                            <div class="forecast-card-inner">
                              <div class="font-medium text-white text-sm mb-2">{{ day.day }}</div>
                              <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center relative">
                                <div class="absolute inset-0 bg-white/10 rounded-full blur-sm"></div>
                                <img 
                                  v-if="day.condition === 'Clear'" 
                                  src="/images/clear.png" 
                                  alt="Clear" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else-if="day.condition === 'Partly Cloudy'" 
                                  src="/images/partlycloudy.png" 
                                  alt="Partly Cloudy" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else-if="day.condition === 'Cloudy'" 
                                  src="/images/cloudy.png" 
                                  alt="Cloudy" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else-if="day.condition === 'Rain'" 
                                  src="/images/rain.png" 
                                  alt="Rain" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else-if="day.condition === 'Thunderstorm'" 
                                  src="/images/thunderstorm.png" 
                                  alt="Thunderstorm" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else-if="day.condition === 'Snow'" 
                                  src="/images/snow.png" 
                                  alt="Snow" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                                <img 
                                  v-else 
                                  src="/images/cloudy.png" 
                                  alt="Default" 
                                  class="h-6 w-6 relative z-10 weather-icon-3d" 
                                />
                              </div>
                              <div class="text-lg font-bold text-white mb-1">{{ day.highTemp }}°</div>
                              <div class="text-sm text-white/80 mb-2">{{ day.lowTemp }}°</div>
                              <div class="text-xs text-white/70 mb-2 truncate">{{ day.condition }}</div>
                              <div class="flex justify-center items-center text-xs text-white/60">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                {{ day.precipitation }}%
                              </div>
                              <!-- UV Index for forecast -->
                              <div class="flex justify-center items-center mt-1 text-xs text-white/60">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                UV: {{ day.uvIndex }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center py-4 text-white/70">
                        <p>{{ $t('weather.forecast.noForecast') }}</p>
                        <p class="text-sm mt-1">{{ $t('weather.forecast.noForecastDesc') }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Banana Growth Conditions and 24-Hour Forecast Combined Card -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                  <!-- Banana Growth Conditions -->
                  <div class="mb-6">
                    <h4 class="text-md font-medium mb-4 text-[#283618]">{{ $t('weather.growth.title') }}</h4>
                    <div class="grid grid-cols-1 gap-4">
                      <div class="bg-white rounded-xl border border-gray-400 p-4">
                        <div class="flex justify-between items-center mb-2">
                          <div class="text-sm font-medium">{{ $t('weather.growth.temp') }}</div>
                          <div
                            class="px-2 py-0.5 text-xs rounded-full"
                            :class="getConditionClass(growthConditions.temperature.status)"
                          >
                            {{ growthConditions.temperature.status }}
                          </div>
                        </div>
                        <p class="text-sm text-gray-400">{{ growthConditions.temperature.message }}</p>
                      </div>
                      <div class="bg-white rounded-xl border border-gray-400 p-4">
                        <div class="flex justify-between items-center mb-2">
                          <div class="text-sm font-medium">{{ $t('weather.growth.humidity') }}</div>
                          <div
                            class="px-2 py-0.5 text-xs rounded-full"
                            :class="getConditionClass(growthConditions.humidity.status)"
                          >
                            {{ growthConditions.humidity.status }}
                          </div>
                        </div>
                        <p class="text-sm text-gray-400">{{ growthConditions.humidity.message }}</p>
                      </div>
                      <div class="bg-white rounded-xl border border-gray-400 p-4">
                        <div class="flex justify-between items-center mb-2">
                          <div class="text-sm font-medium">{{ $t('weather.growth.rainfall') }}</div>
                          <div
                            class="px-2 py-0.5 text-xs rounded-full"
                            :class="getConditionClass(growthConditions.rainfall.status)"
                          >
                            {{ growthConditions.rainfall.status }}
                          </div>
                        </div>
                        <p class="text-sm text-gray-400">{{ growthConditions.rainfall.message }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 24-Hour Temperature Forecast -->
                  <div class="pt-6 border-t border-gray-400/50">
                    <h4 class="text-md font-medium mb-4 text-[#283618]">{{ $t('weather.forecast.hourlyTitle') }}</h4>
                    <div class="bg-white rounded-lg p-4 h-80 relative">
                      <Line
                        :data="temperatureChartData"
                        :options="temperatureChartOptions"
                        class="h-full w-full"
                      />
                      <!-- Current time indicator -->
                      <div
                        class="absolute top-0 bottom-0 w-px bg-yellow-500 translate-x-[-0.5px]"
                        :style="{ left: currentHourLinePosition }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Layout: Original combined layout -->
              <div class="hidden md:block">
                <div class="bg-white rounded-xl shadow-lg p-6 h-full">
                <div class="flex justify-between items-start mb-6">
                  <h3 class="text-lg font-medium text-[#283618]">{{ $t('weather.current.title') }}</h3>
                  <div class="text-sm text-gray-400">{{ currentDate }}</div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Current Conditions -->
              <div class="flex items-center">
                <div class="mr-4">
                  <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <img v-if="currentWeather.simplifiedCondition === 'Clear'" src="/images/clear.png" alt="Clear" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Partly Cloudy'" src="/images/partlycloudy.png" alt="Partly Cloudy" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Cloudy'" src="/images/cloudy.png" alt="Cloudy" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Rain'" src="/images/rain.png" alt="Rain" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Thunderstorm'" src="/images/thunderstorm.png" alt="Thunderstorm" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Snow'" src="/images/snow.png" alt="Snow" class="h-12 w-12" />
                    <img v-else-if="currentWeather.simplifiedCondition === 'Fog'" src="/images/fog.png" alt="Fog" class="h-12 w-12" />
                    <img v-else src="/images/partlycloudy.png" alt="Default Weather" class="h-12 w-12" />
                  </div>
                </div>
                <div>
                  <div class="text-4xl font-bold text-[#283618]">{{ currentWeather.temperature }}°C</div>
                  <div class="text-base text-[#606c38]">{{ currentWeather.condition }}</div>
                  <div class="text-sm text-gray-600">{{ $t('weather.current.feelsLike') }} {{ currentWeather.feelsLike }}°C</div>
                </div>
              </div>

                    <!-- Weather Details -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Humidity -->
                <div class="p-3">
                  <div class="text-sm text-gray-400 mb-1">{{ $t('weather.current.humidity') }}</div>
                  <div class="flex items-center">
                    <img src="/images/humidity.png" alt="Humidity" class="h-5 w-5 mr-2" />
                    <span class="text-lg font-medium">{{ currentWeather.humidity }}%</span>
                  </div>
                </div>

                <!-- Wind -->
                <div class="p-3">
                  <div class="text-sm text-gray-400 mb-1">{{ $t('weather.current.wind') }}</div>
                  <div class="flex items-center">
                    <img src="/images/wind.png" alt="Wind" class="h-5 w-5 mr-2" />
                    <span class="text-lg font-medium">{{ currentWeather.windSpeed }} km/h</span>
                  </div>
                </div>

                <!-- Rainfall -->
                <div class="p-3">
                  <div class="text-sm text-gray-400 mb-1">{{ $t('weather.current.rainfall') }}</div>
                  <div class="flex items-center">
                    <img src="/images/rainfall.png" alt="Rainfall" class="h-5 w-5 mr-2" />
                    <span class="text-lg font-medium">{{ currentWeather.rainfall }} mm</span>
                  </div>
                </div>

                <!-- UV Index -->
                <div class="p-3">
                  <div class="text-sm text-gray-400 mb-1">{{ $t('weather.current.uvIndex') }}</div>
                  <div class="flex items-center">
                    <img src="/images/uvindex.png" alt="UV Index" class="h-5 w-5 mr-2" />
                    <span class="text-lg font-medium">{{ currentWeather.uvIndex }}</span>
                  </div>
                </div>
              </div>
            </div>

                <!-- Banana Growth Conditions -->
                <div class="mt-6 pt-6 border-t border-gray-400/50">
                  <h4 class="text-md font-medium mb-4 text-[#283618]">{{ $t('weather.growth.title') }}</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white rounded-xl border border-gray-400 p-4">
                      <div class="flex justify-between items-center mb-2">
                        <div class="text-sm font-medium">{{ $t('weather.growth.temp') }}</div>
                        <div
                          class="px-2 py-0.5 text-xs rounded-full"
                          :class="getConditionClass(growthConditions.temperature.status)"
                        >
                          {{ growthConditions.temperature.status }}
                        </div>
                      </div>
                      <p class="text-sm text-gray-400">{{ growthConditions.temperature.message }}</p>
                    </div>
                    <div class="bg-white rounded-xl border border-gray-400 p-4">
                      <div class="flex justify-between items-center mb-2">
                        <div class="text-sm font-medium">{{ $t('weather.growth.humidity') }}</div>
                        <div
                          class="px-2 py-0.5 text-xs rounded-full"
                          :class="getConditionClass(growthConditions.humidity.status)"
                        >
                          {{ growthConditions.humidity.status }}
                        </div>
                      </div>
                      <p class="text-sm text-gray-400">{{ growthConditions.humidity.message }}</p>
                    </div>
                    <div class="bg-white rounded-xl border border-gray-400 p-4">
                      <div class="flex justify-between items-center mb-2">
                          <div class="text-sm font-medium">{{ $t('weather.growth.rainfall') }}</div>
                        <div
                          class="px-2 py-0.5 text-xs rounded-full"
                          :class="getConditionClass(growthConditions.rainfall.status)"
                        >
                          {{ growthConditions.rainfall.status }}
                        </div>
                      </div>
                      <p class="text-sm text-gray-400">{{ growthConditions.rainfall.message }}</p>
                    </div>
                  </div>
                </div>

                  <!-- 24-Hour Temperature Forecast -->
                <div class="mt-6 pt-6 border-t border-gray-400/50">
                  <h4 class="text-md font-medium mb-4 text-[#283618]">{{ $t('weather.forecast.hourlyTitle') }}</h4>
                  <div class="bg-white rounded-lg p-4 h-80 relative">
                    <Line
                      :data="temperatureChartData"
                      :options="temperatureChartOptions"
                      class="h-full w-full"
                    />
                    <!-- Current time indicator -->
                    <div
                      class="absolute top-0 bottom-0 w-px bg-yellow-500 translate-x-[-0.5px]"
                      :style="{ left: currentHourLinePosition }"
                    ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 2.5.4 Weather Alerts & Historical Disease/Pest Trends -->
            <div class="md:col-span-4">
              <div class="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium text-[#283618]">{{ $t('weather.alerts.title') }}</h3>
                  <button
                    @click="showAlertSettings = true"
                    class="text-sm text-[#606c38] hover:text-[#c9d4a3]/100"
                    title="Alert Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div v-if="weatherAlerts.length === 0" class="text-center py-4">
                  <p class="text-gray-400">{{ $t('weather.alerts.empty') }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ $t('weather.alerts.emptyDesc') }}</p>
                </div>
                <!-- 2.5.4.1 High-Risk Conditions & 2.5.4.2 Weather Warnings -->
                <div v-else class="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <div
                    v-for="(alert, index) in weatherAlerts"
                    :key="index"
                    class="p-4 rounded-lg border"
                    :class="getAlertClass(alert.severity)"
                  >
                    <div class="flex items-start">
                      <div
                        class="p-1.5 rounded-full mr-3 mt-0.5"
                        :class="getAlertIconClass(alert.severity)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="font-medium mb-1">{{ alert.title }}</h4>
                        <p class="text-sm text-gray-600 mb-2">{{ alert.description }}</p>
                        <div class="flex justify-between text-xs text-gray-400">
                          <span>{{ alert.time }}</span>
                          <span>{{ alert.duration }}</span>
                        </div>
                        <!-- 2.5.4.3 Prevention Tips -->
                        <div v-if="alert.preventionTips && alert.preventionTips.length > 0" class="mt-3 pt-3 border-t border-gray-600">
                          <div class="text-xs font-medium text-emerald-400 mb-1">{{ $t('weather.alerts.prevention') }}</div>
                          <ul class="text-xs text-gray-300 list-disc list-inside">
                            <li v-for="(tip, tipIndex) in alert.preventionTips" :key="tipIndex">{{ tip }}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- New Section: Historical Disease & Pest Trends -->
                <div class="mt-6 pt-6 border-t border-gray-400/50 flex-grow flex flex-col">
                  <h3 class="text-lg font-medium mb-4 text-[#283618]">
                    {{ $t('weather.trends.historical.title') }}
                  </h3>

                  <div v-if="historicalDiseasePestAlerts.length === 0" class="text-center py-4 flex-grow flex flex-col justify-center">
                    <p class="text-gray-400">{{ $t('weather.trends.historical.noTrends') }}</p>
                    <p class="text-sm text-gray-400 mt-1">{{ $t('weather.trends.historical.description') }}</p>
                  </div>

                  <div v-else class="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    <div
                      v-for="(alert, index) in historicalDiseasePestAlerts"
                      :key="index"
                      class="p-4 rounded-lg border"
                      :class="getAlertClass(alert.severity)"
                    >
                      <div class="flex items-start">
                        <div
                          class="p-1.5 rounded-full mr-3 mt-0.5"
                          :class="getAlertIconClass(alert.severity)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3m0 0l3 3m-3-3v6m-4-2h8m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-medium mb-1">{{ alert.title }}</h4>
                          <p class="text-sm text-gray-600 mb-2">{{ alert.description }}</p>
                          <div v-if="alert.preventionTips && alert.preventionTips.length > 0" class="mt-3 pt-3 border-t border-gray-600">
                            <div class="text-xs font-medium text-emerald-400 mb-1">
                              {{ $t('weather.trends.historical.recommendedActions') }}
                            </div>
                            <ul class="text-xs text-gray-400 list-disc list-inside">
                              <li v-for="(tip, tipIndex) in alert.preventionTips" :key="tipIndex">{{ tip }}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- New Section: Current Disease & Pest Correlation Overview -->
                <div class="mt-6 pt-6 border-t border-gray-400/50">
                  <h3 class="text-lg font-medium mb-4 text-[#283618]">
                    {{ $t('weather.trends.current.title') }}
                  </h3>

                  <div v-if="currentDiseasePestCorrelations.length === 0" class="text-center py-4">
                    <p class="text-gray-400">{{ $t('weather.trends.current.noCorrelations') }}</p>
                    <p class="text-sm mt-1 text-gray-400">{{ $t('weather.trends.current.description') }}</p>
                  </div>

                  <div v-else class="space-y-4">
                    <div
                      v-for="(correlation, index) in currentDiseasePestCorrelations"
                      :key="index"
                      class="p-4 rounded-lg border"
                      :class="getAlertClass(correlation.severity)"
                    >
                      <div class="flex items-start">
                        <div
                          class="p-1.5 rounded-full mr-3 mt-0.5"
                          :class="getAlertIconClass(correlation.severity)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3m0 0l3 3m-3-3v6m-4-2h8m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-medium mb-1">{{ correlation.title }}</h4>
                          <p class="text-sm text-gray-300 mb-2">{{ correlation.description }}</p>
                          <div class="text-xs text-gray-400 mb-2">
                            {{ $t('weather.trends.current.weather') }}:
                            Temp {{ correlation.avgTemp }}°C, 
                            Humidity {{ correlation.avgHumidity }}%, 
                            Rainfall {{ correlation.avgRainfall }}mm
                          </div>

                          <div v-if="correlation.preventionTips && correlation.preventionTips.length > 0" class="mt-3 pt-3 border-t border-gray-600">
                            <div class="text-xs font-medium text-emerald-400 mb-1">
                              {{ $t('weather.trends.current.recommendedActions') }}
                            </div>
                            <ul class="text-xs text-gray-300 list-disc list-inside">
                              <li v-for="(tip, tipIndex) in correlation.preventionTips" :key="tipIndex">{{ tip }}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2.5.2 Weather History -->
            <div class="md:col-span-12">
              <div class="bg-white rounded-xl shadow-lg p-6 ">
                <div class="mb-6">
                  <h3 class="text-lg font-medium mb-4">{{ $t('weather.history.title') }}</h3>
                  <div class="flex flex-wrap gap-2 justify-center md:justify-end">
                    <button
                      v-for="period in [
                        { key: 'daily', label: $t('weather.history.daily') },
                        { key: 'weekly', label: $t('weather.history.weekly') },
                        { key: 'monthly', label: $t('weather.history.monthly') },
                        { key: 'seasonal', label: $t('weather.history.seasonal') }
                      ]"
                      :key="period.key"
                      @click="setHistoryPeriod(period.key)"
                      class="px-3 py-1 text-sm rounded-md transition-colors"
                      :class="historyPeriod === period.key ? 'bg-[#606c38] text-white' : 'bg-gray-600 text-white hover:bg-gray-400'"
                    >
                      {{ period.label }}
                    </button>
                  </div>
                </div>
                <!-- 2.5.2.1 Daily Records -->
                <div v-if="historyPeriod === 'daily'" class="space-y-6">
                  <div class="p-4">
                    <h4 class="text-md font-medium mb-4 text-[#283618]">
                      {{ $t('weather.daily.title') }}
                    </h4>
                    <div class="overflow-x-auto">
                      <table class="w-full text-left text-sm text-gray-300 border border-gray-400/50">
                        <thead class="text-xs text-white uppercase bg-[#283618]">
                          <tr>
                            <th scope="col" class="px-4 py-2">{{ $t('weather.daily.date') }}</th>
                            <th scope="col" class="px-4 py-2">{{ $t('weather.daily.highTemp') }}</th>
                            <th scope="col" class="px-4 py-2">{{ $t('weather.daily.lowTemp') }}</th>
                            <th scope="col" class="px-4 py-2">{{ $t('weather.daily.rainfall') }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="day in historicalWeatherData"
                            :key="day.date"
                            class="bg-white border-b border-gray-700/50 hover:bg-[#f7f2df]"
                          >
                            <td class="px-4 py-2 font-medium text-black">{{ day.date }}</td>
                            <td class="px-4 py-2 text-gray-600">{{ day.highTemp }}</td>
                            <td class="px-4 py-2 text-gray-600">{{ day.lowTemp }}</td>
                            <td class="px-4 py-2 text-gray-600">{{ day.rainfall }}</td>
                          </tr>
                          <tr v-if="historicalWeatherData.length === 0">
                            <td colspan="4" class="px-4 py-4 text-center text-gray-400">
                              {{ $t('weather.daily.noData') }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-4 text-[#283618]">
                        {{ $t('weather.daily.humidity') }}
                      </h4>
                      <div class="h-48 flex items-center justify-center">
                        <Line
                          v-if="historicalHourlyData.length > 0"
                          :data="hourlyHumidityChartData"
                          :options="hourlyChartOptions"
                          class="h-full w-full"
                        />
                        <div v-else class="text-center text-gray-400">
                          <p>{{ $t('weather.daily.noHumidityData') }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-4">
                        {{ $t('weather.daily.rainfallHourly') }}
                      </h4>
                      <div class="h-48 flex items-center justify-center">
                        <Line
                          v-if="historicalHourlyData.length > 0"
                          :data="hourlyRainfallChartData"
                          :options="hourlyChartOptions"
                          class="h-full w-full"
                        />
                        <div v-else class="text-center text-gray-400">
                          <p>{{ $t('weather.daily.noRainfallData') }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-4">
                        {{ $t('weather.daily.windSpeed') }}
                      </h4>
                      <div class="h-48 flex items-center justify-center">
                        <Line
                          v-if="historicalHourlyData.length > 0"
                          :data="hourlyWindSpeedChartData"
                          :options="hourlyChartOptions"
                          class="h-full w-full"
                        />
                        <div v-else class="text-center text-gray-400">
                          <p>{{ $t('weather.daily.noWindData') }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2.5.2.2 Weekly Summary -->
                <div v-if="historyPeriod === 'weekly'" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg p-4">
                      <h4 class="text-md font-medium mb-4">{{ $t('weather.weekly.tempTrend') }}</h4>
                      <div class="h-64 flex items-center justify-center">
                        <Line
                          v-if="weeklySummaryData.length > 0"
                          :data="weeklyTemperatureChartData"
                          :options="temperatureChartOptions"
                          class="h-full w-full"
                        />
                        <div v-else class="text-center text-gray-400">
                          <p>{{ $t('weather.weekly.noTempData') }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-700/30 rounded-lg p-4">
                      <h4 class="text-md font-medium mb-4">{{ $t('weather.weekly.rainfall') }}</h4>
                      <div class="h-64 flex items-center justify-center">
                        <Line
                          v-if="weeklySummaryData.length > 0"
                          :data="weeklyRainfallChartData"
                          :options="temperatureChartOptions"
                          class="h-full w-full"
                        />
                        <div v-else class="text-center text-gray-400">
                          <p>{{ $t('weather.weekly.noRainData') }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-700/30 rounded-lg p-4">
                    <h4 class="text-md font-medium mb-4">{{ $t('weather.weekly.summaryTitle') }}</h4>

                    <div v-if="weeklySummaryData.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="bg-gray-700/50 p-3 rounded-lg">
                        <div class="text-sm text-gray-400 mb-1">{{ $t('weather.weekly.avgTemp') }}</div>
                        <div class="text-xl font-bold">{{ weeklySummaryData[weeklySummaryData.length - 1].avgTemp }}°C</div>
                        <div v-if="weeklyTempComparison !== 'N/A'" :class="weeklyTempComparison.class" class="text-xs">
                          {{ weeklyTempComparison.text }}
                        </div>
                        <div v-else class="text-xs text-gray-400">{{ $t('weather.weekly.noValue') }}</div>
                      </div>

                      <div class="bg-gray-700/50 p-3 rounded-lg">
                        <div class="text-sm text-gray-400 mb-1">{{ $t('weather.weekly.totalRainfall') }}</div>
                        <div class="text-xl font-bold">{{ weeklySummaryData[weeklySummaryData.length - 1].totalRainfall }} mm</div>
                        <div v-if="weeklyRainfallComparison !== 'N/A'" :class="weeklyRainfallComparison.class" class="text-xs">
                          {{ weeklyRainfallComparison.text }}
                        </div>
                        <div v-else class="text-xs text-gray-400">{{ $t('weather.weekly.noValue') }}</div>
                      </div>

                      <div class="bg-gray-700/50 p-3 rounded-lg">
                        <div class="text-sm text-gray-400 mb-1">{{ $t('weather.weekly.avgHumidity') }}</div>
                        <div class="text-xl font-bold">{{ weeklySummaryData[weeklySummaryData.length - 1].avgHumidity }}%</div>
                        <div v-if="weeklyHumidityComparison !== 'N/A'" :class="weeklyHumidityComparison.class" class="text-xs">
                          {{ weeklyHumidityComparison.text }}
                        </div>
                        <div v-else class="text-xs text-gray-400">{{ $t('weather.weekly.noValue') }}</div>
                      </div>

                      <div class="bg-gray-700/50 p-3 rounded-lg">
                        <div class="text-sm text-gray-400 mb-1">{{ $t('weather.weekly.maxWindSpeed') }}</div>
                        <div class="text-xl font-bold">{{ weeklySummaryData[weeklySummaryData.length - 1].maxWindSpeed }} km/h</div>
                        <div v-if="weeklyWindSpeedComparison !== 'N/A'" :class="weeklyWindSpeedComparison.class" class="text-xs">
                          {{ weeklyWindSpeedComparison.text }}
                        </div>
                        <div v-else class="text-xs text-gray-400">{{ $t('weather.weekly.noValue') }}</div>
                      </div>
                    </div>

                    <div v-else class="px-4 py-4 text-center text-gray-400">
                      {{ $t('weather.weekly.noSummaryData') }}
                    </div>
                  </div>
                </div>

                <!-- 2.5.2.3 Monthly Summary -->
                <div v-if="historyPeriod === 'monthly'" class="space-y-6">
                  <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                    <h4 class="text-md font-medium mb-4">{{ $t('weather.monthly.title') }}</h4>
                    <div class="h-80 flex items-center justify-center">
                      <Line
                        v-if="monthlySummaryData.length > 0"
                        :data="monthlyTemperatureRainfallChartData"
                        :options="monthlyTemperatureRainfallChartOptions"
                        class="h-full w-full"
                      />
                      <div v-else class="text-center text-gray-400">
                        <p>{{ $t('weather.monthly.noData') }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-4">{{ $t('weather.monthly.statsTitle') }}</h4>

                      <div v-if="monthlySummaryData.length > 0" class="space-y-4">
                        <div class="flex justify-between items-center">
                          <div class="text-sm">{{ $t('weather.monthly.highTemp') }}</div>
                          <div class="font-medium">{{ monthlySummaryData[monthlySummaryData.length - 1].highTemp }}°C</div>
                        </div>
                        <div class="flex justify-between items-center">
                          <div class="text-sm">{{ $t('weather.monthly.lowTemp') }}</div>
                          <div class="font-medium">{{ monthlySummaryData[monthlySummaryData.length - 1].lowTemp }}°C</div>
                        </div>
                        <div class="flex justify-between items-center">
                          <div class="text-sm">{{ $t('weather.monthly.totalRainfall') }}</div>
                          <div class="font-medium">{{ monthlySummaryData[monthlySummaryData.length - 1].totalRainfall }} mm</div>
                        </div>
                        <div class="flex justify-between items-center">
                          <div class="text-sm">{{ $t('weather.monthly.rainyDays') }}</div>
                          <div class="font-medium">{{ monthlySummaryData[monthlySummaryData.length - 1].rainyDays }} {{ $t('weather.monthly.days') }}</div>
                        </div>
                        <div class="flex justify-between items-center">
                          <div class="text-sm">{{ $t('weather.monthly.avgHumidity') }}</div>
                          <div class="font-medium">{{ monthlySummaryData[monthlySummaryData.length - 1].avgHumidity }}%</div>
                        </div>
                      </div>

                      <div v-else class="px-4 py-4 text-center text-gray-400">
                        {{ $t('weather.monthly.noStats') }}
                      </div>
                    </div>

                    <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-4">{{ $t('weather.monthly.comparisonTitle') }}</h4>

                      <div class="space-y-4">
                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.monthly.tempLabel') }}</span>
                            <span v-if="monthlyTempComparison !== 'N/A'" :class="monthlyTempComparison.class">
                              {{ monthlyTempComparison.text }}
                            </span>
                            <span v-else class="text-sm text-gray-400">{{ $t('weather.monthly.noValue') }}</span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div
                              class="h-2 rounded-full"
                              :class="monthlyTempComparison.class"
                              :style="{ width: monthlyTempComparison !== 'N/A' ? `${Math.abs(monthlyTempComparison.text.split('°')[0]) * 10}%` : '0%' }"
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.monthly.rainfallLabel') }}</span>
                            <span v-if="monthlyRainfallComparison !== 'N/A'" :class="monthlyRainfallComparison.class">
                              {{ monthlyRainfallComparison.text }}
                            </span>
                            <span v-else class="text-sm text-gray-400">{{ $t('weather.monthly.noValue') }}</span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div
                              class="h-2 rounded-full"
                              :class="monthlyRainfallComparison.class"
                              :style="{ width: monthlyRainfallComparison !== 'N/A' ? `${Math.abs(monthlyRainfallComparison.text.split(' ')[0])}%` : '0%' }"
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.monthly.humidityLabel') }}</span>
                            <span v-if="monthlyHumidityComparison !== 'N/A'" :class="monthlyHumidityComparison.class">
                              {{ monthlyHumidityComparison.text }}
                            </span>
                            <span v-else class="text-sm text-gray-400">{{ $t('weather.monthly.noValue') }}</span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div
                              class="h-2 rounded-full"
                              :class="monthlyHumidityComparison.class"
                              :style="{ width: monthlyHumidityComparison !== 'N/A' ? `${Math.abs(monthlyHumidityComparison.text.split('%')[0])}%` : '0%' }"
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.monthly.sunnyDaysLabel') }}</span>
                            <span v-if="monthlySunnyDaysComparison !== 'N/A'" :class="monthlySunnyDaysComparison.class">
                              {{ monthlySunnyDaysComparison.text }}
                            </span>
                            <span v-else class="text-sm text-gray-400">{{ $t('weather.monthly.noValue') }}</span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div
                              class="h-2 rounded-full"
                              :class="monthlySunnyDaysComparison.class"
                              :style="{ width: monthlySunnyDaysComparison !== 'N/A' ? `${Math.abs(monthlySunnyDaysComparison.text.split(' ')[0]) * 5}%` : '0%' }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2.5.2.4 Seasonal Trend -->
                <div v-if="historyPeriod === 'seasonal'" class="space-y-6">
                  <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                    <h4 class="text-md font-medium mb-4">{{ $t('weather.seasonal.title') }}</h4>
                    <div class="h-80 flex items-center justify-center">
                      <Line
                        v-if="seasonalSummaryData.length > 0"
                        :data="seasonalWeatherPatternsChartData"
                        :options="seasonalWeatherPatternsChartOptions"
                        class="h-full w-full"
                      />
                      <div v-else class="text-center text-gray-400">
                        <p>{{ $t('weather.seasonal.noData') }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Current Period -->
                    <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-3">
                        {{ $t('weather.seasonal.currentPeriod') }}:
                        {{ seasonalSummaryData.length > 0 ? seasonalSummaryData[seasonalSummaryData.length - 1].label : 'N/A' }}
                      </h4>

                      <div class="space-y-3">
                        <div class="text-sm text-gray-300">
                          <p>{{ $t('weather.seasonal.description') }}</p>
                        </div>

                        <div class="mt-4">
                          <div class="text-sm font-medium mb-2">{{ $t('weather.seasonal.dataCoverage') }}</div>
                          <div class="w-full bg-gray-600 rounded-full h-2.5 mb-1">
                            <div
                              class="bg-blue-500 h-2.5 rounded-full"
                              :style="{ width: `${(seasonalSummaryData.length / 12) * 100}%` }"
                            ></div>
                          </div>

                          <div class="flex justify-between text-xs text-gray-400">
                            <span>{{ $t('weather.seasonal.start') }} ({{ seasonalSummaryData.length > 0 ? seasonalSummaryData[0].label : 'N/A' }})</span>
                            <span>{{ (seasonalSummaryData.length / 12 * 100).toFixed(0) }}%</span>
                            <span>{{ $t('weather.seasonal.end') }} ({{ seasonalSummaryData.length > 0 ? seasonalSummaryData[seasonalSummaryData.length - 1].label : 'N/A' }})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Yearly Averages -->
                    <div class="bg-white rounded-xl border border-gray-400/50 p-4">
                      <h4 class="text-md font-medium mb-3">{{ $t('weather.seasonal.yearlyAverages') }}</h4>

                      <div v-if="seasonalSummaryData.length > 0" class="space-y-3">
                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.seasonal.avgTemp') }}</span>
                            <span class="text-sm">
                              {{ (seasonalSummaryData.reduce((sum, d) => sum + d.avgTemp, 0) / seasonalSummaryData.length).toFixed(1) }}°C
                            </span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-emerald-500 h-2 rounded-full" style="width: 75%"></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.seasonal.avgRainfall') }}</span>
                            <span class="text-sm">
                              {{ (seasonalSummaryData.reduce((sum, d) => sum + parseFloat(d.totalRainfall), 0) / seasonalSummaryData.length).toFixed(1) }} mm
                            </span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between mb-1">
                            <span class="text-sm">{{ $t('weather.seasonal.avgHumidity') }}</span>
                            <span class="text-sm">
                              {{ (seasonalSummaryData.reduce((sum, d) => sum + d.avgHumidity, 0) / seasonalSummaryData.length).toFixed(1) }}%
                            </span>
                          </div>
                          <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: 68%"></div>
                          </div>
                        </div>
                      </div>

                      <div v-else class="px-4 py-4 text-center text-gray-400">
                        {{ $t('weather.seasonal.noYearlyAverage') }}
                      </div>
                    </div>

                    <!-- Seasonal Forecast -->
                    <div class="bg-white rounded-xl border border-gray-400/80 p-4">
                      <h4 class="text-md font-medium mb-3">{{ $t('weather.seasonal.forecastTitle') }}</h4>

                      <div class="space-y-3">
                        <div class="text-sm text-gray-600">
                          <p>{{ $t('weather.seasonal.forecastDescription') }}</p>
                        </div>

                        <div class="mt-3 pt-3 border-t border-gray-400">
                          <div class="text-sm font-medium mb-2">{{ $t('weather.seasonal.expectedRainfall') }}</div>
                          <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            <span>{{ $t('weather.seasonal.expectedRainfallValue') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2.5.3 Disease/Pest Weather Correlation -->
            <div class="md:col-span-12">
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-medium mb-6 text-[#283618]">
                  {{ $t('weather.correlation.title') }}
                </h3>

                <div class="h-80 flex items-center justify-center">
                  <Line
                    v-if="historicalCorrelationChartData.labels.length > 0"
                    :data="historicalCorrelationChartData"
                    :options="historicalCorrelationChartOptions"
                    class="h-full w-full"
                  />
                  <div v-else class="text-center text-gray-400">
                    <p>{{ $t('weather.correlation.noData') }}</p>
                    <p class="text-sm mt-1">
                      {{ $t('weather.correlation.description') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>

    <!-- Auto-refresh Settings Modal -->
    <div v-if="showRefreshSettings" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          @click="showRefreshSettings = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-xl font-semibold mb-4">{{ $t('weather.refreshAuto.title') }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              {{ $t('weather.refresh.autoLabel') }}
            </label>
            <div class="flex items-center">
              <input
                id="auto-refresh-toggle"
                v-model="autoRefreshEnabled"
                type="checkbox"
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
              >
              <label for="auto-refresh-toggle" class="ml-2 block text-sm text-gray-300">
                {{ $t('weather.refreshAuto.enableAuto') }}
              </label>
            </div>
          </div>

          <div v-if="autoRefreshEnabled">
            <label for="refresh-interval" class="block text-sm font-medium text-gray-300 mb-2">
              {{ $t('weather.refreshAuto.intervalLabel') }}
            </label>
            <select
              id="refresh-interval"
              v-model="autoRefreshInterval"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="5">{{ $t('weather.refreshAuto.option5') }}</option>
              <option value="10">{{ $t('weather.refreshAuto.option10') }}</option>
              <option value="15">{{ $t('weather.refreshAuto.option15') }}</option>
              <option value="30">{{ $t('weather.refreshAuto.option30') }}</option>
              <option value="60">{{ $t('weather.refreshAuto.option60') }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">
              {{ $t('weather.refreshAuto.note') }}
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="showRefreshSettings = false"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm mr-2"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveRefreshSettings"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors"
          >
            {{ $t('weather.refreshAuto.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Weather Alert Settings Modal -->
    <div v-if="showAlertSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          @click="showAlertSettings = false"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-600/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-xl font-semibold mb-4 text-[#283618]">{{ $t('weather.alert.title') }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-black mb-2">
              {{ $t('weather.alert.notificationsLabel') }}
            </label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  id="email-alerts"
                  type="checkbox"
                  v-model="alertSettings.emailAlerts"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="email-alerts" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.email') }}
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="sms-alerts"
                  type="checkbox"
                  v-model="alertSettings.smsAlerts"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="sms-alerts" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.sms') }}
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="app-alerts"
                  type="checkbox"
                  v-model="alertSettings.appAlerts"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="app-alerts" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.app') }}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-black mb-2">
              {{ $t('weather.alert.typesLabel') }}
            </label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  id="severe-weather"
                  type="checkbox"
                  v-model="alertSettings.severeWeather"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="severe-weather" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.severeWeather') }}
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="disease-risk"
                  type="checkbox"
                  v-model="alertSettings.diseaseRisk"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="disease-risk" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.diseaseRisk') }}
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="pest-activity"
                  v-model="alertSettings.pestActivity"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded bg-gray-600"
                >
                <label for="pest-activity" class="ml-2 block text-sm text-gray-600">
                  {{ $t('weather.alert.pestActivity') }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="saveAlertSettings"
            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm font-medium transition-colors"
          >
            {{ $t('weather.alert.save') }}
          </button>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, BarController, Filler } from 'chart.js'; // Import Filler

// Import weather service functions
import {
  fetchCurrentAndForecastWeatherData,
  fetchHistoricalDailyArchiveData,
  fetchHistoricalHourlyArchiveData,
  getWeatherDescription,
  getSimplifiedCondition,
  fetchWeatherAPIAlerts,
  getSimplifiedWeatherClassification,
  fetchScanHistory,
  processScanHistoryForTrends,
  getCurrentDiseasePestCorrelations // New import
} from '../../services/weatherService';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, BarController, Filler);

// Router
const router = useRouter();

// State
const isLoading = ref(true);
const isRefreshing = ref(false);
const error = ref(null);
const showAlertSettings = ref(false);
const showRefreshSettings = ref(false);
const showSignOutConfirmation = ref(false);
const historyPeriod = ref('daily');
const lastUpdated = ref('');
const currentDate = ref(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
const notificationCount = ref(0);
const refreshInterval = ref(null);
const countdownInterval = ref(null);
const hourlyTemperatureForecast = ref([]);
const rawHistoricalDailyData = ref([]);
const historicalHourlyData = ref([]);
const weeklySummaryData = ref([]);
const monthlySummaryData = ref([]);
const seasonalSummaryData = ref([]);
const rawScanHistoryData = ref([]); // New ref to store raw scan history
const isWeatherLoaded = ref(false);
const currentDiseasePestCorrelations = ref([]); // New ref for combined current correlations

// Auto-refresh settings
const autoRefreshEnabled = ref(true);
const autoRefreshInterval = ref(15);
const countdownMinutes = ref(autoRefreshInterval.value);

const alertSettings = ref({
  emailAlerts: true,
  smsAlerts: false,
  appAlerts: true,
  severeWeather: true,
  diseaseRisk: true,
  pestActivity: true,
});

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const userRole = ref('User');
const authUid = ref(null);
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

// User's farm location (from user profile)
const userFarmLocation = ref({
  name: 'Loading...',
  coordinates: 'Loading...',
  lat: null,
  lon: null,
  region: '',
  country: ''
});

// Current weather data
const currentWeather = ref({
  temperature: 0,
  feelsLike: 0,
  condition: 'Loading...',
  simplifiedCondition: 'Unknown',
  humidity: 0,
  windSpeed: 0,
  rainfall: 0,
  uvIndex: 0
});

// Historical weather data (for the past 7 days)
const historicalWeatherData = ref([]);

// Growth conditions (will be calculated based on current weather)
const growthConditions = ref({
  temperature: {
    status: 'Loading',
    message: 'Loading temperature conditions...'
  },
  humidity: {
    status: 'Loading',
    message: 'Loading humidity conditions...'
  },
  rainfall: {
    status: 'Loading',
    message: 'Loading rainfall conditions...'
  }
});

// Weather alerts with prevention tips (ONLY WeatherAPI alerts)
const weatherAlerts = ref([]);

// Historical Disease & Pest Alerts (new property)
const historicalDiseasePestAlerts = ref([]);

// 7-day forecast (dynamically populated from API)
const forecast = ref([]);

// Start countdown timer
const startCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  countdownMinutes.value = autoRefreshInterval.value;
  countdownInterval.value = setInterval(() => {
    if (countdownMinutes.value > 0) {
      countdownMinutes.value--;
    } else {
      clearInterval(countdownInterval.value);
    }
  }, 60000);
};

// Set up automatic refresh
const startAutoRefresh = (intervalMinutes = 15) => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
  if (autoRefreshEnabled.value) {
    startCountdown();
    const intervalMs = intervalMinutes * 60 * 1000;
    refreshInterval.value = setInterval(() => {
      console.log(`Auto-refreshing weather data (every ${intervalMinutes} minutes)...`);
      refreshWeather();
      startCountdown();
    }, intervalMs);
    console.log(`Automatic refresh set for every ${intervalMinutes} minutes`);
  } else {
    console.log("Automatic refresh disabled");
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
  }
};

// Save refresh settings
const saveRefreshSettings = async () => {
  await setDoc(doc(db, "users", authUid.value), {
    settings: {
      autoRefresh: {
        enabled: autoRefreshEnabled.value,
        interval: parseInt(autoRefreshInterval.value)
      }
    }
  }, { merge: true });
  console.log("Refresh settings saved to DB successfully");
  showRefreshSettings.value = false;
};

// Fetch user data from Firestore
const fetchUserData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log("Fetching user data...");
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }
    authUid.value = auth.currentUser.uid;
    console.log("Current user:", authUid.value);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", authUid.value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No user document found for current auth user");
      throw new Error("User profile not found. Please contact support.");
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log("User data retrieved:", userData);

    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    profileImage.value = userData.profileImage || null;
    userRole.value = userData.role === 'professional' ? 'Professional' : 'User';

    if (userData.location) {
      const locationName = [
        userData.location.barangay?.name,
        userData.location.municipality?.name,
        userData.location.province?.name
      ].filter(Boolean).join(', ');
      const lat = userData.location.latitude || 13.7565;
      const lon = userData.location.longitude || 121.0583;
      userFarmLocation.value = {
        name: locationName || userData.location.formattedAddress || 'Your Location',
        coordinates: `${lat}° N, ${lon}° E`,
        lat: lat,
        lon: lon,
        region: userData.location.province?.name || '',
        country: userData.location.country?.name || 'Philippines'
      };
      console.log("Updated user location:", userFarmLocation.value);
    } else {
      userFarmLocation.value = {
        name: 'Default Location',
        coordinates: '13.7565° N, 121.0583° E',
        lat: 13.7565,
        lon: 121.0583,
        region: 'Oriental Mindoro',
        country: 'Philippines'
      };
    }

    if (userData.settings && userData.settings.autoRefresh) {
      autoRefreshEnabled.value = userData.settings.autoRefresh.enabled;
      autoRefreshInterval.value = userData.settings.autoRefresh.interval;
      console.log("Loaded auto-refresh settings from DB:", userData.settings.autoRefresh);
    }
    if (userData.settings && userData.settings.alerts) {
      Object.assign(alertSettings.value, userData.settings.alerts);
      console.log("Loaded alert settings from DB:", userData.settings.alerts);
    }

    if (userData.role === 'professional') {
      console.warn("User has professional role, redirecting to professional dashboard");
      router.push('/professional/dashboard');
      return;
    }

    console.log("User data loaded successfully");
    await fetchWeatherData();
    await fetchHistoricalWeatherData();
    // fetchAndProcessHistoricalDiseasePestTrends is called within fetchWeatherData now
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
    isLoading.value = false;
  }
};

// Fetch current weather data from Open-Meteo API based on user's location
const fetchWeatherData = async () => {
  try {
    console.log("Fetching current weather data for location:", userFarmLocation.value.name);
    const lat = userFarmLocation.value.lat;
    const lon = userFarmLocation.value.lon;

    if (lat === null || lon === null) {
      throw new Error("Farm location coordinates are not available.");
    }

    const data = await fetchCurrentAndForecastWeatherData(lat, lon);
    if (!data) {
      throw new Error("No weather data received from service.");
    }

    const current = data.current;
    const weatherCode = current.weather_code;
    const condition = getWeatherDescription(weatherCode);
    const simplifiedCondition = getSimplifiedCondition(weatherCode);

    currentWeather.value = {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: condition,
      simplifiedCondition: simplifiedCondition,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m * 3.6),
      rainfall: current.precipitation || 0,
      uvIndex: current.uv_index || 0
    };

    if (data.daily) {
      const daily = data.daily;
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      forecast.value = daily.time.slice(0, 7).map((timeStr, index) => {
        const date = new Date(timeStr);
        const dayName = index === 0 ? 'Today' : daysOfWeek[date.getDay()];
        const weatherCodeDay = daily.weather_code[index];
        return {
          day: dayName,
          condition: getSimplifiedCondition(weatherCodeDay),
          highTemp: Math.round(daily.temperature_2m_max[index]),
          lowTemp: Math.round(daily.temperature_2m_min[index]),
          precipitation: Math.round((daily.precipitation_sum[index] > 0 ? daily.precipitation_sum[index] / 10 : 0) * 100),
          uvIndex: daily.uv_index_max ? daily.uv_index_max[index] : 0
        };
      });
      console.log("7-day forecast updated:", forecast.value);

      if (authUid.value && daily.time.length > 0) {
        const todayDate = daily.time[0];
        const docId = `${todayDate}_${authUid.value}`;
        const weatherDataToSave = {
          userId: authUid.value,
          farmLocation: userFarmLocation.value.name,
          latitude: userFarmLocation.value.lat,
          longitude: userFarmLocation.value.lon,
          date: todayDate,
          temperature_max: daily.temperature_2m_max[0],
          temperature_min: daily.temperature_2m_min[0],
          precipitation_sum: daily.precipitation_sum[0],
          humidity_avg: current.relative_humidity_2m,
          wind_speed_avg: current.wind_speed_10m,
          weather_condition: current.weather_code,
          timestamp: new Date()
        };
        await setDoc(doc(db, "weather_records", docId), weatherDataToSave, { merge: true });
        console.log(`Current day's weather saved/updated in Firebase: ${docId}`);
      }
    }

    if (data.hourly && data.hourly.temperature_2m) {
      hourlyTemperatureForecast.value = data.hourly.temperature_2m.slice(0, 24);
      console.log("Hourly temperature forecast:", hourlyTemperatureForecast.value);
    }

    updateGrowthConditions();
    await checkWeatherAlerts();
    // Fetch and process historical scan data for both historical trends and current correlations
    await fetchAndProcessAllScanHistoryData();
    lastUpdated.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    error.value = null;
    isWeatherLoaded.value = true;
  } catch (err) {
    console.error("Error fetching weather data:", err);
    error.value = err.message || "Failed to fetch weather data.";
    isWeatherLoaded.value = false;
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

// Refresh weather data
const refreshWeather = async () => {
  isRefreshing.value = true;
  await fetchWeatherData();
  await fetchHistoricalWeatherData();
  isRefreshing.value = false;
};

// Update growth conditions based on current weather
const updateGrowthConditions = () => {
  const temp = currentWeather.value.temperature;
  const humidity = currentWeather.value.humidity;
  const rainfall = currentWeather.value.rainfall;

  // Temperature
  if (temp >= 25 && temp <= 30) {
    growthConditions.value.temperature = { status: 'Optimal', message: 'Temperature is ideal for banana growth.' };
  } else if (temp > 30 && temp <= 35) {
    growthConditions.value.temperature = { status: 'Good', message: 'Temperature is slightly high but still good.' };
  } else if (temp < 20 || temp > 35) {
    growthConditions.value.temperature = { status: 'Suboptimal', message: 'Temperature is outside optimal range, may affect growth.' };
  } else {
    growthConditions.value.temperature = { status: 'Fair', message: 'Temperature is acceptable but not ideal.' };
  }

  // Humidity
  if (humidity >= 70 && humidity <= 90) {
    growthConditions.value.humidity = { status: 'Optimal', message: 'Humidity levels are excellent for banana plants.' };
  } else if (humidity > 90) {
    growthConditions.value.humidity = { status: 'High', message: 'High humidity may increase risk of fungal diseases.' };
  } else {
    growthConditions.value.humidity = { status: 'Low', message: 'Low humidity may cause stress to plants, consider irrigation.' };
  }

  // Rainfall (using current precipitation as an indicator for immediate conditions)
  if (rainfall > 5) {
    growthConditions.value.rainfall = { status: 'High', message: 'Significant rainfall detected, ensure good drainage.' };
  } else if (rainfall > 0) {
    growthConditions.value.rainfall = { status: 'Moderate', message: 'Light rain, beneficial for plant hydration.' };
  } else {
    growthConditions.value.rainfall = { status: 'Low', message: 'No recent rainfall, monitor soil moisture.' };
  }
};

// Function to generate weather alerts based on current and forecast data (WeatherAPI only)
const checkWeatherAlerts = async () => {
  const lat = userFarmLocation.value.lat;
  const lon = userFarmLocation.value.lon;
  let alerts = [];

  // Fetch severe weather alerts from WeatherAPI if enabled
  if (alertSettings.value.severeWeather && lat !== null && lon !== null) {
    const weatherApiAlerts = await fetchWeatherAPIAlerts(lat, lon);
    alerts = alerts.concat(weatherApiAlerts);
  }
  weatherAlerts.value = alerts;
  console.log("Weather alerts updated (WeatherAPI only):", weatherAlerts.value);
};

// Function to fetch and process all scan history data for both historical trends and current correlations
const fetchAndProcessAllScanHistoryData = async () => {
  if (!authUid.value || userFarmLocation.value.lat === null || userFarmLocation.value.lon === null) {
    console.warn("Cannot fetch historical scan data: User ID or location not available.");
    historicalDiseasePestAlerts.value = [];
    currentDiseasePestCorrelations.value = [];
    rawScanHistoryData.value = [];
    return;
  }

  try {
    console.log("Fetching historical scan data for disease/pest trends and current correlations...");
    const scanData = await fetchScanHistory(
      authUid.value,
      userFarmLocation.value.lat,
      userFarmLocation.value.lon,
      365 // Fetch last 365 days of scan history
    );
    rawScanHistoryData.value = scanData; // Store raw data for chart

    // Process raw scan data into historical trends
    historicalDiseasePestAlerts.value = processScanHistoryForTrends(scanData);
    console.log("Historical disease/pest trends updated from scan history:", historicalDiseasePestAlerts.value);

    // Get current correlations based on current weather and historical scan data
    currentDiseasePestCorrelations.value = getCurrentDiseasePestCorrelations(currentWeather.value, scanData);
    console.log("Current disease/pest correlations updated:", currentDiseasePestCorrelations.value);

  } catch (error) {
    console.error("Error in fetchAndProcessAllScanHistoryData:", error);
    historicalDiseasePestAlerts.value = [];
    currentDiseasePestCorrelations.value = [];
    rawScanHistoryData.value = [];
  }
};

// Save alert settings
const saveAlertSettings = async () => {
  await setDoc(doc(db, "users", authUid.value), {
    settings: {
      alerts: alertSettings.value
    }
  }, { merge: true });
  console.log("Alert settings saved to DB successfully");
  await checkWeatherAlerts();
  await fetchAndProcessAllScanHistoryData(); // Re-process trends and correlations with new settings
  showAlertSettings.value = false;
};

// Chart data and options for 24-hour temperature forecast
const temperatureChartData = computed(() => {
  const labels = Array.from({ length: 24 }, (_, i) => {
    const hour = (new Date().getHours() + i) % 24;
    return `${hour}:00`;
  });
  return {
    labels: labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        backgroundColor: '#c9d4a3',
        borderColor: '#283618',
        data: hourlyTemperatureForecast.value,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#606c38',
        pointBorderColor: '#606c38',
        pointHoverRadius: 5,
      }
    ]
  };
});

const temperatureChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y}°C`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}°C`;
        }
      }
    }
  }
};

const currentHourLinePosition = computed(() => {
  const now = new Date();
  const currentHour = now.getHours();
  return `${(currentHour / 24) * 100}%`;
});

// Fetch historical weather data
const fetchHistoricalWeatherData = async () => {
  try {
    console.log("Fetching historical weather data...");
    const lat = userFarmLocation.value.lat;
    const lon = userFarmLocation.value.lon;

    if (lat === null || lon === null) {
      throw new Error("Farm location coordinates are not available for historical data.");
    }

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDateDaily = new Date(today);
    startDateDaily.setDate(today.getDate() - 6);
    const startDateDailyStr = startDateDaily.toISOString().split('T')[0];

    const startDateHourly = new Date(today);
    startDateHourly.setDate(today.getDate() - 7);
    const startDateHourlyStr = startDateHourly.toISOString().split('T')[0];

    const startDateYear = new Date(today);
    startDateYear.setDate(today.getDate() - 364);
    const startDateYearStr = startDateYear.toISOString().split('T')[0];

    const dailyData = await fetchHistoricalDailyArchiveData(lat, lon, startDateDailyStr, endDate);
    if (dailyData && dailyData.daily) {
      historicalWeatherData.value = dailyData.daily.time.map((dateStr, index) => ({
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        highTemp: Math.round(dailyData.daily.temperature_2m_max[index]),
        lowTemp: Math.round(dailyData.daily.temperature_2m_min[index]),
        rainfall: dailyData.daily.precipitation_sum[index] ? dailyData.daily.precipitation_sum[index].toFixed(1) : 0,
        weatherCode: dailyData.daily.weather_code[index]
      })).reverse();
      console.log("Historical daily weather data (7 days):", historicalWeatherData.value);
    } else {
      historicalWeatherData.value = [];
    }

    const hourlyData = await fetchHistoricalHourlyArchiveData(lat, lon, startDateHourlyStr, endDate);
    if (hourlyData && hourlyData.hourly) {
      historicalHourlyData.value = hourlyData.hourly.time.map((timeStr, index) => ({
        time: new Date(timeStr),
        temperature: hourlyData.hourly.temperature_2m[index],
        humidity: hourlyData.hourly.relative_humidity_2m[index],
        precipitation: hourlyData.hourly.precipitation[index],
        windSpeed: hourlyData.hourly.wind_speed_10m[index]
      }));
      console.log("Historical hourly weather data (7 days):", historicalHourlyData.value);
    } else {
      historicalHourlyData.value = [];
    }

    const yearlyDailyData = await fetchHistoricalDailyArchiveData(lat, lon, startDateYearStr, endDate);
    if (yearlyDailyData && yearlyDailyData.daily) {
      rawHistoricalDailyData.value = yearlyDailyData.daily.time.map((dateStr, index) => ({
        date: new Date(dateStr),
        highTemp: yearlyDailyData.daily.temperature_2m_max[index],
        lowTemp: yearlyDailyData.daily.temperature_2m_min[index],
        precipitation: yearlyDailyData.daily.precipitation_sum[index],
        humidity: yearlyDailyData.daily.relative_humidity_2m_mean[index],
        windSpeed: yearlyDailyData.daily.wind_speed_10m_max[index],
        weatherCode: yearlyDailyData.daily.weather_code[index]
      }));
      console.log("Raw historical daily data (365 days):", rawHistoricalDailyData.value);
      processHistoricalDataForSummaries();
    } else {
      rawHistoricalDailyData.value = [];
      weeklySummaryData.value = [];
      monthlySummaryData.value = [];
      seasonalSummaryData.value = [];
    }
  } catch (err) {
    console.error("Error fetching historical weather data:", err);
    error.value = err.message || "Failed to fetch historical weather data.";
  }
};

// Process raw historical data into weekly, monthly, seasonal summaries
const processHistoricalDataForSummaries = () => {
  if (rawHistoricalDailyData.value.length === 0) return;

  // Weekly Summary (last 4 weeks)
  const weeks = {};
  rawHistoricalDailyData.value.forEach(day => {
    const weekStart = new Date(day.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        dates: [],
        highTemps: [],
        lowTemps: [],
        precipitations: [],
        humidities: [],
        windSpeeds: [],
        weatherCodes: []
      };
    }
    weeks[weekKey].dates.push(day.date);
    weeks[weekKey].highTemps.push(day.highTemp);
    weeks[weekKey].lowTemps.push(day.lowTemp);
    weeks[weekKey].precipitations.push(day.precipitation);
    weeks[weekKey].humidities.push(day.humidity);
    weeks[weekKey].windSpeeds.push(day.windSpeed);
    weeks[weekKey].weatherCodes.push(day.weatherCode);
  });

  weeklySummaryData.value = Object.keys(weeks).sort().slice(-4).map(weekKey => {
    const week = weeks[weekKey];
    const avgTemp = (week.highTemps.reduce((a, b) => a + b, 0) / week.highTemps.length).toFixed(1);
    const totalRainfall = week.precipitations.reduce((a, b) => a + b, 0).toFixed(1);
    const avgHumidity = (week.humidities.reduce((a, b) => a + b, 0) / week.humidities.length).toFixed(1);
    const maxWindSpeed = Math.max(...week.windSpeeds).toFixed(1);
    return {
      label: `Week of ${new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      avgTemp: parseFloat(avgTemp),
      totalRainfall: parseFloat(totalRainfall),
      avgHumidity: parseFloat(avgHumidity),
      maxWindSpeed: parseFloat(maxWindSpeed)
    };
  });
  console.log("Weekly summary data:", weeklySummaryData.value);

  const weeklyTempComparison = computed(() => {
    if (weeklySummaryData.value.length < 2) return 'N/A';
    const currentWeek = weeklySummaryData.value[weeklySummaryData.value.length - 1].avgTemp;
    const prevWeek = weeklySummaryData.value[weeklySummaryData.value.length - 2].avgTemp;
    const diff = (currentWeek - prevWeek).toFixed(1);
    if (diff > 0) return { text: `+${diff}°C warmer`, class: 'text-red-400' };
    if (diff < 0) return { text: `${diff}°C cooler`, class: 'text-blue-400' };
    return { text: 'No change', class: 'text-gray-400' };
  });

  const weeklyRainfallComparison = computed(() => {
    if (weeklySummaryData.value.length < 2) return 'N/A';
    const currentWeek = weeklySummaryData.value[weeklySummaryData.value.length - 1].totalRainfall;
    const prevWeek = weeklySummaryData.value[weeklySummaryData.value.length - 2].totalRainfall;
    const diff = (currentWeek - prevWeek).toFixed(1);
    if (diff > 0) return { text: `+${diff} mm more`, class: 'text-blue-400' };
    if (diff < 0) return { text: `${diff} mm less`, class: 'text-red-400' };
    return { text: 'No change', class: 'text-gray-400' };
  });

  const weeklyHumidityComparison = computed(() => {
    if (weeklySummaryData.value.length < 2) return 'N/A';
    const currentWeek = weeklySummaryData.value[weeklySummaryData.value.length - 1].avgHumidity;
    const prevWeek = weeklySummaryData.value[weeklySummaryData.value.length - 2].avgHumidity;
    const diff = (currentWeek - prevWeek).toFixed(1);
    if (diff > 0) return { text: `+${diff}% higher`, class: 'text-red-400' };
    if (diff < 0) return { text: `${diff}% lower`, class: 'text-blue-400' };
    return { text: 'No change', class: 'text-gray-400' };
  });

  const weeklyWindSpeedComparison = computed(() => {
    if (weeklySummaryData.value.length < 2) return 'N/A';
    const currentWeek = weeklySummaryData.value[weeklySummaryData.value.length - 1].maxWindSpeed;
    const prevWeek = weeklySummaryData.value[weeklySummaryData.value.length - 2].maxWindSpeed;
    const diff = (currentWeek - prevWeek).toFixed(1);
    if (diff > 0) return { text: `+${diff} km/h faster`, class: 'text-red-400' };
    if (diff < 0) return { text: `${diff} km/h slower`, class: 'text-blue-400' };
    return { text: 'No change', class: 'text-gray-400' };
  });

  // Monthly Summary (last 12 months)
  const months = {};
  rawHistoricalDailyData.value.forEach(day => {
    const monthKey = `${day.date.getFullYear()}-${(day.date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!months[monthKey]) {
      months[monthKey] = {
        dates: [],
        highTemps: [],
        lowTemps: [],
        precipitations: [],
        humidities: [],
        weatherCodes: []
      };
    }
    months[monthKey].dates.push(day.date);
    months[monthKey].highTemps.push(day.highTemp);
    months[monthKey].lowTemps.push(day.lowTemp);
    months[monthKey].precipitations.push(day.precipitation);
    months[monthKey].humidities.push(day.humidity);
    months[monthKey].weatherCodes.push(day.weatherCode);
  });

  monthlySummaryData.value = Object.keys(months).sort().slice(-12).map(monthKey => {
    const month = months[monthKey];
    const avgTemp = (month.highTemps.reduce((a, b) => a + b, 0) / month.highTemps.length).toFixed(1);
    const totalRainfall = month.precipitations.reduce((a, b) => a + b, 0).toFixed(1);
    const avgHumidity = (month.humidities.reduce((a, b) => a + b, 0) / month.humidities.length).toFixed(1);
    const rainyDays = month.precipitations.filter(p => p > 0).length;
    const sunnyDays = month.weatherCodes.filter(code => [0, 1].includes(code)).length;
    return {
      label: new Date(monthKey).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      avgTemp: parseFloat(avgTemp),
      totalRainfall: parseFloat(totalRainfall),
      avgHumidity: parseFloat(avgHumidity),
      rainyDays: rainyDays,
      sunnyDays: sunnyDays,
      highTemp: Math.max(...month.highTemps),
      lowTemp: Math.min(...month.lowTemps)
    };
  });
  console.log("Monthly summary data:", monthlySummaryData.value);
  seasonalSummaryData.value = monthlySummaryData.value;
};

const monthlyTempComparison = computed(() => {
  if (monthlySummaryData.value.length < 2) return 'N/A';
  const currentMonth = monthlySummaryData.value[monthlySummaryData.value.length - 1].avgTemp;
  const prevMonth = monthlySummaryData.value[monthlySummaryData.value.length - 2].avgTemp;
  const diff = (currentMonth - prevMonth).toFixed(1);
  if (diff > 0) return { text: `+${diff}°C warmer`, class: 'text-red-400' };
  if (diff < 0) return { text: `${diff}°C cooler`, class: 'text-blue-400' };
  return { text: 'No change', class: 'text-gray-400' };
});

const monthlyRainfallComparison = computed(() => {
  if (monthlySummaryData.value.length < 2) return 'N/A';
  const currentMonth = monthlySummaryData.value[monthlySummaryData.value.length - 1].totalRainfall;
  const prevMonth = monthlySummaryData.value[monthlySummaryData.value.length - 2].totalRainfall;
  const diff = (currentMonth - prevMonth).toFixed(1);
  if (diff > 0) return { text: `+${diff} mm more`, class: 'text-blue-400' };
  if (diff < 0) return { text: `${diff} mm less`, class: 'text-red-400' };
  return { text: 'No change', class: 'text-gray-400' };
});

const monthlyHumidityComparison = computed(() => {
  if (monthlySummaryData.value.length < 2) return 'N/A';
  const currentMonth = monthlySummaryData.value[monthlySummaryData.value.length - 1].avgHumidity;
  const prevMonth = monthlySummaryData.value[monthlySummaryData.value.length - 2].avgHumidity;
  const diff = (currentMonth - prevMonth).toFixed(1);
  if (diff > 0) return { text: `+${diff}% higher`, class: 'text-red-400' };
  if (diff < 0) return { text: `${diff}% lower`, class: 'text-blue-400' };
  return { text: 'No change', class: 'text-gray-400' };
});

const monthlySunnyDaysComparison = computed(() => {
  if (monthlySummaryData.value.length < 2) return 'N/A';
  const currentMonth = monthlySummaryData.value[monthlySummaryData.value.length - 1].sunnyDays;
  const prevMonth = monthlySummaryData.value[monthlySummaryData.value.length - 2].sunnyDays;
  const diff = currentMonth - prevMonth;
  if (diff > 0) return { text: `+${diff} more sunny days`, class: 'text-yellow-400' };
  if (diff < 0) return { text: `${diff} fewer sunny days`, class: 'text-gray-400' };
  return { text: 'No change', class: 'text-gray-400' };
});

// Chart data for hourly humidity
const hourlyHumidityChartData = computed(() => {
  const labels = historicalHourlyData.value.map(d => d.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const data = historicalHourlyData.value.map(d => d.humidity);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Humidity (%)',
        backgroundColor: 'rgba(102, 178, 255, 0.2)',
        borderColor: '#66b2ff',
        data: data,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };
});

// Chart data for hourly rainfall
const hourlyRainfallChartData = computed(() => {
  const labels = historicalHourlyData.value.map(d => d.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const data = historicalHourlyData.value.map(d => d.precipitation);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Rainfall (mm)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        borderColor: '#0099ff',
        data: data,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };
});

// Chart data for hourly wind speed
const hourlyWindSpeedChartData = computed(() => {
  const labels = historicalHourlyData.value.map(d => d.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const data = historicalHourlyData.value.map(d => d.windSpeed);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Wind Speed (km/h)',
        backgroundColor: 'rgba(102, 255, 102, 0.2)',
        borderColor: '#66ff66',
        data: data,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };
});

const hourlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#ccc',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 4
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#ccc'
      }
    }
  }
};

// Chart data for weekly temperature
const weeklyTemperatureChartData = computed(() => {
  const labels = weeklySummaryData.value.map(d => d.label);
  const avgTemps = weeklySummaryData.value.map(d => d.avgTemp);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Avg. Temperature (°C)',
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderColor: '#ff9900',
        data: avgTemps,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      }
    ]
  };
});

// Chart data for weekly rainfall
const weeklyRainfallChartData = computed(() => {
  const labels = weeklySummaryData.value.map(d => d.label);
  const totalRainfalls = weeklySummaryData.value.map(d => d.totalRainfall);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Total Rainfall (mm)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        borderColor: '#0099ff',
        data: totalRainfalls,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      }
    ]
  };
});

// Chart data for monthly temperature and rainfall
const monthlyTemperatureRainfallChartData = computed(() => {
  const labels = monthlySummaryData.value.map(d => d.label);
  const avgTemps = monthlySummaryData.value.map(d => d.avgTemp);
  const totalRainfalls = monthlySummaryData.value.map(d => d.totalRainfall);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Avg. Temperature (°C)',
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderColor: '#ff9900',
        data: avgTemps,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-temp',
        pointRadius: 3,
      },
      {
        label: 'Total Rainfall (mm)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        borderColor: '#0099ff',
        data: totalRainfalls,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-rain',
        pointRadius: 3,
      }
    ]
  };
});

const monthlyTemperatureRainfallChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#ccc'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        maxRotation: 45,
        minRotation: 0,
      }
    },
    'y-temp': {
      type: 'linear',
      position: 'left',
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}°C`;
        }
      },
      title: {
        display: true,
        text: 'Temperature (°C)',
        color: '#66ff66'
      }
    },
    'y-rain': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}mm`;
        }
      },
      title: {
        display: true,
        text: 'Rainfall (mm)',
        color: '#0099ff'
      }
    },
    'y-humidity': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}%`;
        }
      },
      title: {
        display: true,
        text: 'Humidity (%)',
        color: '#66ff66'
      }
    }
  }
};

// Chart data for seasonal weather patterns (last 12 months)
const seasonalWeatherPatternsChartData = computed(() => {
  const labels = seasonalSummaryData.value.map(d => d.label);
  const avgTemps = seasonalSummaryData.value.map(d => d.avgTemp);
  const totalRainfalls = seasonalSummaryData.value.map(d => d.totalRainfall);
  const avgHumidities = seasonalSummaryData.value.map(d => d.avgHumidity);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Avg. Temperature (°C)',
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderColor: '#ff9900',
        data: avgTemps,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-temp',
        pointRadius: 3,
      },
      {
        label: 'Total Rainfall (mm)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        borderColor: '#0099ff',
        data: totalRainfalls,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-rain',
        pointRadius: 3,
      },
      {
        label: 'Avg. Humidity (%)',
        backgroundColor: 'rgba(102, 255, 102, 0.2)',
        borderColor: '#66ff66',
        data: avgHumidities,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-humidity',
        pointRadius: 3,
      }
    ]
  };
});

const seasonalWeatherPatternsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#ccc'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc'
      }
    },
    'y-temp': {
      type: 'linear',
      position: 'left',
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}°C`;
        }
      },
      title: {
        display: true,
        text: 'Temperature (°C)',
        color: '#66ff66'
      }
    },
    'y-rain': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}mm`;
        }
      },
      title: {
        display: true,
        text: 'Rainfall (mm)',
        color: '#0099ff'
      }
    },
    'y-humidity': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}%`;
        }
      },
      title: {
        display: true,
        text: 'Humidity (%)',
        color: '#66ff66'
      }
    }
  }
};

// Historical Correlation Chart Data (dynamically generated from scan history)
const historicalCorrelationChartData = computed(() => {
  if (rawScanHistoryData.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Sort data by timestamp to ensure correct chronological order
  const sortedData = [...rawScanHistoryData.value].sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

  const labels = sortedData.map(d => d.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const temperatures = sortedData.map(d => d.weather.temperature);
  const rainfalls = sortedData.map(d => d.weather.precipitation);
  
  // Map severity to a numerical value for charting
  const diseaseSeverity = sortedData.map(d => {
    if (d.severity === 'High') return 3;
    if (d.severity === 'Medium') return 2;
    if (d.severity === 'Low') return 1;
    return 0; // No disease/pest or unknown severity
  });

  return {
    labels: labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        backgroundColor: 'rgba(102, 255, 102, 0.2)',
        borderColor: '#66ff66',
        data: temperatures,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-temp',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Total Rainfall (mm)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        borderColor: '#0099ff',
        data: rainfalls,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-rainfall',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Disease/Pest Severity (0-3)',
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderColor: '#ff9900',
        data: diseaseSeverity,
        fill: false,
        tension: 0.4,
        yAxisID: 'y-risk',
        pointRadius: 2,
        borderWidth: 2,
      }
    ]
  };
});

const historicalCorrelationChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#ccc'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc'
      }
    },
    'y-temp': {
      type: 'linear',
      position: 'left',
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}°C`;
        }
      },
      title: {
        display: true,
        text: 'Temperature (°C)',
        color: '#66ff66'
      }
    },
    'y-rainfall': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ccc',
        callback: function (value) {
          return `${value}mm`;
        }
      },
      title: {
        display: true,
        text: 'Rainfall (mm)',
        color: '#0099ff'
      }
    },
    'y-risk': {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      min: 0,
      max: 3, // Max severity level
      ticks: {
        color: '#ccc',
        stepSize: 1,
        callback: function (value) {
          if (value === 3) return 'High';
          if (value === 2) return 'Medium';
          if (value === 1) return 'Low';
          return 'None';
        }
      },
      title: {
        display: true,
        text: 'Disease/Pest Severity',
        color: '#ff9900'
      }
    }
  }
};

// Utility methods for styling
const getConditionClass = (status) => {
  if (status === 'Optimal') return 'bg-green-100 text-green-700';
  if (status === 'Good') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Fair') return 'bg-yellow-100 text-yellow-700';
  if (status === 'Suboptimal' || status === 'High' || status === 'Low' || status === 'Warning' || status === 'Critical') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

const getAlertClass = (severity) => {
  if (severity === 'severe') return 'bg-red-100 text-red-700';
  if (severity === 'warning') return 'bg-amber-100 text-amber-700';
  if (severity === 'medium') return 'bg-blue-100 text-blue-700';
  if (severity === 'low') return 'bg-gray-100 text-gray-700';
  if (severity === 'advisory') return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

const getAlertIconClass = (severity) => {
  if (severity === 'severe') return 'bg-red-100 text-red-700';
  if (severity === 'warning') return 'bg-amber-100 text-amber-700';
  if (severity === 'medium') return 'bg-blue-100 text-blue-700';
  if (severity === 'low') return 'bg-gray-100 text-gray-700';
  if (severity === 'advisory') return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

const setHistoryPeriod = (period) => {
  historyPeriod.value = period;
};

// Handle sign out
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

// Lifecycle hooks
const autoRefreshEnabledLocal = ref(autoRefreshEnabled.value);
const autoRefreshIntervalLocal = ref(autoRefreshInterval.value);

const loadingSvg = ref(null); // Define loadingSvg ref

onMounted(async () => {
  console.log("WeatherMonitoring component mounted");
  await fetchUserData();
  startAutoRefresh(autoRefreshInterval.value);
  loadingSvg.value = document.querySelector('.animate-spin'); // Assign the element to the ref
});

onBeforeUnmount(() => {
  console.log("WeatherMonitoring component unmounted");
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});

watch([autoRefreshEnabled, autoRefreshInterval], () => {
  startAutoRefresh(autoRefreshInterval.value);
});
</script>

<style scoped>
/* Custom scrollbar for better aesthetics */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #374151; /* gray-700 */
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; /* gray-600 */
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* gray-500 */
}

/* 3D Forecast Card Effects */
.forecast-card-3d {
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.forecast-card-inner {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.forecast-card-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  pointer-events: none;
}

.forecast-card-3d:hover {
  transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
}

.forecast-card-3d:hover .forecast-card-inner {
  transform: translateZ(20px);
}

.weather-icon-3d {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  transform: translateZ(10px);
}

.forecast-card-3d:hover .weather-icon-3d {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  transform: translateZ(15px) scale(1.1);
}

/* Mobile-specific 3D adjustments */
@media (max-width: 768px) {
  .forecast-card-3d {
    perspective: 800px;
  }
  
  .forecast-card-3d:hover {
    transform: translateY(-4px) rotateX(3deg) rotateY(3deg);
  }
  
  .forecast-card-inner {
    padding: 12px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .forecast-card-3d:active {
    transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
  }
  
  .forecast-card-3d:active .forecast-card-inner {
    transform: translateZ(10px);
  }
}

/* Weather Forecast Carousel Animation */
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 10s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
