<template>
    <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
      <div class="max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <h4 class="text-lg font-medium mb-2">Drag & Drop Images Here</h4>
        <p class="text-gray-400 mb-4">Upload clear images of banana plant leaves, stems, or fruits for best results. Supported formats: JPG, PNG.</p>
        
        <div class="flex flex-col items-center">
          <label for="file-upload" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition-colors cursor-pointer">
            Select Images
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/jpeg, image/png" 
            multiple 
            class="hidden" 
            @change="handleFileUpload"
          />
          <p class="text-xs text-gray-500 mt-2">Maximum 5 images, up to 10MB each</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const emit = defineEmits(['files-selected', 'error']);
  
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
  
    // Limit to 5 files
    if (files.length > 5) {
      emit('error', 'You can upload a maximum of 5 images at once.');
      return;
    }
  
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024); // 10MB
    if (oversizedFiles.length > 0) {
      emit('error', 'One or more files exceed the 10MB size limit.');
      return;
    }
  
    // Generate preview URLs
    const previewUrls = [];
    let loadedCount = 0;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrls.push(e.target.result);
        loadedCount++;
        
        // When all files are loaded, emit the event
        if (loadedCount === files.length) {
          emit('files-selected', { files, previewUrls });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  </script>