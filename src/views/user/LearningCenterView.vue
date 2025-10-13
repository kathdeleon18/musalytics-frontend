<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Success Notification -->
    <NotificationToast
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
    
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
    <div class="pt-2 md:pl-64 flex">
      <!-- Sidebar -->
      <UserSidebar />
      
      <!-- Main Content Area -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <div class="mb-4 sm:mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="mb-2 text-2xl font-semibold text-[#283618]">Learning Center</h2>
              <p class="text-gray-400 text-sm">Browse and access educational materials shared by our professionals</p>
            </div>
            
            <!-- Back Button for Mobile and Desktop -->
            <div v-if="currentFolderId !== 'root'" class="flex items-center gap-2">
              <button 
                @click="goBack"
                class="flex items-center mt-4 text-gray-600 transition-colors text-sm font-medium"
                title="Go back to previous folder"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>

        <!-- Breadcrumb Navigation -->
        <div v-if="currentFolderId !== 'root' || currentFolderPath.length > 0" class="mb-4">
          <nav class="flex items-center space-x-2 text-sm overflow-x-auto" aria-label="Breadcrumb">
            <!-- Home/Root Link -->
            <button 
              @click="navigateToRoot"
              class="flex items-center text-[#606c38] hover:text-[#4a5a2a] transition-colors whitespace-nowrap"
              title="Go to root directory"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="font-medium hidden sm:inline">Learning Center</span>
              <span class="font-medium sm:hidden">Home</span>
            </button>
            
            <!-- Breadcrumb Separator and Folders -->
            <template v-for="(folder, index) in currentFolderPath" :key="folder.id">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <button 
                @click="navigateToFolder(folder.id)"
                class="text-[#606c38] hover:text-[#4a5a2a] transition-colors truncate max-w-[120px] sm:max-w-[150px] whitespace-nowrap"
                :title="folder.name"
              >
                <span class="font-medium">{{ folder.name }}</span>
              </button>
            </template>
            
            <!-- Current Folder (not clickable) -->
            <template v-if="currentFolderId !== 'root'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-gray-600 font-medium truncate max-w-[120px] sm:max-w-[150px] whitespace-nowrap">
                {{ getCurrentFolderName() }}
              </span>
            </template>
          </nav>
        </div>
        
        <!-- Search and Filters -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-4">
          <!-- Search Bar with Clear Filter Button -->
          <div class="flex gap-2 mb-3">
            <!-- Search -->
            <div class="relative flex-1">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search materials..." 
                class="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-xl text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <!-- Clear Filters (Only show when filters are active) -->
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm whitespace-nowrap"
              title="Clear all filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="hidden sm:inline">Clear</span>
            </button>
          </div>
          
          <!-- Filter Controls (Single Line with Horizontal Scroll on Mobile) -->
          <div class="flex gap-2 overflow-x-auto pb-1">
            <!-- Category Filter -->
            <div class="relative flex-shrink-0 min-w-[140px]">
              <select 
                v-model="categoryFilter"
                class="px-3 py-2 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ formatName(category) }}
                </option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <!-- File Type Filter -->
            <div class="relative flex-shrink-0 min-w-[140px]">
              <select 
                v-model="fileTypeFilter"
                class="px-3 py-2 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm"
              >
                <option value="">All File Types</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <!-- Sort By -->
            <div class="relative flex-shrink-0 min-w-[140px]">
              <select 
                v-model="sortBy"
                class="px-3 py-2 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm"
              >
                <option value="createdAt">Date (Newest)</option>
                <option value="createdAtAsc">Date (Oldest)</option>
                <option value="title">Name (A-Z)</option>
                <option value="titleDesc">Name (Z-A)</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- No Materials or Folders Found Message -->
        <div v-if="filteredFolders.length === 0 && filteredMaterials.length === 0" class="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <div class="flex flex-col items-center max-w-md mx-auto">
            <!-- Icon based on search context -->
            <div class="mb-6">
              <svg v-if="searchQuery || categoryFilter || fileTypeFilter" xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <!-- Title -->
            <h3 class="text-xl sm:text-2xl font-semibold mb-3 text-gray-800">
              {{ getNoResultsTitle() }}
            </h3>
            
            <!-- Contextual message -->
            <p class="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
              {{ getNoResultsMessage() }}
            </p>
            
            <!-- Suggestions card (only show when filters are active) -->
            <div v-if="searchQuery || categoryFilter || fileTypeFilter" class="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 text-left w-full mb-6">
              <p class="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Try these suggestions:
              </p>
              <ul class="text-sm text-blue-800 space-y-2">
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Check your spelling
                </li>
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Use different keywords
                </li>
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Search by file type: "documents", "images", "videos", "audio"
                </li>
                <li v-if="categoryFilter || fileTypeFilter" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Clear some filters to see more results
                </li>
              </ul>
            </div>
            
            <!-- Action buttons -->
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                v-if="searchQuery || categoryFilter || fileTypeFilter"
                @click="clearFilters"
                class="px-6 py-3 bg-[#606c38] hover:bg-[#4a5a2a] text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
              <button 
                v-else-if="currentFolderId !== 'root'"
                @click="goBack"
                class="px-6 py-3 bg-[#606c38] hover:bg-[#4a5a2a] text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Go Back to Parent Folder
              </button>
            </div>
          </div>
        </div>
        
        <!-- Grid View (Desktop Style) -->
        <div v-else-if="effectiveViewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <!-- Folders -->
          <div 
            v-for="folder in paginatedFolders" 
            :key="'folder-' + folder.id" 
            class="group flex flex-col items-center justify-center text-center p-4 rounded-lg transition-all duration-200"
            @mouseenter="showItemTooltip($event, folder, true)"
            @mouseleave="hideItemTooltip"
            @touchstart="startLongPress($event, folder, true)"
            @touchend="cancelLongPress"
            @touchmove="cancelLongPress"
            @contextmenu.prevent="showItemContextMenu($event, folder, true)"
          >
            <!-- Folder Icon (positioned above the name) -->
            <div class="mb-3 relative">
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-16 h-16">
                  <!-- Classic folder shape -->
                  <path fill="#FFCA28" d="M448,119.5V352c0,35.3-28.7,64-64,64H64c-35.3,0-64-28.7-64-64V96c0-35.3,28.7-64,64-64h149.3
                    c17,0,33.3,6.7,45.3,18.7l36.7,36.7c6,6,14.1,9.4,22.6,9.4H384C419.3,96.7,448,84.2,448,119.5z"/>
                  <!-- Folder tab -->
                  <path fill="#FFB300" d="M448,119.5V160H296c-13.3,0-24-10.7-24-24V96.7c0-17.7-14.3-32-32-32H64c-35.3,0-64,28.7-64,64v32h448
                    V119.5z"/>
                </svg>
                <button 
                  @click="navigateToFolder(folder.id)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="Open folder"
                >
                  <span class="sr-only">Open folder</span>
                </button>
              </div>
            </div>
            
            <!-- Folder Name (positioned below the icon) -->
            <div class="w-full">
              <p class="text-[#606c38] text-sm font-medium truncate transition-colors duration-200 max-w-[120px] mx-auto">
                {{ folder.name }}
              </p>
            </div>

            <!-- Folder Type -->
            <div class="mt-2">
              <p class="text-xs text-gray-500 truncate max-w-[120px] mx-auto">
                Folder
              </p>
            </div>
          </div>
          
          <!-- Materials -->
          <div 
            v-for="material in paginatedMaterials" 
            :key="'material-' + material.id" 
            class="group flex flex-col items-center justify-center text-center p-4 rounded-lg transition-all duration-200"
            @mouseenter="showItemTooltip($event, material)"
            @mouseleave="hideItemTooltip"
            @touchstart="startLongPress($event, material)"
            @touchend="cancelLongPress"
            @touchmove="cancelLongPress"
            @contextmenu.prevent="showItemContextMenu($event, material)"
          >
            <!-- File Icon (positioned above the name) -->
            <div class="mb-3 relative">
              <!-- PDF Icon -->
              <div v-if="material.fileType === 'document' && isPDF(material.fileUrl)" class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- PDF red part -->
                  <path fill="#dc2626" d="M384 128H256V0L384 128z"/>
                  <!-- PDF text -->
                  <text x="90" y="300" fill="#dc2626" font-size="60" font-weight="bold">PDF</text>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="View document"
                >
                  <span class="sr-only">View document</span>
                </button>
              </div>
              
              <!-- Document Icon -->
              <div v-else-if="material.fileType === 'document'" class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- Document purple part -->
                  <path fill="#9333ea" d="M384 128H256V0L384 128z"/>
                  <!-- Document lines -->
                  <path fill="#9333ea" d="M64 224H320V256H64zM64 288H320V320H64zM64 352H192V384H64z"/>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="View document"
                >
                  <span class="sr-only">View document</span>
                </button>
              </div>
              
              <!-- Image Icon -->
              <div v-else-if="material.fileType === 'image'" class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- Image green part -->
                  <path fill="#10b981" d="M384 128H256V0L384 128z"/>
                  <!-- Image icon -->
                  <path fill="#10b981" d="M64 192H320V384H64z"/>
                  <circle fill="#10b981" cx="112" cy="240" r="16"/>
                  <path fill="#ffffff" d="M304 368L240 280 192 336 144 304 80 368z"/>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="View image"
                >
                  <span class="sr-only">View image</span>
                </button>
              </div>
              
              <!-- Video Icon -->
              <div v-else-if="material.fileType === 'video'" class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- Video red part -->
                  <path fill="#ef4444" d="M384 128H256V0L384 128z"/>
                  <!-- Video play button -->
                  <path fill="#ef4444" d="M64 192H320V384H64z"/>
                  <path fill="#ffffff" d="M160 240V336L256 288z"/>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="View video"
                >
                  <span class="sr-only">View video</span>
                </button>
              </div>
              
              <!-- Audio Icon -->
              <div v-else-if="material.fileType === 'audio'" class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- Audio yellow part -->
                  <path fill="#eab308" d="M384 128H256V0L384 128z"/>
                  <!-- Audio icon -->
                  <path fill="#eab308" d="M192 192v160M152 352c0 22.1 17.9 40 40 40s40-17.9 40-40-17.9-40-40-40-40 17.9-40 40zM232 192c0-22.1-17.9-40-40-40s-40 17.9-40 40"/>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="Play audio"
                >
                  <span class="sr-only">Play audio</span>
                </button>
              </div>
              
              <!-- Default file icon -->
              <div v-else class="w-16 h-16 flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="w-16 h-16">
                  <!-- File background -->
                  <path fill="#ffffff" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
                  <!-- Default gray part -->
                  <path fill="#6b7280" d="M384 128H256V0L384 128z"/>
                </svg>
                <button 
                  @click="previewMaterial(material)"
                  class="absolute inset-0 w-12 h-12 mx-auto flex items-center justify-center bg-black/0 hover:bg-black/20 rounded-full transition-colors"
                  style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
                  title="View file"
                >
                  <span class="sr-only">View file</span>
                </button>
              </div>
            </div>
            
            <!-- File Name (positioned below the icon) -->
            <div class="w-full">
              <p class="text-sm font-medium truncate text-[#606c38] transition-colors duration-200 max-w-[120px] mx-auto">
                {{ material.fileName || 'Unnamed file' }}
              </p>
            </div>

            <!-- Category -->
            <div class="mt-2">
              <p class="text-xs text-gray-400 truncate max-w-[120px] mx-auto">
                {{ formatName(material.category) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- List View (Original) -->
        <div v-else class="w-full bg-white backdrop-blur-sm rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <colgroup>
                <col class="w-2/5 md:w-auto" />
                <col class="hidden sm:table-column" />
                <col class="hidden md:table-column" />
                <col class="hidden md:table-column" />
                <col class="hidden sm:table-column" />
                <col class="w-1/5 md:w-auto" />
              </colgroup>
              <thead>
                <tr class="bg-[#283618] border-b border-gray-700/50 text-left">
                  <th class="px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th class="hidden sm:table-cell px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Type</th>
                  <th class="hidden md:table-cell px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th class="hidden md:table-cell px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Size</th>
                  <th class="hidden sm:table-cell px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Added</th>
                  <th class="sm:hidden px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <!-- Folders -->
                <tr 
                  v-for="folder in paginatedFolders" 
                  :key="'folder-' + folder.id" 
                  class="bg-white hover:bg-[#f7f2df] transition-colors cursor-pointer"
                  @click="navigateToFolder(folder.id)"
                  @contextmenu.prevent="showItemContextMenu($event, folder, true)"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex items-center justify-center text-[#606c38] mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-medium text-[#606c38]">
                          {{ folder.name }}
                        </div>
                        <div class="text-sm text-gray-500 truncate max-w-xs">{{ folder.description || 'No description' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-[#c9d4a3] text-[#606c38]">
                      Folder
                    </span>
                  </td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span class="text-gray-400">-</span>
                  </td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="text-gray-400">-</span>
                  </td>
                  <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(folder.createdAt) }}
                  </td>
                  <td class="sm:hidden px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click.stop="showItemContextMenu($event, folder, true)"
                      class="p-1.5 text-gray-600 rounded-md transition-colors min-w-[32px] min-h-[32px]"
                      title="View details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                
                <!-- Materials -->
                <tr 
                  v-for="material in paginatedMaterials" 
                  :key="'material-' + material.id" 
                  class="bg-white  transition-colors cursor-pointer"
                  @click="previewMaterial(material)"
                  @contextmenu.prevent="showItemContextMenu($event, material)"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-md flex items-center justify-center mr-3"
                           :class="{
                             'text-purple-400': material.fileType === 'document',
                             'text-green-400': material.fileType === 'image',
                             'text-red-400': material.fileType === 'video',
                             'text-yellow-400': material.fileType === 'audio',
                             'text-gray-400': material.fileType === 'other'
                           }"
                      >
                        <svg v-if="material.fileType === 'document'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <svg v-else-if="material.fileType === 'image'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <svg v-else-if="material.fileType === 'video'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg v-else-if="material.fileType === 'audio'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-medium text-[#606c38]">{{ material.fileName || 'Unnamed file' }}</div>
                        <div class="text-sm text-gray-400 truncate max-w-xs">{{ material.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="{
                        'text-purple-400': material.fileType === 'document',
                        'text-green-400': material.fileType === 'image',
                        'text-red-400': material.fileType === 'video',
                        'text-yellow-400': material.fileType === 'audio',
                        'text-gray-400': material.fileType === 'other'
                      }"
                      class="px-2 py-1 text-xs rounded-full"
                    >
                      {{ formatName(material.fileType) }}
                    </span>
                  </td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-[#c9d4a3] text-[#606c38]">
                      {{ formatName(material.category) }}
                    </span>
                  </td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatFileSize(material.fileSize) }}
                  </td>
                  <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(material.createdAt) }}
                  </td>
                  <td class="sm:hidden px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click.stop="showItemContextMenu($event, material)"
                      class="p-1.5 text-gray-600 rounded-md transition-colors min-w-[32px] min-h-[32px]"
                      title="View details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination for List View - Mobile Friendly -->
          <div class="bg-[#f7f2df] px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} items
            </div>
            <div class="flex space-x-2">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                class="px-3 py-1.5 text-xs sm:text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-w-[70px] sm:min-w-[80px]"
              >
                <span class="hidden sm:inline">Previous</span>
                <span class="sm:hidden">Prev</span>
              </button>
              <div class="px-3 py-1.5 bg-[#606c38] text-white rounded-lg text-xs sm:text-sm font-medium">
                {{ currentPage }} / {{ totalPages }}
              </div>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                class="px-3 py-1.5 text-xs sm:text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-w-[70px] sm:min-w-[80px]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination for Grid View - Mobile Friendly -->
        <div v-if="effectiveViewMode === 'grid' && totalPages > 1" class="mt-4 bg-white rounded-xl shadow-lg px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} items
          </div>
          <div class="flex space-x-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              class="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-w-[70px] sm:min-w-[80px]"
            >
              <span class="hidden sm:inline">Previous</span>
              <span class="sm:hidden">Prev</span>
            </button>
            <div class="px-3 py-1.5 bg-[#606c38] text-white rounded-lg text-xs sm:text-sm font-medium">
              {{ currentPage }} / {{ totalPages }}
            </div>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
              class="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-w-[70px] sm:min-w-[80px]"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Preview Material Modal -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div 
        :class="{ 
          'bg-white rounded-xl shadow-lg flex flex-col': !isFullscreen,
          'bg-black/40 flex flex-col': isFullscreen 
        }"
        :style="{ 
          width: isFullscreen ? '100%' : '95%', 
          height: isFullscreen ? '100%' : '95vh',
          maxWidth: isFullscreen ? '100%' : '1400px'
        }"
      >
        <!-- Modal Header - Mobile Friendly with Fixed Buttons -->
        <div 
          :class="{ 
            'p-3 sm:p-4 border-b border-gray-300 flex items-center justify-between gap-2 sm:gap-4': !isFullscreen,
            'p-3 sm:p-4 bg-black/60 flex items-center justify-between gap-2 sm:gap-4 absolute top-0 left-0 right-0 z-10 transition-opacity duration-300': isFullscreen,
            'opacity-100': showControls && isFullscreen,
            'opacity-0': !showControls && isFullscreen
          }"
        >
          <!-- Title Section - Takes available space and truncates -->
          <div class="flex items-center min-w-0 flex-1 overflow-hidden">
            <h3 
              class="text-base sm:text-xl font-bold truncate text-[#606c38]" 
              v-if="previewMaterialData"
              :class="{ 'text-white': isFullscreen }"
              :title="previewMaterialData.title"
            >
              {{ previewMaterialData.title }}
            </h3>
            <div v-if="previewMaterialData" class="hidden lg:flex items-center space-x-2 ml-3 flex-shrink-0">
              <span 
                :class="{
                  'bg-purple-200 text-purple-400': previewMaterialData.fileType === 'document',
                  'bg-green-200 text-green-400': previewMaterialData.fileType === 'image',
                  'bg-red-200 text-red-400': previewMaterialData.fileType === 'video',
                  'bg-yellow-200 text-yellow-400': previewMaterialData.fileType === 'audio',
                  'bg-gray-200 text-gray-400': previewMaterialData.fileType === 'other'
                }"
                class="px-2 py-1 text-xs rounded-full whitespace-nowrap"
              >
                {{ formatName(previewMaterialData.fileType) }}
              </span>
              <span class="text-sm text-gray-500 whitespace-nowrap">{{ formatDate(previewMaterialData.updatedAt || previewMaterialData.createdAt) }}</span>
            </div>
          </div>
          
          <!-- Action Buttons - Always Visible, No Shrink -->
          <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button 
              @click="toggleFullscreen"
              class="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              :class="{ 'text-white hover:text-gray-300 hover:bg-white/10': isFullscreen }"
              title="Toggle Fullscreen"
            >
              <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
            <button 
              @click="showPreviewModal = false"
              class="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              :class="{ 'text-white hover:text-gray-300 hover:bg-white/10': isFullscreen }"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div 
          class="flex-1 overflow-auto relative"
          :class="{ 'bg-black': isFullscreen }"
          @mousemove="showControls = true"
          @mouseleave="handleMouseLeave"
        >
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
          
          <!-- Content Preview -->
          <div 
            v-if="previewMaterialData" 
            class="w-full h-full flex items-center justify-center p-4"
            :class="{ 'p-0': isFullscreen }"
          >
            <!-- Enhanced PDF Preview -->
            <div 
              v-if="previewMaterialData.fileType === 'document' && isPDF(previewMaterialData.fileUrl)"
              class="w-full h-full relative bg-gray-100 flex flex-col"
            >
              <!-- PDF Viewer Container -->
              <div class="flex-1 relative overflow-hidden pdf-iframe-container">
                <iframe 
                  :src="previewMaterialData.fileUrl"
                  class="w-full h-full border-0"
                  @load="isLoading = false"
                  @error="handleDocumentPreviewError"
                ></iframe>
                
                <!-- Mobile Touch Overlay for Better Interaction -->
                <div 
                  v-if="isMobile"
                  class="absolute inset-0 pointer-events-none"
                  @touchstart="handleTouchStart"
                  @touchmove="handleTouchMove"
                  @touchend="handleTouchEnd"
                ></div>
              </div>
              
              <!-- PDF Controls Bar (Always Visible) -->
              <div 
                class="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-600 transition-all duration-300 pdf-controls"
                :class="{ 'opacity-100': showControls, 'opacity-0': !showControls }"
              >
                <!-- Mobile Controls -->
                <div v-if="isMobile" class="flex items-center justify-between p-3">
                  <!-- Left Side Controls -->
                  <div class="flex items-center space-x-3">
                    <!-- Zoom Out -->
                    <button 
                      @click="zoomOut"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                      </svg>
                    </button>
                    
                    <!-- Zoom Level Display -->
                    <div class="text-white text-sm font-medium min-w-[3rem] text-center">
                      {{ Math.round(pdfZoom * 100) }}%
                    </div>
                    
                    <!-- Zoom In -->
                    <button 
                      @click="zoomIn"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Center Controls -->
                  <div class="flex items-center space-x-2">
                    <!-- Fit to Width -->
                    <button 
                      @click="fitToWidth"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Fit to Width"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    </button>
                    
                    <!-- Reset Zoom -->
                    <button 
                      @click="resetZoom"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Reset Zoom"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Right Side Controls -->
                  <div class="flex items-center space-x-2">
                    <!-- Rotate -->
                    <button 
                      @click="rotatePDF"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Rotate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Desktop Controls -->
                <div v-else class="flex items-center justify-between p-4">
                  <!-- Left Side Controls -->
                  <div class="flex items-center space-x-4">
                    <!-- Zoom Out -->
                    <button 
                      @click="zoomOut"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                      </svg>
                    </button>
                    
                    <!-- Zoom Slider -->
                    <div class="flex items-center space-x-3">
                      <span class="text-white text-sm">25%</span>
                      <input 
                        v-model="pdfZoom"
                        @input="updatePDFZoom"
                        type="range"
                        min="0.25"
                        max="3"
                        step="0.1"
                        class="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span class="text-white text-sm">300%</span>
                    </div>
                    
                    <!-- Zoom In -->
                    <button 
                      @click="zoomIn"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Center Controls -->
                  <div class="flex items-center space-x-3">
                    <!-- Fit to Width -->
                    <button 
                      @click="fitToWidth"
                      class="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
                      title="Fit to Width"
                    >
                      Fit Width
                    </button>
                    
                    <!-- Fit to Page -->
                    <button 
                      @click="fitToPage"
                      class="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
                      title="Fit to Page"
                    >
                      Fit Page
                    </button>
                    
                    <!-- Reset Zoom -->
                    <button 
                      @click="resetZoom"
                      class="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
                      title="Reset Zoom"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <!-- Right Side Controls -->
                  <div class="flex items-center space-x-3">
                    <!-- Rotate -->
                    <button 
                      @click="rotatePDF"
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Rotate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    
                    <!-- Download -->
                    <a 
                      :href="previewMaterialData.fileUrl" 
                      download
                      class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Touch Controls Indicator (Mobile) -->
              <div 
                v-if="isMobile && showControls"
                class="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs"
              >
                Pinch to zoom • Drag to scroll
              </div>
            </div>
            
            <!-- Text File Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'document' && isTextFile(previewMaterialData.fileName) && textContent"
              class="w-full h-full overflow-auto bg-[#151b29] p-4 rounded"
              :style="{ transform: `scale(${viewerScale})`, transformOrigin: 'center top' }"
            >
              <pre class="text-gray-400 whitespace-pre-wrap font-mono text-sm">{{ textContent }}</pre>
            </div>
            
            <!-- Office Document Preview (using Google Docs Viewer) -->
            <div 
              v-else-if="previewMaterialData.fileType === 'document' && isOfficeDocument(previewMaterialData.fileName)"
              class="w-full h-full relative"
            >
              <iframe 
                v-if="!officeDocError"
                :src="`https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterialData.fileUrl)}&embedded=true`"
                class="w-full h-full border-0 rounded"
                @load="isLoading = false"
                @error="handleOfficeDocError"
              ></iframe>
              
              <!-- Office Doc Error Fallback -->
              <div 
                v-else
                class="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50"
              >
                <div class="w-16 h-16 mb-6 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium mb-2 text-gray-800">{{ previewMaterialData.title }}</h3>
                <p class="text-gray-600 mb-6 text-center">Unable to preview this document online. You can download it to view with your preferred application.</p>
                <div class="flex space-x-4">
                  <button 
                    @click="retryOfficeDocPreview"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Preview
                  </button>
                  <a 
                    :href="previewMaterialData.fileUrl" 
                    download
                    class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Image Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'image'"
              class="relative flex items-center justify-center h-full"
              :style="{ transform: `scale(${viewerScale})`, transformOrigin: 'center center' }"
            >
              <img 
                :src="previewMaterialData.fileUrl" 
                :alt="previewMaterialData.title" 
                class="max-w-full max-h-full object-contain"
                @error="handlePreviewImageError"
                @load="isLoading = false"
              />
            </div>
            
            <!-- Video Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'video'"
              class="w-full h-full flex items-center justify-center"
            >
              <video 
                :src="previewMaterialData.fileUrl" 
                controls 
                class="max-w-full max-h-full"
                @error="handlePreviewVideoError"
                @loadeddata="isLoading = false"
              ></video>
            </div>
            
            <!-- Audio Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'audio'"
              class="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <div class="w-16 h-16 mb-6 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-4 text-white">{{ previewMaterialData.title }}</h3>
              <audio 
                :src="previewMaterialData.fileUrl" 
                controls 
                class="w-full max-w-md"
                @error="handlePreviewAudioError"
                @loadeddata="isLoading = false"
              ></audio>
            </div>
            
            <!-- Enhanced Document Preview (for other document types) -->
            <div 
              v-else-if="previewMaterialData.fileType === 'document'"
              class="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <div class="w-16 h-16 mb-6 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-2 text-white">{{ previewMaterialData.title }}</h3>
              <p class="text-gray-400 mb-6 text-center">This document format is not directly previewable, but you can try alternative viewing methods:</p>
              
              <div class="flex flex-col sm:flex-row gap-4 items-center">
                <!-- Try Google Docs Viewer -->
                <button 
                  @click="tryGoogleDocsViewer"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Try Online Viewer
                </button>
                
                <!-- Open in New Tab -->
                <a 
                  :href="previewMaterialData.fileUrl" 
                  target="_blank"
                  class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                
                <!-- Download -->
                <a 
                  :href="previewMaterialData.fileUrl" 
                  download
                  class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
            
            <!-- Other File Types (Non-documents) -->
            <div 
              v-else
              class="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <div class="w-16 h-16 mb-6 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-2 text-white">{{ previewMaterialData.title }}</h3>
              <p class="text-gray-400 mb-6">This file type cannot be previewed</p>
              <a 
                :href="previewMaterialData.fileUrl" 
                download
                class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer with File Details - Mobile Friendly -->
        <div 
          :class="{ 
            'p-3 sm:p-4 border-t border-gray-300 flex flex-col gap-3': !isFullscreen,
            'p-3 sm:p-4 bg-black/60 flex flex-col gap-3 absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300': isFullscreen,
            'opacity-100': showControls && isFullscreen,
            'opacity-0': !showControls && isFullscreen
          }"
        >
          <!-- File Details Grid - Mobile Responsive -->
          <div v-if="previewMaterialData" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <div class="font-semibold text-xs text-gray-600 uppercase" :class="{ 'text-gray-400': isFullscreen }">File Name</div>
              <div class="text-xs sm:text-sm text-gray-700 truncate" :class="{ 'text-white': isFullscreen }" :title="previewMaterialData.fileName">
                {{ previewMaterialData.fileName }}
              </div>
            </div>
            <div>
              <div class="font-semibold text-xs text-gray-600 uppercase" :class="{ 'text-gray-400': isFullscreen }">Size</div>
              <div class="text-xs sm:text-sm text-gray-700" :class="{ 'text-white': isFullscreen }">
                {{ formatFileSize(previewMaterialData.fileSize) }}
              </div>
            </div>
            <div>
              <div class="font-semibold text-xs text-gray-600 uppercase" :class="{ 'text-gray-400': isFullscreen }">Category</div>
              <div class="text-xs sm:text-sm text-gray-700" :class="{ 'text-white': isFullscreen }">
                {{ formatName(previewMaterialData.category) }}
              </div>
            </div>
            <div>
              <div class="font-semibold text-xs text-gray-600 uppercase" :class="{ 'text-gray-400': isFullscreen }">Shared By</div>
              <div class="text-xs sm:text-sm text-gray-700 truncate" :class="{ 'text-white': isFullscreen }" :title="previewMaterialData.uploadedBy || 'Unknown'">
                {{ previewMaterialData.uploadedBy || 'Unknown' }}
              </div>
            </div>
            <div>
              <div class="font-semibold text-xs text-gray-600 uppercase" :class="{ 'text-gray-400': isFullscreen }">Date Added</div>
              <div class="text-xs sm:text-sm text-gray-700" :class="{ 'text-white': isFullscreen }">
                {{ formatDate(previewMaterialData.createdAt) }}
              </div>
            </div>
          </div>
          
          <!-- Download Button -->
          <div class="flex justify-center sm:justify-end">
            <a 
              v-if="previewMaterialData"
              :href="previewMaterialData.fileUrl" 
              download
              class="w-full sm:w-auto px-4 py-2 bg-[#606c38] hover:bg-[#4a5a2a] text-white rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="showTooltip"
      class="fixed z-50 bg-transparent rounded-lg p-4 text-sm text-gray-400"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: 'translate(-50%, 0)'
      }"
    >
      <h3 class="font-medium text-[#606c38]">{{ tooltipData.name || tooltipData.title }}</h3>
      <p v-if="tooltipData.description" class="mt-1">{{ tooltipData.description }}</p>
      
      <!-- Enhanced details similar to list view -->
      <div class="mt-2 grid grid-cols-1 gap-y-1">
        <div class="flex items-center">
          <span class="text-gray-500 mr-2">Type:</span>
          <span v-if="tooltipData.isFolder" class="px-2 py-0.5 text-xs rounded-full bg-[#c9d4a3] text-[#606c38] ">Folder</span>
          <span v-else class="px-2 py-0.5 text-xs rounded-full" 
            :class="{
              'bg-purple-200 text-purple-400': tooltipData.fileType === 'document' && !isPDF(tooltipData.fileUrl),
              'bg-red-200 text-red-400': tooltipData.fileType === 'document' && isPDF(tooltipData.fileUrl),
              'bg-green-200 text-green-400': tooltipData.fileType === 'image',
              'bg-red-200 text-red-400': tooltipData.fileType === 'video',
              'bg-yellow-200 text-yellow-400': tooltipData.fileType === 'audio',
              'bg-gray-200 text-gray-400': tooltipData.fileType === 'other'
            }">
            {{ formatName(tooltipData.fileType) }}
          </span>
        </div>
        
        <div v-if="!tooltipData.isFolder && tooltipData.category" class="flex items-center">
          <span class="text-gray-500 mr-2">Category:</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-[#c9d4a3] text-[#606c38]">{{ formatName(tooltipData.category) }}</span>
        </div>
        
        <div v-if="!tooltipData.isFolder && tooltipData.fileSize" class="flex items-center">
          <span class="text-gray-500 mr-2">Size:</span>
          <span>{{ formatFileSize(tooltipData.fileSize) }}</span>
        </div>
        
        <div v-if="!tooltipData.isFolder && tooltipData.uploadedBy" class="flex items-center">
          <span class="text-gray-500 mr-2">Shared by:</span>
          <span>{{ tooltipData.uploadedBy }}</span>
        </div>
        
        <div class="flex items-center">
          <span class="text-gray-500 mr-2">Added:</span>
          <span>{{ formatDate(tooltipData.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Simple Context Menu -->
    <div 
      v-if="showContextMenu && contextMenuData" 
      id="context-menu"
      class="fixed z-50 bg-white rounded-xl shadow-lg overflow-hidden"
      :style="{ 
        left: getContextMenuPosition().x + 'px',
        top: getContextMenuPosition().y + 'px'
      }"
    >
      <div class="p-3 border-b border-gray-400 bg-white">
        <h3 class="text-sm font-medium truncate">{{ contextMenuData.isFolder ? contextMenuData.name : contextMenuData.title }}</h3>
      </div>
      
      <div class="p-2">
        <button 
          @click="showDetailsModal = true; hideContextMenu();"
          class="w-full text-left px-3 py-2  rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Details
        </button>
        
        <a 
          v-if="!contextMenuData.isFolder"
          :href="contextMenuData.fileUrl" 
          download
          @click="hideContextMenu"
          class="w-full text-left px-3 py-2 text-700   rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      </div>
    </div>

    <!-- Details Modal - Mobile Friendly -->
    <div 
      v-if="showDetailsModal && contextMenuData" 
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      @click.self="showDetailsModal = false"
    >
      <div class="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col">
        <div class="p-3 sm:p-4 bg-[#606c38] flex justify-between items-center gap-2">
          <h3 class="text-white text-sm sm:text-base font-semibold truncate flex-1 min-w-0" :title="contextMenuData.isFolder ? contextMenuData.name : contextMenuData.title">
            {{ contextMenuData.isFolder ? contextMenuData.name : contextMenuData.title }}
          </h3>
          <button 
            @click="showDetailsModal = false"
            class="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-3 sm:p-4 overflow-y-auto flex-1">
          <div class="space-y-3 sm:space-y-4">
            <!-- Description -->
            <div v-if="contextMenuData.description">
              <h4 class="text-xs font-medium uppercase text-gray-600 mb-1">Description</h4>
              <p class="text-xs sm:text-sm text-gray-700">{{ contextMenuData.description }}</p>
            </div>
            
            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4">
              <template v-if="!contextMenuData.isFolder">
                <div>
                  <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Type</h4>
                  <p class="text-sm text-gray-500">{{ formatName(contextMenuData.fileType) }}</p>
                </div>
                
                <div>
                  <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Size</h4>
                  <p class="text-sm text-gray-500">{{ formatFileSize(contextMenuData.fileSize) }}</p>
                </div>
                
                <div>
                  <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Category</h4>
                  <p class="text-sm text-gray-500">{{ formatName(contextMenuData.category) }}</p>
                </div>
                
                <div>
                  <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Shared By</h4>
                  <p class="text-sm text-gray-500">{{ contextMenuData.uploadedBy || 'Unknown' }}</p>
                </div>
              </template>
              
              <div>
                <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Created</h4>
                <p class="text-sm text-gray-500">{{ formatDate(contextMenuData.createdAt) }}</p>
              </div>
              
              <div v-if="contextMenuData.updatedAt">
                <h4 class="text-xs font-medium uppercase text-gray-700 mb-1">Updated</h4>
                <p class="text-sm text-gray-500">{{ formatDate(contextMenuData.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-3 sm:p-4 border-t border-gray-300 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0">
          <button 
            @click="showDetailsModal = false"
            class="w-full sm:w-auto px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <a 
            v-if="!contextMenuData.isFolder"
            :href="contextMenuData.fileUrl" 
            download
            class="w-full sm:w-auto px-4 py-2 bg-[#606c38] hover:bg-[#4a5a2a] text-sm text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
    
    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation 
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { 
collection, 
query, 
where, 
getDocs, 
onSnapshot,
orderBy
} from 'firebase/firestore';
import UserNavbar from '../../components/user/UserNavbar.vue';
import UserSidebar from '../../components/user/UserSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import NotificationToast from '../../components/professional/NotificationToast.vue';

// Router
const router = useRouter();

// Current user state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const profileImage = ref(null);
const notificationCount = ref(0);
const showSignOutConfirmation = ref(false);
const error = ref(null);

// New state variables
const showTooltip = ref(false);
const tooltipData = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });
const longPressTimer = ref(null);
const showContextMenu = ref(false);
const contextMenuData = ref(null);
const contextMenuPosition = ref({ x: 0, y: 0 });
const showDetailsModal = ref(false); // New state for details modal

// View mode state
const viewMode = ref('grid'); // 'list' or 'grid'
const isMobile = ref(false);
const sortBy = ref('createdAt'); // Default sort by newest

// Folder navigation state
const currentFolderId = ref('root'); // 'root' is the top level
const currentFolderPath = ref([]); // Array of folder objects in the path
const folders = ref([]); // Folders in the current directory

// Learning materials state
const materials = ref([]);
const searchQuery = ref('');
const categoryFilter = ref('');
const fileTypeFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 12;
const showPreviewModal = ref(false);
const previewMaterialData = ref(null);
const isLoading = ref(false);

// File viewer state
const isFullscreen = ref(false);
const textContent = ref(null);
const viewerScale = ref(1);
const showControls = ref(true);
const officeDocError = ref(false);

// PDF viewer state
const pdfZoom = ref(1);
const pdfRotation = ref(0);
const touchStartDistance = ref(0);
const touchStartZoom = ref(1);
const isTouchInteracting = ref(false);

// Categories state - will be dynamically populated from materials
const categories = ref([]);

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success',
  timeout: null
});

// New methods
const showItemTooltip = (event, item, isFolder = false) => {
  // Don't show tooltip on mobile devices
  if (window.innerWidth <= 768) return;
  
  tooltipData.value = {
    ...item,
    isFolder
  };
  
  // Get the element's position for consistent tooltip placement
  const rect = event.currentTarget.getBoundingClientRect();
  
  // Position the tooltip centered below the item
  tooltipPosition.value = {
    x: rect.left + (rect.width / 2),
    y: rect.bottom + 10
  };
  
  showTooltip.value = true;
};

const hideItemTooltip = () => {
  showTooltip.value = false;
  tooltipData.value = null;
};

const startLongPress = (event, item, isFolder = false) => {
  // Only for mobile devices
  if (window.innerWidth > 768) return;
  
  event.preventDefault();
  
  longPressTimer.value = setTimeout(() => {
    showItemContextMenu(event, item, isFolder);
  }, 500); // 500ms long press
};

const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

const showItemContextMenu = (event, item, isFolder = false) => {
  event.preventDefault();
  
  contextMenuData.value = {
    ...item,
    isFolder
  };
  
  // Position the context menu
  if (event.type === 'contextmenu') {
    // For right-click
    contextMenuPosition.value = {
      x: event.clientX,
      y: event.clientY
    };
  } else {
    // For button click or long press, position it centered
    const rect = event.currentTarget.getBoundingClientRect();
    contextMenuPosition.value = {
      x: rect.left + rect.width / 2,
      y: Math.min(rect.top + rect.height / 2, window.innerHeight - 300) // Keep it visible
    };
  }
  
  showContextMenu.value = true;
};

const hideContextMenu = () => {
  showContextMenu.value = false;
  // Don't clear contextMenuData here as we might need it for the details modal
};

// Computed properties for current user
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${formatName(firstName.value)} ${formatName(lastName.value)}`;
  }
  return formatName(firstName.value) || 'User';
});

const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'U';
});

// Computed property for effective view mode (force list on mobile)
const effectiveViewMode = computed(() => {
  return isMobile.value ? 'list' : viewMode.value;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         categoryFilter.value !== '' || 
         fileTypeFilter.value !== '';
});

// Show notification
const showNotification = (message, type = 'success', duration = 5000) => {
  // Clear any existing timeout
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }

  // Set notification
  notification.value = {
    show: true,
    message,
    type,
    timeout: setTimeout(() => {
      hideNotification();
    }, duration)
  };
};

// Hide notification
const hideNotification = () => {
  notification.value.show = false;
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
    notification.value.timeout = null;
  }
};

// Computed properties for filtered and sorted items
const filteredFolders = computed(() => {
  if (!searchQuery.value) {
    return folders.value.filter(folder => folder.parentId === currentFolderId.value);
  }

  const search = searchQuery.value.toLowerCase();
  return folders.value.filter(folder => 
    folder.parentId === currentFolderId.value && 
    (folder.name.toLowerCase().includes(search) || 
    (folder.description && folder.description.toLowerCase().includes(search)))
  );
});

const filteredMaterials = computed(() => {
  // First filter by current folder and public materials only
  let result = materials.value.filter(material => 
    material.folderId === currentFolderId.value && material.isPublic === true
  );

  // Then apply search and filters
  if (searchQuery.value || categoryFilter.value || fileTypeFilter.value) {
    const search = searchQuery.value.toLowerCase().trim();
    
    result = result.filter(material => {
      // Enhanced search query filter with file type detection
      let searchMatches = !search;
      
      if (search) {
        // Map common search terms to file types
        const fileTypeKeywords = {
          'document': ['document'],
          'documents': ['document'],
          'pdf': ['document'],
          'doc': ['document'],
          'docx': ['document'],
          'text': ['document'],
          'image': ['image'],
          'images': ['image'],
          'picture': ['image'],
          'pictures': ['image'],
          'photo': ['image'],
          'photos': ['image'],
          'img': ['image'],
          'video': ['video'],
          'videos': ['video'],
          'movie': ['video'],
          'movies': ['video'],
          'audio': ['audio'],
          'sound': ['audio'],
          'music': ['audio'],
          'song': ['audio'],
          'other': ['other'],
          'others': ['other'],
          'file': ['other']
        };
        
        // Check if search term matches a file type keyword
        if (fileTypeKeywords[search]) {
          // Search is for a file type
          searchMatches = fileTypeKeywords[search].includes(material.fileType);
        } 
        // Check for specific PDF search by file extension
        else if (search === 'pdf') {
          searchMatches = material.fileName && material.fileName.toLowerCase().endsWith('.pdf');
        }
        // Otherwise, search in title, description, category, and filename
        else {
          searchMatches = 
            (material.title && material.title.toLowerCase().includes(search)) ||
            (material.description && material.description.toLowerCase().includes(search)) ||
            (material.category && material.category.toLowerCase().includes(search)) ||
            (material.fileName && material.fileName.toLowerCase().includes(search));
        }
      }
      
      // Category filter
      const categoryMatches = !categoryFilter.value || material.category === categoryFilter.value;
      
      // File type filter
      const fileTypeMatches = !fileTypeFilter.value || material.fileType === fileTypeFilter.value;
      
      return searchMatches && categoryMatches && fileTypeMatches;
    });
  }

  // Apply sorting
  return sortItems(result);
});

// Sort items based on the selected sort option
const sortItems = (items) => {
  switch (sortBy.value) {
    case 'createdAt':
      return [...items].sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA; // Newest first
      });
    case 'createdAtAsc':
      return [...items].sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateA - dateB; // Oldest first
      });
    case 'title':
      return [...items].sort((a, b) => a.title.localeCompare(b.title)); // A-Z
    case 'titleDesc':
      return [...items].sort((a, b) => b.title.localeCompare(a.title)); // Z-A
    default:
      return items;
  }
};

// Computed properties for pagination
const totalItems = computed(() => filteredFolders.value.length + filteredMaterials.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedFolders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  if (filteredFolders.value.length >= end) {
    return filteredFolders.value.slice(start, end);
  }

  if (start < filteredFolders.value.length) {
    return filteredFolders.value.slice(start);
  }

  return [];
});

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const foldersOnPage = paginatedFolders.value.length;

  if (foldersOnPage >= itemsPerPage) {
    return [];
  }

  const materialsStart = Math.max(0, start - filteredFolders.value.length);
  const materialsCount = itemsPerPage - foldersOnPage;

  return filteredMaterials.value.slice(materialsStart, materialsStart + materialsCount);
});

const paginationStart = computed(() => {
  return totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalItems.value);
});

// File type detection methods
const isPDF = (url) => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
};

const isTextFile = (fileName) => {
  if (!fileName) return false;
  const textExtensions = ['.txt', '.csv', '.json', '.xml', '.md', '.html', '.css', '.js', '.ts'];
  return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isOfficeDocument = (fileName) => {
  if (!fileName) return false;
  const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp'];
  return officeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Enhanced document type detection
const isViewableDocument = (fileName) => {
  if (!fileName) return false;
  const viewableExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
    '.odt', '.ods', '.odp', '.txt', '.csv', '.json', '.xml', 
    '.md', '.html', '.css', '.js', '.ts', '.rtf'
  ];
  return viewableExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Methods
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

const fetchCurrentUser = async () => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
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
    profileImage.value = userData.profileImage || null;
    
    // Set notification count (you can calculate this based on actual notifications)
    notificationCount.value = 0; // This can be updated with actual notification logic
  } catch (err) {
    console.error("Error fetching current user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  }
};

// Firestore unsubscribe functions
let unsubscribeFolders = null;
let unsubscribeMaterials = null;

// Set up real-time listeners for folders and materials
const setupRealtimeListeners = () => {
  // Set up listener for folders
  const foldersRef = collection(db, "learningMaterials");
  const foldersQuery = query(foldersRef, where("type", "==", "folder"));

  unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
    const fetchedFolders = [];
    snapshot.forEach((doc) => {
      fetchedFolders.push({
        id: doc.id,
        ...doc.data(),
        // Add default values for any missing fields
        name: doc.data().name || 'Untitled Folder',
        description: doc.data().description || '',
        parentId: doc.data().parentId || 'root',
        createdAt: doc.data().createdAt || null,
        updatedAt: doc.data().updatedAt || null,
        createdBy: doc.data().createdBy || 'Unknown'
      });
    });
    
    folders.value = fetchedFolders;
    console.log(`Real-time update: ${fetchedFolders.length} folders`);
    
    // Update folder path
    updateFolderPath();
  }, (error) => {
    console.error("Error in folders listener:", error);
    showNotification('Error loading folders: ' + error.message, 'error');
  });

  // Set up listener for materials - only get public materials
  // Modified query to avoid the composite index error
  try {
    const materialsRef = collection(db, "learningMaterials");
    
    // First, get all non-folder items
    const materialsQuery = query(
      materialsRef, 
      where("type", "!=", "folder")
    );

    unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
      const fetchedMaterials = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Skip folders and non-public materials (client-side filtering)
        if (data.type === "folder" || data.isPublic !== true) return;
        
        fetchedMaterials.push({
          id: doc.id,
          ...data,
          // Add default values for any missing fields
          title: data.title || 'Untitled',
          description: data.description || '',
          category: data.category || 'other',
          fileType: data.fileType || 'other',
          fileSize: data.fileSize || 0,
          fileName: data.fileName || '',
          fileUrl: data.fileUrl || '',
          folderId: data.folderId || 'root', // Default to root folder
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          uploadedBy: data.uploadedBy || 'Unknown'
        });
      });
      
      materials.value = fetchedMaterials;
      console.log(`Real-time update: ${fetchedMaterials.length} learning materials`);
      
      // Extract unique categories from materials
      const uniqueCategories = [...new Set(fetchedMaterials.map(material => material.category))];
      
      // Reset categories and populate with unique categories from materials
      categories.value = uniqueCategories.filter(category => category !== 'other');
    }, (error) => {
      console.error("Error in materials listener:", error);
      showNotification('Error loading materials: ' + error.message, 'error');
      showNotification('Please create the required index in Firebase console using the link in the console error', 'warning', 10000);
    });
  } catch (err) {
    console.error("Error setting up materials listener:", err);
    showNotification('Error setting up materials listener: ' + err.message, 'error');
  }
};

const updateFolderPath = async () => {
  if (currentFolderId.value === 'root') {
    currentFolderPath.value = [];
    return;
  }

  const path = [];
  let currentId = currentFolderId.value;

  // Build the path from current folder up to root
  while (currentId && currentId !== 'root') {
    const folder = folders.value.find(f => f.id === currentId);
    if (!folder) break;
    
    path.unshift(folder);
    currentId = folder.parentId;
  }

  currentFolderPath.value = path;
};

const navigateToFolder = (folderId) => {
  currentFolderId.value = folderId;
  currentPage.value = 1; // Reset pagination when changing folders
  updateFolderPath();
};

const goBack = () => {
  if (currentFolderPath.value.length > 0) {
    // Go to parent folder
    const parentFolder = currentFolderPath.value[currentFolderPath.value.length - 1];
    const parentId = parentFolder.parentId || 'root';
    navigateToFolder(parentId);
  } else if (currentFolderId.value !== 'root') {
    // If we're in a folder but no path, go to root
    navigateToRoot();
  }
};

const navigateToRoot = () => {
  navigateToFolder('root');
};

const getCurrentFolderName = () => {
  if (currentFolderId.value === 'root') {
    return 'Learning Center';
  }
  
  const currentFolder = folders.value.find(f => f.id === currentFolderId.value);
  return currentFolder ? currentFolder.name : 'Unknown Folder';
};

// Mobile detection and screen size handling
const checkMobileScreen = () => {
  isMobile.value = window.innerWidth <= 768;
};

const handleResize = () => {
  checkMobileScreen();
};

const clearFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = '';
  fileTypeFilter.value = '';
  currentPage.value = 1;
};

// Handle sign out
const handleSignOut = async () => {
  try {
    showSignOutConfirmation.value = false;
    await signOut(auth);
    window.location.href = '/signin';
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = "Failed to sign out. Please try again.";
  }
};

// Helper functions for no results messages
const getNoResultsTitle = () => {
  if (searchQuery.value) {
    // Check if search is for a file type
    const search = searchQuery.value.toLowerCase().trim();
    const fileTypeKeywords = ['document', 'documents', 'pdf', 'image', 'images', 'picture', 'pictures', 'photo', 'photos', 'video', 'videos', 'audio', 'music', 'sound', 'other', 'others'];
    
    if (fileTypeKeywords.includes(search)) {
      return `No ${formatName(search)} Found`;
    }
    return 'No Results Found';
  }
  
  if (categoryFilter.value || fileTypeFilter.value) {
    return 'No Matching Materials';
  }
  
  return 'No Materials Available';
};

const getNoResultsMessage = () => {
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase().trim();
    const fileTypeMap = {
      'document': 'documents',
      'documents': 'documents',
      'pdf': 'PDF documents',
      'image': 'images',
      'images': 'images',
      'picture': 'images',
      'pictures': 'images',
      'photo': 'images',
      'photos': 'images',
      'video': 'videos',
      'videos': 'videos',
      'audio': 'audio files',
      'music': 'audio files',
      'sound': 'audio files',
      'other': 'other files',
      'others': 'other files'
    };
    
    if (fileTypeMap[search]) {
      return `We couldn't find any ${fileTypeMap[search]} matching your search. Try browsing other categories or check back later.`;
    }
    
    return `No materials found for "${searchQuery.value}". Try using different keywords or clear filters to see all materials.`;
  }
  
  if (categoryFilter.value && fileTypeFilter.value) {
    return `No ${formatName(fileTypeFilter.value)} files found in the ${formatName(categoryFilter.value)} category. Try adjusting your filters.`;
  }
  
  if (categoryFilter.value) {
    return `No materials found in the ${formatName(categoryFilter.value)} category. Try selecting a different category.`;
  }
  
  if (fileTypeFilter.value) {
    return `No ${formatName(fileTypeFilter.value)} files available in this folder. Try selecting a different file type.`;
  }
  
  return 'This folder is currently empty. Check back later for new learning materials.';
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Preview material
const previewMaterial = async (material) => {
  previewMaterialData.value = material;
  textContent.value = null; // Reset text content
  isLoading.value = true;
  viewerScale.value = 1; // Reset zoom level
  officeDocError.value = false; // Reset office doc error state
  
  // Reset PDF viewer state
  pdfZoom.value = 1;
  pdfRotation.value = 0;
  isTouchInteracting.value = false;

  try {
    // If it's a text file, fetch the content
    if (material.fileType === 'document' && isTextFile(material.fileName)) {
      try {
        const response = await fetch(material.fileUrl);
        if (response.ok) {
          textContent.value = await response.text();
        } else {
          showNotification('Failed to load text content', 'error');
        }
      } catch (error) {
        console.error('Error loading text content:', error);
        showNotification('Error loading text content', 'error');
      }
    }
    
    showPreviewModal.value = true;
    
    // Allow time for the modal to render before hiding loading state
    await nextTick();
    
    // For PDFs and Office documents, we'll let the iframe load event handle the loading state
    // For other types, we'll hide the loading state after a short delay
    if (!(material.fileType === 'document' && (isPDF(material.fileUrl) || isOfficeDocument(material.fileName)))) {
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    }
  } catch (err) {
    console.error("Error previewing material:", err);
    showNotification('Error previewing material: ' + err.message, 'error');
    isLoading.value = false;
  }
};

// Viewer controls
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;

  // When entering fullscreen, show controls briefly
  if (isFullscreen.value) {
    showControls.value = true;
    setTimeout(() => {
      showControls.value = false;
    }, 3000);
  }
};

const zoomIn = () => {
  if (previewMaterialData.value && isPDF(previewMaterialData.value.fileUrl)) {
    pdfZoom.value = Math.min(pdfZoom.value + 0.1, 3);
    updatePDFZoom();
  } else {
    viewerScale.value = Math.min(viewerScale.value + 0.1, 2);
  }
};

const zoomOut = () => {
  if (previewMaterialData.value && isPDF(previewMaterialData.value.fileUrl)) {
    pdfZoom.value = Math.max(pdfZoom.value - 0.1, 0.25);
    updatePDFZoom();
  } else {
    viewerScale.value = Math.max(viewerScale.value - 0.1, 0.5);
  }
};

const resetZoom = () => {
  if (previewMaterialData.value && isPDF(previewMaterialData.value.fileUrl)) {
    pdfZoom.value = 1;
    updatePDFZoom();
  } else {
    viewerScale.value = 1;
  }
};

// Handle mouse leave for controls
const handleMouseLeave = () => {
  if (!isFullscreen.value) {
    window.setTimeout(() => {
      showControls.value = false;
    }, 2000);
  }
};

// Error handling for media
const handleImageError = (event) => {
  event.target.src = '/placeholder.svg?height=200&width=300';
};

const handlePreviewImageError = (event) => {
  event.target.src = '/placeholder.svg?height=400&width=600';
};

const handlePreviewVideoError = (event) => {
  console.error('Video preview error:', event);
  showNotification('Error loading video content', 'error');
};

const handlePreviewAudioError = (event) => {
  console.error('Audio preview error:', event);
  showNotification('Error loading audio content', 'error');
};

// Document preview error handling
const handleDocumentPreviewError = (event) => {
  console.error('Document preview error:', event);
  showNotification('Error loading document preview', 'error');
};

const handleOfficeDocError = (event) => {
  console.error('Office document preview error:', event);
  officeDocError.value = true;
  isLoading.value = false;
  showNotification('Unable to preview document online', 'warning');
};

const retryOfficeDocPreview = () => {
  officeDocError.value = false;
  isLoading.value = true;
  // The iframe will reload automatically when officeDocError becomes false
};

const tryGoogleDocsViewer = () => {
  if (previewMaterialData.value && previewMaterialData.value.fileUrl) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterialData.value.fileUrl)}&embedded=true`;
    window.open(viewerUrl, '_blank');
  }
};

// Enhanced PDF viewer methods
const updatePDFZoom = () => {
  // Update iframe zoom if possible (limited by browser security)
  const iframe = document.querySelector('iframe[src*=".pdf"]');
  if (iframe) {
    // Most browsers don't allow direct zoom control of PDF iframes
    // The zoom controls are primarily for UI feedback
    showNotification(`Zoom set to ${Math.round(pdfZoom.value * 100)}%`, 'info', 2000);
  }
};

const fitToWidth = () => {
  pdfZoom.value = 1;
  showNotification('Fitted to width', 'info', 2000);
};

const fitToPage = () => {
  pdfZoom.value = 1;
  showNotification('Fitted to page', 'info', 2000);
};

const rotatePDF = () => {
  pdfRotation.value = (pdfRotation.value + 90) % 360;
  showNotification(`Rotated to ${pdfRotation.value}°`, 'info', 2000);
};

// Touch handling for mobile PDF interaction
const handleTouchStart = (event) => {
  if (event.touches.length === 2) {
    // Two-finger touch for pinch zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    touchStartDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    touchStartZoom.value = pdfZoom.value;
    isTouchInteracting.value = true;
    event.preventDefault();
  }
};

const handleTouchMove = (event) => {
  if (event.touches.length === 2 && isTouchInteracting.value) {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const zoomFactor = currentDistance / touchStartDistance.value;
    const newZoom = Math.max(0.25, Math.min(3, touchStartZoom.value * zoomFactor));
    pdfZoom.value = newZoom;
    
    event.preventDefault();
  }
};

const handleTouchEnd = (event) => {
  if (isTouchInteracting.value) {
    isTouchInteracting.value = false;
    showNotification(`Zoom: ${Math.round(pdfZoom.value * 100)}%`, 'info', 1500);
  }
};

// Add a click handler to close context menu when clicking outside
const handleDocumentClick = (event) => {
  if (showContextMenu.value) {
    const contextMenuElement = document.getElementById('context-menu');
    if (contextMenuElement && !contextMenuElement.contains(event.target)) {
      hideContextMenu();
    }
  }
};

// Add this to the script setup section
const getContextMenuPosition = () => {
  if (!contextMenuPosition.value) return { x: 0, y: 0 };
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Start with the current position
  let x = contextMenuPosition.value.x;
  let y = contextMenuPosition.value.y;
  
  // Estimate menu dimensions (actual dimensions might not be available yet)
  const estimatedWidth = Math.min(viewportWidth * 0.9, 400); // 90% of viewport or 400px, whichever is smaller
  const estimatedHeight = 300; // rough estimate
  
  // Adjust position to keep menu within viewport
  if (x + estimatedWidth / 2 > viewportWidth - 20) {
    x = viewportWidth - estimatedWidth / 2 - 20;
  }
  if (x - estimatedWidth / 2 < 20) {
    x = estimatedWidth / 2 + 20;
  }
  
  if (y + estimatedHeight > viewportHeight - 20) {
    y = viewportHeight - estimatedHeight - 20;
  }
  
  // Set position style - centered horizontally, above the click if there's room
  return {
    x: x,
    y: y
  };
};

// Clean up listeners when component is unmounted
onUnmounted(() => {
  if (unsubscribeFolders) {
    unsubscribeFolders();
  }
  if (unsubscribeMaterials) {
    unsubscribeMaterials();
  }
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
});

// Keyboard navigation support
const handleKeydown = (event) => {
  // Alt + Left Arrow for back navigation
  if (event.altKey && event.key === 'ArrowLeft' && currentFolderId.value !== 'root') {
    event.preventDefault();
    goBack();
  }
  // Escape key to close modals
  if (event.key === 'Escape') {
    if (showPreviewModal.value) {
      showPreviewModal.value = false;
    }
    if (showContextMenu.value) {
      hideContextMenu();
    }
    if (showDetailsModal.value) {
      showDetailsModal.value = false;
    }
  }
};

// onMounted hook
onMounted(() => {
  fetchCurrentUser();
  setupRealtimeListeners();
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
  
  // Initialize mobile detection
  checkMobileScreen();
});
</script>

<style scoped>
/* Smooth horizontal scroll for filter controls */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(96, 108, 56, 0.3) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
  margin: 0 8px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(96, 108, 56, 0.3);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 108, 56, 0.5);
}

/* PDF Viewer Slider Styles */
.slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.slider::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.3);
  height: 4px;
  border-radius: 2px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: white;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-track {
  background: rgba(255, 255, 255, 0.3);
  height: 4px;
  border-radius: 2px;
  border: none;
}

.slider::-moz-range-thumb {
  background: white;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* PDF Viewer Controls Animation */
.pdf-controls {
  transition: all 0.3s ease-in-out;
}

/* Touch interaction improvements */
@media (max-width: 768px) {
  .pdf-controls button {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Ensure PDF iframe takes full space */
.pdf-iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pdf-iframe-container iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
