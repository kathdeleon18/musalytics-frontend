<template>
    <div class="py-12 text-center">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-emerald-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h4 class="text-lg font-medium mb-2">Analyzing Images</h4>
        <p class="text-gray-400 max-w-md mx-auto">Our AI model is processing your images to detect banana plant diseases and pests. This may take a few moments...</p>
        
        <div class="w-full max-w-md mt-6">
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-emerald-500 rounded-full transition-all duration-300" 
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-2">{{ progressText }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    progress: {
      type: Number,
      default: 0
    }
  });
  
  const progressText = computed(() => {
    if (props.progress < 30) {
      return 'Preprocessing images...';
    } else if (props.progress < 60) {
      return 'Running detection model...';
    } else if (props.progress < 90) {
      return 'Analyzing results...';
    } else {
      return 'Finalizing report...';
    }
  });
  </script>