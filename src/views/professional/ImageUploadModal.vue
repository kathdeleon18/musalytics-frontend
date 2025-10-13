<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 class="text-xl font-bold mb-4">Insert Image</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-400 mb-1">Upload Image</label>
        <div 
          class="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-700/30"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop"
          :class="{ 'border-emerald-500 bg-emerald-500/10': dragover }"
        >
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-1 text-sm text-gray-400">Drag and drop an image here, or click to select</p>
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              ref="imageInput"
              @change="handleFileSelect"
            />
            <button 
              @click="$refs.imageInput.click()" 
              class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white"
            >
              Select Image
            </button>
          </div>
        </div>
        
        <!-- Preview image if uploaded -->
        <div v-if="uploadedImage" class="mt-4 flex flex-col items-center">
          <img :src="uploadedImage" alt="Preview" class="max-h-40 rounded-md" />
          <button 
            @click="uploadedImage = null" 
            class="mt-2 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 rounded-md text-red-400 text-sm"
          >
            Remove
          </button>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-400 mb-1">Or enter image URL</label>
        <input 
          v-model="imageUrl" 
          type="text" 
          placeholder="https://example.com/image.jpg" 
          class="w-full px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-white"
        />
      </div>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancel" 
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Cancel
        </button>
        <button 
          @click="insert" 
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md"
          :disabled="!imageUrl && !uploadedImage"
        >
          Insert
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB default
  }
});

const emit = defineEmits(['update:modelValue', 'insert', 'error']);

// State
const imageUrl = ref('');
const uploadedImage = ref(null);
const dragover = ref(false);
const imageInput = ref(null);

// Methods
const cancel = () => {
  resetForm();
  emit('update:modelValue', false);
};

const resetForm = () => {
  imageUrl.value = '';
  uploadedImage.value = null;
  dragover.value = false;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  processFile(file);
};

const handleDrop = (event) => {
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  
  dragover.value = false;
  processFile(file);
};

const processFile = (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    emit('error', 'Please select an image file');
    return;
  }
  
  // Validate file size
  if (file.size > props.maxSize) {
    emit('error', `Image size should be less than ${props.maxSize / (1024 * 1024)}MB`);
    return;
  }
  
  // Read and preview the file
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const insert = () => {
  const src = uploadedImage.value || imageUrl.value;
  if (!src) return;
  
  emit('insert', {
    src,
    alt: 'Inserted image'
  });
  
  resetForm();
  emit('update:modelValue', false);
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>