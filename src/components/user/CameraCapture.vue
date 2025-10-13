<template>
    <div class="border-2 border-gray-600 rounded-lg p-4 text-center">
      <div class="max-w-2xl mx-auto">
        <div v-if="!isCameraActive && !capturedImage" class="py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          
          <h4 class="text-lg font-medium mb-2">Take a Picture</h4>
          
          <div v-if="isRequestingPermission" class="text-center mb-4">
            <div class="animate-pulse flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p class="text-emerald-400 font-medium">Requesting Camera Permission</p>
              <p class="text-gray-400 text-sm mt-1">Please allow access when prompted by your browser</p>
            </div>
          </div>
          
          <div v-else-if="permissionDenied" class="text-center mb-4">
            <div class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-red-400 font-medium">Camera Permission Denied</p>
              <p class="text-gray-400 text-sm mt-1 mb-3">You need to allow camera access in your browser settings</p>
              
              <div class="bg-gray-700/50 p-3 rounded-md text-left text-sm mb-4 max-w-md">
                <p class="font-medium mb-1">How to enable camera access:</p>
                <ol class="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Click the camera or lock icon in your browser's address bar</li>
                  <li>Select "Allow" for camera access</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </div>
              
              <button 
                @click="retryPermission" 
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
          
          <div v-else>
            <p class="text-gray-400 mb-4">Use your device's camera to take a clear picture of the banana plant.</p>
            
            <button 
              @click="startCamera" 
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition-colors"
            >
              Start Camera
            </button>
          </div>
        </div>
        
        <!-- Camera View -->
        <div v-if="isCameraActive && !capturedImage" class="relative">
          <div class="bg-black rounded-md overflow-hidden" style="height: 400px; width: 100%;">
            <video 
              ref="videoElement" 
              class="h-full w-full object-cover"
              autoplay 
              playsinline
              muted
            ></video>
          </div>
          
          <div class="absolute bottom-4 left-0 right-0 flex justify-center">
            <button 
              @click="captureImage" 
              class="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-12 h-12 rounded-full border-4 border-emerald-600"></div>
            </button>
          </div>
          
          <button 
            @click="stopCamera" 
            class="absolute top-4 right-4 p-2 bg-gray-800/70 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="absolute top-4 left-4 flex space-x-2">
            <button 
              @click="switchCamera" 
              class="p-2 bg-gray-800/70 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button 
              v-if="flashAvailable"
              @click="toggleFlash" 
              class="p-2 bg-gray-800/70 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Captured Image Preview -->
        <div v-if="capturedImage" class="relative">
          <div class="bg-black rounded-md overflow-hidden" style="height: 400px; width: 100%;">
            <img :src="capturedImage" class="h-full w-full object-contain" alt="Captured image" />
          </div>
          
          <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button 
              @click="retakeImage" 
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition-colors"
            >
              Retake
            </button>
            <button 
              @click="acceptCapturedImage" 
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition-colors"
            >
              Use This Image
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onUnmounted } from 'vue';
  
  const props = defineProps({
    error: {
      type: Object,
      default: null
    }
  });
  
  const emit = defineEmits(['error', 'image-captured']);
  
  // Camera state
  const isCameraActive = ref(false);
  const videoElement = ref(null);
  const capturedImage = ref(null);
  const mediaStream = ref(null);
  const hasMultipleCameras = ref(false);
  const availableCameras = ref([]);
  const flashAvailable = ref(false);
  const flashOn = ref(false);
  const isRequestingPermission = ref(false);
  const permissionDenied = ref(false);
  const currentCameraMode = ref('user'); // 'user' for front camera, 'environment' for back camera
  
  // Methods
  const startCamera = async () => {
    // Reset any previous errors and states
    emit('error', null);
    capturedImage.value = null;
  
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access. Please try a different browser or use the upload option.");
      }
      
      // Show permission request message
      isRequestingPermission.value = true;
      
      // Stop any existing stream
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop());
        mediaStream.value = null;
      }
      
      // First try to get basic camera access
      const basicConstraints = {
        video: true,
        audio: false
      };
      
      mediaStream.value = await navigator.mediaDevices.getUserMedia(basicConstraints);
      
      // Now that we have permission, enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Check if there are any video devices
      if (videoDevices.length === 0) {
        throw new Error("No camera detected on your device. Please use the upload option instead.");
      }
      
      availableCameras.value = videoDevices;
      hasMultipleCameras.value = videoDevices.length > 1;
      
      console.log("Available cameras:", availableCameras.value);
      
      // Stop the initial stream
      mediaStream.value.getTracks().forEach(track => track.stop());
      
      // Try to use the environment facing camera by default on mobile
      let facingMode = 'user'; // Default to front camera
      
      // Check if this is likely a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, prefer the back camera initially
        facingMode = 'environment';
      }
      
      // Set up constraints with the preferred facing mode
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log("Using constraints:", constraints);
      
      // Get the stream with the preferred facing mode
      mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if flash/torch is available
      if (mediaStream.value.getVideoTracks().length > 0) {
        const track = mediaStream.value.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        flashAvailable.value = capabilities.torch || false;
        console.log("Flash available:", flashAvailable.value);
      }
      
      // Connect stream to video element
      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream.value;
        videoElement.value.muted = true; // Ensure video is muted to prevent feedback
        
        // Add event listener to log when video starts playing
        videoElement.value.onloadedmetadata = () => {
          console.log("Video metadata loaded, dimensions:", 
            videoElement.value.videoWidth, "x", videoElement.value.videoHeight);
          videoElement.value.play().catch(e => console.error("Error playing video:", e));
        };
        
        videoElement.value.onplaying = () => {
          console.log("Video is now playing");
        };
      } else {
        console.error("Video element not found");
      }
      
      isCameraActive.value = true;
      isRequestingPermission.value = false;
      permissionDenied.value = false;
      
      // Set the current camera mode
      currentCameraMode.value = facingMode;
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      isRequestingPermission.value = false;
      
      // Handle permission denied error specifically
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        permissionDenied.value = true;
        emit('error', "Camera access was denied. Please allow camera access in your browser settings to use this feature.");
      } else if (err.name === 'OverconstrainedError') {
        // Handle the case where constraints can't be satisfied
        emit('error', "Your camera doesn't support the requested settings. Please try again with different settings or use the upload option.");
      } else {
        emit('error', `Could not access camera: ${err.message}. You can still upload images manually.`);
      }
    }
  };
  
  const switchCamera = async () => {
    if (!isCameraActive.value) return;
  
    try {
      // Stop current stream
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop());
      }
      
      // Toggle between front and back camera
      const newFacingMode = currentCameraMode.value === 'user' ? 'environment' : 'user';
      
      console.log(`Switching camera from ${currentCameraMode.value} to ${newFacingMode}`);
      
      // Set up constraints for the new camera
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      // Get the stream with the new facing mode
      mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if flash/torch is available on this camera
      if (mediaStream.value.getVideoTracks().length > 0) {
        const track = mediaStream.value.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        flashAvailable.value = capabilities.torch || false;
        
        // Turn off flash when switching cameras
        if (flashOn.value && flashAvailable.value) {
          track.applyConstraints({ advanced: [{ torch: false }] });
          flashOn.value = false;
        }
      }
      
      // Connect the new stream to the video element
      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream.value;
      }
      
      // Update the current camera mode
      currentCameraMode.value = newFacingMode;
      
    } catch (err) {
      console.error("Error switching camera:", err);
      emit('error', "Failed to switch camera. Please try again or use a different method.");
      
      // Try to recover by restarting the camera
      setTimeout(() => {
        startCamera();
      }, 1000);
    }
  };
  
  const stopCamera = () => {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop());
      mediaStream.value = null;
    }
  
    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }
  
    isCameraActive.value = false;
  };
  
  const toggleFlash = async () => {
    if (!mediaStream.value || !flashAvailable.value) return;
    
    try {
      const track = mediaStream.value.getVideoTracks()[0];
      flashOn.value = !flashOn.value;
      await track.applyConstraints({ advanced: [{ torch: flashOn.value }] });
      console.log(`Flash ${flashOn.value ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error("Error toggling flash:", err);
      flashOn.value = false;
    }
  };
  
  const captureImage = () => {
    if (!videoElement.value || !videoElement.value.videoWidth) {
      console.error("Video element not ready");
      emit('error', "Camera not ready. Please wait or restart the camera.");
      return;
    }
  
    try {
      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.value.videoWidth;
      canvas.height = videoElement.value.videoHeight;
      
      // Draw the current video frame to the canvas
      context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL (image)
      capturedImage.value = canvas.toDataURL('image/jpeg', 0.9);
      
      // Stop the camera stream to freeze the image
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop());
        mediaStream.value = null;
      }
      
      console.log("Image captured successfully");
    } catch (err) {
      console.error("Error capturing image:", err);
      emit('error', "Failed to capture image. Please try again.");
    }
  };
  
  const retakeImage = () => {
    capturedImage.value = null;
    // Restart the camera
    startCamera();
  };
  
  const acceptCapturedImage = () => {
    if (!capturedImage.value) return;
    
    // Convert data URL to Blob
    const byteString = atob(capturedImage.value.split(',')[1]);
    const mimeType = capturedImage.value.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([arrayBuffer], { type: mimeType });
    
    // Create a File object from the Blob
    const fileName = `camera_capture_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: mimeType });
    
    // Emit the captured image
    emit('image-captured', {
      file,
      previewUrl: capturedImage.value
    });
    
    // Reset camera state
    capturedImage.value = null;
    isCameraActive.value = false;
  };
  
  const retryPermission = () => {
    permissionDenied.value = false;
    startCamera();
  };
  
  // Clean up resources when component is unmounted
  onUnmounted(() => {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop());
      mediaStream.value = null;
    }
  });
  </script>