<template>
  <Transition
    name="notification-panel"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 scale-95 translate-y-2"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-2"
  >
    <div
      v-if="show"
      class="absolute right-0 mt-2 w-80 rounded-xl shadow-lg z-50 overflow-hidden bg-white border border-gray-400 notification-panel"
    >
      <div class="p-4 flex justify-between items-center border-b border-gray-400/50">
        <h3 class="font-medium text-[#283618]">Notifications</h3>
        <button
          v-if="notifications.length > 0"
          @click="$emit('mark-all-as-read')"
          class="text-xs text-gray-600 hover:text-black font-semibold transition-colors duration-200 active:scale-95"
        >
          Mark all as read
        </button>
      </div>

      <div v-if="notifications.length === 0" class="p-8 text-center">
        <p class="text-sm text-gray-600">You have no new notifications.</p>
      </div>

      <ul v-else class="max-h-96 overflow-y-auto">
        <TransitionGroup
          name="notification-item"
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 transform translate-x-4"
          enter-to-class="opacity-100 transform translate-x-0"
          leave-from-class="opacity-100 transform translate-x-0"
          leave-to-class="opacity-0 transform -translate-x-4"
        >
          <li
            v-for="(notification, index) in notifications"
            :key="notification.id"
            class="group flex items-start p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            :style="{ 'animation-delay': `${index * 50}ms` }"
            @click="$emit('notification-clicked', notification)"
          >

            <div class="flex-shrink-0 mr-3 mt-1">
              <div class="p-1.5 rounded-full" :class="getNotificationIcon(notification.type).bgClass">
                <component :is="getNotificationIcon(notification.type).icon" class="h-4 w-4" :class="getNotificationIcon(notification.type).iconClass" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 line-clamp-2">{{ notification.message }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatTimestamp(notification.timestamp) }}</p>
            </div>

            <div class="flex items-center ml-2 flex-shrink-0 mt-1">
              <div v-if="!notification.isRead" class="w-2.5 h-2.5 bg-emerald-400 rounded-full transition-opacity duration-300"></div>
              <div v-else class="w-2.5 h-2.5"></div>
              <button
                @click.stop="$emit('delete-notification', notification.id)"
                aria-label="Delete notification"
                class="ml-2 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
              >
                  <XIcon class="h-4 w-4" />
              </button>
            </div>
          </li>
        </TransitionGroup>
      </ul>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { AlertTriangle, Bell, CheckCircle, XIcon } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  notifications: {
    type: Array,
    required: true,
  },
});

defineEmits(['mark-all-as-read', 'notification-clicked', 'delete-notification']);

const getNotificationIcon = (type) => {
  switch (type) {
    case 'alert':
      return { icon: AlertTriangle, bgClass: 'bg-red-500/20', iconClass: 'text-red-400' };
    case 'success':
      return { icon: CheckCircle, bgClass: 'bg-green-500/20', iconClass: 'text-green-400' };
    default:
      return { icon: Bell, bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400' };
  }
};

const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<style scoped>
/* Enhanced notification panel animations */
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .notification-panel-enter-active,
  .notification-panel-leave-active {
    transition: all 0.25s ease;
  }
}

/* Staggered animation for notification items */
.notification-item-enter-active {
  transition: all 0.3s ease-out;
}

.notification-item-leave-active {
  transition: all 0.2s ease-in;
  position: absolute; /* Important for TransitionGroup leave animations */
  width: calc(100% - 2rem);
}

/* Enhanced backdrop blur for better visual separation */
.notification-panel-enter-active {
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s ease;
}

.notification-panel-enter-to {
  backdrop-filter: blur(2px);
}

/* Smooth touch interactions */
button:active,
li:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Ensure smooth scrolling on mobile */
.max-h-96 {
  -webkit-overflow-scrolling: touch;
}

/* Enhanced hover states */
@media (hover: hover) {
  li:hover {
    background-color: rgba(107, 114, 128, 0.1);
    transform: translateX(2px);
  }
}

/* Active state improvements */
li:active {
  background-color: rgba(107, 114, 128, 0.2);
}
</style>