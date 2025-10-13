<template>
  <header class="fixed top-0 left-0 right-0 md:left-auto z-30 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]" :style="navbarStyle">
    <div class="flex items-center justify-between w-full p-4" style="background-color: #fff;">
      <div class="flex items-center gap-2">
        <button @click="toggleSidebar" class="p-1.5 rounded hover:bg-[#f2f5ea] md:hidden" aria-label="Open menu">
          <MenuIcon class="h-6 w-6 text-[#283618]" />
        </button>
        <h1 class="text-xl font-bold tracking-wide" style="color:#606c38;">MUSALYTICS</h1>
      </div>

      <div class="flex items-center space-x-2">
        <button @click="toggleLanguage" class="h-9 w-9 rounded-full flex items-center justify-center text-[#283618] hover:text-[#c9d4a3] transition-colors" aria-label="Toggle language">
          <LanguagesIcon class="h-5 w-5" />
        </button>

        <div class="relative">
          <button @click="toggleNotificationPanel" class="h-9 w-9 rounded-full flex items-center justify-center transition-colors notification-button">
            <BellIcon class="h-5 w-5 text-[#283618] hover:text-[#c9d4a3]" />
          </button>
          <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold">{{ unreadCount }}</span>

          <NotificationPanel
            :show="showNotificationPanel"
            :notifications="notifications"
            @mark-all-as-read="markAllAsRead"
            @notification-clicked="handleNotificationClick"
            @delete-notification="handleNotificationDelete"
          />
        </div>

        <div class="relative">
          <button
            @click="toggleProfileMenu"
            class="h-9 w-9 rounded-full flex items-center justify-center profile-button"
            style="background-color: #dfe8d4; border: 2px solid #606c38; color: #606c38;"
          >
            <img v-if="profileImage" :src="profileImage" alt="Profile" class="h-full w-full object-cover rounded-full">
            <span v-else class="text-sm font-bold">{{ userInitials }}</span>
          </button>

          <Transition
            name="profile-menu"
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-64 rounded-xl shadow-lg z-50 overflow-hidden profile-menu"
            >
              <div class="bg-[#283618] p-4">
                <div class="flex flex-col items-center">
                    <div class="h-12 w-12 rounded-full bg-[#606c38] flex items-center justify-center text-white mb-2">
                      <img v-if="profileImage" :src="profileImage" alt="Profile" class="h-full w-full object-cover rounded-full">
                      <UserIcon v-else class="h-6 w-6" />
                    </div>
                  <p class="font-medium text-base text-[#c9d4a3]">{{ userDisplayName }}</p>
                  <p class="text-xs text-white">{{ email }}</p>
                </div>
              </div>

              <div class="bg-white">
                <ul class="list-none p-0 m-0">
                  <li class="profile-menu-item">
                    <router-link to="/user/profile" @click="showProfileMenu = false" class="flex items-center space-x-3 px-4 py-3 text-[#283618] hover:bg-[#f7f2df] hover:text-[#283618] transition-all duration-200 active:scale-95">
                      <UserIcon class="h-5 w-5 text-[#283618]" />
                      <span>{{ $t('profile.header.title') }}</span>
                    </router-link>
                  </li>
                  <li class="profile-menu-item">
                    <button
                      @click="handleSignOut"
                      class="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-[#f7f2df] transition-all duration-200 active:scale-95"
                    >
                      <LogOutIcon class="h-5 w-5 text-red-600" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div v-if="isOverlayVisible" class="fixed inset-0 z-40 bg-black/10 " @click="closeAllOverlays" aria-hidden="true"></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { auth, db } from '../../firebase/config';
import { collection, query, onSnapshot, doc, updateDoc, writeBatch, orderBy, deleteDoc } from 'firebase/firestore';
import { BellIcon, UserIcon, LogOutIcon, MenuIcon, LanguagesIcon } from 'lucide-vue-next';
import NotificationPanel from './NotificationPanel.vue';

// --- NEW: Import for translation ---
import { useI18n } from 'vue-i18n';

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
  profileImage: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['sign-out']);
const router = useRouter();

// Sidebar collapsed sync and responsive navbar offset
const isCollapsed = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const navbarStyle = computed(() => ({
  left: '0px',
  right: '0px'
}));

const handleSidebarCollapsedChange = (e) => {
  isCollapsed.value = !!e.detail?.collapsed;
};
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// --- NEW: Language Toggle Logic ---
const { locale } = useI18n();

const languageButtonText = computed(() => {
  return locale.value === 'en' ? 'Tagalog' : 'English';
});

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'tl' : 'en';
}
// --- END NEW ---

// Profile Menu State
const showProfileMenu = ref(false);

// Notification State
const showNotificationPanel = ref(false);
const notifications = ref([]);
let unsubscribeNotifications = null;

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

// --- Notification Logic ---
const toggleNotificationPanel = () => {
  showNotificationPanel.value = !showNotificationPanel.value;
  if (showNotificationPanel.value) {
    setTimeout(() => {
      window.addEventListener('click', closeMenusOnClickOutside);
    }, 0);
  } else if (!showProfileMenu.value) {
    window.removeEventListener('click', closeMenusOnClickOutside);
  }
};

const setupNotificationListener = () => {
  if (!auth.currentUser) return;

  // --- THIS IS THE CRITICAL FIX ---
  // The path now correctly points to the sub-collection within the user's document.
  const notifsRef = collection(db, 'users', auth.currentUser.uid, 'notifications');
  const q = query(notifsRef, orderBy('timestamp', 'desc'));

  unsubscribeNotifications = onSnapshot(q, (snapshot) => {
    const fetchedNotifications = [];
    snapshot.forEach((doc) => {
      fetchedNotifications.push({ id: doc.id, ...doc.data() });
    });
    notifications.value = fetchedNotifications;
  }, (error) => {
    console.error("Error fetching notifications:", error); // This will now stop firing
  });
};

const markAllAsRead = async () => {
  if (!auth.currentUser || unreadCount.value === 0) return;
  const batch = writeBatch(db);
  notifications.value.forEach(notification => {
    if (!notification.isRead) {
      const notifRef = doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id);
      batch.update(notifRef, { isRead: true });
    }
  });
  await batch.commit();
};

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    const notifRef = doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id);
    await updateDoc(notifRef, { isRead: true });
  }

  if (notification.link) {
    router.push(notification.link);
  }

  showNotificationPanel.value = false;
};

const handleNotificationDelete = async (notificationId) => {
  if (!auth.currentUser || !notificationId) return;
  try {
    const notifRef = doc(db, 'users', auth.currentUser.uid, 'notifications', notificationId);
    await deleteDoc(notifRef);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

// --- Profile Menu Logic ---
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) {
    setTimeout(() => {
      window.addEventListener('click', closeMenusOnClickOutside);
    }, 0);
  } else {
    window.removeEventListener('click', closeMenusOnClickOutside);
  }
};

const closeMenusOnClickOutside = (event) => {
  const profileMenu = document.querySelector('.profile-menu');
  const profileButton = document.querySelector('.profile-button');
  const notificationPanel = document.querySelector('.notification-panel');
  const notificationButton = document.querySelector('.notification-button');

  if (profileMenu && !profileMenu.contains(event.target) && profileButton && !profileButton.contains(event.target)) {
    showProfileMenu.value = false;
  }
  if (notificationPanel && !notificationPanel.contains(event.target) && notificationButton && !notificationButton.contains(event.target)) {
    showNotificationPanel.value = false;
  }

  if (!showProfileMenu.value && !showNotificationPanel.value) {
      window.removeEventListener('click', closeMenusOnClickOutside);
  }
};

const handleSignOut = () => {
  showProfileMenu.value = false;
  emit('sign-out');
};

// Sidebar toggle for mobile
const toggleSidebar = () => {
  window.dispatchEvent(new Event('toggle-user-sidebar'));
};

// Overlay visibility
const isOverlayVisible = computed(() => showProfileMenu.value || showNotificationPanel.value);

const closeAllOverlays = () => {
  showProfileMenu.value = false;
  showNotificationPanel.value = false;
  window.removeEventListener('click', closeMenusOnClickOutside);
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Listen for auth changes to ensure currentUser is available
  auth.onAuthStateChanged(user => {
    if (user) {
      setupNotificationListener();
    } else if (unsubscribeNotifications) {
      unsubscribeNotifications(); // Stop listening if user logs out
    }
  });
  window.addEventListener('user-sidebar-collapsed-change', handleSidebarCollapsedChange);
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (unsubscribeNotifications) {
    unsubscribeNotifications();
  }
  window.removeEventListener('click', closeMenusOnClickOutside);
  window.removeEventListener('user-sidebar-collapsed-change', handleSidebarCollapsedChange);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Enhanced profile menu animations */
.profile-menu-enter-active,
.profile-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .profile-menu-enter-active,
  .profile-menu-leave-active {
    transition: all 0.25s ease;
  }
}

/* Staggered animation for profile menu items */
.profile-menu-item-enter-active {
  transition: all 0.3s ease-out;
}

.profile-menu-item-leave-active {
  transition: all 0.2s ease-in;
}

/* Enhanced backdrop blur for better visual separation */
.profile-menu-enter-active {
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s ease;
}

.profile-menu-enter-to {
  backdrop-filter: blur(2px);
}

/* Smooth touch interactions */
button:active,
a:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Enhanced hover states */
@media (hover: hover) {
  .profile-menu-item a:hover,
  .profile-menu-item button:hover {
    background-color: rgba(247, 242, 223, 0.5);
    transform: translateX(2px);
  }
}

/* Active state improvements */
.profile-menu-item a:active,
.profile-menu-item button:active {
  background-color: rgba(247, 242, 223, 0.8);
}

/* Ensure smooth scrolling on mobile */
.profile-menu {
  -webkit-overflow-scrolling: touch;
}

/* Button press animations for mobile */
.profile-button:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.notification-button:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
</style>