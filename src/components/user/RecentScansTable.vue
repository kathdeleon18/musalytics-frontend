<template>
    <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">Recent Scans</h3>
        <button class="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
      </div>
      
      <div v-if="scans.length === 0" class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-400">No recent scans found</p>
        <p class="text-sm text-gray-500 mt-1">Upload and analyze images to see your scan history</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs text-gray-400 border-b border-gray-700">
              <th class="pb-2 font-medium">Image</th>
              <th class="pb-2 font-medium">Detection</th>
              <th class="pb-2 font-medium">Date</th>
              <th class="pb-2 font-medium">Confidence</th>
              <th class="pb-2 font-medium">Severity</th>
              <th class="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(scan, index) in scans" :key="index" class="border-b border-gray-700/50">
              <td class="py-3 pr-4">
                <div class="h-12 w-12 rounded-md overflow-hidden bg-gray-700">
                  <img :src="scan.imageUrl" class="w-full h-full object-cover" alt="Scan" />
                </div>
              </td>
              <td class="py-3 pr-4">
                <p class="font-medium">{{ scan.disease }}</p>
                <p class="text-xs text-gray-400">{{ scan.location }}</p>
              </td>
              <td class="py-3 pr-4 text-sm text-gray-300">{{ scan.date }}</td>
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
                    @click="$emit('view-details', scan)" 
                    class="p-1.5 rounded-md hover:bg-gray-700 transition-colors" 
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    @click="$emit('download-report', scan)" 
                    class="p-1.5 rounded-md hover:bg-gray-700 transition-colors" 
                    title="Download Report"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  </template>
  
  <script setup>
  const props = defineProps({
    scans: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['view-details', 'download-report']);
  
  // Utility methods
  const getConfidenceClass = (confidence) => {
    if (confidence >= 90) {
      return 'bg-emerald-500/20 text-emerald-400';
    } else if (confidence >= 70) {
      return 'bg-blue-500/20 text-blue-400';
    } else {
      return 'bg-yellow-500/20 text-yellow-400';
    }
  };
  
  const getSeverityClass = (severity) => {
    if (severity === 'High') {
      return 'bg-red-500/20 text-red-400';
    } else if (severity === 'Medium') {
      return 'bg-yellow-500/20 text-yellow-400';
    } else {
      return 'bg-green-500/20 text-green-400';
    }
  };
  </script>