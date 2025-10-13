<template>
  <header class="fixed top-0 left-0 right-0 z-50 p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]" style="background-color: #fff;">
    <div class="flex items-center justify-between w-full">

      <div class="flex items-center gap-2">
        <img src="/images/musaLogo.svg" alt="Logo" class="h-9 w-9 object-contain" />
        <h1 class="text-3xl font-bold tracking-wide" style="color:#606c38;">MUSALYTICS</h1>
      </div>

      <div class="flex items-center gap-2 sm:gap-4 md:gap-6">
        

        <button class="md:hidden p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#283618]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <div class="relative">
          <button class="p-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#283618]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span v-if="notificationCount > 0"
                class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#dda15e] text-white flex items-center justify-center text-xs font-bold">
            {{ notificationCount }}
          </span>
        </div>
          
          <div class="relative">
            <button 
              @click="toggleProfileMenu" 
              class="flex items-center profile-button"
            >
              <div class="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden" 
             style="background-color: #dfe8d4; color: #606c38; border: 2px solid #606c38;">
                <img v-if="photoURL" :src="photoURL" alt="Profile" class="h-full w-full object-cover" />
                <span v-else>{{ userInitials }}</span>
              </div>
            </button>
            
            <div 
              v-if="showProfileMenu" 
              class="absolute right-0 mt-2 w-64 rounded-xl shadow-lg z-50 overflow-hidden profile-menu"
            >
              <div class="bg-[#606c38] p-4">
                <div class="flex flex-col items-center">
                  <div class="h-12 w-12 rounded-full bg-[#283618] flex items-center justify-center text-white mb-2 overflow-hidden">
                    <img v-if="photoURL" :src="photoURL" alt="Profile" class="h-full w-full object-cover" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p class="font-medium text-white">{{ userDisplayName }}</p>
                  <p class="text-xs text-[#c9d4a3]">{{ email }}</p>
                </div>
              </div>
              
              <div class="bg-gray-50 py-2">
                <ul class="space-y-1">
                  <li>
                    <router-link to="/professional/profile" class="flex items-center space-x-3 px-4 py-2.5 text-[#606c38] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#606c38]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Manage Profile</span>
                    </router-link>
                  </li>
                  <li>
                    <button 
                      @click="handleSignOut" 
                      class="w-full flex items-center space-x-3 px-4 py-2.5 text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  </header>
</template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue';
  import { RouterLink } from 'vue-router';
  
  const props = defineProps({
    userInitials: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    photoURL: {
    type: String,
    default: null // It's not required, can be null
    },
    notificationCount: {
      type: Number,
      default: 0
    }
  });
  
  const emit = defineEmits(['sign-out']);
  
  const showProfileMenu = ref(false);
  
  // Toggle profile menu
  const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value;
    
    // Close profile menu when clicking outside
    if (showProfileMenu.value) {
      setTimeout(() => {
        window.addEventListener('click', closeProfileMenuOnClickOutside);
      }, 0);
    }
  };
  
  // Close profile menu when clicking outside
  const closeProfileMenuOnClickOutside = (event) => {
    const profileMenu = document.querySelector('.profile-menu');
    const profileButton = document.querySelector('.profile-button');
    
    if (profileMenu && !profileMenu.contains(event.target) && 
        profileButton && !profileButton.contains(event.target)) {
      showProfileMenu.value = false;
      window.removeEventListener('click', closeProfileMenuOnClickOutside);
    }
  };
  
  // Handle sign out
  const handleSignOut = () => {
    showProfileMenu.value = false;
    emit('sign-out');
  };
  
  // Clean up event listeners
  onBeforeUnmount(() => {
    window.removeEventListener('click', closeProfileMenuOnClickOutside);
  });
  </script>