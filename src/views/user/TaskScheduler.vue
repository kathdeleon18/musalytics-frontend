
<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Top Navigation Bar -->
    <UserNavbar
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :profile-image="profileImage"
      :notification-count="notificationCount"
      @sign-out="showSignOutConfirmation = true"
    />

    <!-- Main Content with Sidebar -->
    <!-- This div now flex-grows to take all remaining vertical space -->
    <div class="pt-2 md:pl-64 flex">
      <!-- Sidebar (UNCHANGED) -->
      <UserSidebar />

      <!-- Main Content Area -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header & View Toggle -->
        <header class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
          <div class="text-left">
            <h1 class="text-2xl font-semibold mb-1 text-[#283618]">
              {{ $t('tasks.header.title') }}
            </h1>
            <p class="text-gray-400 text-base">{{ $t('tasks.header.description') }}</p>
          </div>
          <div class="mt-4 sm:mt-0 flex items-center justify-center">
            <!-- View Toggle -->
            <div class="flex bg-gray-500 overflow-hidden">
              <button
                @click="currentView = 'week'"
                :class="{ 'bg-[#606c38] text-white': currentView === 'week', 'text-white hover:bg-gray-500': currentView !== 'week' }"
                class="px-4 py-2 flex items-center justify-center transition-colors duration-200 text-sm font-medium rounded-lg"
              >
                <CalendarDaysIcon class="h-5 w-5 mr-2" />
                {{ $t('tasks.views.week') }}
              </button>
              <button
                @click="currentView = 'day'"
                :class="{ 'bg-[#606c38] text-white': currentView === 'day', 'text-white hover:bg-gray-500': currentView !== 'day' }"
                class="px-4 py-2 flex items-center justify-center transition-colors duration-200 text-sm font-medium rounded-lg"
              >
                <CalendarIcon class="h-5 w-5 mr-2" />
                {{ $t('tasks.views.day') }}
              </button>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 flex-shrink-0">
          <div class="bg-white p-3 sm:p-5 flex items-center space-x-2 sm:space-x-4 shadow-lg rounded-xl">
            <div class="p-2 sm:p-3 rounded-full bg-teal-600/20 flex-shrink-0">
              <ClipboardListIcon class="h-4 w-4 sm:h-6 sm:w-6 text-teal-400" />
            </div>
            <div>
              <p class="text-xs sm:text-sm text-gray-400 font-medium">{{ $t('tasks.stats.total') }}</p>
              <p class="text-lg sm:text-2xl font-bold text-black">{{ tasks.length }}</p>
            </div>
          </div>

          <div class="bg-white p-3 sm:p-5 flex items-center space-x-2 sm:space-x-4 shadow-lg rounded-xl">
            <div class="p-2 sm:p-3 rounded-full bg-green-600/20 flex-shrink-0">
              <CheckCircleIcon class="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <div>
              <p class="text-xs sm:text-sm text-gray-400 font-medium">{{ $t('tasks.stats.completed') }}</p>
              <p class="text-lg sm:text-2xl font-bold text-black">{{ completedTasksCount }}</p>
            </div>
          </div>

          <div class="bg-white p-3 sm:p-5 flex items-center space-x-2 sm:space-x-4 shadow-lg rounded-xl">
            <div class="p-2 sm:p-3 rounded-full bg-yellow-600/20 flex-shrink-0">
              <HourglassIcon class="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
            </div>
            <div>
              <p class="text-xs sm:text-sm text-gray-400 font-medium">{{ $t('tasks.stats.pending') }}</p>
              <p class="text-lg sm:text-2xl font-bold text-black">{{ pendingTasksCount }}</p>
            </div>
          </div>

          <div class="bg-white p-3 sm:p-5 flex items-center space-x-2 sm:space-x-4 shadow-lg rounded-xl">
            <div class="p-2 sm:p-3 rounded-full bg-red-600/20 flex-shrink-0">
              <AlertCircleIcon class="h-4 w-4 sm:h-6 sm:w-6 text-red-400" />
            </div>
            <div>
              <p class="text-xs sm:text-sm text-gray-400 font-medium">{{ $t('tasks.stats.overdue') }}</p>
              <p class="text-lg sm:text-2xl font-bold text-black">{{ overdueTasksCount }}</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading">
          <SkeletonLoader />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center py-12">
          <div class="rounded-xl bg-red-900/50 border border-red-800 text-red-600 px-8 py-6 rounded-lg max-w-lg mx-auto shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-start">
              <AlertTriangleIcon class="h-12 w-12 text-red-600 mx-auto sm:mx-0 sm:mr-5 mb-4 sm:mb-0 flex-shrink-0" />
              <div class="text-center sm:text-left">
                <h3 class="font-bold text-xl sm:text-2xl mb-2">{{ $t('tasks.errorState.errorLoadingTasks') }}</h3>
                <p class="mb-5 text-gray-300">{{ error }}</p>
                <button
                  @click="fetchTasks"
                  class="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {{ $t('common.tryAgain') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid: Calendar/Daily List + Right Panels -->
        <div v-else class="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Left Column: Calendar/Daily List -->
          <div class="lg:col-span-2 flex flex-col">
            <!-- Filters and Search -->
            <div class="bg-white rounded-xl p-3 sm:p-5 mb-4 sm:mb-8 shadow-lg flex-shrink-0">
              <!-- Mobile Filter Toggle -->
              <div class="lg:hidden mb-4">
                <button
                  @click="showMobileFilters = !showMobileFilters"
                  class="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg text-gray-500 text-sm font-medium transition-colors duration-200"
                >
                  <span class="flex items-center">
                    <FilterIcon class="h-4 w-4 mr-2" />
                    Filters
                  </span>
                  <ChevronDownIcon class="h-4 w-4 text-gray-400 transition-transform duration-200" :class="{'rotate-180': showMobileFilters}" />
                </button>
              </div>

              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4" :class="{'hidden lg:flex': !showMobileFilters}">
                <!-- Search -->
                <div class="relative flex-1">
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('tasks.filters.searchPlaceholder')"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-8 pr-3 text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <SearchIcon class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <!-- Filters -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                  <!-- Status Filter -->
                  <div class="relative flex-1 min-w-[120px]">
                    <select
                      v-model="statusFilter"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-xs sm:text-sm"
                    >
                      <option value="all">{{ $t('tasks.filters.status.all') }}</option>
                      <option value="pending">{{ $t('tasks.filters.status.pending') }}</option>
                      <option value="completed">{{ $t('tasks.filters.status.completed') }}</option>
                      <option value="overdue">{{ $t('tasks.filters.status.overdue') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>

                  <!-- Priority Filter -->
                  <div class="relative flex-1 min-w-[120px]">
                    <select
                      v-model="priorityFilter"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-xs sm:text-sm"
                    >
                      <option value="all">{{ $t('tasks.filters.priority.all') }}</option>
                      <option value="High">{{ $t('tasks.filters.priority.high') }}</option>
                      <option value="Medium">{{ $t('tasks.filters.priority.medium') }}</option>
                      <option value="Low">{{ $t('tasks.filters.priority.low') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>

                  <!-- Due Date Filter -->
                  <div class="relative flex-1 min-w-[120px]">
                    <select
                      v-model="dueDateFilter"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-xs sm:text-sm"
                    >
                      <option value="all">{{ $t('tasks.filters.dueDate.all') }}</option>
                      <option value="today">{{ $t('tasks.filters.dueDate.today') }}</option>
                      <option value="week">{{ $t('tasks.filters.dueDate.week') }}</option>
                      <option value="month">{{ $t('tasks.filters.dueDate.month') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>

                  <!-- Sort By -->
                  <div class="relative flex-1 min-w-[120px]">
                    <select
                      v-model="sortBy"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-8 text-gray-500 appearance-none transition-all duration-200 text-xs sm:text-sm"
                    >
                      <option value="dueDate-asc">{{ $t('tasks.filters.sort.dueAsc') }}</option>
                      <option value="dueDate-desc">{{ $t('tasks.filters.sort.dueDesc') }}</option>
                      <option value="priority-desc">{{ $t('tasks.filters.sort.priorityDesc') }}</option>
                      <option value="priority-asc">{{ $t('tasks.filters.sort.priorityAsc') }}</option>
                      <option value="createdAt-desc">{{ $t('tasks.filters.sort.createdDesc') }}</option>
                      <option value="createdAt-asc">{{ $t('tasks.filters.sort.createdAsc') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4">
                <span class="text-xs sm:text-sm text-gray-400 font-medium">{{ $t('tasks.filters.active') }}</span>

                <div v-if="statusFilter !== 'all'" class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                  {{ formatStatus(statusFilter) }}
                  <button @click="statusFilter = 'all'" class="ml-1.5 text-gray-400 transition-colors duration-200">
                    <XIcon class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                <div v-if="priorityFilter !== 'all'" class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                  {{ priorityFilter }} Priority
                  <button @click="priorityFilter = 'all'" class="ml-1.5 text-gray-400 transition-colors duration-200">
                    <XIcon class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                <div v-if="dueDateFilter !== 'all'" class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                  {{ formatDueDateFilter(dueDateFilter) }}
                  <button @click="dueDateFilter = 'all'" class="ml-1.5 text-gray-400 transition-colors duration-200">
                    <XIcon class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                <div v-if="searchQuery" class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-400">
                  "{{ searchQuery }}"
                  <button @click="searchQuery = ''" class="ml-1.5 text-gray-400 transition-colors duration-200">
                    <XIcon class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                <button
                  @click="clearAllFilters"
                  class="text-xs sm:text-sm text-red-400 hover:text-red-200 ml-2 font-medium transition-colors duration-200"
                >
                  {{ $t('common.clearAll') }}
                </button>
              </div>
            </div>

            <!-- Search Results Section -->
            <div v-if="searchQuery" class="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg mb-4 sm:mb-6 flex-shrink-0">
              <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">{{ $t('tasks.searchResults') }} "{{ searchQuery }}"</h3>
              <ul v-if="filteredTasks.length > 0" class="space-y-2 sm:space-y-3">
                <li v-for="task in filteredTasks" :key="task.id"
                    @click="viewTaskDetails(task)"
                    class="bg-white rounded p-3 sm:p-4 border border-gray-400/50 flex items-center justify-between transition-all duration-200 hover:bg-[#f7f2df] cursor-pointer">
                  <div class="flex items-center flex-1 min-w-0">
                    <input
                      type="checkbox"
                      :checked="task.status === 'completed'"
                      @change.stop="toggleTaskStatus(task)"
                      class="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 mr-2 sm:mr-3 flex-shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-gray-600 text-sm sm:text-base truncate" :class="{'line-through text-gray-500': task.status === 'completed'}">{{ task.title }}</p>
                      <p class="text-xs text-gray-400">{{ formatDate(task.dueDate, true) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span :class="getPriorityClass(task.priority).badge" class="px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ task.priority }}
                    </span>
                    <button @click.stop="editTask(task)" class="p-1 sm:p-1.5 text-blue-600 hover:text-blue-600/50 transition-colors">
                      <PencilIcon class="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button @click.stop="confirmDelete(task)" class="p-1 sm:p-1.5 text-red-600 hover:text-red-600/50 transition-colors">
                      <Trash2Icon class="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </li>
              </ul>
              <div v-else class="bg-trasparent p-8 text-center  flex flex-col justify-center items-center">
                <SearchXIcon class="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 class="text-lg font-medium mb-1 text-black">{{ $t('tasks.noTasksFound') }}</h3>
                <p class="text-gray-400 text-sm">{{ $t('tasks.noTasksMessage') }}.</p>
              </div>
            </div>

            <!-- Calendar View (always rendered if currentView is 'week') -->
            <div v-if="currentView === 'week' && !searchQuery" class="flex flex-col flex-grow">
              <TaskCalendar
                :tasks="filteredTasks"
                :view-mode="currentView"
                @viewTaskDetails="viewTaskDetails"
                @editTask="editTask"
                @toggleTaskStatus="toggleTaskStatus"
                @add-task-for-day="openAddTaskModal"
                @update:selected-day="selectedDay = $event"
                @delete-task="deleteTask"
                @update:current-month-year="updateCalendarMonthYear"
              />
            </div>

            <!-- Daily List View (always rendered if currentView is 'day') -->
            <div v-else-if="currentView === 'day' && !searchQuery" class="flex-grow overflow-auto bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg">
              <h3 class="text-lg sm:text-xl font-medium mb-3 sm:mb-4 text-[#283618]">{{ $t('tasks.dailyListTitle') }} {{ formatDate(selectedDay, false) }}</h3>
              <ul v-if="selectedDayTasks.length > 0" class="space-y-2 sm:space-y-3">
                <li v-for="task in selectedDayTasks" :key="task.id" class="bg-white rounded-xl p-3 sm:p-4 border border-gray-400/50 flex items-center justify-between transition-all duration-200">
                  <div class="flex items-center flex-1 min-w-0">
                    <input
                      type="checkbox"
                      :checked="task.status === 'completed'"
                      @change="toggleTaskStatus(task)"
                      class="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 mr-2 sm:mr-3 flex-shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-[#606c38] text-sm sm:text-base truncate" :class="{'line-through text-gray-500': task.status === 'completed'}">{{ task.title }}</p>
                      <p class="text-xs text-gray-400">{{ formatTime(task.dueDate) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span :class="getPriorityClass(task.priority).badge" class="px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ task.priority }}
                    </span>
                    <button @click="editTask(task)" class="p-1 sm:p-1.5 rounded-md text-blue-600 hover:text-blue-400/50 transition-colors">
                      <PencilIcon class="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button @click="confirmDelete(task)" class="p-1 sm:p-1.5 rounded-md text-red-600 hover:text-red-400/50 transition-colors">
                      <Trash2Icon class="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </li>
              </ul>
              <div v-else class="bg-white rounded-xl p-6 sm:p-8 text-center shadow-lg flex flex-col justify-center items-center">
                <ClipboardXIcon class="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-500 mb-3 sm:mb-4" />
                <h3 class="text-lg sm:text-xl font-medium mb-2 sm:mb-3">{{ $t('tasks.noTasksForDay') }} {{ formatDate(selectedDay, false) }}</h3>
                <p class="text-gray-400 mb-4 sm:mb-5 text-sm sm:text-base">{{ $t('tasks.addNewTasksMessage') }}</p>
                <button @click="openAddTaskModal({ dueDate: selectedDay })" class="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-md inline-flex items-center">
                  <PlusIcon class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  {{ $t('tasks.addTaskForToday') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Additional Task-Related Containers (Right Column) -->
          <div class="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
            <!-- Quick Add Task -->
            <div class="p-3 sm:p-4 lg:p-5 shadow-lg rounded-xl bg-white">
              <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#283618]">{{ $t('tasks.quickAdd.title') }}</h3> <!-- Changed title -->
              <form @submit.prevent="openAddTaskFromQuickAdd" class="space-y-3 sm:space-y-4"> <!-- New method -->
                <div>
                  <label for="quick-task-title" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.quickAdd.taskTitle') }}</label>
                  <input
                    id="quick-task-title"
                    v-model="quickTaskTitle"
                    type="text"
                    :placeholder="$t('tasks.quickAdd.taskTitle')"
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2 sm:py-2.5 px-3 sm:px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label for="quick-task-dueDate" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.quickAdd.dueDate') }}</label>
                  <input
                    id="quick-task-dueDate"
                    v-model="quickTaskDueDate"
                    type="date"
                    class="w-full bg-white border border-gray-600/50 rounded-xl py-2 sm:py-2.5 px-3 sm:px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label for="quick-task-priority" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.quickAdd.priority') }}</label>
                  <div class="relative">
                    <select
                      id="quick-task-priority"
                      v-model="quickTaskPriority"
                      class="w-full bg-white border border-gray-600/50 rounded-xl py-2 sm:py-2.5 px-3 sm:px-4 text-black appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                    >
                      <option value="Low">{{ $t('tasks.quickAdd.low') }}</option>
                      <option value="Medium">{{ $t('tasks.quickAdd.medium') }}</option>
                      <option value="High">{{ $t('tasks.quickAdd.high') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500">
                      <ChevronDownIcon class="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  class="w-full px-4 sm:px-5 py-2 sm:py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
                >
                  {{ $t('tasks.quickAdd.button') }}s
                </button>
              </form>
            </div>

            <!-- Task Categories -->
            <div class="p-3 sm:p-4 lg:p-5 shadow-lg rounded-xl bg-white">
              <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#283618]">{{ $t('tasks.categories.title') }}</h3>
              <ul class="space-y-1.5 sm:space-y-2">
                <li v-for="category in taskCategories" :key="category.name" class="flex items-center justify-between text-gray-600">
                  <span class="flex items-center text-xs sm:text-sm">
                    <TagIcon class="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    {{ category.name }}
                  </span>
                  <span class="text-xs sm:text-sm font-medium text-gray-400">{{ category.count }}</span>
                </li>
              </ul>
            </div>

            <!-- Monthly Task Overview -->
            <div class="p-3 sm:p-4 lg:p-5 shadow-lg rounded-xl bg-white">
              <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#283618]">{{ $t('tasks.monthlyOverview.title') }} {{ currentMonthYearOverview }}</h3>
              <ul v-if="tasksForCurrentMonthOverview.length > 0" class="space-y-1.5 sm:space-y-2">
                <li v-for="task in tasksForCurrentMonthOverview" :key="task.id"
                    @click="viewTaskDetails(task)"
                    class="flex items-center justify-between text-gray-500 cursor-pointer transition-colors duration-200">
                  <span class="flex items-center truncate min-w-0 flex-1">
                    <CheckCircleIcon v-if="task.status === 'completed'" class="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-green-400 flex-shrink-0" />
                    <HourglassIcon v-else-if="task.status === 'pending'" class="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-yellow-400 flex-shrink-0" />
                    <AlertCircleIcon v-else-if="task.status === 'overdue'" class="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-red-400 flex-shrink-0" />
                    <span class="truncate text-xs sm:text-sm" :class="{'line-through text-gray-500': task.status === 'completed'}">{{ task.title }}</span>
                  </span>
                  <span class="text-xs sm:text-sm font-medium text-gray-500 flex-shrink-0 ml-2">{{ formatDate(task.dueDate, false) }}</span>
                </li>
              </ul>
              <div v-else class="text-gray-400 text-xs sm:text-sm text-center py-3 sm:py-4">
                <ClipboardXIcon class="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-500 mb-1.5 sm:mb-2" />
                {{ $t('tasks.monthlyOverview.empty') }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div> <!-- Closing div for flex flex-grow -->

    <!-- Add/Edit Task Modal -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        class="bg-white rounded-xl shadow-lg max-w-sm sm:max-w-md w-full p-4 sm:p-6 relative transform transition-all duration-300 max-h-[95vh] overflow-y-auto"
        :class="{ 'scale-100 opacity-100': showTaskModal, 'scale-95 opacity-0': !showTaskModal }"
      >
        <button
          @click="closeTaskModal"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-400 transition-colors duration-200 p-1 rounded-full"
        >
          <XIcon class="h-6 w-6" />
        </button>

        <div class="text-center mb-4 sm:mb-5">
          <h3 class="text-lg sm:text-2xl text-[#283618] font-bold mb-1 sm:mb-2">{{ isEditing ? $t('tasks.modal.editTitle') : $t('tasks.modal.addTitle') }}</h3>
          <p class="text-gray-400 text-xs sm:text-sm">
            {{ isEditing ? $t('tasks.modal.editDesc') : $t('tasks.modal.addDesc') }}
          </p>
        </div>

        <form @submit.prevent="saveTask" class="space-y-4 sm:space-y-5">
          <div>
            <label for="task-title" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.title') }}</label>
            <input
              id="task-title"
              v-model="currentTask.title"
              type="text"
              :placeholder="$t('tasks.modal.placeholders.title')"
              class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label for="task-description" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.description') }}</label>
            <textarea
              id="task-description"
              v-model="currentTask.description"
              rows="3"
              :placeholder="$t('tasks.modal.placeholders.description')"
              class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label for="task-dueDate" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.dueDate') }}</label>
            <input
              id="task-dueDate"
              v-model="currentTask.dueDate"
              type="date"
              class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label for="task-startTime" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.startTime') }}</label>
              <input
                id="task-startTime"
                v-model="currentTask.startTime"
                type="time"
                class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label for="task-endTime" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.endTime') }}</label>
              <input
                id="task-endTime"
                v-model="currentTask.endTime"
                type="time"
                class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="task-notificationTime" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.notificationTime') }}</label>
            <input
              id="task-notificationTime"
              v-model="currentTask.notificationTime"
              type="time"
              class="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label for="task-priority" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.priority') }}</label>
              <div class="relative">
                <select
                  id="task-priority"
                  v-model="currentTask.priority"
                  class="w-full py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="Low">{{ $t('tasks.quickAdd.low') }}</option>
                  <option value="Medium">{{ $t('tasks.quickAdd.medium') }}</option>
                  <option value="High">{{ $t('tasks.quickAdd.high') }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-400">
                  <ChevronDownIcon class="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
            <div>
              <label for="task-status" class="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">{{ $t('tasks.modal.labels.status') }}</label>
              <div class="relative">
                <select
                  id="task-status"
                  v-model="currentTask.status"
                  class="w-full py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="pending">{{ $t('tasks.filters.status.pending') }}</option>
                  <option value="completed">{{ $t('tasks.filters.status.completed') }}</option>
                  <option value="overdue">{{ $t('tasks.filters.status.overdue') }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-400">
                  <ChevronDownIcon class="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-3 sm:pt-4">
            <button
              type="submit"
              class="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-sm sm:text-base font-medium transition-all duration-200 shadow-md flex items-center justify-center"
            >
              <span>{{ isEditing ? $t('tasks.modal.buttons.saveChanges') : $t('tasks.modal.buttons.addTask') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>



    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        class="bg-white rounded-xl  max-w-xs sm:max-w-sm w-full p-4 sm:p-6 relative shadow transform transition-all duration-300"
        :class="{ 'scale-100 opacity-100': showDeleteConfirmation, 'scale-95 opacity-0': !showDeleteConfirmation }"
      >
        <button
          @click="showDeleteConfirmation = false"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-600/50 transition-colors duration-200 p-1 rounded-full hover:bg-[#2a3548]"
        >
          <XIcon class="h-6 w-6" />
        </button>

        <div class="text-center mb-4 sm:mb-5">
          <div class="bg-red-600/20 rounded-full p-3 sm:p-4 inline-block mb-3 sm:mb-4">
            <Trash2Icon class="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
          <h3 class="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{{ $t('tasks.deleteModal.title') }}</h3>
        </div>

        <p class="text-gray-300 mb-4 sm:mb-6 text-center text-sm sm:text-base">{{ $t('tasks.deleteModal.confirm') }} "<span class="font-semibold text-white">{{ taskToDelete ? taskToDelete.title : '' }}</span>"? This action cannot be undone.</p>

        <div class="flex justify-center space-x-3 sm:space-x-4">
          <button
            @click="showDeleteConfirmation = false"
            class="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-sm sm:text-base font-medium transition-all duration-200 "
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="deleteTask"
            class="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-600/50 text-white hover:text-red-600 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sign Out Confirmation Modal (UNCHANGED) -->
    <SignOutConfirmation
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />

    <!-- Floating Action Button -->
    <button
      @click="openAddTaskModal()"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-3 sm:p-4 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-full transition-all duration-200 transform hover:scale-105"
      title="Add New Task"
    >
      <PlusIcon class="h-5 w-5 sm:h-6 sm:w-6" />
      <span class="sr-only">Add New Task</span>
    </button>
  </div> 
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { auth, db } from '../../firebase/config';
  import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

  // Lucide Icons
  import {
  PlusIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  HourglassIcon,
  AlertCircleIcon,
  FilterIcon,
  ChevronDownIcon,
  SearchIcon,
  TableIcon,
  CalendarDaysIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  ClipboardXIcon,
  SearchXIcon,
  TagIcon
  } from 'lucide-vue-next';

  import UserNavbar from '../../components/user/UserNavbar.vue';
  import UserSidebar from '../../components/user/UserSidebar.vue';
  import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
  import LoadingSpinner from '../../components/LoadingSpinner.vue';
  import TaskCalendar from '../../components/user/TaskCalendar.vue';
  import SkeletonLoader from '../../components/SkeletonLoader.vue';

  // State
  const isLoading = ref(true); // For initial page load/fetch (controls skeleton)
  const error = ref(null);
  const tasks = ref([]);
  const searchQuery = ref('');
  const statusFilter = ref('all');
  const priorityFilter = ref('all');
  const dueDateFilter = ref('all');
  const sortBy = ref('dueDate-asc');
  const currentPage = ref(1);
  const itemsPerPage = 12; // Retained for filter logic, though pagination is not visible in calendar view
  const showDeleteConfirmation = ref(false);
  const taskToDelete = ref(null);
  const showTaskModal = ref(false);
  const isEditing = ref(false);
  const currentTask = ref({
  id: null,
  title: '',
  description: '',
  dueDate: '',
  startTime: '', // New field
  endTime: '', // New field
  notificationTime: '', // New field
  status: 'pending',
  priority: 'Medium',
  createdAt: null,
  });
  const showTaskDetails = ref(false);
  const selectedTask = ref(null);
  const showSignOutConfirmation = ref(false);
  const notificationCount = ref(3);
  const showMobileFilters = ref(false);
  const showGlobalSpinner = ref(false); // For specific, longer CRUD operations (e.g., adding task)
  const currentView = ref('week'); // 'week' or 'day'
  const selectedDay = ref(new Date().toISOString().split('T')[0]); // Default to today

  // Quick Add Task State (now used for initial pre-fill for modal)
  const quickTaskTitle = ref('');
  const quickTaskDueDate = ref(new Date().toISOString().split('T')[0]);
  const quickTaskPriority = ref('Medium'); // Added for quick add priority

  // State for calendar's current month/year
  const calendarCurrentMonth = ref(new Date().getMonth());
  const calendarCurrentYear = ref(new Date().getFullYear());

  // User data (mocked for standalone component)
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const profileImage = ref(null);

  // Computed properties for user display
  const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`;
  }
  return firstName.value || 'User';
  });

  // Compute user initials for avatar
  const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value ? firstName.value.charAt(0) : 'U';
  });

  // Computed property for active filters
  const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value !== 'all' || priorityFilter.value !== 'all' || dueDateFilter.value !== 'all';
  });

  // Computed properties for statistics
  const completedTasksCount = computed(() => {
  return tasks.value.filter(task => task.status === 'completed').length;
  });

  const pendingTasksCount = computed(() => {
  return tasks.value.filter(task => task.status === 'pending').length;
  });

  const overdueTasksCount = computed(() => {
  const now = new Date();
  return tasks.value.filter(task => task.status === 'pending' && new Date(task.dueDate) < now).length;
  });

  // Computed property for task categories (example, can be expanded)
  const taskCategories = computed(() => {
  const categoriesMap = {};
  tasks.value.forEach(task => {
    const categoryName = task.priority || 'Uncategorized'; // Using priority as a simple category for now
    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = { name: categoryName, count: 0 };
    }
    categoriesMap[categoryName].count++;
  });
  return Object.values(categoriesMap);
  });

  // Filter tasks based on search query, status, priority, and due date
  const filteredTasks = computed(() => {
  let filtered = [...tasks.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(task =>
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  // Only apply other filters if no search query is active, or if we want to combine them
  // For now, search takes precedence for the displayed list, but calendar still uses all filters
  if (!searchQuery.value) { // Apply other filters only when no search query
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter.value);
    }

    if (priorityFilter.value !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter.value);
    }

    if (dueDateFilter.value !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dueDateFilter.value === 'today') {
        filtered = filtered.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate.toDateString() === today.toDateString();
        });
      } else if (dueDateFilter.value === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        filtered = filtered.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= weekStart;
        });
      } else if (dueDateFilter.value === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        filtered = filtered.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= monthStart;
        });
      }
    }
  }

  if (sortBy.value === 'dueDate-asc') {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy.value === 'dueDate-desc') {
    filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  } else if (sortBy.value === 'priority-desc') {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  } else if (sortBy.value === 'priority-asc') {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortBy.value === 'createdAt-desc') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === 'createdAt-asc') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return filtered;
  });

  // Tasks for the selected day in 'day' view
  const selectedDayTasks = computed(() => {
  if (!selectedDay.value) return [];
  const day = new Date(selectedDay.value);
  return tasks.value.filter(task => { // Use raw tasks here, as filtering is handled by filteredTasks for search
    const taskDueDate = new Date(task.dueDate);
    return taskDueDate.toDateString() === day.toDateString();
  });
  });

  // Pagination is not visually displayed for calendar, but logic kept in case needed
  const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTasks.value.slice(startIndex, endIndex);
  });

  const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage);
  });

  const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    range.push(1);

    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, start + 2);

    if (end === totalPages.value - 1) {
      start = Math.max(2, end - 2);
    }

    if (start > 2) {
      range.push('...');
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages.value - 1) {
      range.push('...');
    }

    range.push(totalPages.value);
  }

  return range;
  });

  // Computed property for tasks in the current calendar month for the overview panel
  const tasksForCurrentMonthOverview = computed(() => {
  return tasks.value.filter(task => {
    const taskDueDate = new Date(task.dueDate);
    return taskDueDate.getMonth() === calendarCurrentMonth.value &&
           taskDueDate.getFullYear() === calendarCurrentYear.value;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort by due date
  });

  const currentMonthYearOverview = computed(() => {
  const date = new Date(calendarCurrentYear.value, calendarCurrentMonth.value);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });

  // Format date filter
  const formatDueDateFilter = (filter) => {
  switch (filter) {
    case 'today':
      return 'Due Today';
    case 'week':
      return 'Due This Week';
    case 'month':
      return 'Due This Month';
    default:
      return 'All Time';
  }
  };

  // Format date
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

  // Format time (for daily list view)
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

  // Format status
  const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status class
  const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return {
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
        text: 'text-emerald-700'
      };
    case 'pending':
      return {
        badge: 'bg-amber-100 text-amber-700 border border-amber-300',
        text: 'text-amber-700'
      };
    case 'overdue':
      return {
        badge: 'bg-rose-100 text-rose-700 border border-rose-300',
        text: 'text-rose-700'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-600 border border-gray-300',
        text: 'text-gray-600'
      };
  }
  };

  // Get priority class
  const getPriorityClass = (priority) => {
  switch (priority) {
    case 'High':
      return {
        badge: 'bg-rose-100 text-rose-700 border border-rose-300',
        text: 'text-rose-700'
      };
    case 'Medium':
      return {
        badge: 'bg-amber-100 text-amber-700 border border-amber-300',
        text: 'text-amber-700'
      };
    case 'Low':
      return {
        badge: 'bg-sky-100 text-sky-700 border border-sky-300',
        text: 'text-sky-700'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-600 border border-gray-300',
        text: 'text-gray-600'
      };
  }
  };

  // Clear all filters
  const clearAllFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  priorityFilter.value = 'all';
  dueDateFilter.value = 'all';
  sortBy.value = 'dueDate-asc';
  currentPage.value = 1;
  };

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
  isLoading.value = true; // Show skeleton for initial load
  showGlobalSpinner.value = true; // Show global spinner

  error.value = null;

  const user = auth.currentUser;
  if (!user) {
    error.value = "User not authenticated. Please sign in to view tasks.";
    isLoading.value = false;
    showGlobalSpinner.value = false;
    tasks.value = []; // Clear tasks if no user
    return;
  }

  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedTasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(), // Convert Firestore Timestamp to Date
      // Robust dueDate conversion: check if it's a Timestamp or a string
      dueDate: doc.data().dueDate
        ? (doc.data().dueDate.toDate ? doc.data().dueDate.toDate() : new Date(doc.data().dueDate))
        : '',
      startTime: doc.data().startTime || '',
      endTime: doc.data().endTime || '',
      notificationTime: doc.data().notificationTime || '',
    }));
    tasks.value = fetchedTasks;
    updateTaskStatuses(); // Update statuses after fetching
  } catch (err) {
    console.error("Error fetching tasks:", err);
    error.value = err.message || "Failed to load tasks. Please try again.";
  } finally {
    isLoading.value = false; // Hide skeleton
    showGlobalSpinner.value = false; // Hide global spinner
  }
  };

  // Helper to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Open Add Task Modal
  const openAddTaskModal = (initialData = {}) => {
  isEditing.value = false;
  const nowTime = getCurrentTime();
  currentTask.value = {
    id: null,
    title: initialData.title || '',
    description: initialData.description || '',
    // Ensure dueDate is in YYYY-MM-DD format for input type="date"
    dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: initialData.startTime || nowTime, // Default to current time
    endTime: initialData.endTime || '', // Default empty
    notificationTime: initialData.notificationTime || '', // Default empty
    status: initialData.status || 'pending',
    priority: initialData.priority || 'Medium', // Now handles initial priority
    createdAt: null,
  };
  showTaskModal.value = true;
  };

  // New method for the quick add form submission
  const openAddTaskFromQuickAdd = () => {
  if (!quickTaskTitle.value) {
    alert('Task title is required!');
    return;
  }
  openAddTaskModal({
    title: quickTaskTitle.value,
    dueDate: quickTaskDueDate.value,
    priority: quickTaskPriority.value, // Pass priority
  });
  // Reset quick add inputs after opening modal
  quickTaskTitle.value = '';
  quickTaskDueDate.value = new Date().toISOString().split('T')[0];
  quickTaskPriority.value = 'Medium'; // Reset priority
  };

  // Edit Task
  const editTask = (task) => {
  isEditing.value = true;
  // Ensure dueDate is in YYYY-MM-DD format for input type="date"
  currentTask.value = {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', // Convert Date object to YYYY-MM-DD string
    startTime: task.startTime || '',
    endTime: task.endTime || '',
    notificationTime: task.notificationTime || '',
  };
  showTaskModal.value = true;
  closeTaskDetails();
  };

  // Save Task (Add or Edit)
  const saveTask = async () => {
  if (!currentTask.value.title || !currentTask.value.dueDate) {
    alert('Title and Due Date are required!');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to save tasks.");
    return;
  }

  // --- Date/Time Validation ---
  const now = new Date();
  now.setSeconds(0, 0); // Ignore seconds and milliseconds for comparison

  const taskDueDateString = currentTask.value.dueDate; // YYYY-MM-DD
  const taskStartTimeString = currentTask.value.startTime; // HH:MM

  let taskDateTimeForValidation;
  if (taskStartTimeString) {
      // Combine date and time for precise comparison
      taskDateTimeForValidation = new Date(`${taskDueDateString}T${taskStartTimeString}:00`);
  } else {
      // If no start time, consider the end of the day for validation
      taskDateTimeForValidation = new Date(`${taskDueDateString}T23:59:59`);
  }

  // Check if the task date is in the past
  if (taskDateTimeForValidation < now && taskDateTimeForValidation.toDateString() !== now.toDateString()) {
      alert('Cannot add tasks for past dates!');
      return;
  }
  // Check if the task is for today but the time is in the past
  if (taskDateTimeForValidation.toDateString() === now.toDateString() && taskDateTimeForValidation < now) {
      alert('Cannot add tasks for a time in the past on the current date!');
      return;
  }
  // --- End Date/Time Validation ---

  // Only show global spinner for adding new tasks
  if (!isEditing.value) {
    showGlobalSpinner.value = true;
  }

  try {
    // Construct a proper Date object for dueDate to save to Firestore
    // This will be converted to a Firestore Timestamp (UTC)
    // When read back, .toDate() will convert it back to a local Date object.
    let finalDueDateForFirestore = new Date(currentTask.value.dueDate);
    if (currentTask.value.endTime) {
        const [hours, minutes] = currentTask.value.endTime.split(':').map(Number);
        finalDueDateForFirestore.setHours(hours, minutes, 59, 999); // Set to end of minute for comparison
    } else if (currentTask.value.startTime) {
        const [hours, minutes] = currentTask.value.startTime.split(':').map(Number);
        finalDueDateForFirestore.setHours(hours, minutes, 0, 0);
    } else {
        finalDueDateForFirestore.setHours(23, 59, 59, 999); // Default to end of day if no time specified
    }

    const taskData = {
      title: currentTask.value.title,
      description: currentTask.value.description,
      dueDate: finalDueDateForFirestore, // Save as Date object
      startTime: currentTask.value.startTime || '', // Keep as string for input display
      endTime: currentTask.value.endTime || '',
      notificationTime: currentTask.value.notificationTime || '',
      status: currentTask.value.status,
      priority: currentTask.value.priority,
      userId: user.uid, // Associate task with user
    };

    if (isEditing.value) {
      // Update existing task
      const taskRef = doc(db, "tasks", currentTask.value.id);
      await updateDoc(taskRef, taskData);
    } else {
      // Add new task
      taskData.createdAt = new Date(); // Set createdAt only for new tasks
      await addDoc(collection(db, "tasks"), taskData);
    }
    await fetchTasks(); // Re-fetch tasks to update calendar
    closeTaskModal();
  } catch (err) {
    console.error("Error saving task:", err);
    alert("Failed to save task. Please try again.");
  } finally {
    showGlobalSpinner.value = false;
  }
  };

  // Close Task Modal
  const closeTaskModal = () => {
  showTaskModal.value = false;
  };

  // View Task Details
  const viewTaskDetails = (task) => {
  selectedTask.value = task;
  showTaskDetails.value = true;
  };

  // Close Task Details Modal
  const closeTaskDetails = () => {
  showTaskDetails.value = false;
  selectedTask.value = null;
  };

  // Confirm Delete
  const confirmDelete = (task) => {
  taskToDelete.value = task;
  showDeleteConfirmation.value = true;
  closeTaskDetails();
  };

  // Delete Task
  const deleteTask = async (taskId) => {
  // No global spinner for delete, as it's usually quick and modal provides feedback
  const idToDelete = taskId || (taskToDelete.value ? taskToDelete.value.id : null);

  if (!idToDelete) {
    return;
  }

  try {
    await deleteDoc(doc(db, "tasks", idToDelete));
    await fetchTasks(); // Re-fetch tasks to update calendar
    showDeleteConfirmation.value = false;
    taskToDelete.value = null;
  } catch (err) {
    console.error("Error deleting task:", err);
    alert("Failed to delete task. Please try again.");
  }
  };

  // Toggle Task Status (e.g., mark complete/pending)
  const toggleTaskStatus = async (task) => {
  // No global spinner for status toggle, as it's usually quick
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';

  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { status: newStatus });
    await fetchTasks(); // Re-fetch tasks to update calendar
  } catch (err) {
    console.error("Error toggling task status:", err);
    alert("Failed to update task status. Please try again.");
  }
  };

  // Update task statuses (e.g., mark as overdue)
  const updateTaskStatuses = () => {
  const now = new Date();
  tasks.value.forEach(task => {
    // Ensure task.dueDate is a Date object for comparison
    const taskDueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);

    if (task.status === 'pending' && taskDueDate < now) {
      task.status = 'overdue';
      // Optionally, update in Firestore as well for persistence
      // updateDoc(doc(db, "tasks", task.id), { status: 'overdue' });
    } else if (task.status === 'overdue' && taskDueDate >= now) {
      task.status = 'pending';
      // Optionally, update in Firestore as well for persistence
      // updateDoc(doc(db, "tasks", task.id), { status: 'pending' });
    }
  });
  };

  // Handle sign out (mocked)
  const handleSignOut = async () => {
  try {
    // await signOut(auth); // Uncomment if using Firebase Auth
    // router.push('/signin'); // Uncomment if using vue-router
    alert('Signed out (mock action)');
    showSignOutConfirmation.value = false;
  } catch (err) {
    console.error("Error signing out:", err);
    alert("Failed to sign out. Please try again.");
  }
  };

  // Fetch user data from Firebase
  const fetchUserData = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("authUid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        firstName.value = userData.firstName || '';
        lastName.value = userData.lastName || '';
        email.value = userData.email || user.email || '';
        profileImage.value = userData.profileImage || null;
      } else {
        console.warn("No user document found for authUid:", user.uid);
        email.value = user.email || '';
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }
  };

  // Method to update calendar month/year from TaskCalendar component
  const updateCalendarMonthYear = ({ month, year }) => {
  calendarCurrentMonth.value = month;
  calendarCurrentYear.value = year;
  };

  // Reset filters when search/filter inputs change
  watch([searchQuery, statusFilter, priorityFilter, dueDateFilter, sortBy], () => {
  currentPage.value = 1;
  });

  // Lifecycle hooks
  onMounted(async () => {
  console.log("Task scheduler component mounted");
  // Listen for auth state changes to fetch tasks only when authenticated
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await fetchUserData();
      await fetchTasks();
      // Set up an interval to periodically check for overdue tasks
      setInterval(updateTaskStatuses, 60 * 1000);
    } else {
      // User logged out, clear tasks
      tasks.value = [];
      isLoading.value = false;
      error.value = "Please sign in to view tasks.";
    }
  });
  });
</script>

<style scoped>
  /* No specific scoped styles for TaskScheduler.vue, Tailwind handles most. */
  /* Keeping existing global animations, if any. */
  .animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
  }
</style>
