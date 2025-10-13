<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Top Navigation Bar -->
    <ProfessionalNavbar 
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :photoURL="photoURL"
      @manage-profile="goToProfile"
      @sign-out="showSignOutConfirmation = true"
    />
    
    <!-- Main Content with Sidebar -->
    <div class="pt-8 md:pl-64 flex">
      <!-- Sidebar -->
      <ProfessionalSidebar />
      
      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 class="text-3xl font-semibold mb-1 text-[#283618]">User Management</h1>
            <p class="text-sm sm:text-base text-gray-400">Manage system users, roles, and permissions</p>
          </div>
          
          <button 
            @click="showAddUserModal = true"
            class="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 bg-[#283618] hover:bg-[#606c38] text-white rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New User
          </button>
        </div>
        
        <!-- Error State -->
        <div v-if="error" class="h-[calc(100vh-200px)] flex items-center justify-center">
          <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-lg mx-auto">
            <h3 class="font-medium text-lg mb-2">Error Loading Users</h3>
            <p>{{ error }}</p>
            <button 
              @click="fetchUsers" 
              class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        
        <!-- User Management Content -->
        <div v-else>
          <!-- Filters and Search -->
          <div class="bg-white rounded-xl p-4 mb-6 shadow-lg">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <!-- Search -->
              <div class="relative flex-1">
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Search users by name, email, or role..." 
                  class="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-xl text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <!-- Filters and View Toggle -->
              <div class="flex flex-wrap gap-3 items-center">
                <!-- Role Filter -->
                <div class="relative">
                  <select 
                    v-model="roleFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="professional">Professional</option>
                    <option value="user">Farmer</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <!-- Status Filter -->
                <div class="relative">
                  <select 
                    v-model="statusFilter"
                    class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <!-- View Toggle -->
                <div class="flex bg-gray-300 rounded-md overflow-hidden">
                  <button 
                    @click="viewMode = 'list'"
                    :class="{ 'bg-[#606c38] text-white': viewMode === 'list' }"
                    class="px-3 py-2 flex items-center justify-center transition-colors"
                    title="List View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button 
                    @click="viewMode = 'card'"
                    :class="{ 'bg-[#606c38] text-white': viewMode === 'card' }"
                    class="px-3 py-2 flex items-center justify-center transition-colors"
                    title="Card View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
                
                <!-- Clear Filters -->
                <button 
                  @click="clearFilters"
                  class="px-4 py-2 bg-trasparent transition-colors text-sm text-red-500 hover:text-red-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          
          <!-- No Users Found Message -->
          <div v-if="filteredUsers.length === 0" class="bg-white rounded-xl shadow-lg p-12 text-center">
            <div class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="text-lg font-medium mb-1 text-black">No users found</p>
              <p class="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
          
          <!-- List View (Table) -->
          <div v-else-if="viewMode === 'list'" class="bg-white rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#283618] border-b border-gray-700/50 text-left">
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Joined</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr 
                    v-for="user in paginatedUsers" 
                    :key="user.id" 
                    class="bg-white hover:bg-[#f7f2df] transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-[#dfe8d4] flex items-center justify-center text-[#606c38] text-sm font-bold mr-3 overflow-hidden" style="border: #606c38; border: 2px solid #606c38;">
                          <img v-if="user.profileImage" :src="user.profileImage" alt="Profile" class="h-full w-full object-cover" />
                          <span v-else>{{ getUserInitials(user) }}</span>
                        </div>
                        <div>
                          <div class="font-medium text-[#606c38]">{{ formatName(user.firstName) }} {{ formatName(user.lastName) }}</div>
                          <div class="text-sm text-gray-400">ID: {{ user.id.substring(0, 8) }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ user.email }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="{
                          'bg-emerald-500/20 text-emerald-400': user.role === 'professional',
                          'bg-blue-500/20 text-blue-400': user.role === 'user'
                        }"
                        class="px-2 py-1 text-xs rounded-full"
                      >
                        {{ getRoleDisplay(user.role) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="{
                          'bg-green-500/20 text-green-400': user.status === 'active',
                          'bg-red-500/20 text-red-400': user.status === 'inactive',
                          'bg-yellow-500/20 text-yellow-400': user.status === 'pending'
                        }"
                        class="px-2 py-1 text-xs rounded-full"
                      >
                        {{ capitalizeFirstLetter(user.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatLocation(user.location) || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="flex space-x-2">
                        <button 
                          @click="viewUser(user)"
                          class="p-1.5 text-blue-500 hover:text-blue-300 transition-colors"
                          title="View User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          @click="editUser(user)"
                          class="p-1.5 text-yellow-500 hover:text-yellow-300 transition-colors"
                          title="Edit User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          @click="confirmDeleteUser(user)"
                          class="p-1.5 text-red-500 hover:text-red-300 transition-colors"
                          title="Delete User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination for List View -->
            <div class="bg-[#f7f2df] px-6 py-4 flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredUsers.length }} users
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          <!-- Card View -->
          <div v-else>
            <!-- Card Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div 
                v-for="user in paginatedUsers" 
                :key="user.id" 
                class="bg-white rounded-xl shadow-lg overflow-hidden transition-colors"
              >
                <!-- Card Header -->
                <div class="p-4 bg-[#283618] flex items-center">
                  <div class="h-12 w-12 mr-3 rounded-full bg-[#c9d4a3] flex items-center justify-center text-[#606c38] text-sm font-bold overflow-hidden" style="border: #606c38; border: 2px solid #606c38;">
                    <img v-if="user.profileImage" :src="user.profileImage" alt="Profile" class="h-full w-full object-cover" />
                    <span v-else>{{ getUserInitials(user) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-white truncate">{{ formatName(user.firstName) }} {{ formatName(user.lastName) }}</h3>
                    <p class="text-sm text-[#c9d4a3] truncate">{{ user.email }}</p>
                  </div>
                </div>
                
                <!-- Card Body -->
                <div class="p-4 space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Role</span>
                    <span 
                      :class="{
                        'text-emerald-400': user.role === 'professional',
                        'text-blue-400': user.role === 'user'
                      }"
                    >
                      {{ getRoleDisplay(user.role) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Status</span>
                    <span 
                      :class="{
                        'text-green-400': user.status === 'active',
                        'text-red-400': user.status === 'inactive',
                        'text-yellow-400': user.status === 'pending'
                      }"
                    >
                      {{ capitalizeFirstLetter(user.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Joined</span>
                    <span class="text-sm text-gray-400">{{ formatDate(user.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Location</span>
                    <span class="text-gray-400 text-sm truncate max-w-[150px]">{{ formatLocation(user.location) || 'N/A' }}</span>
                  </div>
                </div>
                
                <!-- Card Footer -->
                <div class="bg-[#f7f2df] p-3 flex justify-between">
                  <button 
                    @click="viewUser(user)"
                    class="flex-1 py-1.5 text-blue-500 transition-colors text-sm"
                  >
                    View
                  </button>
                  <button 
                    @click="editUser(user)"
                    class="flex-1 py-1.5 text-yellow-500 ransition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    @click="confirmDeleteUser(user)"
                    class="flex-1 py-1.5 text-red-500 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Pagination for Card View -->
            <div class="mt-6 px-6 py-4 flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredUsers.length }} users
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">Add New User</h3>
            <button @click="showAddUserModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="addUser">
            <div class="space-y-4">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <input 
                  v-model="newUser.firstName"
                  type="text" 
                  id="firstName" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <input 
                  v-model="newUser.lastName"
                  type="text" 
                  id="lastName" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <input 
                  v-model="newUser.email"
                  type="email" 
                  id="email" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Role -->
              <div>
                <label for="role" class="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <select 
                  v-model="newUser.role"
                  id="role" 
                  class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                >
                  <option value="professional">Professional</option>
                  <option value="user">Farmer</option>
                </select>
              </div>
              
              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <select 
                  v-model="newUser.status"
                  id="status" 
                  class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input 
                  v-model="newUser.password"
                  type="password" 
                  id="password" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="submit"
                class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors"
                :disabled="isAddingUser"
              >
                <span v-if="isAddingUser">Adding...</span>
                <span v-else>Add User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- View User Modal -->
    <div v-if="showViewUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">User Details</h3>
            <button @click="showViewUserModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedUser" class="space-y-6">
            <!-- User Avatar and Name -->
            <div class="flex flex-col items-center">
              <div class="h-20 w-20 rounded-full bg-[#dfe8d4] flex items-center justify-center text-[#606c38] text-xl font-bold mb-3 overflow-hidden" style="border: #606c38; border: 3px solid #606c38;">
                <img v-if="selectedUser.profileImage" :src="selectedUser.profileImage" alt="Profile" class="h-full w-full object-cover" />
                <span v-else>{{ getUserInitials(selectedUser) }}</span>
              </div>
              <h3 class="text-xl font-bold text-[#606c38]">{{ formatName(selectedUser.firstName) }} {{ formatName(selectedUser.lastName) }}</h3>
              <p class="text-sm text-gray-600">{{ selectedUser.email }}</p>
            </div>
            
            <!-- User Details -->
            <div class="bg-transparent p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">User ID</span>
                <span>{{ selectedUser.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Role</span>
                <span 
                  :class="{
                    'text-emerald-400': selectedUser.role === 'professional',
                    'text-blue-400': selectedUser.role === 'user'
                  }"
                >
                  {{ getRoleDisplay(selectedUser.role) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span 
                  :class="{
                    'text-green-400': selectedUser.status === 'active',
                    'text-red-400': selectedUser.status === 'inactive',
                    'text-yellow-400': selectedUser.status === 'pending'
                  }"
                >
                  {{ capitalizeFirstLetter(selectedUser.status) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Location</span>
                <span>{{ formatLocation(selectedUser.location) || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Joined</span>
                <span>{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Active</span>
                <span>{{ formatDate(selectedUser.lastActive) || 'N/A' }}</span>
              </div>
            </div>
            
            <!-- User Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-emerald-50 rounded-xl shadow-lg p-4 text-center">
                <div class="text-2xl font-bold text-emerald-500">{{ selectedUser.detectionCount || 0 }}</div>
                <div class="text-sm text-gray-700">Detections</div>
              </div>
              <div class="bg-blue-50 rounded-xl shadow-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-500">{{ selectedUser.loginCount || 0 }}</div>
                <div class="text-sm text-gray-700">Logins</div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-3">
              <button 
                @click="editUser(selectedUser)"
                class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">Edit User</h3>
            <button @click="showEditUserModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form v-if="editingUser" @submit.prevent="updateUser">
            <div class="space-y-4">
              <!-- First Name -->
              <div>
                <label for="editFirstName" class="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <input 
                  v-model="editingUser.firstName"
                  type="text" 
                  id="editFirstName" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Last Name -->
              <div>
                <label for="editLastName" class="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <input 
                  v-model="editingUser.lastName"
                  type="text" 
                  id="editLastName" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Email -->
              <div>
                <label for="editEmail" class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <input 
                  v-model="editingUser.email"
                  type="email" 
                  id="editEmail" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              
              <!-- Role -->
              <div>
                <label for="editRole" class="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <select 
                  v-model="editingUser.role"
                  id="editRole" 
                  class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                >
                  <option value="professional">Professional</option>
                  <option value="user">Farmer</option>
                </select>
              </div>
              
              <!-- Status -->
              <div>
                <label for="editStatus" class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <select 
                  v-model="editingUser.status"
                  id="editStatus" 
                  class="w-full px-4 py-2 rounded-xl bg-white border border-gray-600/50 text-black focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <!-- Reset Password Option -->
              <div class="flex items-center">
                <input 
                  v-model="resetPassword"
                  type="checkbox" 
                  id="resetPassword" 
                  class="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
                <label for="resetPassword" class="ml-2 block text-sm text-gray-500">Reset Password</label>
              </div>
              
              <!-- New Password (only shown if resetPassword is checked) -->
              <div v-if="resetPassword">
                <label for="newPassword" class="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                <input 
                  v-model="newPassword"
                  type="password" 
                  id="newPassword" 
                  class="w-full bg-white border border-gray-600/50 rounded-xl py-2.5 px-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="submit"
                class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors"
                :disabled="isUpdatingUser"
              >
                <span v-if="isUpdatingUser">Updating...</span>
                <span v-else>Update User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Delete User Confirmation Modal -->
    <div v-if="showDeleteUserModal" class="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">Delete User</h3>
            <button @click="showDeleteUserModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedUser" class="space-y-4">
            <div class="text-center p-4">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            
            <div class="bg-white rounded-xl border border-gray-400/50 p-4">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-[#dfe8d4] flex items-center justify-center text-[#606c38] text-sm font-bold mr-3 overflow-hidden" style="border: #606c38; border: 2px solid #606c38;">
                  <img v-if="selectedUser.profileImage" :src="selectedUser.profileImage" alt="Profile" class="h-full w-full object-cover" />
                  <span v-else>{{ getUserInitials(selectedUser) }}</span>
                </div>
                <div>
                  <div class="font-medium text-lg">{{ formatName(selectedUser.firstName) }} {{ formatName(selectedUser.lastName) }}</div>
                  <div class="text-xs text-gray-600">{{ selectedUser.email }}</div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                @click="showDeleteUserModal = false"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteUser"
                class="px-4 py-2 bg-red-600 hover:bg-red-600/50 text-white rounded-xl transition-colors"
                :disabled="isDeletingUser"
              >
                <span v-if="isDeletingUser">Deleting...</span>
                <span v-else>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation 
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
    
    <!-- Page Loader -->
    <PageLoader :is-loading="isLoading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateEmail, updatePassword } from 'firebase/auth';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import PageLoader from '../../components/professional/PageLoader.vue';

// Router
const router = useRouter();

// Current user state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const photoURL = ref(null);
const userRole = ref('Professional');
const isLoading = ref(true);
const error = ref(null);
const showSignOutConfirmation = ref(false);

// View mode state
const viewMode = ref('list'); // 'list' or 'card'

// Computed properties for current user
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${formatName(firstName.value)} ${formatName(lastName.value)}`;
  }
  return formatName(firstName.value) || 'Professional';
});

const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'P';
});

// Users management state
const users = ref([]);
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddUserModal = ref(false);
const showViewUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteUserModal = ref(false);
const selectedUser = ref(null);
const editingUser = ref(null);
const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user',
  status: 'active',
  password: ''
});
const resetPassword = ref(false);
const newPassword = ref('');
const isAddingUser = ref(false);
const isUpdatingUser = ref(false);
const isDeletingUser = ref(false);

// Computed properties for users
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Search query filter
    const searchLower = searchQuery.value.toLowerCase();
    const nameMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower);
    const emailMatch = user.email.toLowerCase().includes(searchLower);
    const roleMatch = user.role.toLowerCase().includes(searchLower);
    const searchMatches = nameMatch || emailMatch || roleMatch;
    
    // Role filter
    const roleMatches = roleFilter.value ? user.role === roleFilter.value : true;
    
    // Status filter
    const statusMatches = statusFilter.value ? user.status === statusFilter.value : true;
    
    return searchMatches && roleMatches && statusMatches;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const paginationStart = computed(() => {
  return filteredUsers.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredUsers.value.length);
});

// Methods
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const getRoleDisplay = (role) => {
  if (role === 'user') return 'Farmer';
  return capitalizeFirstLetter(role);
};

const fetchCurrentUser = async () => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      router.push('/signin');
      return;
    }
    
    // Get user data from Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No user document found for current auth user");
      throw new Error("User profile not found. Please contact support.");
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Update user data state
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    photoURL.value = userData.photoURL || null; // This gets the photo URL
    userRole.value = userData.role === 'professional' ? 'Professional' : 'User';
    
    // Check if user has correct role for this dashboard
    if (userData.role !== 'professional') {
      console.warn("User does not have professional role, redirecting to user dashboard");
      router.push('/user/dashboard');
      return;
    }
    
  } catch (err) {
    console.error("Error fetching current user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  }
};

const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Get all users from Firestore
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const fetchedUsers = [];
    querySnapshot.forEach((doc) => {
      fetchedUsers.push({
        id: doc.id,
        ...doc.data(),
        // Add default values for any missing fields
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || '',
        email: doc.data().email || '',
        role: doc.data().role || 'user',
        status: doc.data().status || 'active',
        createdAt: doc.data().createdAt || null,
        lastActive: doc.data().lastActive || null,
        location: doc.data().location || null,
        detectionCount: doc.data().detectionCount || 0,
        loginCount: doc.data().loginCount || 0,
        profileImage: doc.data().profileImage || null
      });
    });
    
    // Sort users by join date (newest first)
    users.value = fetchedUsers.sort((a, b) => {
      // Handle cases where createdAt might be null or undefined
      const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
      const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
      
      // Sort in descending order (newest first)
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Fetched ${fetchedUsers.length} users`);
    
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = err.message || "Failed to load users. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  statusFilter.value = '';
  currentPage.value = 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const getUserInitials = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  return user.firstName.charAt(0) || 'U';
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatLocation = (location) => {
  if (!location) return '';
  
  const parts = [];
  
  if (location.municipality?.name) {
    parts.push(location.municipality.name);
  }
  
  if (location.province?.name) {
    parts.push(location.province.name);
  }
  
  if (location.country?.name) {
    parts.push(location.country.name);
  }
  
  return parts.join(', ');
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // If it's a Firestore timestamp, convert to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const viewUser = (user) => {
  selectedUser.value = user;
  showViewUserModal.value = true;
};

const editUser = (user) => {
  // Create a copy of the user object to avoid modifying the original
  editingUser.value = { ...user };
  resetPassword.value = false;
  newPassword.value = '';
  showEditUserModal.value = true;
  
  // If we're coming from the view modal, close it
  showViewUserModal.value = false;
};

const confirmDeleteUser = (user) => {
  selectedUser.value = user;
  showDeleteUserModal.value = true;
};

const addUser = async () => {
  isAddingUser.value = true;
  
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      newUser.value.email,
      newUser.value.password
    );
    
    // Add user to Firestore
    const userRef = collection(db, "users");
    await addDoc(userRef, {
      firstName: newUser.value.firstName,
      lastName: newUser.value.lastName,
      email: newUser.value.email,
      role: newUser.value.role,
      status: newUser.value.status,
      authUid: userCredential.user.uid,
      createdAt: serverTimestamp(),
      lastActive: null
    });
    
    // Reset form and close modal
    newUser.value = {
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active',
      password: ''
    };
    showAddUserModal.value = false;
    
    // Refresh users list
    await fetchUsers();
    
    // Show success message
    alert('User added successfully');
    
  } catch (err) {
    console.error("Error adding user:", err);
    alert(`Failed to add user: ${err.message}`);
  } finally {
    isAddingUser.value = false;
  }
};

const updateUser = async () => {
  isUpdatingUser.value = true;
  
  try {
    // Update user in Firestore
    const userRef = doc(db, "users", editingUser.value.id);
    await updateDoc(userRef, {
      firstName: editingUser.value.firstName,
      lastName: editingUser.value.lastName,
      email: editingUser.value.email,
      role: editingUser.value.role,
      status: editingUser.value.status
    });
    
    // If the user has an authUid and we need to reset password
    if (editingUser.value.authUid && resetPassword.value && newPassword.value) {
      // This would typically be done through a Cloud Function for security
      // For demo purposes, we'll just show a message
      console.log(`Password would be reset for user ${editingUser.value.id}`);
    }
    
    // Close modal
    showEditUserModal.value = false;
    
    // Refresh users list
    await fetchUsers();
    
    // Show success message
    alert('User updated successfully');
    
  } catch (err) {
    console.error("Error updating user:", err);
    alert(`Failed to update user: ${err.message}`);
  } finally {
    isUpdatingUser.value = false;
  }
};

const deleteUser = async () => {
  isDeletingUser.value = true;
  
  try {
    // Delete user from Firestore
    const userRef = doc(db, "users", selectedUser.value.id);
    await deleteDoc(userRef);
    
    // Note: Deleting the user from Firebase Auth would typically be done through a Cloud Function
    // For demo purposes, we'll just show a message
    console.log(`User ${selectedUser.value.id} deleted from Firestore`);
    
    // Close modal
    showDeleteUserModal.value = false;
    
    // Refresh users list
    await fetchUsers();
    
    // Show success message
    alert('User deleted successfully');
    
  } catch (err) {
    console.error("Error deleting user:", err);
    alert(`Failed to delete user: ${err.message}`);
  } finally {
    isDeletingUser.value = false;
  }
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/professional/profile');
};

// Handle sign out
const handleSignOut = async () => {
  try {
    // First close the confirmation dialog
    showSignOutConfirmation.value = false;
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Sign out from Firebase Auth
    await signOut(auth);
    
    // Force immediate navigation to sign in page using window.location
    window.location.href = '/signin';
    
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = "Failed to sign out. Please try again.";
  }
};

// Fetch data on component mount
onMounted(async () => {
  await fetchCurrentUser();
  await fetchUsers();
});
</script>