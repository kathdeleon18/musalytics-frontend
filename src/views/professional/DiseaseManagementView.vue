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

    <!-- Success/Error Notification -->
    <NotificationToast
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />

    <div class="pt-8 md:pl-64 flex">
      <!-- Professional Sidebar Component -->
      <ProfessionalSidebar :active-page="'disease-management'" />
      
      <!-- Main Content Area - Reduced left margin to match the design -->
      <div class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Disease Management</h1>
          <p class="text-sm sm:text-base text-gray-400">Create and manage information about pests and diseases for farmers</p>
        </div>
        
        <!-- Permission Error State -->
        <div v-if="error && error.includes('permission')" class="h-[calc(100vh-200px)] flex items-center justify-center">
          <div class="flex flex-col items-center text-center max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-xl font-medium mb-2">Permission Error</h2>
            <p class="text-gray-400 mb-4">{{ error }}</p>
            <p class="text-gray-400 mb-6">Please contact your administrator to grant you the necessary permissions.</p>
            <button 
              @click="fetchDiseases" 
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        
        <!-- Main Content Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Left Sidebar - Disease List -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="p-4 bg-[#606c38] flex justify-between items-center">
                <h2 class="text-xl font-medium text-white">Disease Library</h2>
                <button 
                  @click="createNewDisease" 
                  class="p-2 transition-colors"
                  title="Create New Disease Entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white hover:text-[#c9d4a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              <!-- Search Box -->
              <div class="p-3">
                <div class="relative">
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Search diseases..."
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <!-- Category Filter -->
              <div class="p-3">
                <label class="block text-sm font-medium text-gray-400 mb-2">Filter by Category</label>
                <select 
                  v-model="categoryFilter"
                  class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="fungal">Fungal Diseases</option>
                  <option value="bacterial">Bacterial Diseases</option>
                  <option value="viral">Viral Diseases</option>
                  <option value="pest">Pests</option>
                  <option value="nutritional">Nutritional Disorders</option>
                  <option value="environmental">Environmental Stress</option>
                </select>
              </div>
              
              <!-- Disease List -->
              <div class="overflow-y-auto max-h-[calc(100vh-400px)]">
                <div v-if="filteredDiseases.length === 0" class="p-4 text-center text-gray-400">
                  <p v-if="searchQuery || categoryFilter">No diseases match your filters</p>
                  <p v-else>No diseases added yet</p>
                  <button 
                    @click="createNewDisease" 
                    class="mt-2 px-4 py-2 bg-[#c9d4a3] rounded-xl text-[#606c38] transition-colors"
                  >
                    Create Your First Entry
                  </button>
                </div>
                
                <div 
                  v-for="disease in filteredDiseases" 
                  :key="disease.id"
                  @click="selectDisease(disease)"
                  :class="[
                    'p-3  hover:bg-[#f7f2df] cursor-pointer transition-colors',
                    selectedDisease && selectedDisease.id === disease.id ? 'bg-white border-l-4 border-l-[#606c38]' : ''
                  ]"
                >
                  <div class="flex items-center">
                    <div class="h-2.5 w-2.5 rounded-full mr-2" :class="getStatusColor(disease.status)"></div>
                    <h3 class="font-medium">{{ disease.name }}</h3>
                  </div>
                  <div class="mt-1 flex justify-between text-sm">
                    <span class="text-gray-400">{{ disease.category }}</span>
                    <span class="text-gray-500">{{ formatDate(disease.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Content Area - Disease View/Editor -->
          <div class="lg:col-span-3">
            <!-- No Disease Selected State -->
            <div v-if="!selectedDisease && !isCreatingNew" class="bg-white p-6 h-[calc(95vh-200px)] rounded-xl flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 class="text-xl font-medium mb-2">No Disease Selected</h2>
              <p class="text-gray-400 text-center max-w-md mb-4">Select a disease from the list or create a new entry to start managing disease information.</p>
              <button 
                @click="createNewDisease" 
                class="px-5 py-2.5 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Disease Entry
              </button>
            </div>
            <!-- Disease Editor (Create New or Edit Mode) -->
            <div v-else-if="isCreatingNew || (selectedDisease && isEditMode)" class="bg-white rounded-xl shadow-lg overflow-hidden">
              <!-- Editor Header -->
              <div class="p-4 bg-[#606c38] flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">{{ isCreatingNew ? 'Create New Disease Entry' : 'Edit Disease Entry' }}</h2>
                <div class="flex space-x-2">
                  <button 
                    @click="cancelEdit" 
                    class="p-2 transition-colors"
                    title="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white hover:text-[#c9d4a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Disease Form -->
              <div class="p-6">
                <form @submit.prevent="saveDisease">
                  <!-- Form content for creating/editing disease -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <!-- Disease Name -->
                    <div>
                      <label for="diseaseName" class="block text-base font-medium text-gray-500 mb-2">Disease Name*</label>
                      <input 
                        id="diseaseName"
                        v-model="editingDisease.name"
                        type="text" 
                        class="w-full px-4 py-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Enter disease name"
                        required
                      />
                    </div>
                    
                    <!-- Scientific Name -->
                    <div>
                      <label for="scientificName" class="block text-base font-medium text-gray-500 mb-2">Scientific Name</label>
                      <input 
                        id="scientificName"
                        v-model="editingDisease.scientificName"
                        type="text" 
                        class="w-full px-4 py-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Enter scientific name"
                      />
                    </div>
                    
                    <!-- Category -->
                    <div>
                      <label for="category" class="block text-base font-medium text-gray-500 mb-2">Category*</label>
                      <select 
                        id="category"
                        v-model="editingDisease.category"
                        class="w-full px-4 py-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="fungal">Fungal Disease</option>
                        <option value="bacterial">Bacterial Disease</option>
                        <option value="viral">Viral Disease</option>
                        <option value="pest">Pest</option>
                        <option value="nutritional">Nutritional Disorder</option>
                        <option value="environmental">Environmental Stress</option>
                      </select>
                    </div>
                    
                    <!-- Status -->
                    <div>
                      <label for="status" class="block text-base font-medium text-gray-400 mb-2">Status</label>
                      <select 
                        id="status"
                        v-model="editingDisease.status"
                        class="w-full px-4 py-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Affected Crops -->
                  <div class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Affected Crops</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <div 
                        v-for="(crop, index) in editingDisease.affectedCrops" 
                        :key="index"
                        class="bg-gray-200 px-3 py-1.5 rounded-full flex items-center"
                      >
                        <span>{{ crop }}</span>
                        <button 
                          type="button"
                          @click="removeCrop(index)"
                          class="ml-2 text-gray-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div class="flex">
                      <input 
                        v-model="newCrop"
                        type="text" 
                        class="flex-1 px-4 py-3 bg-white border border-gray-600/50 rounded-l-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Add affected crop"
                        @keyup.enter="addCrop"
                      />
                      <button 
                        type="button"
                        @click="addCrop"
                        class="px-4 py-3 bg-[#606c38] hover:bg-[#c9d4a3] rounded-r-xl text-white hover:text-[#606c38] border border-gray-600/50 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <!-- Short Description -->
                  <div class="mb-6">
                    <label for="shortDescription" class="block text-base font-medium text-gray-500 mb-2">Short Description*</label>
                    <textarea 
                      id="shortDescription"
                      v-model="editingDisease.shortDescription"
                      rows="2" 
                      class="w-full px-4 py-3 bg-white border border-gray-600/50 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Brief description of the disease"
                      required
                    ></textarea>
                  </div>
                  
                  <!-- Disease Image -->
                  <div class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Disease Image</label>
                    <div class="flex items-center space-x-4">
                      <div 
                        v-if="editingDisease.imageURL || previewImage" 
                        class="h-32 w-32 rounded-md bg-white border border-gray-600 overflow-hidden flex items-center justify-center"
                      >
                        <img 
                          :src="previewImage || editingDisease.imageURL" 
                          alt="Disease Image" 
                          class="h-full w-full object-cover"
                        />
                      </div>
                      <div 
                        v-else
                        class="h-32 w-32 rounded-xl bg-white border-2 border-dashed border-gray-600 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="flex flex-col space-y-2">
                        <label class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl transition-colors cursor-pointer text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            class="hidden" 
                            @change="handleImageChange"
                          />
                          Upload Image
                        </label>
                        <button 
                          v-if="editingDisease.imageURL || previewImage"
                          type="button"
                          @click="removeImage"
                          class="px-4 py-2 bg-red-600 text-white hover:bg-red-600/50 hover:text-red-600 rounded-xl rounded-xl text-white transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Rich Text Editor Tabs -->
                  <div class="mb-4 border-b border-gray-300">
                    <div class="flex overflow-x-auto">
                      <button 
                        v-for="tab in editorTabs" 
                        :key="tab.id"
                        type="button"
                        @click="activeEditorTab = tab.id"
                        :class="[
                          'px-4 py-2 text-basefont-medium whitespace-nowrap transition-colors',
                          activeEditorTab === tab.id 
                            ? 'text-[#606c38] border-b-2 border-[#606c38] font-bold' 
                            : 'text-gray-400 hover:text-[#606c38] hover:font-bold'
                        ]"
                      >
                        {{ tab.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Enhanced Professional Ribbon Toolbar -->
                  <div class="mb-4 overflow-hidden">
                    <!-- Main Toolbar -->
                    <div class="p-2 border-b border-gray-700 overflow-x-auto">
                      <div class="flex flex-wrap gap-1 min-w-max">
                        <!-- Text Style Section -->
                        <div class="flex items-center px-2 border-r border-gray-700">
                          <select 
                            @change="applyTextStyle($event)" 
                            class="bg-white border border-gray-300 rounded text-sm px-2 py-1 text-black focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">Paragraph</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                            <option value="h5">Heading 5</option>
                            <option value="h6">Heading 6</option>
                            <option value="blockquote">Blockquote</option>
                            <option value="code">Code Block</option>
                          </select>
                        </div>
                        
                        <!-- Font Style Section -->
                        <div class="flex items-center gap-1 px-2 border-r border-gray-700">
                          <button 
                            @click="toggleFormat('bold')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('bold') }]"
                            type="button"
                            title="Bold (Ctrl+B)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                            </svg>
                          </button>
                          <button 
                            @click="toggleFormat('italic')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('italic') }]"
                            type="button"
                            title="Italic (Ctrl+I)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="19" y1="4" x2="10" y2="4"></line>
                              <line x1="14" y1="20" x2="5" y2="20"></line>
                              <line x1="15" y1="4" x2="9" y2="20"></line>
                            </svg>
                          </button>
                          <button 
                            @click="toggleFormat('underline')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('underline') }]"
                            type="button"
                            title="Underline (Ctrl+U)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                              <line x1="4" y1="21" x2="20" y2="21"></line>
                            </svg>
                          </button>
                          <button 
                            @click="toggleFormat('strike')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('strike') }]"
                            type="button"
                            title="Strikethrough"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M17 9V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3"></path>
                              <path d="M20 12H4"></path>
                              <path d="M11 12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2z"></path>
                            </svg>
                          </button>
                          <button 
                            @click="toggleFormat('superscript')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('superscript') }]"
                            type="button"
                            title="Superscript"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M10 6L22 18"></path>
                              <path d="M22 6L10 18"></path>
                              <path d="M15 5h5v4h-5z"></path>
                            </svg>
                          </button>
                          <button 
                            @click="toggleFormat('subscript')" 
                            :class="['toolbar-btn', { 'active': isFormatActive('subscript') }]"
                            type="button"
                            title="Subscript"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M10 6L22 18"></path>
                              <path d="M22 6L10 18"></path>
                              <path d="M15 15h5v4h-5z"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <!-- Text Color Section -->
                        <div class="flex items-center gap-1 px-2 border-r border-gray-700">
                          <div class="relative">
                            <button 
                              @click="toggleColorPicker('text')" 
                              class="toolbar-btn flex items-center"
                              type="button"
                              title="Text Color"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 7h6l-3 10z"></path>
                                <line x1="4" y1="20" x2="20" y2="20"></line>
                              </svg>
                              <span class="ml-1 w-2 h-2 rounded-full" :style="{ backgroundColor: textColor || '#ffffff' }"></span>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                            <div v-if="showTextColorPicker" class="absolute top-full left-0 mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md z-10 grid grid-cols-5 gap-1">
                              <button 
                                v-for="color in colorPalette" 
                                :key="color"
                                @click="applyTextColor(color)"
                                class="w-5 h-5 rounded-full border border-gray-600"
                                :style="{ backgroundColor: color }"
                                :title="color"
                              ></button>
                              <button 
                                @click="applyTextColor('transparent')"
                                class="w-5 h-5 rounded-full border border-gray-600 bg-transparent flex items-center justify-center"
                                title="Default Color"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div class="relative">
                            <button 
                              @click="toggleColorPicker('highlight')" 
                              class="toolbar-btn flex items-center"
                              type="button"
                              title="Highlight Color"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2l.642.005.616.017.299.013.579.034.553.046c4.687.455 6.65 2.333 7.166 6.906l.03.29.046.553.034.58.013.298.017.616.004.318.001.324L22 12l-.005.642-.017.616-.013.299-.034.579-.046.553c-.455 4.687-2.333 6.65-6.906 7.166l-.29.03-.553.046-.58.034-.298.013-.616.017L12 22l-.642-.005-.616-.017-.299-.013-.579-.034-.553-.046c-4.687-.455-6.65-2.333-7.166-6.906l-.03-.29-.046-.553-.034-.58-.013-.298-.017-.616L2 12l.005-.642.017-.616.013-.299.034-.579.046-.553c.455-4.687 2.333-6.65 6.906-7.166l.29-.03.553-.046.58-.034.298-.013.616.017L12 2z"></path>
                              </svg>
                              <span class="ml-1 w-2 h-2 rounded-full" :style="{ backgroundColor: highlightColor || 'transparent' }"></span>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                            <div v-if="showHighlightColorPicker" class="absolute top-full left-0 mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md z-10 grid grid-cols-5 gap-1">
                              <button 
                                v-for="color in highlightPalette" 
                                :key="color"
                                @click="applyHighlightColor(color)"
                                class="w-5 h-5 rounded-full border border-gray-600"
                                :style="{ backgroundColor: color }"
                                :title="color"
                              ></button>
                              <button 
                                @click="applyHighlightColor('transparent')"
                                class="w-5 h-5 rounded-full border border-gray-600 bg-transparent flex items-center justify-center"
                                title="No Highlight"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Alignment Section -->
                        <div class="flex items-center gap-1 px-2 border-r border-gray-700">
                          <button 
                            @click="setAlignment('left')" 
                            :class="['toolbar-btn', { 'active': isAlignmentActive('left') }]"
                            type="button"
                            title="Align Left"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="17" y1="10" x2="3" y2="10"></line>
                              <line x1="21" y1="6" x2="3" y2="6"></line>
                              <line x1="21" y1="14" x2="3" y2="14"></line>
                              <line x1="17" y1="18" x2="3" y2="18"></line>
                            </svg>
                          </button>
                          <button 
                            @click="setAlignment('center')" 
                            :class="['toolbar-btn', { 'active': isAlignmentActive('center') }]"
                            type="button"
                            title="Align Center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="10" x2="6" y2="10"></line>
                              <line x1="21" y1="6" x2="3" y2="6"></line>
                              <line x1="21" y1="14" x2="3" y2="14"></line>
                              <line x1="18" y1="18" x2="6" y2="18"></line>
                            </svg>
                          </button>
                          <button 
                            @click="setAlignment('right')" 
                            :class="['toolbar-btn', { 'active': isAlignmentActive('right') }]"
                            type="button"
                            title="Align Right"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="21" y1="10" x2="7" y2="10"></line>
                              <line x1="21" y1="6" x2="3" y2="6"></line>
                              <line x1="21" y1="14" x2="3" y2="14"></line>
                              <line x1="21" y1="18" x2="7" y2="18"></line>
                            </svg>
                          </button>
                          <button 
                            @click="setAlignment('justify')" 
                            :class="['toolbar-btn', { 'active': isAlignmentActive('justify') }]"
                            type="button"
                            title="Justify"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="21" y1="10" x2="3" y2="10"></line>
                              <line x1="21" y1="6" x2="3" y2="6"></line>
                              <line x1="21" y1="14" x2="3" y2="14"></line>
                              <line x1="21" y1="18" x2="3" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        
                        <!-- List Section -->
                        <div class="flex items-center gap-1 px-2 border-r border-gray-700">
                          <button 
                            @click="toggleList('bulletList')" 
                            :class="['toolbar-btn', { 'active': isListActive('bulletList') }]"
                            type="button"
                            title="Bullet List"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="9" y1="6" x2="20" y2="6"></line>
                              <line x1="9" y1="12" x2="20" y2="12"></line>
                              <line x1="9" y1="18" x2="20" y2="18"></line>
                              <circle cx="4" cy="6" r="2"></circle>
                              <circle cx="4" cy="12" r="2"></circle>
                              <circle cx="4" cy="18" r="2"></circle>
                            </svg>
                          </button>
                          <button 
                            @click="toggleList('orderedList')" 
                            :class="['toolbar-btn', { 'active': isListActive('orderedList') }]"
                            type="button"
                            title="Numbered List"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="10" y1="6" x2="21" y2="6"></line>
                              <line x1="10" y1="12" x2="21" y2="12"></line>
                              <line x1="10" y1="18" x2="21" y2="18"></line>
                              <path d="M4 6h1v4"></path>
                              <path d="M4 10h2"></path>
                              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                            </svg>
                          </button>
                          <button 
                            @click="toggleList('checkList')" 
                            :class="['toolbar-btn', { 'active': isListActive('checkList') }]"
                            type="button"
                            title="Check List"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="9 11 12 14 22 4"></polyline>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <!-- Insert Section -->
                        <div class="flex items-center gap-1 px-2">
                          <button 
                            @click="insertHorizontalRule()" 
                            class="toolbar-btn"
                            type="button"
                            title="Horizontal Rule"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <button 
                            @click="insertTable()" 
                            class="toolbar-btn"
                            type="button"
                            title="Insert Table"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="3" y1="9" x2="21" y2="9"></line>
                              <line x1="3" y1="15" x2="21" y2="15"></line>
                              <line x1="9" y1="3" x2="9" y2="21"></line>
                              <line x1="15" y1="3" x2="15" y2="21"></line>
                            </svg>
                          </button>
                          <button 
                            @click="openImageUploader" 
                            class="toolbar-btn"
                            type="button"
                            title="Insert Image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </button>
                          <button 
                            @click="addLink()" 
                            class="toolbar-btn"
                            type="button"
                            title="Insert Link"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Format Toolbar -->
                    <div class="p-2 flex flex-wrap gap-1 min-w-max">
                      <button 
                        @click="clearFormatting()" 
                        class="toolbar-btn flex items-center"
                        type="button"
                        title="Clear Formatting"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 15l4 4m0-4l-4 4"></path>
                          <path d="M7 4h10M7 8h6"></path>
                          <path d="M7 12h4"></path>
                          <path d="M15 20H7a2 2 0 01-2-2V6a2 2 0 012-2"></path>
                        </svg>
                        Clear Formatting
                      </button>
                      
                      <button 
                        @click="toggleFullscreen()" 
                        class="toolbar-btn flex items-center"
                        type="button"
                        title="Toggle Fullscreen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                          <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                          <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                          <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                        </svg>
                        Fullscreen
                      </button>
                      
                      <button 
                        @click="toggleWordCount()" 
                        class="toolbar-btn flex items-center"
                        type="button"
                        title="Word Count"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Word Count
                      </button>
                      
                      <div v-if="showWordCount" class="ml-auto text-xs text-gray-400">
                        {{ wordCount }} words | {{ characterCount }} characters
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tiptap Editor for each tab with drag-and-drop support -->
                  <div v-show="activeEditorTab === 'symptoms'" class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Symptoms*</label>
                    <div 
                      class="editor-container bg-white !bg-white" 
                      @dragover.prevent 
                      @drop.prevent="handleDrop($event, 'symptoms')"
                      :class="{ 'fullscreen': isFullscreen }"
                    >
                      <editor-content :editor="editors.symptoms" class="editor-content" />
                    </div>
                  </div>
                  
                  <div v-show="activeEditorTab === 'causes'" class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Causes</label>
                    <div 
                      class="editor-container bg-white !bg-white" 
                      @dragover.prevent 
                      @drop.prevent="handleDrop($event, 'causes')"
                      :class="{ 'fullscreen': isFullscreen }"
                    >
                      <editor-content :editor="editors.causes" class="editor-content" />
                    </div>
                  </div>
                  
                  <div v-show="activeEditorTab === 'prevention'" class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Prevention Methods</label>
                    <div 
                      class="editor-container bg-white !bg-white" 
                      @dragover.prevent 
                      @drop.prevent="handleDrop($event, 'prevention')"
                      :class="{ 'fullscreen': isFullscreen }"
                    >
                      <editor-content :editor="editors.prevention" class="editor-content" />
                    </div>
                  </div>
                  
                  <div v-show="activeEditorTab === 'treatment'" class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Treatment Methods*</label>
                    <div 
                      class="editor-container bg-white !bg-white" 
                      @dragover.prevent 
                      @drop.prevent="handleDrop($event, 'treatment')"
                      :class="{ 'fullscreen': isFullscreen }"
                    >
                      <editor-content :editor="editors.treatment" class="editor-content" />
                    </div>
                  </div>
                  
                  <div v-show="activeEditorTab === 'additional'" class="mb-6">
                    <label class="block text-base font-medium text-gray-500 mb-2">Additional Information</label>
                    <div 
                      class="editor-container bg-white !bg-white" 
                      @dragover.prevent 
                      @drop.prevent="handleDrop($event, 'additionalInfo')"
                      :class="{ 'fullscreen': isFullscreen }"
                    >
                      <editor-content :editor="editors.additionalInfo" class="editor-content" />
                    </div>
                  </div>
                  
                  <!-- Form Actions -->
                  <div class="flex justify-end space-x-3 mt-8">
                    <button 
                      type="button"
                      @click="saveAsDraft"
                      class="px-6 py-3 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-blue-600 rounded-xl text-base transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button 
                      type="submit" 
                      class="px-6 py-3 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl text-base transition-colors flex items-center"
                      :disabled="isSaving"
                    >
                      <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isSaving ? 'Saving...' : isCreatingNew ? 'Create & Publish' : 'Update & Publish' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Disease View (Read-only Mode) -->
            <div v-else-if="selectedDisease && !isEditMode" class="bg-white rounded-xl shadow-lg overflow-hidden">
              <!-- View Header -->
              <div class="p-4 bg-[#606c38] flex justify-between items-center">
                <div class="flex items-center">
                  <div class="h-3 w-3 rounded-full mr-2" :class="getStatusColor(selectedDisease.status)"></div>
                  <h2 class="text-xl font-medium text-white">{{ selectedDisease.name }}</h2>
                  <span v-if="selectedDisease.scientificName" class="ml-2 text-gray-200 italic">({{ selectedDisease.scientificName }})</span>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="toggleEditMode" 
                    class="p-2 transition-colors"
                    title="Edit Disease Entry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white hover:text-[#c9d4a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="confirmDeleteDisease" 
                    class="p-2 transition-colors"
                    title="Delete Disease Entry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 hover:text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Disease Content -->
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <!-- Left Column - Image and Metadata -->
                  <div class="md:col-span-1">
                    <!-- Disease Image -->
                    <div class="mb-6">
                      <div 
                        v-if="selectedDisease.imageURL" 
                        class=" overflow-hidden"
                      >
                        <img 
                          :src="selectedDisease.imageURL" 
                          alt="Disease Image" 
                          class="w-full h-auto object-cover"
                        />
                      </div>
                      <div 
                        v-else
                        class="h-48 rounded-md bg-gray-700/50 border border-gray-600 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Metadata -->
                    <div class="space-y-4">
                      <!-- Category -->
                      <div>
                        <h3 class="text-sm font-medium text-gray-500">Category</h3>
                        <p class="mt-1 text-base">{{ getCategoryName(selectedDisease.category) }}</p>
                      </div>
                      
                      <!-- Affected Crops -->
                      <div>
                        <h3 class="text-sm font-medium text-gray-600">Affected Crops</h3>
                        <div class="mt-1 flex flex-wrap gap-2">
                          <span 
                            v-for="(crop, index) in selectedDisease.affectedCrops" 
                            :key="index"
                            class="bg-gray-400/50 text-gray-600 px-3 py-1 rounded-full text-sm"
                          >
                            {{ crop }}
                          </span>
                          <span v-if="!selectedDisease.affectedCrops || selectedDisease.affectedCrops.length === 0" class="text-gray-500">
                            None specified
                          </span>
                        </div>
                      </div>
                      
                      <!-- Last Updated -->
                      <div>
                        <h3 class="text-sm font-medium text-gray-600">Last Updated</h3>
                        <p class="mt-1 text-sm">{{ formatDate(selectedDisease.updatedAt) }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Right Column - Description and Content -->
                  <div class="md:col-span-2">
                    <!-- Short Description -->
                    <div class="mb-6">
                      <h3 class="text-lg font-medium mb-2">Description</h3>
                      <p class="text-gray-600">{{ selectedDisease.shortDescription }}</p>
                    </div>
                    
                    <!-- Content Tabs -->
                    <div class="mb-4 border-b border-gray-700">
                      <div class="flex overflow-x-auto">
                        <button 
                          v-for="tab in viewTabs" 
                          :key="tab.id"
                          type="button"
                          @click="activeViewTab = tab.id"
                          :class="[
                            'px-4 py-2 text-base font-medium whitespace-nowrap transition-colors',
                            activeViewTab === tab.id 
                            ? 'text-[#606c38] border-b-2 border-[#606c38] font-bold' 
                            : 'text-gray-400 hover:text-[#606c38] hover:font-bold'
                          ]"
                        >
                          {{ tab.name }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Tab Content -->
                    <div class="prose prose-invert prose-emerald max-w-none">
                      <!-- Symptoms -->
                      <div v-show="activeViewTab === 'symptoms'" v-html="selectedDisease.symptoms"></div>
                      
                      <!-- Causes -->
                      <div v-show="activeViewTab === 'causes'">
                        <div v-if="selectedDisease.causes" v-html="selectedDisease.causes"></div>
                        <p v-else class="text-gray-500">No information available about causes.</p>
                      </div>
                      
                      <!-- Prevention -->
                      <div v-show="activeViewTab === 'prevention'">
                        <div v-if="selectedDisease.prevention" v-html="selectedDisease.prevention"></div>
                        <p v-else class="text-gray-500">No information available about prevention methods.</p>
                      </div>
                      
                      <!-- Treatment -->
                      <div v-show="activeViewTab === 'treatment'" v-html="selectedDisease.treatment"></div>
                      
                      <!-- Additional Info -->
                      <div v-show="activeViewTab === 'additional'">
                        <div v-if="selectedDisease.additionalInfo" v-html="selectedDisease.additionalInfo"></div>
                        <p v-else class="text-gray-500">No additional information available.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div 
    v-if="showDeleteConfirmation" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-medium mb-4 text-black">Confirm Deletion</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete "{{ selectedDisease?.name }}"? This action cannot be undone.</p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="showDeleteConfirmation = false" 
          class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-base transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="deleteDisease" 
          class="px-4 py-2 bg-red-600 hover:bg-red-600/50 text-white hover:text-red-600 rounded-xl text-base transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>

  <!-- Image Upload Modal -->
  <div 
    v-if="showImageUploadModal" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl  p-6 max-w-md w-full">
      <h3 class="text-xl text-[#283618] font-semibold mb-4">Insert Image</h3>
      
      <div class="mb-4">
        <label class="block text-base font-medium text-gray-600 mb-2">Upload Image</label>
        <div 
          class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleEditorImageDrop"
        >
          <input 
            ref="editorImageInput"
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="handleEditorImageSelect"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-base font-medium text-gray-600">Drag and drop an image here or click to browse</p>
          <p class="text-gray-400 text-sm mt-1">Max size: 5MB</p>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          @click="closeImageUploader" 
          class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl text-base transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- Table Insert Modal -->
  <div 
    v-if="showTableModal" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full">
      <h3 class="text-xl font-medium mb-4">Insert Table</h3>
      
      <div class="mb-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-base font-medium text-gray-400 mb-2">Rows</label>
            <input 
              v-model="tableRows"
              type="number" 
              min="1"
              max="10"
              class="w-full px-4 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label class="block text-base font-medium text-gray-400 mb-2">Columns</label>
            <input 
              v-model="tableCols"
              type="number" 
              min="1"
              max="10"
              class="w-full px-4 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          @click="showTableModal = false" 
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-base transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="createTable" 
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white text-base transition-colors"
        >
          Insert
        </button>
      </div>
    </div>
  </div>

  <!-- Sign Out Confirmation Modal -->
  <SignOutConfirmation 
    v-if="showSignOutConfirmation"
    @confirm="handleSignOut"
    @cancel="showSignOutConfirmation = false"
  />
  
  <!-- Page Loader -->
  <PageLoader :is-loading="isLoading" />
</template>

## Complete Script Section

```javascript
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import NotificationToast from '../../components/professional/NotificationToast.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import PageLoader from '../../components/professional/PageLoader.vue';

// Import Tiptap libraries
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { EditorContent } from '@tiptap/vue-3';

// Router
const router = useRouter();

// State
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const showSignOutConfirmation = ref(false);
const showDeleteConfirmation = ref(false);
const showImageUploadModal = ref(false);
const showTableModal = ref(false);
const showTextColorPicker = ref(false);
const showHighlightColorPicker = ref(false);
const showWordCount = ref(false);
const isFullscreen = ref(false);
const email = ref('');
const photoURL = ref(null);
const userInitials = ref('');
const userDisplayName = ref('');
const editorImageInput = ref(null);
const currentUploadingEditor = ref(null);
const isEditMode = ref(false);
const sidebarOpen = ref(true);
const textColor = ref('#ffffff');
const highlightColor = ref('transparent');
const tableRows = ref(3);
const tableCols = ref(3);

// Color palettes
const colorPalette = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff', '#c0c0c0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080'
];

const highlightPalette = [
  '#ffff00', '#00ffff', '#ff00ff', '#ff0000', '#00ff00',
  '#0000ff', '#800000', '#808000', '#008000', '#800080'
];

// Disease Management State
const diseases = ref([]);
const selectedDisease = ref(null);
const isCreatingNew = ref(false);
const searchQuery = ref('');
const categoryFilter = ref('');
const newCrop = ref('');
const previewImage = ref(null);
const imageFile = ref(null);

// Rich Text Editor State
const activeEditorTab = ref('symptoms');
const activeViewTab = ref('symptoms');
const editorTabs = [
  { id: 'symptoms', name: 'Symptoms' },
  { id: 'causes', name: 'Causes' },
  { id: 'prevention', name: 'Prevention' },
  { id: 'treatment', name: 'Treatment' },
  { id: 'additional', name: 'Additional Info' }
];

const viewTabs = [
  { id: 'symptoms', name: 'Symptoms' },
  { id: 'causes', name: 'Causes' },
  { id: 'prevention', name: 'Prevention' },
  { id: 'treatment', name: 'Treatment' },
  { id: 'additional', name: 'Additional Info' }
];

// Tiptap Editors
const editors = reactive({
  symptoms: null,
  causes: null,
  prevention: null,
  treatment: null,
  additionalInfo: null
});

// Editing Disease Data
const editingDisease = reactive({
  name: '',
  scientificName: '',
  category: '',
  status: 'draft',
  shortDescription: '',
  affectedCrops: [],
  imageURL: '',
  symptoms: '',
  causes: '',
  prevention: '',
  treatment: '',
  additionalInfo: '',
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  updatedBy: ''
});

// Notification state
const notification = reactive({
  show: false,
  message: '',
  type: 'success',
  timeout: null
});

// Computed Properties
const filteredDiseases = computed(() => {
  let result = [...diseases.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(disease => 
      disease.name.toLowerCase().includes(query) || 
      disease.scientificName?.toLowerCase().includes(query) ||
      disease.shortDescription.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (categoryFilter.value) {
    result = result.filter(disease => disease.category === categoryFilter.value);
  }

  // Sort by updated date (newest first)
  return result.sort((a, b) => {
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;
    return b.updatedAt.seconds - a.updatedAt.seconds;
  });
});

// Get current editor based on active tab
const currentEditor = computed(() => {
  if (activeEditorTab.value === 'additional') {
    return editors.additionalInfo;
  }
  return editors[activeEditorTab.value];
});

// Word count and character count
const wordCount = computed(() => {
  if (!currentEditor.value) return 0;
  const text = currentEditor.value.getText();
  return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
});

const characterCount = computed(() => {
  if (!currentEditor.value) return 0;
  return currentEditor.value.getText().length;
});

// Methods
const fetchDiseases = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }
    
    // Get user data for display
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        email.value = userData.email;
        photoURL.value = userData.photoURL || null; // This gets the photo URL
        
        if (userData.firstName && userData.lastName) {
          userInitials.value = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
          userDisplayName.value = `${formatName(userData.firstName)} ${formatName(userData.lastName)}`;
        } else {
          userInitials.value = userData.displayName?.charAt(0) || 'P';
          userDisplayName.value = userData.displayName || 'Professional';
        }
      }
    } catch (userErr) {
      console.error("Error fetching user data:", userErr);
      // Continue with default values if user data fetch fails
      userInitials.value = auth.currentUser.email?.charAt(0) || 'P';
      userDisplayName.value = auth.currentUser.email || 'Professional';
      email.value = auth.currentUser.email || '';
      photoURL.value = null;
    }
    
    // Fetch diseases from Firestore
    try {
      const diseasesRef = collection(db, "diseases");
      const diseasesQuery = query(diseasesRef, orderBy("updatedAt", "desc"));
      const diseasesSnapshot = await getDocs(diseasesQuery);
      
      const diseasesData = [];
      diseasesSnapshot.forEach((doc) => {
        diseasesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      diseases.value = diseasesData;
    } catch (diseaseErr) {
      console.error("Error fetching diseases:", diseaseErr);
      
      if (diseaseErr.code === 'permission-denied') {
        showNotification('You do not have permission to access disease data. Please contact your administrator.', 'error', 10000);
        error.value = "Missing or insufficient permissions. Please contact your administrator to grant you access to the diseases collection.";
        // Load empty diseases array to allow creating new entries
        diseases.value = [];
      } else {
        error.value = diseaseErr.message || "Failed to load disease data. Please try again.";
        throw diseaseErr;
      }
    }
    
  } catch (err) {
    console.error("Error in disease management:", err);
    error.value = err.message || "Failed to load disease data. Please try again.";
    showNotification('Error loading disease management data: ' + err.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Initialize Tiptap editors
const initEditors = () => {
  // Initialize each editor
  const editorFields = ['symptoms', 'causes', 'prevention', 'treatment', 'additionalInfo'];

  editorFields.forEach((field) => {
    editors[field] = new Editor({
      extensions: [
        StarterKit,
        Underline,
        Strike,
        Superscript,
        Subscript,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
        }),
        Image.configure({
          allowBase64: true,
          inline: true,
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Highlight.configure({
          multicolor: true,
        }),
        TextStyle,
        Color,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content: editingDisease[field] || '',
      onUpdate: ({ editor }) => {
        editingDisease[field] = editor.getHTML();
      },
      editorProps: {
        attributes: {
          class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none min-h-[200px] max-w-none p-4',
        },
      }
    });
  });
};

// Update editor content when disease changes
const updateEditors = () => {
  Object.keys(editors).forEach(field => {
    if (editors[field]) {
      editors[field].commands.setContent(editingDisease[field] || '');
    }
  });
};

// Toggle edit mode
const toggleEditMode = () => {
  isEditMode.value = true;
  
  // Copy selected disease data to editing disease
  if (selectedDisease.value) {
    Object.keys(editingDisease).forEach(key => {
      if (selectedDisease.value[key] !== undefined) {
        if (Array.isArray(selectedDisease.value[key])) {
          editingDisease[key] = [...selectedDisease.value[key]];
        } else {
          editingDisease[key] = selectedDisease.value[key];
        }
      }
    });
  }

  // Make sure editors are initialized with current content
  nextTick(() => {
    if (!editors.symptoms) {
      initEditors();
    } else {
      updateEditors();
    }
  });
};

// Enhanced Editor Methods
const applyTextStyle = (event) => {
  if (!currentEditor.value) return;

  const style = event.target.value;

  if (!style) {
    currentEditor.value.chain().focus().setParagraph().run();
    return;
  }

  if (style.startsWith('h')) {
    const level = parseInt(style.substring(1));
    currentEditor.value.chain().focus().toggleHeading({ level }).run();
  } else if (style === 'blockquote') {
    currentEditor.value.chain().focus().toggleBlockquote().run();
  } else if (style === 'code') {
    currentEditor.value.chain().focus().toggleCodeBlock().run();
  }

  // Reset the select after applying
  event.target.value = '';
};

// Editor toolbar methods
const toggleFormat = (format) => {
  if (!currentEditor.value) return;

  switch (format) {
    case 'bold':
      currentEditor.value.chain().focus().toggleBold().run();
      break;
    case 'italic':
      currentEditor.value.chain().focus().toggleItalic().run();
      break;
    case 'underline':
      currentEditor.value.chain().focus().toggleUnderline().run();
      break;
    case 'strike':
      currentEditor.value.chain().focus().toggleStrike().run();
      break;
    case 'superscript':
      currentEditor.value.chain().focus().toggleSuperscript().run();
      break;
    case 'subscript':
      currentEditor.value.chain().focus().toggleSubscript().run();
      break;
  }
};

const toggleColorPicker = (type) => {
  if (type === 'text') {
    showTextColorPicker.value = !showTextColorPicker.value;
    if (showTextColorPicker.value) {
      showHighlightColorPicker.value = false;
    }
  } else if (type === 'highlight') {
    showHighlightColorPicker.value = !showHighlightColorPicker.value;
    if (showHighlightColorPicker.value) {
      showTextColorPicker.value = false;
    }
  }
};

const applyTextColor = (color) => {
  if (!currentEditor.value) return;

  textColor.value = color;
  currentEditor.value.chain().focus().setColor(color).run();
  showTextColorPicker.value = false;
};

const applyHighlightColor = (color) => {
  if (!currentEditor.value) return;

  highlightColor.value = color;
  if (color === 'transparent') {
    currentEditor.value.chain().focus().unsetHighlight().run();
  } else {
    currentEditor.value.chain().focus().setHighlight({ color }).run();
  }
  showHighlightColorPicker.value = false;
};

const setAlignment = (align) => {
  if (!currentEditor.value) return;
  currentEditor.value.chain().focus().setTextAlign(align).run();
};

const isAlignmentActive = (align) => {
  if (!currentEditor.value) return false;
  return currentEditor.value.isActive({ textAlign: align });
};

const toggleList = (type) => {
  if (!currentEditor.value) return;

  if (type === 'bulletList') {
    currentEditor.value.chain().focus().toggleBulletList().run();
  } else if (type === 'orderedList') {
    currentEditor.value.chain().focus().toggleOrderedList().run();
  } else if (type === 'checkList') {
    currentEditor.value.chain().focus().toggleTaskList().run();
  }
};

const insertHorizontalRule = () => {
  if (!currentEditor.value) return;
  currentEditor.value.chain().focus().setHorizontalRule().run();
};

const insertTable = () => {
  showTableModal.value = true;
};

const createTable = () => {
  if (!currentEditor.value) return;

  currentEditor.value.chain()
    .focus()
    .insertTable({ rows: tableRows.value, cols: tableCols.value, withHeaderRow: true })
    .run();

  showTableModal.value = false;
};

const clearFormatting = () => {
  if (!currentEditor.value) return;
  currentEditor.value.chain().focus().clearNodes().unsetAllMarks().run();
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const toggleWordCount = () => {
  showWordCount.value = !showWordCount.value;
};

// Image handling for editor
const openImageUploader = () => {
  currentUploadingEditor.value = activeEditorTab.value;
  showImageUploadModal.value = true;
};

const closeImageUploader = () => {
  showImageUploadModal.value = false;
  currentUploadingEditor.value = null;
};

const triggerFileInput = () => {
  editorImageInput.value.click();
};

const handleEditorImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  await uploadEditorImage(file);
};

const handleEditorImageDrop = async (event) => {
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  await uploadEditorImage(file);
};

const uploadEditorImage = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    showNotification('Please select a valid image file', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showNotification('Image size should be less than 5MB', 'error');
    return;
  }

  try {
    showNotification('Uploading image...', 'info');
    
    // Upload to Firebase Storage
    const fileRef = storageRef(storage, `disease-content-images/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    
    // Insert image into editor
    if (editors[currentUploadingEditor.value || activeEditorTab.value]) {
      editors[currentUploadingEditor.value || activeEditorTab.value]
        .chain()
        .focus()
        .setImage({ src: url })
        .run();
    }
    
    showNotification('Image uploaded successfully', 'success');
    closeImageUploader();
  } catch (err) {
    console.error('Error uploading image:', err);
    showNotification('Failed to upload image: ' + err.message, 'error');
  }
};

// Handle drag and drop directly on editor
const handleDrop = async (event, editorName) => {
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  currentUploadingEditor.value = editorName;
  await uploadEditorImage(file);
};

// Add link to editor
const addLink = () => {
  if (!currentEditor.value) return;

  const previousUrl = currentEditor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    currentEditor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
    return;
  }

  // update link
  currentEditor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
};

// Editor state check methods
const isFormatActive = (format) => {
  if (!currentEditor.value) return false;

  switch (format) {
    case 'bold':
      return currentEditor.value.isActive('bold');
    case 'italic':
      return currentEditor.value.isActive('italic');
    case 'underline':
      return currentEditor.value.isActive('underline');
    case 'strike':
      return currentEditor.value.isActive('strike');
    case 'superscript':
      return currentEditor.value.isActive('superscript');
    case 'subscript':
      return currentEditor.value.isActive('subscript');
    default:
      return false;
  }
};

const isListActive = (type) => {
  if (!currentEditor.value) return false;

  if (type === 'bulletList') {
    return currentEditor.value.isActive('bulletList');
  } else if (type === 'orderedList') {
    return currentEditor.value.isActive('orderedList');
  } else if (type === 'checkList') {
    return currentEditor.value.isActive('taskList');
  }

  return false;
};

const selectDisease = (disease) => {
  selectedDisease.value = disease;

  isEditMode.value = false;
  isCreatingNew.value = false;
  activeViewTab.value = 'symptoms';

  // Reset preview image
  previewImage.value = null;
  imageFile.value = null;
};

// Create new disease
const createNewDisease = () => {
  isEditMode.value = true;
  isCreatingNew.value = true;

  // Reset editingDisease to default values
  Object.keys(editingDisease).forEach(key => {
    if (key === 'affectedCrops') editingDisease[key] = [];
    else if (key === 'status') editingDisease[key] = 'draft';
    else editingDisease[key] = '';
  });

  // Reset preview image
  previewImage.value = null;
  imageFile.value = null;

  // Make sure editors are initialized with empty content
  nextTick(() => {
    // Ensure editors are initialized
    if (!editors.symptoms) {
      initEditors();
    } else {
      // Clear editor content
      Object.keys(editors).forEach(field => {
        if (editors[field]) {
          editors[field].commands.setContent('');
        }
      });
    }
    
    // Set active tab to symptoms by default
    activeEditorTab.value = 'symptoms';
  });
};

// Cancel edit mode
const cancelEdit = () => {
  isEditMode.value = false;
  isCreatingNew.value = false;
  previewImage.value = null;
  imageFile.value = null;
};

// Handle image change
const handleImageChange = (event) => {
  imageFile.value = event.target.files[0];
  if (imageFile.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(imageFile.value);
  } else {
    previewImage.value = null;
  }
};

// Remove image
const removeImage = () => {
  previewImage.value = null;
  imageFile.value = null;
  editingDisease.imageURL = '';
};

// Add crop
const addCrop = () => {
  if (newCrop.value.trim()) {
    if (!editingDisease.affectedCrops) {
      editingDisease.affectedCrops = [];
    }
    editingDisease.affectedCrops.push(newCrop.value.trim());
    newCrop.value = '';
  }
};

// Remove crop
const removeCrop = (index) => {
  editingDisease.affectedCrops.splice(index, 1);
};

// Save disease
const saveDisease = async () => {
  isSaving.value = true;

  try {
    // Validate required fields
    if (!editingDisease.name || !editingDisease.category || !editingDisease.shortDescription) {
      showNotification('Please fill in all required fields', 'error');
      isSaving.value = false;
      return;
    }
    
    // Get current user ID
    const userId = auth.currentUser.uid;
    
    // Prepare disease data
    const diseaseData = {
      name: editingDisease.name,
      scientificName: editingDisease.scientificName || '',
      category: editingDisease.category,
      status: editingDisease.status,
      shortDescription: editingDisease.shortDescription,
      affectedCrops: editingDisease.affectedCrops || [],
      symptoms: editors.symptoms ? editors.symptoms.getHTML() : '',
      causes: editors.causes ? editors.causes.getHTML() : '',
      prevention: editors.prevention ? editors.prevention.getHTML() : '',
      treatment: editors.treatment ? editors.treatment.getHTML() : '',
      additionalInfo: editors.additionalInfo ? editors.additionalInfo.getHTML() : '',
      updatedAt: serverTimestamp(),
      updatedBy: userId
    };
    
    // Handle image upload if there's a new image
    if (imageFile.value) {
      const imagePath = `diseases/${Date.now()}_${imageFile.value.name}`;
      const imageRef = storageRef(storage, imagePath);
      
      // Upload the image
      await uploadBytes(imageRef, imageFile.value);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      // Add image URL to disease data
      diseaseData.imageURL = downloadURL;
      
      // If we're updating and there was a previous image, delete it
      if (!isCreatingNew.value && selectedDisease.value.imageURL) {
        try {
          // Extract the path from the URL
          const oldImagePath = selectedDisease.value.imageURL.split('?')[0].split('/o/')[1].replace(/%2F/g, '/');
          const decodedPath = decodeURIComponent(oldImagePath);
          const oldImageRef = storageRef(storage, decodedPath);
          
          // Delete the old image
          await deleteObject(oldImageRef);
        } catch (imgErr) {
          console.error("Error deleting old image:", imgErr);
          // Continue with the update even if image deletion fails
        }
      }
    } else if (isCreatingNew.value) {
      // No image for new disease
      diseaseData.imageURL = '';
    } else {
      // Keep existing image for updates
      diseaseData.imageURL = selectedDisease.value.imageURL || '';
    }
    
    // Create new disease or update existing one
    if (isCreatingNew.value) {
      // Add creation metadata
      diseaseData.createdAt = serverTimestamp();
      diseaseData.createdBy = userId;
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "diseases"), diseaseData);
      
      // Get the new disease with ID
      const newDisease = {
        id: docRef.id,
        ...diseaseData,
        // Add a temporary timestamp for sorting until the server timestamp is available
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };
      
      // Add to local state
      diseases.value.unshift(newDisease);
      
      // Select the new disease
      selectedDisease.value = newDisease;
      
      showNotification('Disease created successfully', 'success');
    } else {
      // Update existing disease
      const diseaseRef = doc(db, "diseases", selectedDisease.value.id);
      await updateDoc(diseaseRef, diseaseData);
      
      // Update local state
      const index = diseases.value.findIndex(d => d.id === selectedDisease.value.id);
      if (index !== -1) {
        // Create updated disease object
        const updatedDisease = {
          ...diseases.value[index],
          ...diseaseData,
          // Add a temporary timestamp for sorting until the server timestamp is available
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
        };
        
        // Update the array
        diseases.value[index] = updatedDisease;
        
        // Update selected disease
        selectedDisease.value = updatedDisease;
      }
      
      showNotification('Disease updated successfully', 'success');
    }
    
    // Reset state
    isCreatingNew.value = false;
    isEditMode.value = false;
    
    // Reset image state
    previewImage.value = null;
    imageFile.value = null;
    
  } catch (err) {
    console.error("Error saving disease:", err);
    showNotification(`Error saving disease: ${err.message}`, 'error');
  } finally {
    isSaving.value = false;
  }
};

// Save as draft
const saveAsDraft = () => {
  editingDisease.status = 'draft';
  saveDisease();
};

// Confirm delete disease
const confirmDeleteDisease = () => {
  showDeleteConfirmation.value = true;
};

// Delete disease
const deleteDisease = async () => {
  try {
    // Delete from Firestore
    const diseaseRef = doc(db, "diseases", selectedDisease.value.id);
    await deleteDoc(diseaseRef);
    
    // Delete image from storage if it exists
    if (selectedDisease.value.imageURL) {
      try {
        // Extract the path from the URL
        const imagePath = selectedDisease.value.imageURL.split('?')[0].split('/o/')[1].replace(/%2F/g, '/');
        const decodedPath = decodeURIComponent(imagePath);
        const imageRef = storageRef(storage, decodedPath);
        
        // Delete the image
        await deleteObject(imageRef);
      } catch (imgErr) {
        console.error("Error deleting image:", imgErr);
        // Continue with the deletion even if image deletion fails
      }
    }
    
    // Update local state
    diseases.value = diseases.value.filter(d => d.id !== selectedDisease.value.id);
    selectedDisease.value = null;
    
    showNotification('Disease deleted successfully', 'success');
  } catch (err) {
    console.error("Error deleting disease:", err);
    showNotification(`Error deleting disease: ${err.message}`, 'error');
  } finally {
    showDeleteConfirmation.value = false;
  }
};

// Show notification
const showNotification = (message, type = 'success', duration = 3000) => {
  // Clear any existing timeout
  if (notification.timeout) {
    clearTimeout(notification.timeout);
  }
  
  notification.message = message;
  notification.type = type;
  notification.show = true;
  
  notification.timeout = setTimeout(() => {
    notification.show = false;
  }, duration);
};

// Hide notification
const hideNotification = () => {
  notification.show = false;
  if (notification.timeout) {
    clearTimeout(notification.timeout);
  }
};

// Format name (capitalize first letter)
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'published':
      return 'bg-emerald-500';
    case 'draft':
      return 'bg-yellow-500';
    case 'archived':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

// Get category name
const getCategoryName = (category) => {
  switch (category) {
    case 'fungal':
      return 'Fungal Disease';
    case 'bacterial':
      return 'Bacterial Disease';
    case 'viral':
      return 'Viral Disease';
    case 'pest':
      return 'Pest';
    case 'nutritional':
      return 'Nutritional Disorder';
    case 'environmental':
      return 'Environmental Stress';
    default:
      return category;
  }
};

// Format date
const formatDate = (timestamp) => {
if (!timestamp) return 'N/A';

try {
  let date;
  
  // Handle Firestore timestamp objects
  if (timestamp && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } 
  // Handle timestamp objects with seconds (Firestore server timestamps)
  else if (timestamp && timestamp.seconds !== undefined) {
    date = new Date(timestamp.seconds * 1000);
  }
  // Handle string timestamps
  else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  }
  // Handle numeric timestamps (milliseconds since epoch)
  else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  }
  // Handle Date objects
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  else {
    return 'N/A';
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
} catch (error) {
  console.error("Error formatting date:", error, timestamp);
  return 'N/A';
}
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/professional/profile');
};

// Handle sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
    router.push('/signin');
  } catch (error) {
    console.error("Error signing out:", error);
    showNotification('Error signing out: ' + error.message, 'error');
  } finally {
    showSignOutConfirmation.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchDiseases();
  initEditors();
});

onBeforeUnmount(() => {
  // Destroy editors to prevent memory leaks
  Object.values(editors).forEach(editor => {
    editor?.destroy();
  });
  
  // Clear any notification timeout
  if (notification.timeout) {
    clearTimeout(notification.timeout);
  }
});

// Watch for changes in selectedDisease to update editors
watch(() => selectedDisease.value, (newDisease) => {
  if (newDisease && isEditMode.value) {
    updateEditors();
  }
}, { deep: true });
</script>

<style scoped>
.toolbar-btn {
  @apply p-1.5 rounded hover:bg-gray-200 transition-colors;
}

.toolbar-btn.active {
  @apply bg-[#c9d4a3] text-[#606c38];
}

.editor-container {
  @apply  overflow-hidden bg-white border border-gray-600/50 rounded-xl ;
}

.editor-container.fullscreen {
  @apply fixed inset-0 z-50 bg-white;
}

:deep(.editor-content) {
  @apply min-h-[200px];
}

:deep(.ProseMirror) {
  @apply outline-none;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-gray-500;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.ProseMirror table) {
  @apply border-collapse w-full my-4;
}

:deep(.ProseMirror table td),
:deep(.ProseMirror table th) {
  @apply border border-gray-600 p-2;
}

:deep(.ProseMirror table th) {
  @apply bg-gray-700/50 font-medium;
}

:deep(.ProseMirror blockquote) {
  @apply border-l-4 border-emerald-500 pl-4 italic;
}

:deep(.ProseMirror pre) {
  @apply bg-gray-800 p-4 rounded-md overflow-x-auto;
}

:deep(.ProseMirror ul) {
  @apply list-disc pl-6;
}

:deep(.ProseMirror ol) {
  @apply list-decimal pl-6;
}

:deep(.ProseMirror ul[data-type="taskList"]) {
  @apply list-none p-0;
}

:deep(.ProseMirror ul[data-type="taskList"] li) {
  @apply flex items-start;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label) {
  @apply mr-2 mt-1;
}

:deep(.ProseMirror hr) {
  @apply border-t border-gray-600 my-4;
}
</style>