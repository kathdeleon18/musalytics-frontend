<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300" :class="show ? 'opacity-100' : 'opacity-0'">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full shadow-xl transform transition-all duration-300" :class="show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'">
      <h3 class="text-lg font-semibold mb-4">Sign Out Confirmation</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="$emit('cancel')" 
          class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-sm transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="$emit('confirm')" 
          class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  show: {
    type: Boolean,
    required: true
  }
});

defineEmits(['confirm', 'cancel']);
</script>

