<template>
    <div v-if="show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] shadow overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-medium">Detection Result Details</h3>
          <button 
            @click="$emit('close')" 
            class="p-1 rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="result" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column: Image and Basic Info -->
            <div>
              <div class="bg-gray-700/50 rounded-lg overflow-hidden mb-4">
                <img :src="result.imageUrl" class="w-full h-64 object-contain" alt="Analyzed Image" />
              </div>
              
              <div class="bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-lg">{{ result.disease }}</h4>
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs bg-red-500/80 text-white rounded-full">{{ result.confidence }}% Confidence</span>
                    <span class="px-2 py-1 text-xs bg-yellow-500/80 text-white rounded-full">{{ result.severity }} Severity</span>
                  </div>
                </div>
                
                <p class="text-gray-300 text-sm mb-4">{{ result.description }}</p>
                
                <div v-if="result.scientificName" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-400 mb-1">Scientific Name</h5>
                  <p class="text-sm italic">{{ result.scientificName }}</p>
                </div>
                
                <div v-if="result.affectedParts && result.affectedParts.length > 0" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-400 mb-1">Affected Plant Parts</h5>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(part, index) in result.affectedParts" 
                      :key="index"
                      class="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded-full"
                    >
                      {{ part }}
                    </span>
                  </div>
                </div>
                
                <div v-if="result.category" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-400 mb-1">Category</h5>
                  <span class="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded-md">
                    {{ result.category }}
                  </span>
                </div>
                
                <div class="mb-4">
                  <h5 class="text-sm font-medium text-gray-400 mb-1">Analysis ID</h5>
                  <p class="text-xs text-gray-400 font-mono">{{ result.analysisId }}</p>
                </div>
                
                <div>
                  <h5 class="text-sm font-medium text-gray-400 mb-1">Date</h5>
                  <p class="text-sm">{{ result.date }}</p>
                </div>
              </div>
            </div>
            
            <!-- Right Column: Symptoms, Treatments, Prevention -->
            <div class="space-y-4">
              <!-- Symptoms -->
              <div v-if="result.symptoms && result.symptoms.length > 0" class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium mb-3">Symptoms</h4>
                <ul class="space-y-2">
                  <li v-for="(symptom, index) in result.symptoms" :key="index" class="flex items-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-sm text-gray-300">{{ symptom }}</p>
                  </li>
                </ul>
              </div>
              
              <!-- Causes -->
              <div v-if="result.causes" class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium mb-3">Causes</h4>
                <p class="text-sm text-gray-300">{{ result.causes }}</p>
              </div>
              
              <!-- Treatments -->
              <div v-if="result.treatments && result.treatments.length > 0" class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium mb-3">Treatment Recommendations</h4>
                <ul class="space-y-3">
                  <li v-for="(treatment, index) in result.treatments" :key="index" class="flex items-start space-x-3">
                    <div class="h-5 w-5 rounded-full bg-[#606c38]/50 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span class="text-xs text-[#606c38] font-medium">{{ index + 1 }}</span>
                    </div>
                    <div>
                      <p class="text-sm">{{ treatment }}</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <!-- Prevention Tips -->
              <div v-if="result.preventionTips && result.preventionTips.length > 0" class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium mb-3">Prevention Tips</h4>
                <ul class="space-y-2">
                  <li v-for="(tip, index) in result.preventionTips" :key="index" class="flex items-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#606c38] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p class="text-sm text-gray-300">{{ tip }}</p>
                  </li>
                </ul>
              </div>
              
              <!-- Additional Info -->
              <div v-if="result.additionalInfo" class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium mb-3">Additional Information</h4>
                <p class="text-sm text-gray-300">{{ result.additionalInfo }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <p class="text-gray-400">No detection result available</p>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-4 border-t border-gray-700 flex items-center justify-between">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="auto-save" 
              :checked="autoSave" 
              @change="$emit('toggle-auto-save')" 
              class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-emerald-600 focus:ring-emerald-500"
            />
            <label for="auto-save" class="ml-2 text-sm text-gray-300">
              Automatically save future detections
            </label>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="$emit('close')" 
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
            >
              Dismiss
            </button>
            <button 
              @click="$emit('save')" 
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors"
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
    show: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      default: null
    },
    autoSave: {
      type: Boolean,
      default: false
    },
    isSaving: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['close', 'save', 'toggle-auto-save']);
  </script>