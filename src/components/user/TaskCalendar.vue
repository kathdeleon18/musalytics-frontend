<template>
  <!-- The outer div already has flex flex-col h-full from TaskScheduler.vue, so this component's root should also fill that space -->
  <div class="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg flex flex-col h-full">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between pb-3 sm:pb-4 lg:pb-6 mb-2 sm:mb-3 lg:mb-4 border-b border-gray-100">
      <button @click="prevMonth" class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 sm:p-3 rounded-full hover:bg-gray-50">
        <ChevronLeftIcon class="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <span class="text-[#606c38] text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-wide">{{ currentMonthYear }}</span>
      <button @click="nextMonth" class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 sm:p-3 rounded-full hover:bg-gray-50">
        <ChevronRightIcon class="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>

    <!-- Weekday Headers -->
    <div class="bg-[#c9d4a3] grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 text-center text-gray-600 text-xs sm:text-sm font-medium pb-2 sm:pb-3 lg:pb-4 mb-1 sm:mb-2 rounded">
      <div v-for="day in weekdays" :key="day" class="py-1 sm:py-2">{{ day }}</div>
    </div>

    <!-- Calendar Days Grid -->
    <div class="flex-grow grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        class="relative flex flex-col justify-between bg-[#faffe7] rounded sm:rounded-xl overflow-hidden transition-all duration-200 group hover:bg-[#c9d4a3] hover:shadow-sm border border-gray-200 hover:border-[#c9d4a3] min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px]"
        :class="{
          'opacity-40': !day.isCurrentMonth,
          'bg-blue-50 border-1 border-[#c9d4a3] shadow-sm': day.isToday,
        }"
        @click="handleDayClick(day.date)"
      >
        <!-- Day number at top right -->
        <span class="absolute top-1 sm:top-1.5 lg:top-2 right-1 sm:right-1.5 lg:right-2 text-xs sm:text-sm font-medium text-[#283618] z-10"
              :class="{'text-[#283618] font-semibold hover:text-white': day.isToday}">
          {{ day.dayNum }}
        </span>

        <!-- Tasks for the day -->
        <div class="flex-grow overflow-y-auto p-1 sm:p-1.5 lg:p-2 pt-4 sm:pt-5 lg:pt-6 custom-scrollbar">
          <div
            v-for="task in day.tasks"
            :key="task.id"
            class="task-card relative rounded-lg sm:rounded-xl px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 mb-1 sm:mb-1.5 lg:mb-2 cursor-pointer transition-all duration-150 flex items-center space-x-1 sm:space-x-2 group-task border"
            :class="getTaskCalendarClass(task.status, task.priority)"
            @click.stop="toggleTaskPopover(task, $event)"
          >
            <input 
              type="checkbox"
              :checked="task.status === 'completed'"
              @change.stop="toggleTaskStatus(task)"
              class="form-checkbox h-2.5 sm:h-3 w-2.5 sm:w-3 text-blue-500 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-1 flex-shrink-0"
            />
            <span class="text-xs sm:text-sm font-medium flex-1 truncate text-gray-700" :class="{'line-through text-gray-400': task.status === 'completed'}" :title="task.title">
              {{ task.title }}
            </span>
            <!-- Delete button - only appears on hover of the task card -->
            <button  
              @click.stop="deleteTask(task.id)"
              class="text-red-500 transition-colors duration-150 opacity-0 group-task-hover:opacity-100 p-0.5 sm:p-1 rounded-md hover:bg-white flex-shrink-0"
              aria-label="Delete task"
              title="Delete task"
            >
              <Trash2Icon class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </div>
        </div>

        <!-- Add Task button for each day -->
        <button 
          @click.stop="addTaskForDay(day.date)"
          class="mt-auto w-full bg-white text-gray-600 rounded-b-lg sm:rounded-b-xl text-xs sm:text-sm py-1 sm:py-1.5 lg:py-2 transition-colors duration-200 flex items-center justify-center font-medium opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto border-t border-gray-200"
          title="Add task for this day"
        >
          <PlusIcon class="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" /> Add
        </button>
      </div>
    </div>

    <!-- Task Popover -->
    <div v-if="showPopover && popoverTask"
       class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/30"
        @click="hideTaskPopover"
      ></div>
      
      <!-- Popover Content -->
      <div class="relative bg-white border border-gray-200 rounded-xl sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-8 max-w-xs w-full transition-all duration-200"
        @click.stop
      >
      <h4 class="font-semibold text-[#606c38] text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">{{ popoverTask.title }}</h4>
      <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">{{ popoverTask.description || 'No description provided.' }}</p>
      <div class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
        <p class="flex justify-between items-center"><span class="text-gray-500">Due:</span> <span class="text-gray-700 font-medium">{{ formatDate(popoverTask.dueDate, true) }}</span></p>
        <p v-if="popoverTask.startTime" class="flex justify-between items-center"><span class="text-gray-500">Start:</span> <span class="text-gray-700 font-medium">{{ popoverTask.startTime }}</span></p>
        <p v-if="popoverTask.endTime" class="flex justify-between items-center"><span class="text-gray-500">End:</span> <span class="text-gray-700 font-medium">{{ popoverTask.endTime }}</span></p>
        <p v-if="popoverTask.notificationTime" class="flex justify-between items-center"><span class="text-gray-500">Notify:</span> <span class="text-gray-700 font-medium">{{ popoverTask.notificationTime }}</span></p>
        <p class="flex justify-between items-center"><span class="text-gray-500">Status:</span> <span :class="getStatusClass(popoverTask.status).text" class="font-semibold">{{ formatStatus(popoverTask.status) }}</span></p>
        <p class="flex justify-between items-center"><span class="text-gray-500">Priority:</span> <span :class="getPriorityClass(popoverTask.priority).text" class="font-semibold">{{ popoverTask.priority }}</span></p>
      </div>
      <div class="flex flex-col space-y-1.5 sm:space-y-2">
        <button 
          @click="editTask(popoverTask); hideTaskPopover();"
          class="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
        >
          Edit Task
        </button>
        <button 
          @click="toggleTaskStatus(popoverTask); hideTaskPopover();"
          class="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
        >
        
          {{ popoverTask.status === 'completed' ? 'Mark Pending' : 'Mark Complete' }}
        </button>
        <button 
          @click="viewTaskDetails(popoverTask); hideTaskPopover();"
          class="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-white rounded-xl sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
        >
          View Details
        </button>
      </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div v-if="showTaskDetails" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div 
        class="bg-white rounded-2xl shadow-xl w-full sm:max-w-2xl relative border border-gray-200 transform transition-all duration-300 max-h-[90vh] overflow-hidden"
        :class="{ 'scale-100 opacity-100': showTaskDetails, 'scale-95 opacity-0': !showTaskDetails }"
      >
        <!-- Fixed Header -->
        <div class="sticky top-0 z-10 bg-[#283618] p-6 flex items-center justify-between">
          <h3 class="text-2xl font-semibold text-white">
            {{ selectedTask ? selectedTask.title : 'Task Details' }}
          </h3>
          <button 
            @click="closeTaskDetails"
            class="text-white hover:text-gray-400 transition-colors duration-200 p-2 rounded-full"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div v-if="selectedTask" class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <div class="bg-white rounded-xl p-5 border border-gray-400/50">
              <h4 class="font-semibold mb-4 text-lg text-gray-900">Task Information</h4>
              
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <span class="text-gray-600 font-medium">Description:</span>
                  <span class="text-right text-gray-900 flex-1 ml-4">{{ selectedTask.description || 'N/A' }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Due Date:</span>
                  <span class="text-gray-900 font-medium">{{ formatDate(selectedTask.dueDate, true) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Start Time:</span>
                  <span class="text-gray-900">{{ selectedTask.startTime || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">End Time:</span>
                  <span class="text-gray-900">{{ selectedTask.endTime || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Notification Time:</span>
                  <span class="text-gray-900">{{ selectedTask.notificationTime || 'N/A' }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Status:</span>
                  <span :class="getStatusClass(selectedTask.status).text" class="font-semibold">
                    {{ formatStatus(selectedTask.status) }}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Priority:</span>
                  <span :class="getPriorityClass(selectedTask.priority).text" class="font-semibold">
                    {{ selectedTask.priority }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Created At:</span>
                  <span class="text-gray-900">{{ formatDate(selectedTask.createdAt, true) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                @click="editTask(selectedTask)"
                class="px-6 py-3 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              >
                
                Edit Task
              </button>
              <button 
                @click="toggleTaskStatus(selectedTask)"
                class="px-6 py-3 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-white rounded-xl text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              >
                <XCircleIcon v-if="selectedTask.status === 'completed'" class="h-5 w-5 mr-2" />
            
                {{ selectedTask.status === 'completed' ? 'Mark Pending' : 'Mark Complete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import {
  XIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from 'lucide-vue-next';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  viewMode: {
    type: String,
    default: 'week',
  },
});

const emit = defineEmits(['viewTaskDetails', 'editTask', 'toggleTaskStatus', 'add-task-for-day', 'update:selected-day', 'delete-task', 'update:current-month-year']);

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const showTaskDetails = ref(false);
const selectedTask = ref(null);

const showPopover = ref(false);
const popoverTask = ref(null);
let popoverTimeout = null;

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const currentMonthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  let firstDayOfWeek = firstDayOfMonth.getDay();
  firstDayOfWeek = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1;

  const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate();
  const daysInMonth = lastDayOfMonth.getDate();

  // Add leading days from previous month to fill the first row
  for (let i = firstDayOfWeek; i > 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, daysInPrevMonth - i + 1);
    days.push({
      date,
      dayNum: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      tasks: getTasksForDay(date),
    });
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date,
      dayNum: i,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      tasks: getTasksForDay(date),
    });
  }

  // Add trailing days from next month to ensure exactly 5 rows (35 cells)
  const remainingCells = 35 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date,
      dayNum: i,
      isCurrentMonth: false,
      isToday: false,
      tasks: getTasksForDay(date),
    });
  }
  return days;
});

const getTasksForDay = (date) => {
  const dayString = date.toISOString().split('T')[0];
  return props.tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate.toISOString().split('T')[0] === dayString;
  });
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  emitCurrentMonthYear();
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  emitCurrentMonthYear();
};

const emitCurrentMonthYear = () => {
  emit('update:current-month-year', { month: currentMonth.value, year: currentYear.value });
};

const handleDayClick = (date) => {
  console.log('Day clicked:', date);
  emit('update:selected-day', date.toISOString().split('T')[0]);
};

const addTaskForDay = (date) => {
  emit('add-task-for-day', date);
};

const deleteTask = (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete-task', taskId);
    hideTaskPopover();
  }
};

const viewTaskDetails = (task) => {
  selectedTask.value = task;
  showTaskDetails.value = true;
  emit('viewTaskDetails', task);
};

const closeTaskDetails = () => {
  showTaskDetails.value = false;
  selectedTask.value = null;
};

const editTask = (task) => {
  closeTaskDetails();
  emit('editTask', task);
};

const toggleTaskStatus = (task) => {
  emit('toggleTaskStatus', task);
  if (selectedTask.value && selectedTask.value.id === task.id) {
    selectedTask.value.status = task.status === 'completed' ? 'pending' : 'completed';
  }
  if (popoverTask.value && popoverTask.value.id === task.id) {
    popoverTask.value.status = task.status === 'completed' ? 'pending' : 'completed';
  }
};

const toggleTaskPopover = (task, event) => {
  if (popoverTask.value && popoverTask.value.id === task.id && showPopover.value) {
    hideTaskPopover();
  } else {
    showTaskPopover(task, event);
  }
};

const showTaskPopover = (task, event) => {
  if (popoverTimeout) {
    clearTimeout(popoverTimeout);
  }
  popoverTask.value = task;
  showPopover.value = true;
};

const hideTaskPopover = () => {
  popoverTimeout = setTimeout(() => {
    showPopover.value = false;
    popoverTask.value = null;
  }, 100);
};

// Utility functions
const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'N/A';
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    return 'Invalid Date';
  }
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  if (includeTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    return 'Invalid Time';
  }
  if (isNaN(date.getTime())) {
    return 'Invalid Time';
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return {
        badge: 'bg-green-100 text-green-700 border border-green-200',
        text: 'text-green-600'
      };
    case 'pending':
      return {
        badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        text: 'text-yellow-600'
      };
    case 'overdue':
      return {
        badge: 'bg-red-100 text-red-700 border border-red-200',
        text: 'text-red-600'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-700',
        text: 'text-gray-600'
      };
  }
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'High':
      return {
        badge: 'bg-red-100 text-red-700 border border-red-200',
        text: 'text-red-600'
      };
    case 'Medium':
      return {
        badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        text: 'text-yellow-600'
      };
    default:
      return {
        badge: 'bg-blue-100 text-blue-700 border border-blue-200',
        text: 'text-blue-600'
      };
  }
};

const getTaskCalendarClass = (status, priority) => {
  let baseClass = 'font-medium';
  switch (status) {
    case 'completed':
      baseClass += ' bg-green-50 text-green-700 border-l-4 border-green-400 hover:bg-green-100';
      break;
    case 'pending':
      baseClass += ' bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400 hover:bg-yellow-100';
      break;
    case 'overdue':
      baseClass += ' bg-red-50 text-red-700 border-l-4 border-red-400 hover:bg-red-100';
      break;
    default:
      baseClass += ' bg-blue-50 text-blue-700 border-l-4 border-blue-400 hover:bg-blue-100';
  }
  return baseClass;
};

onMounted(() => {
  emitCurrentMonthYear();
});
</script>

<style scoped>
/* Custom Scrollbar for task list within day cells */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}

/* Ensure the grid cells are responsive and fill the space */
.calendar-grid {
  grid-template-rows: repeat(5, 1fr); /* 5 rows for consistent layout */
}

.calendar-grid > div {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  width: 100%;
}

/* Mobile-first responsive design */
@media (max-width: 639px) {
  .calendar-grid > div {
    min-height: 60px;
  }
}

@media (min-width: 640px) and (max-width: 767px) {
  .calendar-grid > div {
    min-height: 80px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-grid > div {
    min-height: 100px;
  }
}

@media (min-width: 1024px) {
  .calendar-grid > div {
    min-height: 120px;
  }
}

/* Task Card specific styles - Mobile first approach */
.task-card {
  min-height: 1.25rem;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 640px) {
  .task-card {
    min-height: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .task-card {
    min-height: 1.75rem;
  }
}

/* Responsive text sizing */
.task-card .text-xs {
  font-size: 0.625rem;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .task-card .text-xs {
    font-size: 0.75rem;
    line-height: 1.3;
  }
}

@media (min-width: 1024px) {
  .task-card .text-xs {
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

/* Responsive checkbox sizing */
.task-card .form-checkbox {
  height: 0.625rem;
  width: 0.625rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .task-card .form-checkbox {
    height: 0.75rem;
    width: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .task-card .form-checkbox {
    height: 0.875rem;
    width: 0.875rem;
  }
}

/* Style for the delete button - Responsive */
.task-card button {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
  padding: 0.125rem;
}

@media (min-width: 640px) {
  .task-card button {
    right: 0.375rem;
    padding: 0.25rem;
  }
}

@media (min-width: 1024px) {
  .task-card button {
    right: 0.5rem;
    padding: 0.375rem;
  }
}

.task-card:hover button {
  opacity: 1;
  pointer-events: auto;
}

.group-task:hover .group-task-hover\:opacity-100 {
  opacity: 1;
}

/* Ensure no content overflow */
.calendar-grid > div {
  contain: layout style;
}

.task-card {
  contain: layout style;
  max-width: 100%;
}

.form-checkbox:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
}
</style>