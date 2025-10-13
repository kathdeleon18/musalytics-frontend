<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">Add Learning Material</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitForm">
          <!-- Title -->
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-500 mb-1">Title <span class="text-red-500">*</span></label>
            <input 
              v-model="form.title"
              type="text" 
              id="title" 
              class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Enter material title"
              required
            />
          </div>
          
          <!-- Description -->
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-500 mb-1">Description</label>
            <textarea 
              v-model="form.description"
              id="description" 
              class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Enter material description"
            ></textarea>
          </div>
          
          <!-- Category -->
          <div class="mb-4 relative">
            <label for="category" class="block text-sm font-medium text-gray-500 mb-1">Category <span class="text-red-500">*</span></label>
            <div class="relative">
              <input 
                v-model="categoryInput"
                type="text" 
                id="category" 
                class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Select or enter a category"
                @focus="showCategorySuggestions = true"
                @blur="handleCategoryBlur"
                required
              />
              <div v-if="showCategorySuggestions && filteredCategories.length > 0" class="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-400   max-h-60 overflow-auto">
                <div 
                  v-for="category in filteredCategories" 
                  :key="category"
                  @click="selectCategory(category)"
                  class="px-4 py-2 hover:bg-gray-300 cursor-pointer"
                >
                  {{ formatName(category) }}
                </div>
                <div v-if="categoryInput && !filteredCategories.includes(categoryInput)" @click="addNewCategory" class="px-4 py-2 hover:bg-gray-600 cursor-pointer text-emerald-400">
                  + Add "{{ categoryInput }}" as new category
                </div>
              </div>
            </div>
          </div>
          
          <!-- File Upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-500 mb-1">File <span class="text-red-500">*</span></label>
            <div 
              class="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center"
              :class="{ 'border-emerald-500 bg-emerald-500/10': dragover }"
              @dragover.prevent="dragover = true"
              @dragleave.prevent="dragover = false"
              @drop.prevent="handleFileDrop"
            >
              <div v-if="!selectedFile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-gray-500 mb-2">Drag and drop your file here, or</p>
                <button 
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="px-4 py-2 bg-[#c9d4a3] hover:bg-[#606c38]/100 text-white hover:text-[#c9d4a3] rounded-xl transition-colors"
                >
                  Browse Files
                </button>
                <input 
                  ref="fileInput"
                  type="file" 
                  class="hidden"
                  @change="handleFileSelect"
                />
                <p class="text-gray-400 text-sm mt-2">Max file size: 50MB</p>
              </div>
              <div v-else class="text-left">
                <div class="flex items-center mb-2">
                  <div class="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mr-3">
                    <svg v-if="fileType === 'document'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg v-else-if="fileType === 'image'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="fileType === 'video'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="fileType === 'audio'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-500 truncate">{{ selectedFile.name }}</div>
                    <div class="text-sm text-gray-400">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <button 
                    type="button"
                    @click="removeFile"
                    class="p-1.5 text-red-500 hover:text-red-300 transition-colors ml-2"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Visibility -->
          <div class="mb-6">
            <label class="flex items-center">
              <input 
                v-model="form.isPublic"
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-gray-700"
              />
              <span class="ml-2 text-gray-600">Make this material visible to farmers</span>
            </label>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="mb-6">
            <div class="w-full bg-gray-700 rounded-full h-2.5">
              <div class="bg-emerald-600 h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <div class="text-sm text-gray-400 mt-1 text-center">Uploading: {{ uploadProgress }}%</div>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button 
              type="submit"
              class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors"
              :disabled="isUploading || !selectedFile || !form.title || !categoryInput"
            >
              <span v-if="isUploading">Uploading...</span>
              <span v-else>Upload Material</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { collection, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentFolderId: {
    type: String,
    default: 'root'
  },
  categories: {
    type: Array,
    default: () => []
  },
  userDisplayName: {
    type: String,
    default: 'User'
  }
});

const emit = defineEmits(['close', 'material-added', 'add-category', 'notification']);

// Form state
const form = ref({
  title: '',
  description: '',
  isPublic: true
});

// File upload state
const fileInput = ref(null);
const selectedFile = ref(null);
const dragover = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Category input state
const categoryInput = ref('');
const showCategorySuggestions = ref(false);

// Computed file type based on selected file
const fileType = computed(() => {
  if (!selectedFile.value) return 'other';
  
  const fileName = selectedFile.value.name.toLowerCase();
  
  // Document types
  if (fileName.endsWith('.pdf') || 
      fileName.endsWith('.doc') || 
      fileName.endsWith('.docx') || 
      fileName.endsWith('.txt') || 
      fileName.endsWith('.rtf') || 
      fileName.endsWith('.xls') || 
      fileName.endsWith('.xlsx') || 
      fileName.endsWith('.ppt') || 
      fileName.endsWith('.pptx')) {
    return 'document';
  }
  
  // Image types
  if (fileName.endsWith('.jpg') || 
      fileName.endsWith('.jpeg') || 
      fileName.endsWith('.png') || 
      fileName.endsWith('.gif') || 
      fileName.endsWith('.bmp') || 
      fileName.endsWith('.svg') || 
      fileName.endsWith('.webp')) {
    return 'image';
  }
  
  // Video types
  if (fileName.endsWith('.mp4') || 
      fileName.endsWith('.webm') || 
      fileName.endsWith('.ogg') || 
      fileName.endsWith('.mov') || 
      fileName.endsWith('.avi') || 
      fileName.endsWith('.wmv') || 
      fileName.endsWith('.flv')) {
    return 'video';
  }
  
  // Audio types
  if (fileName.endsWith('.mp3') || 
      fileName.endsWith('.wav') || 
      fileName.endsWith('.ogg') || 
      fileName.endsWith('.m4a') || 
      fileName.endsWith('.flac') || 
      fileName.endsWith('.aac')) {
    return 'audio';
  }
  
  // Default to other
  return 'other';
});

// Filtered categories for suggestions
const filteredCategories = computed(() => {
  if (!categoryInput.value) return props.categories;
  
  const search = categoryInput.value.toLowerCase();
  return props.categories.filter(category => 
    category.toLowerCase().includes(search)
  );
});

// Methods
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fixed the setTimeout issue by moving it to a method
const handleCategoryBlur = () => {
  setTimeout(() => {
    showCategorySuggestions.value = false;
  }, 200);
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      emit('notification', 'File size exceeds the 50MB limit', 'error');
      return;
    }
    
    selectedFile.value = file;
  }
};

const handleFileDrop = (event) => {
  dragover.value = false;
  
  const file = event.dataTransfer.files[0];
  if (file) {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      emit('notification', 'File size exceeds the 50MB limit', 'error');
      return;
    }
    
    selectedFile.value = file;
  }
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const selectCategory = (category) => {
  categoryInput.value = category;
  showCategorySuggestions.value = false;
};

const addNewCategory = () => {
  if (categoryInput.value && !props.categories.includes(categoryInput.value)) {
    emit('add-category', categoryInput.value);
  }
  showCategorySuggestions.value = false;
};

const closeModal = () => {
  if (isUploading.value) {
    const confirm = window.confirm('An upload is in progress. Are you sure you want to cancel?');
    if (!confirm) return;
  }
  
  // Reset form
  form.value = {
    title: '',
    description: '',
    isPublic: true
  };
  categoryInput.value = '';
  selectedFile.value = null;
  isUploading.value = false;
  uploadProgress.value = 0;
  
  emit('close');
};

const submitForm = async () => {
  if (!form.value.title || !categoryInput.value || !selectedFile.value) {
    emit('notification', 'Please fill in all required fields and select a file', 'error');
    return;
  }
  
  isUploading.value = true;
  uploadProgress.value = 0;
  
  try {
    // 1. Save material metadata to Firestore first (without the file URL)
    const timestamp = Date.now();
    const fileName = selectedFile.value.name;
    const fileExtension = fileName.split('.').pop();
    const safeFileName = `${form.value.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.${fileExtension}`;
    
    // Create a document in Firestore first
    const materialData = {
      title: form.value.title,
      description: form.value.description || '',
      category: categoryInput.value,
      fileType: fileType.value,
      fileName: fileName,
      fileSize: selectedFile.value.size,
      fileUrl: '', // Will be updated after upload
      storagePath: '', // Will be updated after upload
      folderId: props.currentFolderId,
      isPublic: form.value.isPublic,
      uploadedBy: props.userDisplayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: 'material' // To distinguish from folders
    };
    
    const docRef = await addDoc(collection(db, "learningMaterials"), materialData);
    const materialId = docRef.id;
    
    // 2. Now upload file to Firebase Storage using the document ID
    const storagePath = `materials/${materialId}/${safeFileName}`;
    const fileRef = storageRef(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(fileRef, selectedFile.value);
    
    // Monitor upload progress
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgress.value = Math.round(progress);
      },
      async (error) => {
        console.error("Upload error:", error);
        isUploading.value = false;
        
        // Try to delete the document since the upload failed
        try {
          await deleteDoc(doc(db, "learningMaterials", materialId));
        } catch (deleteErr) {
          console.error("Error deleting document after failed upload:", deleteErr);
        }
        
        emit('notification', 'Error uploading file: ' + error.message, 'error');
      },
      async () => {
        // Upload completed successfully
        try {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update the document with the file URL and storage path
          await updateDoc(doc(db, "learningMaterials", materialId), {
            fileUrl: downloadURL,
            storagePath: storagePath
          });
          
          // Update materialData for the event
          materialData.id = materialId;
          materialData.fileUrl = downloadURL;
          materialData.storagePath = storagePath;
          materialData.createdAt = new Date();
          materialData.updatedAt = new Date();
          
          // Emit event to parent component
          emit('material-added', materialData);
          emit('notification', 'Material uploaded successfully', 'success');
          
          // Reset form
          form.value = {
            title: '',
            description: '',
            isPublic: true
          };
          categoryInput.value = '';
          selectedFile.value = null;
          
          // Close modal
          emit('close');
        } catch (err) {
          console.error("Error updating material metadata:", err);
          emit('notification', 'Error saving material: ' + err.message, 'error');
        } finally {
          isUploading.value = false;
        }
      }
    );
  } catch (err) {
    console.error("Error in upload process:", err);
    isUploading.value = false;
    emit('notification', 'Error uploading material: ' + err.message, 'error');
  }
};
</script>