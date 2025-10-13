<template>
  <!-- Page Loader -->
  <PageLoader />
  
  <!-- Desktop sidebar -->
  <aside 
      class="fixed z-40 hidden md:block shadow-lg transition-all duration-300 ease-in-out"
      :style="desktopSidebarStyle"
  >
      <!-- Logo / Brand (top of sidebar) -->
      <div class="flex items-center px-8 py-8 transition-all duration-300">
        <img src="/images/musaLogo.svg" alt="Logo" class="h-10 w-10 object-contain mr-2 transition-transform duration-300 hover:scale-110" />
        <span class="text-2xl font-bold tracking-wide transition-colors duration-300" style="color:#606c38;">MUSALYTICS</span>
      </div>
      <nav class="p-6">
        <ul class="space-y-2">
          <li v-for="(item, index) in navigationItems" :key="index" class="transform transition-all duration-200 hover:translate-x-1">
            <router-link 
              :to="item.url" 
              @click="handleNavigation"
              class="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group"
              :class="[
                isActive(item.url) 
                  ? 'text-gray-900 bg-[#c9d4a3]/20 rounded-xl' 
                  : 'text-gray-500 hover:text-gray-600 hover:bg-[#c9d4a3]/20'
              ]"
            >
              <component :is="item.iconComponent" class="h-5 w-5 text-inherit transition-transform duration-300 group-hover:scale-110" />
              <span class="transition-all duration-300">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Mobile drawer sidebar -->
    <Transition name="mobile-drawer">
      <div v-if="isOpen" class="fixed inset-0 z-40 md:hidden" aria-modal="true" role="dialog">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/40 transition-opacity duration-300" @click="close"></div>

        <!-- Drawer panel -->
        <aside class="absolute top-0 left-0 h-full w-72 max-w-[80%] shadow-lg pt-2 transition-all duration-300 ease-in-out" style="background-color: #fff;">
          <!-- Top bar with back arrow (no logo/name) -->
          <div class="flex items-center px-2 py-2">
            <button 
              @click="close" 
              class="p-2 rounded hover:bg-gray-100 transition-all duration-200 hover:scale-110" 
              aria-label="Close menu"
            >
              <ChevronLeft class="h-5 w-5 text-[#283618]" />
            </button>
          </div>
          <nav class="p-6">
      <ul class="space-y-2">
              <li v-for="(item, index) in navigationItems" :key="index" class="transform transition-all duration-200 hover:translate-x-1" :style="{ animationDelay: `${index * 50}ms` }">
          <router-link 
            :to="item.url" 
                  class="flex items-center space-x-3 px-3 py-3 rounded-md transition-all duration-300 ease-in-out group"
                  :class="[
                    isActive(item.url) 
                      ? 'text-[#283618] bg-[#c9d4a3] rounded-xl' 
                      : 'text-gray-500 hover:text-[#283618] hover:bg-[#f7f2df]'
                  ]"
                  @click="handleNavigation"
                >
                  <component :is="item.iconComponent" class="h-5 w-5 text-inherit transition-transform duration-300 group-hover:scale-110" />
                  <span class="transition-all duration-300">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
      </div>
    </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import PageLoader from './PageLoader.vue';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Cpu, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Settings, 
  Shield, 
  MapPin,
  ChevronLeft
} from 'lucide-vue-next';

const route = useRoute();
const isOpen = ref(false);
const desktopSidebarStyle = computed(() => ({
  top: '0px',
  left: '0px',
  height: '100vh',
  width: '256px',
  backgroundColor: '#fff'
}));

// Function to check if a route is active
// This will match both exact routes and child routes
const isActive = (url) => {
  // Check if the current route path starts with the given URL
  // This ensures that child routes also highlight the parent menu item
  return route.path === url || route.path.startsWith(`${url}/`);
};

// Navigation items with their icons - professional version
const navigationItems = [
  {
    label: 'Dashboard',
    url: '/professional/dashboard',
    iconComponent: LayoutDashboard
  },
  {
    label: 'User Management',
    url: '/professional/users',
    iconComponent: Users
  },
  {
    label: 'Disease Management',
    url: '/professional/diseases',
    iconComponent: FlaskConical
  },
  {
    label: 'Learning Management',
    url: '/professional/learning',
    iconComponent: BookOpen
  },
  {
    label: 'Analytics',
    url: '/professional/analytics',
    iconComponent: BarChart3
  },
  {
    label: 'Reports',
    url: '/professional/reports',
    iconComponent: FileText
  },
  {
    label: 'Mapping',
    url: '/professional/mapping',
    iconComponent: MapPin
  }
];

const open = () => { isOpen.value = true; };
const close = () => { isOpen.value = false; };

const handleToggle = () => {
  isOpen.value = !isOpen.value;
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') close();
};

const handleNavigation = () => {
  // Trigger loading state by dispatching a custom event
  window.dispatchEvent(new CustomEvent('show-page-loader'));
};

onMounted(() => {
  window.addEventListener('toggle-professional-sidebar', handleToggle);
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('toggle-professional-sidebar', handleToggle);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
nav::-webkit-scrollbar {
  display: none;
}

/* Mobile drawer transition animations */
.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: all 0.3s ease-in-out;
}

.mobile-drawer-enter-from {
  opacity: 0;
}

.mobile-drawer-enter-to {
  opacity: 1;
}

.mobile-drawer-leave-from {
  opacity: 1;
}

.mobile-drawer-leave-to {
  opacity: 0;
}

/* Slide animation for the drawer panel */
.mobile-drawer-enter-active .absolute.top-0.left-0 {
  animation: slideInLeft 0.3s ease-out;
}

.mobile-drawer-leave-active .absolute.top-0.left-0 {
  animation: slideOutLeft 0.3s ease-in;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

/* Staggered animation for navigation items */
.mobile-drawer-enter-active li {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced hover effects */
.group:hover .h-5 {
  transform: scale(1.1);
}

/* Smooth focus states */
.router-link-active {
  position: relative;
}

.router-link-active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #606c38;
  border-radius: 2px;
  transition: all 0.3s ease;
}
</style>