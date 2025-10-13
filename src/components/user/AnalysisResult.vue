<template>
    <div class="mt-4 shadow">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-medium text-[#606c38]">Analysis Results</h4>
        <button 
          @click="$emit('reset')" 
          class="text-sm text-emerald-400 hover:text-emerald-300"
        >
          Start New Scan
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Image with Detection -->
        <div class="bg-gray-700/50 rounded-lg overflow-hidden">
          <div class="relative">
            <img :src="result.imageUrl" class="w-full h-64 object-cover" alt="Analyzed Image" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-4">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs bg-red-500/80 text-white rounded-full">{{ result.confidence }}% Confidence</span>
                <span class="px-2 py-1 text-xs bg-yellow-500/80 text-white rounded-full">{{ result.severity }} Severity</span>
              </div>
            </div>
          </div>
          <div class="p-4">
            <h5 class="font-medium text-lg mb-1">{{ result.disease }}</h5>
            <p class="text-gray-400 text-sm">{{ result.description }}</p>
          </div>
        </div>
        
        <!-- Treatment Recommendations -->
        <div class="bg-gray-700/50 rounded-lg p-4">
          <h5 class="font-medium mb-3">Treatment Recommendations</h5>
          <ul class="space-y-3">
            <li v-for="(treatment, index) in result.treatments" :key="index" class="flex items-start space-x-3">
              <div class="h-5 w-5 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <span class="text-xs text-emerald-400 font-medium">{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm">{{ treatment }}</p>
              </div>
            </li>
          </ul>
          
          <div class="mt-4 pt-4 border-t border-gray-400">
            <h5 class="font-medium mb-2">Prevention Tips</h5>
            <ul class="space-y-2">
              <li v-for="(tip, index) in result.preventionTips" :key="index" class="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-sm text-gray-300">{{ tip }}</p>
              </li>
            </ul>
          </div>
          
          <div class="flex space-x-3 mt-4">
            <button 
              @click="$emit('view-details')" 
              class="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium transition-colors"
            >
              View Details
            </button>
            <button 
              @click="$emit('save')" 
              class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors"
              :disabled="isSaving"
            >
              <span v-if="isSaving">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save to Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    result: {
      type: Object,
      required: true
    },
    isSaving: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['reset', 'save', 'view-details']);
  </script>