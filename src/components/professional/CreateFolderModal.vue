<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">{{ editingFolder ? 'Edit Folder' : 'Create New Folder' }}</h3>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveFolder">
          <div class="space-y-4">
            <!-- Folder Name -->
            <div>
              <label for="folderName" class="block text-sm font-medium text-gray-500 mb-1">Folder Name</label>
              <input 
                v-model="folderData.name"
                type="text" 
                id="folderName" 
                class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                required
              />
            </div>
            
            <!-- Description -->
            <div>
              <label for="folderDescription" class="block text-sm font-medium text-gray-500 mb-1">Description (Optional)</label>
              <textarea 
                v-model="folderData.description"
                id="folderDescription" 
                rows="3"
                class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
              ></textarea>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="submit"
              class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors"
            >
              {{ editingFolder ? 'Update Folder' : 'Create Folder' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editingFolder: {
    type: Object,
    default: null
  },
  currentFolderId: {
    type: String,
    default: 'root'
  }
});

const emit = defineEmits(['close', 'save']);

const folderData = ref({
  name: '',
  description: '',
  id: null
});

// Watch for changes in the editingFolder prop
watch(() => props.editingFolder, (newVal) => {
  if (newVal) {
    folderData.value = {
      name: newVal.name || '',
      description: newVal.description || '',
      id: newVal.id
    };
  } else {
    folderData.value = {
      name: '',
      description: '',
      id: null
    };
  }
}, { immediate: true });

const saveFolder = () => {
  emit('save', {
    ...folderData.value,
    parentId: props.currentFolderId
  });
};
</script>