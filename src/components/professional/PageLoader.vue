<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="flex flex-col items-center space-y-4">
      <!-- Logo -->
      <div class="flex items-center space-x-3">
        <img src="/images/musaLogowhite.svg" alt="MUSALYTICS" class="h-12 w-12 object-contain" />
        <span class="text-2xl font-bold text-white">MUSALYTICS</span>
      </div>
      
      <!-- Dots Loader -->
      <div class="flex space-x-2">
        <div class="w-3 h-3 bg-[#c9d4a3] rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-3 h-3 bg-[#c9d4a3] rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-3 h-3 bg-[#c9d4a3] rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>
