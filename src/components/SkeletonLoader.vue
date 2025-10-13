<template>
  <div class="animate-pulse">
    <!-- Page Header Skeleton -->
    <div class="mb-4 sm:mb-8">
      <div class="h-8 bg-gray-300 rounded-lg w-1/3 mb-2"></div>
      <div class="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>

    <!-- Main Content Skeleton -->
    <div class="space-y-6">
      <!-- Stats Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
            <div class="h-6 bg-gray-300 rounded-full w-16"></div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="h-8 bg-gray-300 rounded w-16"></div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-300 rounded w-24"></div>
              <div class="h-2 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Chart/Analytics Section -->
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="h-6 bg-gray-300 rounded w-1/4"></div>
              <div class="flex space-x-2">
                <div class="h-8 bg-gray-300 rounded w-16"></div>
                <div class="h-8 bg-gray-300 rounded w-16"></div>
                <div class="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div class="h-64 bg-gray-300 rounded-lg"></div>
          </div>

          <!-- Table/List Section -->
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="h-6 bg-gray-300 rounded w-1/3"></div>
              <div class="h-4 bg-gray-300 rounded w-20"></div>
            </div>
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                <div class="h-12 w-12 bg-gray-300 rounded-md"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div class="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (1/3 width) -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow p-5">
            <div class="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="p-3 bg-gray-100 rounded-lg">
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Weather/Info Card -->
          <div class="bg-white rounded-xl shadow p-5">
            <div class="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-300 rounded w-24"></div>
                <div class="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div class="h-3 bg-gray-300 rounded w-full mb-3"></div>
            <div class="h-8 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This is a simple skeleton loader component
// It provides a consistent loading state across all pages
</script>

