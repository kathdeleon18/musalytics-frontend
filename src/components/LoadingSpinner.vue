<template>
    <div class="loading-container" v-show="isVisible">
      <div class="tech-spinner">
        <div class="spinner-ring outer-ring"></div>
        <div class="spinner-ring middle-ring"></div>
        <div class="spinner-ring inner-ring"></div>
        <div class="spinner-core">
          <div class="core-pulse"></div>
        </div>
        <div class="spinner-particles">
          <div v-for="n in 6" :key="n" class="particle" :style="{ '--delay': `${n * 0.15}s` }"></div>
        </div>
      </div>
      <p v-if="message" class="loading-text">{{ message }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  const props = defineProps({
    message: {
      type: String,
      default: 'Loading...'
    },
    minDisplayTime: {
      type: Number,
      default: 1500 // 1.5 seconds minimum display time
    }
  });
  
  const isVisible = ref(false);
  let startTime = 0;
  let timeoutId = null;
  
  onMounted(() => {
    startTime = Date.now();
    isVisible.value = true;
    
    // Ensure spinner shows for at least minDisplayTime
    timeoutId = setTimeout(() => {
      // This will be executed after minDisplayTime
    }, props.minDisplayTime);
  });
  
  onBeforeUnmount(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
  
  // This function can be called when loading is complete
  const hideSpinner = () => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    
    if (elapsedTime < props.minDisplayTime) {
      // If not shown for minimum time, wait before hiding
      const remainingTime = props.minDisplayTime - elapsedTime;
      setTimeout(() => {
        isVisible.value = false;
      }, remainingTime);
    } else {
      // If already shown for minimum time, hide immediately
      isVisible.value = false;
    }
  };
  
  // Expose the hideSpinner method
  defineExpose({ hideSpinner });
  </script>
  
  <style scoped>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .loading-text {
    margin-top: 1.5rem;
    color: #9ca3af;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  .tech-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .spinner-ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid transparent;
  }
  
  .outer-ring {
    width: 80px;
    height: 80px;
    border-top: 2px solid #10b981;
    border-left: 2px solid #10b981;
    animation: spin 2s linear infinite;
  }
  
  .middle-ring {
    width: 60px;
    height: 60px;
    border-right: 2px solid #0ea5e9;
    border-bottom: 2px solid #0ea5e9;
    animation: spin 1.5s linear infinite reverse;
  }
  
  .inner-ring {
    width: 40px;
    height: 40px;
    border-top: 2px solid #f59e0b;
    border-right: 2px solid #f59e0b;
    animation: spin 1s linear infinite;
  }
  
  .spinner-core {
    position: absolute;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #10b981, #059669);
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.7);
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  .core-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.8), rgba(16, 185, 129, 0));
    animation: ripple 1.5s ease-in-out infinite;
  }
  
  .spinner-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    animation: spin 10s linear infinite;
  }
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: #0ea5e9;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: particle-move 2s ease-in-out infinite;
    animation-delay: var(--delay);
  }
  
  .particle:nth-child(odd) {
    background-color: #f59e0b;
  }
  
  .particle:nth-child(3n) {
    background-color: #10b981;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  
  @keyframes particle-move {
    0% {
      transform: translate(-50%, -50%) translateX(0) translateY(0);
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) translateX(calc(cos(var(--delay) * 360deg) * 30px)) translateY(calc(sin(var(--delay) * 360deg) * 30px));
      opacity: 0;
    }
  }
  </style>
  