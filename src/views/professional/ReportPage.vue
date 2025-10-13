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
      <!-- Main Content Area -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4">
          <div>
            <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Report Generator</h1>
            <p class="text-sm sm:text-base text-gray-400">Generate structured, printable summaries of pest and disease detection data</p>
          </div>
          <div class="flex flex-wrap gap-3 mt-6 md:mt-0">
            <!-- Consolidated "Generate Report" Button -->
            <button
              @click="openReportEditModal()"
              :disabled="isGeneratingReport || (filteredScanHistory.length === 0 && selectedScans.length === 0)"
              class="flex items-center justify-center px-7 py-3 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl font-medium disabled:cursor-not-allowed transition-all text-sm"
            >
              <Loader2Icon v-if="isGeneratingReport" class="animate-spin h-5 w-5 mr-2" />
              <DownloadIcon v-else class="h-5 w-5 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        <!-- Report Configuration & Filters Panel -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div class="lg:col-span-1 bg-white p-7 shadow-lg rounded-xl">
            <h2 class="text-2xl font-semibold text-[#283618] mb-6 flex items-center">
              Filters & Customization
            </h2>
            <div class="space-y-6">
              <!-- Custom Title -->
              <div>
                <label for="reportTitle" class="block text-sm font-medium text-gray-600 mb-2">Report Title</label>
                <input
                  v-model="reportConfig.title"
                  type="text"
                  id="reportTitle"
                  placeholder="e.g., Monthly Pest Summary"
                  class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                />
              </div>
              <!-- Remarks / Notes -->
              <div>
                <label for="reportRemarks" class="block text-sm font-medium text-gray-600 mb-2">Remarks / Notes</label>
                <textarea
                  v-model="reportConfig.remarks"
                  id="reportRemarks"
                  rows="3"
                  placeholder="Add any additional notes or context for the report."
                  class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                ></textarea>
              </div>
              <!-- Date Range -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Date Range</label>
                <input
                  v-model="filters.startDate"
                  type="date"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 text-sm mb-3 transition-colors"
                />
                <input
                  v-model="filters.endDate"
                  type="date"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 text-sm transition-colors"
                />
              </div>
              <!-- Farm Location (Municipality) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Municipality</label>
                <select
                  v-model="filters.municipality"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Municipalities</option>
                  <option v-for="muni in uniqueMunicipalities" :key="muni" :value="muni">{{ muni }}</option>
                </select>
              </div>
              <!-- Farm Location (Barangay) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Barangay</label>
                <select
                  v-model="filters.barangay"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Barangays</option>
                  <option v-for="brgy in uniqueBarangays" :key="brgy" :value="brgy">{{ brgy }}</option>
                </select>
              </div>
              <!-- Crop Type -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Plant Type</label>
                <select
                  v-model="filters.plantType"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Plant Types</option>
                  <option v-for="crop in uniquePlantTypes" :key="crop" :value="crop">{{ crop }}</option>
                </select>
              </div>
              <!-- Disease / Pest Type -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Disease/Pest Name</label>
                <select
                  v-model="filters.detectedIssue"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Detections</option>
                  <option v-for="issue in uniqueDetectedIssues" :key="issue" :value="issue">{{ issue }}</option>
                </select>
              </div>
              <!-- Severity Level -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Severity Level</label>
                <select
                  v-model="filters.severity"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Severities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <!-- User Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">User</label>
                <select
                  v-model="filters.userId"
                  class="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  <option value="">All Users</option>
                  <option v-for="user in uniqueUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
              </div>
              <!-- Include Analytics Chart Snapshot Toggle -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="includeChart"
                  v-model="reportConfig.includeChartSnapshot"
                  class="h-4 w-4 text-emerald-600 border-gray-600 rounded focus:ring-emerald-500 bg-gray-700 transition-colors"
                />
                <label for="includeChart" class="ml-2 block text-sm text-gray-600">Include Analytics Chart Snapshot</label>
              </div>
              <!-- Clear Filters Button -->
              <div class="pt-6 border-t border-gray-400/50 mt-6">
                <button
                  @click="clearFilters"
                  class="w-full px-2 py-2.5 text-red-600 hover:text-red-600/50 transition-all text-base font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Main Report Content Area -->
          <div class="lg:col-span-3 space-y-4">
            <!-- Summary Section -->
            <div class="bg-white rounded-xl shadow-lg p-7">
              <h2 class="text-2xl font-semibold text-[#283618] mb-6 flex items-center">
                Report Summary
              </h2>
              <div v-if="loadingData" class="text-center text-gray-400">Loading summary data...</div>
              <div v-else-if="filteredScanHistory.length === 0" class="text-center text-gray-400 italic text-base">No data available for the selected filters.</div>
              <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Total Detections Card -->
                  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                      <div class="bg-emerald-500/20 p-3 rounded-full mr-4">
                        <SearchCheck class="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 class="text-sm font-medium text-gray-600 mb-1">Total Detections</h3>
                        <p class="text-3xl font-bold text-emerald-600">{{ reportSummary.totalDetections }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Overall Risk Level Card -->
                  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                      <div class="p-3 rounded-full mr-4" :class="{
                          'bg-red-500/20': reportSummary.overallRiskLevel === 'High',
                          'bg-yellow-500/20': reportSummary.overallRiskLevel === 'Medium',
                          'bg-green-500/20': reportSummary.overallRiskLevel === 'Low'
                        }">
                        <AlertTriangle class="w-8 h-8" :class="{
                            'text-red-600': reportSummary.overallRiskLevel === 'High',
                            'text-yellow-600': reportSummary.overallRiskLevel === 'Medium',
                            'text-green-600': reportSummary.overallRiskLevel === 'Low'
                          }" />
                      </div>
                      <div>
                        <h3 class="text-sm font-medium text-gray-600 mb-1">Overall Risk Level</h3>
                        <p class="text-3xl font-bold" :class="{
                            'text-red-500': reportSummary.overallRiskLevel === 'High',
                            'text-yellow-500': reportSummary.overallRiskLevel === 'Medium',
                            'text-green-500': reportSummary.overallRiskLevel === 'Low'
                          }">
                          {{ reportSummary.overallRiskLevel }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Unique Users Card -->
                  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                      <div class="bg-blue-500/20 p-3 rounded-full mr-4">
                        <Users class="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 class="text-sm font-medium text-gray-600 mb-1">Unique Users</h3>
                        <p class="text-3xl font-bold text-blue-600">{{ reportSummary.uniqueUsersCount }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Most Common Diseases/Pests -->
                  <div class="bg-white rounded-xl p-5 border border-gray-400/50">
                    <h3 class="text-lg font-semibold text-[#606c38] mb-4">Top 3 Common Issues</h3>
                    <ul class="space-y-3">
                      <li v-for="(issue, index) in reportSummary.topIssues" :key="index" class="flex items-center justify-between text-base">
                        <span class="font-medium text-black">{{ index + 1 }}. {{ issue.name }} ({{ issue.type }})</span>
                        <span class="text-[#dda15e] font-bold">{{ issue.count }}</span>
                      </li>
                      <li v-if="reportSummary.topIssues.length === 0" class="text-gray-400 italic text-sm">No issues detected.</li>
                    </ul>
                  </div>
                  <!-- Locations with Highest Risk/Frequency -->
                  <div class="bg-white rounded-xl p-5 border border-gray-400/50">
                    <h3 class="text-lg font-semibold text-[#606c38] mb-4">Top Locations by Detections</h3>
                    <ul class="space-y-3">
                      <li v-for="(location, index) in reportSummary.topLocations" :key="index" class="flex items-center justify-between text-base">
                        <span class="font-medium text-black">{{ index + 1 }}. {{ location.name }}</span>
                        <span class="text-[#dda15e] font-semibold">{{ location.count }} detections</span>
                      </li>
                      <li v-if="reportSummary.topLocations.length === 0" class="text-gray-400 italic text-sm">No locations with detections.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Scan History Table -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="p-7 border-b border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 class="text-2xl font-semibold text-[#283618] flex items-center">
                    Detailed Scan History
                  </h2>
                  <p class="text-gray-400 text-sm">{{ filteredScanHistory.length }} records found</p>
                </div>
                <button
                  @click="selectedScans = filteredScanHistory.map(s => s.analysisId)"
                  :disabled="filteredScanHistory.length === 0"
                  class="px-5 py-2.5 text-[#606c38] hover:text-[#c9d4a3]/100 disabled:cursor-not-allowed rounded-lg transition-colors text-base font-medium mt-4 md:mt-0"
                >
                  Select All
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-gray-300">
                  <thead>
                    <tr class="bg-[#283618]">
                      <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          :checked="isAllSelected && paginatedScanHistory.length > 0"
                          :indeterminate="isAnySelected && !isAllSelected"
                          @change="toggleSelectAll"
                          class="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700"
                        />
                      </th>
                      <th class="px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Date</th>
                      <th class="px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">User/Farm</th>
                      <th class="px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Plant/Detection</th>
                      <th class="px-6 py-4 text-xs font-medium text-white uppercase tracking-wider">Severity</th>
                      <th class="px-6 py-4 whitespace-nowrap text-xs font-medium text-white uppercase tracking-wider">Weather</th>
                      <th class="px-6 py-4 whitespace-nowrap text-xs font-medium text-white uppercase tracking-wider">Technical</th>
                      <th class="px-6 py-4 whitespace-nowrap text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-400/50">
                    <tr v-if="loadingData">
                      <td colspan="8" class="px-6 py-8 text-center text-gray-400 italic text-base">Loading scan history...</td>
                    </tr>
                    <tr v-else-if="paginatedScanHistory.length === 0">
                      <td colspan="8" class="px-6 py-8 text-center text-gray-400 italic text-base">No scan history records found for the selected filters.</td>
                    </tr>
                    <tr v-else v-for="scan in paginatedScanHistory" :key="scan.analysisId" class="hover:bg-[#f7f2df] text-gray-600 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          :checked="selectedScans.includes(scan.analysisId)"
                          @change="toggleScanSelection(scan.analysisId)"
                          class="h-4 w-4 text-gray-600 border-gray-600 rounded focus:ring-gray-500 bg-gray-700"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        {{ formatDate(scan.timestamp) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <p class="font-medium text-gray-600">{{ getUserDisplayName(scan.userId) }}</p>
                        <p class="text-xs text-gray-400">
                          {{ scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay || 'N/A' }}, {{ scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality || 'N/A' }}
                        </p>
                        <p v-if="scan.userLocationDetails?.farmName" class="text-xs text-gray-400">Farm: {{ scan.userLocationDetails.farmName }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p class="text-sm font-semibold text-[#606c38]">{{ scan.diseaseDetails?.name || scan.disease || 'N/A' }}</p>
                          <p class="text-xs text-gray-400">{{ scan.diseaseDetails?.category || 'N/A' }} ({{ scan.confidence || 'N/A' }}% conf.)</p>
                          <p class="text-xs text-gray-400 italic">{{ scan.plantType || 'N/A' }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="{
                            'bg-red-500/20 text-red-400': scan.severity === 'High',
                            'bg-yellow-500/20 text-yellow-400': scan.severity === 'Medium',
                            'bg-green-500/20 text-green-400': scan.severity === 'Low'
                          }" class="px-2.5 py-1 text-xs rounded-full font-medium">
                          {{ scan.severity || 'N/A' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex items-center gap-1">
                          <CloudRainIcon class="h-4 w-4 text-gray-400" /> {{ scan.weather?.condition || 'N/A' }}
                        </div>
                        <div class="flex items-center gap-1">
                          <ThermometerIcon class="h-4 w-4 text-gray-400" /> {{ scan.weather?.temperature || 'N/A' }}°C
                        </div>
                        <div class="flex items-center gap-1">
                          <DropletIcon class="h-4 w-4 text-gray-400" /> {{ scan.weather?.humidity || 'N/A' }}%
                        </div>
                        <div class="flex items-center gap-1">
                          <WindIcon class="h-4 w-4 text-gray-400" /> {{ scan.weather?.windSpeed || 'N/A' }} m/s
                        </div>
                        <p class="text-xs text-gray-400">Lat: {{ scan.location?.latitude?.toFixed(4) || 'N/A' }}, Lon: {{ scan.location?.longitude?.toFixed(4) || 'N/A' }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex items-center gap-1">
                          <CameraIcon class="h-4 w-4 text-gray-400" /> {{ scan.captureMethod || 'N/A' }}
                        </div>
                        <div class="flex items-center gap-1">
                          <CpuIcon class="h-4 w-4 text-gray-400" /> {{ scan.deviceType || 'N/A' }}
                        </div>
                        <p class="text-xs text-gray-400 truncate max-w-[150px]">{{ scan.deviceInfo || 'N/A' }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <button @click="viewImage(scan.imageUrl, scan.diseaseDetails?.name || scan.disease)" class="text-blue-600 hover:text-blue-400 text-sm font-medium">
                          View Image
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Pagination -->
              <div class="bg-white px-7 py-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-400/50">
                <div class="text-sm text-gray-600 mb-4 md:mb-0">
                  Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredScanHistory.length }} records
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                    class="px-4 py-2  transition-colors text-gray-600 hover:text-gray-400 font-medium"
                  >
                    Previous
                  </button>
                  <button
                    @click="nextPage"
                    :disabled="currentPage === totalPages || totalPages === 0"
                    :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages || totalPages === 0 }"
                    class="px-4 py-2  transition-colors text-gray-600 hover:text-gray-400 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Sign Out Confirmation Modal -->
    <div v-if="showSignOutConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 class="text-xl font-bold text-red-600 mb-4">Confirm Sign Out</h3>
        <p class="text-gray-600 mb-6">Are you sure you want to sign out?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showSignOutConfirmation = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSignOut"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Report Edit Modal -->
    <div v-if="showEditReportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button @click="showEditReportModal = false" class="absolute top-3 right-3 text-gray-600 hover:text-gray-600/50">
          <XIcon class="h-6 w-6" />
        </button>
        <h3 class="text-2xl font-semibold text-[#283618]">Customize Report</h3>
        <p class="text-gray-400 mb-4">Review and edit the report details before generation. Fields marked with * are required.</p>
          <div class="space-y-6 mb-6">
          <div>
            <label for="editReportTitle" class="block text-sm font-medium text-gray-600 mb-2">Report Title *</label>
            <input
              v-model="editableReportContent.title"
              type="text"
              id="editReportTitle"
              placeholder="e.g., Monthly Pest Summary"
              class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
            />
          </div>
          <div>
            <label for="editReportRemarks" class="block text-sm font-medium text-gray-600 mb-2">General Remarks / Notes</label>
            <textarea
              v-model="editableReportContent.remarks"
              id="editReportRemarks"
              rows="4"
              placeholder="Add any general notes or context for the report."
              class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 resize-y transition-colors"
            ></textarea>
          </div>
            <div class="bg-white rounded-xl p-4 border border-gray-400/50">
            <h4 class="text-md font-semibold text-gray-600 mb-2">Data to be Included:</h4>
            <p class="text-gray-400 text-sm">
              <span class="font-semibold text-[#283618]">{{ getScansForReport().length }}</span> records will be included in this report.
              <span v-if="reportActionType === 'specific'" class="text-[#606c38]">(Based on your selection)</span>
              <span v-else class="text-[#606c38]">(Based on current filters for general report)</span>
            </p>
            <p class="text-gray-400 text-xs mt-1">Adjust filters on the main page if you need to change the included data.</p>
          </div>
            <h4 v-if="reportActionType === 'specific'" class="text-lg font-semibold text-[#606c38] mt-8 mb-4">Pest/Disease Specific Details</h4>
          <div v-if="reportActionType === 'specific' && editableReportContent.pestReports.length === 0" class="text-gray-400 italic text-center py-4">
            No unique pests/diseases found in the filtered data to customize.
          </div>
          <div v-if="reportActionType === 'specific'" v-for="(pestReport, index) in editableReportContent.pestReports" :key="pestReport.pestName" class="bg-white rounded-xl p-5 border border-gray-400 space-y-4">
            <h5 class="text-lg font-semibold text-gray-600">
              {{ pestReport.pestName }} <span v-if="pestReport.pestScientificName" class="text-sm text-gray-600">({{ pestReport.pestScientificName }})</span>
            </h5>
            <div>
              <label :for="`description-${index}`" class="block text-sm font-medium text-gray-600 mb-2">Description of Infestation *</label>
              <textarea
                v-model="pestReport.description"
                :id="`description-${index}`"
                rows="6"
                placeholder="Describe the infestation observed for this pest/disease. E.g., 'During the field validation, [Pest Name] specimen were observed and identified in the [Plant Type] plantation...'"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              ></textarea>
            </div>
            <div>
              <label :for="`recommendations-${index}`" class="block text-sm font-medium text-gray-600 mb-2">Recommendations (one per line) *</label>
              <textarea
                v-model="pestReport.recommendations"
                :id="`recommendations-${index}`"
                rows="4"
                placeholder="List recommendations for this pest/disease, one per line. E.g., '1. Proper sanitation of the field\n2. Periodic removal of dry leaves and suckers'"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              ></textarea>
            </div>
            <div>
              <label :for="`actionsTaken-${index}`" class="block text-sm font-medium text-gray-600 mb-2">Actions Taken (one per line)</label>
              <textarea
                v-model="pestReport.actionsTaken"
                :id="`actionsTaken-${index}`"
                rows="3"
                placeholder="List actions taken for this pest/disease, one per line (optional). E.g., '1. Distribution of Trichoderma harzianum'"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              ></textarea>
            </div>
          </div>
            <h4 class="text-lg font-semibold text-[#606c38] mt-8">Contact Information</h4>
          <div class="bg-white rounded-xl p-5 border border-gray-400 space-y-4">
            <div>
              <label for="contactPerson" class="block text-sm font-medium text-gray-600 mb-2">Contact Person Name *</label>
              <input
                v-model="editableReportContent.contactInfo.name"
                type="text"
                id="contactPerson"
                placeholder="e.g., Cristina M. Sagun, Ph.D."
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="contactTitle" class="block text-sm font-medium text-gray-600 mb-2">Contact Person Title *</label>
              <input
                v-model="editableReportContent.contactInfo.title"
                type="text"
                id="contactTitle"
                placeholder="e.g., Chief, RCPC"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="contactPhone1" class="block text-sm font-medium text-gray-600 mb-2">Phone Number 1</label>
              <input
                v-model="editableReportContent.contactInfo.phone1"
                type="text"
                id="contactPhone1"
                placeholder="e.g., 0909-489-3311"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="contactPhone2" class="block text-sm font-medium text-gray-600 mb-2">Phone Number 2 (Optional)</label>
              <input
                v-model="editableReportContent.contactInfo.phone2"
                type="text"
                id="contactPhone2"
                placeholder="e.g., 0905-355-7570"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="contactEmail" class="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
              <input
                v-model="editableReportContent.contactInfo.email"
                type="email"
                id="contactEmail"
                placeholder="e.g., darcpc4b@gmail.com"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
          </div>
            <h4 class="text-lg font-semibold text-[#606c38] mt-8">Prepared By & Noted By</h4>
          <div class="bg-white rounded-xl p-5 border border-gray-400 space-y-4">
            <div>
              <label for="preparedByName" class="block text-sm font-medium text-gray-600 mb-2">Prepared By Name *</label>
              <input
                v-model="editableReportContent.preparedBy.name"
                type="text"
                id="preparedByName"
                placeholder="e.g., JOMARI J. ABDON"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="preparedByTitle" class="block text-sm font-medium text-gray-600 mb-2">Prepared By Title *</label>
              <input
                v-model="editableReportContent.preparedBy.title"
                type="text"
                id="preparedByTitle"
                placeholder="e.g., Agriculturist I/ Entomologist"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="notedByName" class="block text-sm font-medium text-gray-600 mb-2">Noted By Name *</label>
              <input
                v-model="editableReportContent.notedBy.name"
                type="text"
                id="notedByName"
                placeholder="e.g., CRISTINA M. SAGUN, Ph.D."
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
            <div>
              <label for="notedByTitle" class="block text-sm font-medium text-gray-600 mb-2">Noted By Title *</label>
              <input
                v-model="editableReportContent.notedBy.title"
                type="text"
                id="notedByTitle"
                placeholder="e.g., Chief, RCPC"
                class="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400/50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
              />
            </div>
          </div>
        </div>
          <div class="flex justify-end space-x-3">
          <button
            @click="showEditReportModal = false"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmAndGenerateReport"
            :disabled="!isReportEditFormValid"
            class="px-4 py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl disabled:cursor-not-allowed transition-colors font-medium"
          >
            Confirm & Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Report Preview Modal -->
    <div v-if="showReportPreviewModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-5xl p-6 relative max-h-[95vh] overflow-hidden flex flex-col">
        <button @click="closeReportPreview" class="absolute top-3 right-3 text-gray-400 hover:text-white z-10">
          <XIcon class="h-6 w-6" />
        </button>
        <h3 class="text-xl font-bold text-emerald-400 mb-4">Report Preview</h3>
        <p class="text-gray-300 mb-6">Review your report before downloading or printing.</p>

        <!-- Scrollable Preview Area -->
        <div id="report-preview-content" class="flex-1 overflow-y-auto border border-gray-700 rounded-lg bg-white text-black">
          <div class="report-content-wrapper">
            <ReportContentDisplay
              :report-data="editableReportContent"
              :scan-data="scansToIncludeInReportPreview"
              :report-type="reportActionType"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <!-- Export Dropdown -->
          <div class="relative">
            <button
              @click="toggleExportDropdown"
              :disabled="isGeneratingPdf || !isReportPreviewReady"
              class="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors text-white font-medium"
            >
              <Loader2Icon v-if="isGeneratingPdf" class="animate-spin h-5 w-5 mr-2" />
              <DownloadIcon v-else class="h-5 w-5 mr-2" />
              Export <ChevronDownIcon class="ml-2 h-4 w-4" />
            </button>
            <div v-if="showExportDropdown" class="absolute bottom-full mb-2 right-0 w-40 bg-gray-700 rounded-md shadow-lg z-20">
              <button
                @click="downloadPdfFromPreview"
                class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-md"
              >
                Download PDF
              </button>
            </div>
          </div>

          <button
            @click="printFromPreview"
            :disabled="!isReportPreviewReady"
            class="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors text-white font-medium"
          >
            <PrinterIcon class="h-5 w-5 mr-2" />
            Print
          </button>
        </div>
      </div>
    </div>

    <!-- Image View Modal -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button @click="showImageModal = false" class="absolute top-3 right-3 text-gray-600 hover:text-gray-600/50">
          <XIcon class="h-6 w-6" />
        </button>
        <h3 class="text-xl font-bold text-[#606c38] mb-4">Scan Image</h3>
        <div v-if="currentDiseaseName" class="text-center mb-2">
          <p class="text-lg font-medium text-gray-700">{{ currentDiseaseName }}</p>
        </div>
        <div class="flex justify-center">
          <img :src="currentImageUrl || '/placeholder.svg'" alt="Scan Image" class="max-w-full h-auto rounded-md shadow-lg" />
        </div>
      </div>
    </div>

    <!-- PDF Generation Loading Modal -->
    <div v-if="isGeneratingPdf" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <Loader2Icon class="animate-spin h-12 w-12 text-emerald-400 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-white mb-2">Generating PDF Report</h3>
        <p class="text-gray-300">Please wait while we prepare your report...</p>
      </div>
    </div>

    <!-- Print View Container (Hidden, used for window.print()) -->
    <div id="report-print-content" class="report-print-container" :class="{ 'is-visible-for-capture': showPrintView }">
      <div class="report-content-wrapper">
        <ReportContentDisplay 
          :report-data="editableReportContent" 
          :scan-data="scansToIncludeInReportPreview" 
          :report-type="reportActionType" 
        />
      </div>
    </div>
    
    <!-- Page Loader -->
    <PageLoader :is-loading="loadingData" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import ReportContentDisplay from '../../components/professional/ReportContentDisplay.vue';
import PageLoader from '../../components/professional/PageLoader.vue';

import { DownloadIcon, PrinterIcon, FilterIcon, BarChartIcon, TableIcon, Loader2Icon, CheckCircleIcon, CloudRainIcon, ThermometerIcon, WindIcon, DropletIcon, CameraIcon, CpuIcon, XIcon, ChevronDownIcon, SearchCheck, AlertTriangle, Users } from 'lucide-vue-next';

const router = useRouter();
const auth = getAuth();

// All reactive refs declared at top level
const currentUserUid = ref(null);
const authUnsubscribe = ref(null);
const firstName = ref('Guest');
const lastName = ref('User');
const email = ref('guest@example.com');
const photoURL = ref(null);
const showSignOutConfirmation = ref(false);
const allUsers = ref([]);
const allScanHistoryForUser = ref([]);
const loadingData = ref(true);
const loadingUsers = ref(true);
const currentPage = ref(1);
const isGeneratingReport = ref(false);
const isGeneratingPdf = ref(false);
const showEditReportModal = ref(false);
const reportActionType = ref('');
const showImageModal = ref(false);
const currentImageUrl = ref('');
const currentDiseaseName = ref('');
const showPrintView = ref(false);
const showReportPreviewModal = ref(false);
const isReportPreviewReady = ref(false);
const showExportDropdown = ref(false);
const selectedScans = ref([]);
const scansToIncludeInReportPreview = ref([]);

const reportConfig = ref({
  title: 'Pest & Disease Detection Report',
  remarks: '',
  includeChartSnapshot: false,
  pestReports: [],
  contactInfo: {
    name: '',
    title: '',
    phone1: '',
    phone2: '',
    email: ''
  },
  preparedBy: {
    name: '',
    title: ''
  },
  notedBy: {
    name: '',
    title: ''
  }
});

const editableReportContent = ref({
  title: '',
  remarks: '',
  pestReports: [],
  contactInfo: { ...reportConfig.value.contactInfo },
  preparedBy: { ...reportConfig.value.preparedBy },
  notedBy: { ...reportConfig.value.notedBy }
});

const filters = ref({
  startDate: '',
  endDate: '',
  municipality: '',
  barangay: '',
  plantType: '',
  detectedIssue: '',
  severity: '',
  userId: '',
});

// All computed properties
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`;
  }
  return firstName.value || 'Professional';
});

const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'P';
});

const notificationCount = computed(() => {
  return 0; // Can be updated with real notification logic
});

const itemsPerPage = 5;

const filteredScanHistory = computed(() => {
  let filteredData = [...allScanHistoryForUser.value];

  if (filters.value.startDate) {
    const startDateTime = new Date(filters.value.startDate).getTime();
    filteredData = filteredData.filter(scan => {
      const scanTimestamp = scan.timestamp && typeof scan.timestamp.toDate === 'function' ? scan.timestamp.toDate().getTime() : new Date(scan.timestamp).getTime();
      return scanTimestamp >= startDateTime;
    });
  }
  if (filters.value.endDate) {
    const endDateTime = new Date(filters.value.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    const endDateTimeMs = endDateTime.getTime();
    filteredData = filteredData.filter(scan => {
      const scanTimestamp = scan.timestamp && typeof scan.timestamp.toDate === 'function' ? scan.timestamp.toDate().getTime() : new Date(scan.timestamp).getTime();
      return scanTimestamp <= endDateTimeMs;
    });
  }

  if (filters.value.municipality && filters.value.municipality !== '') {
    filteredData = filteredData.filter(scan => (scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality) === filters.value.municipality);
  }
  if (filters.value.barangay && filters.value.barangay !== '') {
    filteredData = filteredData.filter(scan => (scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay) === filters.value.barangay);
  }
  if (filters.value.plantType && filters.value.plantType !== '') {
    filteredData = filteredData.filter(scan => scan.plantType === filters.value.plantType);
  }
  if (filters.value.detectedIssue && filters.value.detectedIssue !== '') {
    filteredData = filteredData.filter(scan => (scan.diseaseDetails?.name || scan.disease) === filters.value.detectedIssue);
  }
  if (filters.value.severity && filters.value.severity !== '') {
    filteredData = filteredData.filter(scan => scan.severity === filters.value.severity);
  }

  return filteredData;
});

const uniqueMunicipalities = computed(() => {
  const municipalities = new Set(allScanHistoryForUser.value.map(scan => scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality).filter(Boolean));
  return [...municipalities].sort();
});

const uniqueBarangays = computed(() => {
  const barangays = new Set(allScanHistoryForUser.value.map(scan => scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay).filter(Boolean));
  return [...barangays].sort();
});

const uniquePlantTypes = computed(() => {
  const plantTypes = new Set(allScanHistoryForUser.value.map(scan => scan.plantType).filter(Boolean));
  return [...plantTypes].sort();
});

const uniqueDetectedIssues = computed(() => {
  const issues = new Set(allScanHistoryForUser.value.map(scan => scan.diseaseDetails?.name || scan.disease).filter(Boolean));
  return [...issues].sort();
});

const uniqueUsers = computed(() => {
  const usersInDropdown = allUsers.value.map(user => ({
    id: user.authUid,
    name: user.displayName || user.email || 'Unknown User'
  }));

  if (currentUserUid.value && !usersInDropdown.some(u => u.id === currentUserUid.value)) {
    usersInDropdown.push({ id: currentUserUid.value, name: userDisplayName.value || 'Current User' });
  }

  const unique = {};
  usersInDropdown.forEach(user => {
    unique[user.id] = user;
  });
  return Object.values(unique).sort((a, b) => a.name.localeCompare(b.name));
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredScanHistory.value.length / itemsPerPage)));

const paginatedScanHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredScanHistory.value.slice(start, end);
});

const paginationStart = computed(() => {
  return filteredScanHistory.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredScanHistory.value.length);
});

const reportSummary = computed(() => {
  const data = filteredScanHistory.value;

  const totalDetections = data.length;
  const issueCounts = {};
  const locationCounts = {};
  const uniqueUserIds = new Set();
  const uniqueFarmNames = new Set();
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  data.forEach(scan => {
    const issueName = scan.diseaseDetails?.name || scan.disease;
    const scientificName = scan.diseaseDetails?.scientificName || '';
    if (issueName && issueName !== 'None') {
      if (!issueCounts[issueName]) {
        issueCounts[issueName] = { count: 0, type: scan.diseaseDetails?.category || 'Unknown', scientificName: scientificName };
      }
      issueCounts[issueName].count++;
    }

    if (scan.severity === 'High') highRiskCount++;
    else if (scan.severity === 'Medium') mediumRiskCount++;
    else if (scan.severity === 'Low') lowRiskCount++;

    const barangayName = scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay;
    const municipalityName = scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality;
    const locationName = `${barangayName || 'N/A'}, ${municipalityName || 'N/A'}`;

    if (locationName && locationName !== 'N/A, N/A') {
      if (!locationCounts[locationName]) {
        locationCounts[locationName] = 0;
      }
      locationCounts[locationName]++;
    }

    if (scan.userId) {
      uniqueUserIds.add(scan.userId);
    }
    if (scan.userLocationDetails?.farmName) {
      uniqueFarmNames.add(scan.userLocationDetails.farmName);
    }
  });

  const topIssues = Object.entries(issueCounts)
    .map(([name, data]) => ({ name, count: data.count, type: data.type, scientificName: data.scientificName }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topLocations = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  let overallRiskLevel = 'N/A';
  if (highRiskCount > 0) {
    overallRiskLevel = 'High';
  } else if (mediumRiskCount > 0) {
    overallRiskLevel = 'Medium';
  } else if (lowRiskCount > 0) {
    overallRiskLevel = 'Medium';
  } else if (lowRiskCount > 0) {
    overallRiskLevel = 'Low';
  }

  return {
    totalDetections,
    overallRiskLevel,
    topIssues,
    topLocations,
    uniqueUsersCount: uniqueUserIds.size,
    uniqueFarmsCount: uniqueFarmNames.size,
  };
});

const isAllSelected = computed(() => {
  if (paginatedScanHistory.value.length === 0) return false;
  return paginatedScanHistory.value.every(scan => selectedScans.value.includes(scan.analysisId));
});

const isAnySelected = computed(() => {
  return paginatedScanHistory.value.some(scan => selectedScans.value.includes(scan.analysisId));
});

const isReportEditFormValid = computed(() => {
  if (!editableReportContent.value.title.trim()) return false;
  if (!editableReportContent.value.contactInfo.name.trim()) return false;
  if (!editableReportContent.value.contactInfo.title.trim()) return false;
  if (!editableReportContent.value.preparedBy.name.trim()) return false;
  if (!editableReportContent.value.preparedBy.title.trim()) return false;
  if (!editableReportContent.value.notedBy.name.trim()) return false;
  if (!editableReportContent.value.notedBy.title.trim()) return false;

  if (reportActionType.value === 'specific' && editableReportContent.value.pestReports.length > 0) {
    for (const pestReport of editableReportContent.value.pestReports) {
      if (!pestReport.description.trim()) return false;
      if (!pestReport.recommendations.trim()) return false;
    }
  }
  return true;
});

// All function declarations
const formatDate = (timestamp) => {
  const date = timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchAllUsers = async () => {
  loadingUsers.value = true;
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const querySnapshot = await getDocs(q);
    allUsers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    allUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const fetchAllScanHistoryForUser = async () => {
  loadingData.value = true;
  try {
    let baseQuery = collection(db, 'scan_history');
    let queryConstraints = [];

    if (filters.value.userId !== '') {
      queryConstraints.push(where('userId', '==', filters.value.userId));
    }

    queryConstraints.push(orderBy('timestamp', 'desc'));

    const finalQuery = query(baseQuery, ...queryConstraints);
    const querySnapshot = await getDocs(finalQuery);

    allScanHistoryForUser.value = querySnapshot.docs.map(doc => ({
      analysisId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all scan history for user:", error);
    allScanHistoryForUser.value = [];
  } finally {
    loadingData.value = false;
    currentPage.value = 1;
    selectedScans.value = [];
  }
};

const getUserDisplayName = (userId) => {
  if (userId === currentUserUid.value) {
    return userDisplayName.value;
  }
  const user = allUsers.value.find(u => u.authUid === userId);
  return user ? (user.displayName || user.email || 'Unknown User') : 'Unknown User';
};

const clearFilters = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

  filters.value = {
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    municipality: '',
    barangay: '',
    plantType: '',
    detectedIssue: '',
    severity: '',
    userId: '',
  };
  reportConfig.value.title = 'Pest & Disease Detection Report';
  reportConfig.value.remarks = '';
  reportConfig.value.includeChartSnapshot = false;
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

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    paginatedScanHistory.value.forEach(scan => {
      if (!selectedScans.value.includes(scan.analysisId)) {
        selectedScans.value.push(scan.analysisId);
      }
    });
  } else {
    paginatedScanHistory.value.forEach(scan => {
      const index = selectedScans.value.indexOf(scan.analysisId);
      if (index > -1) {
        selectedScans.value.splice(index, 1);
      }
    });
  }
};

const toggleScanSelection = (analysisId) => {
  const index = selectedScans.value.indexOf(analysisId);
  if (index > -1) {
    selectedScans.value.splice(index, 1);
  } else {
    selectedScans.value.push(analysisId);
  }
};

const getScansForReport = () => {
  if (selectedScans.value.length > 0) {
    return filteredScanHistory.value.filter(scan => selectedScans.value.includes(scan.analysisId));
  }
  return filteredScanHistory.value;
};

const preparePestReportsForEdit = () => {
  const scansToReport = getScansForReport();
  const uniquePests = {};

  scansToReport.forEach(scan => {
    const pestName = scan.diseaseDetails?.name || scan.disease;
    const scientificName = scan.diseaseDetails?.scientificName || '';
    if (pestName && pestName !== 'None') {
      if (!uniquePests[pestName]) {
        uniquePests[pestName] = {
          pestName: pestName,
          pestScientificName: scientificName,
          description: '',
          recommendations: '',
          actionsTaken: '',
        };
      }
    }
  });

  const currentEditablePestReports = editableReportContent.value.pestReports;
  const newPestReports = Object.values(uniquePests).map(newPest => {
    const existing = currentEditablePestReports.find(p => p.pestName === newPest.pestName);
    return existing ? { ...existing, pestScientificName: newPest.pestScientificName } : newPest;
  });

  editableReportContent.value.pestReports = newPestReports;
};

const openReportEditModal = async () => {
  isGeneratingReport.value = true;

  if (selectedScans.value.length > 0) {
    reportActionType.value = 'specific';
  } else if (filteredScanHistory.value.length > 0) {
    reportActionType.value = 'general';
  } else {
    alert('No records available to generate a report. Please adjust filters or select records.');
    isGeneratingReport.value = false;
    return;
  }

  editableReportContent.value.title = reportConfig.value.title;
  editableReportContent.value.remarks = reportConfig.value.remarks;
  editableReportContent.value.contactInfo = { ...reportConfig.value.contactInfo };
  editableReportContent.value.preparedBy = { ...reportConfig.value.preparedBy };
  editableReportContent.value.notedBy = { ...reportConfig.value.notedBy };
  editableReportContent.value.includeChartSnapshot = reportConfig.value.includeChartSnapshot;

  if (reportActionType.value === 'specific') {
    preparePestReportsForEdit();
  } else {
    editableReportContent.value.pestReports = [];
  }

  isGeneratingReport.value = false;
  showEditReportModal.value = true;
};

const confirmAndGenerateReport = async () => {
  if (!isReportEditFormValid.value) {
    alert('Please fill in all required fields in the customization form.');
    return;
  }

  reportConfig.value.title = editableReportContent.value.title;
  reportConfig.value.remarks = editableReportContent.value.remarks;
  reportConfig.value.pestReports = editableReportContent.value.pestReports;
  reportConfig.value.contactInfo = { ...editableReportContent.value.contactInfo };
  reportConfig.value.preparedBy = { ...editableReportContent.value.preparedBy };
  reportConfig.value.notedBy = { ...editableReportContent.value.notedBy };
  reportConfig.value.includeChartSnapshot = editableReportContent.value.includeChartSnapshot;

  scansToIncludeInReportPreview.value = getScansForReport().map(scan => ({
    ...scan,
    userDisplayName: getUserDisplayName(scan.userId)
  }));

  showEditReportModal.value = false;
  showReportPreviewModal.value = true;

  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 1000));
  isReportPreviewReady.value = true;
};

const downloadPdfFromPreview = async () => {
  isGeneratingPdf.value = true;
  isReportPreviewReady.value = false;
  showExportDropdown.value = false;
  
  try {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('report-preview-content');
    if (!element) {
      throw new Error('Report content element not found');
    }

    element.classList.add('pdf-capture-mode');
    
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 54;

    const detailedScanSection = element.querySelector('.detailed-scan-records-section-print');
    
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: 816,
      windowHeight: 1056
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let detailedScanStartY = 0;
    if (detailedScanSection) {
      const elementRect = element.getBoundingClientRect();
      const sectionRect = detailedScanSection.getBoundingClientRect();
      const sectionOffsetFromTop = sectionRect.top - elementRect.top;
      detailedScanStartY = (sectionOffsetFromTop * pdfWidth) / element.offsetWidth;
    }

    const page1Height = detailedScanSection ? Math.min(detailedScanStartY, pdfHeight - margin) : Math.min(imgHeight, pdfHeight - margin);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

    if (detailedScanSection && detailedScanStartY < imgHeight) {
      pdf.addPage();
      const yOffset = -detailedScanStartY;
      pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight, undefined, 'FAST');
      
      let remainingHeight = imgHeight - detailedScanStartY - pdfHeight;
      let pageCount = 2;
      
      while (remainingHeight > 0) {
        pdf.addPage();
        const additionalYOffset = -(detailedScanStartY + (pdfHeight * (pageCount - 1)));
        pdf.addImage(imgData, 'JPEG', 0, additionalYOffset, imgWidth, imgHeight, undefined, 'FAST');
        remainingHeight -= pdfHeight;
        pageCount++;
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportConfig.value.title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;
    
    pdf.save(filename);
    
    element.classList.remove('pdf-capture-mode');
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert('Failed to generate PDF report. Please try again.');
  } finally {
    isGeneratingPdf.value = false;
    showReportPreviewModal.value = false;
    isReportPreviewReady.value = false;
  }
};

const printFromPreview = async () => {
  isReportPreviewReady.value = false;
  showExportDropdown.value = false;
  showPrintView.value = true;
  
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 800));

  const printContent = document.getElementById('report-print-content');
  if (printContent) {
    printContent.classList.add('print-ready');
    
    const detailedScanSection = printContent.querySelector('.detailed-scan-records-section-print');
    if (detailedScanSection) {
      detailedScanSection.style.pageBreakBefore = 'always';
      detailedScanSection.style.breakBefore = 'page';
    }
  }

  window.print();

  setTimeout(() => {
    showPrintView.value = false;
    showReportPreviewModal.value = false;
    isReportPreviewReady.value = false;
    if (printContent) {
      printContent.classList.remove('print-ready');
    }
  }, 1000);
};

const viewImage = (imageUrl, diseaseName = '') => {
  currentImageUrl.value = imageUrl;
  currentDiseaseName.value = diseaseName;
  showImageModal.value = true;
};

const closeReportPreview = () => {
  showReportPreviewModal.value = false;
  isReportPreviewReady.value = false;
  showExportDropdown.value = false;
};

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value;
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/professional/profile');
};

const handleSignOut = async () => {
  try {
    console.log("Signing out...");
    
    // First close the confirmation dialog
    showSignOutConfirmation.value = false;
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    console.log("Cleared user data from localStorage");
    
    // Sign out from Firebase Auth
    await signOut(auth);
    console.log("Sign out successful");
    
    // Force immediate navigation to sign in page using window.location
    // This ensures a complete page reload and fresh authentication state
    window.location.href = '/signin';
    
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Lifecycle hooks at the end
onMounted(async () => {
  authUnsubscribe.value = onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserUid.value = user.uid;
      
      // Fetch user profile data from Firestore
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("authUid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          firstName.value = userData.firstName || '';
          lastName.value = userData.lastName || '';
          email.value = userData.email || user.email;
          photoURL.value = userData.photoURL || null;
        } else {
          // Fallback if the user document isn't in Firestore
          email.value = user.email || '';
          const nameParts = user.displayName?.split(' ') || [];
          firstName.value = nameParts[0] || '';
          lastName.value = nameParts.slice(1).join(' ') || '';
        }
      } catch (error) {
        console.error("Failed to fetch user profile from Firestore:", error);
        // Use basic auth info as a fallback on error
        email.value = user.email || '';
        const nameParts = user.displayName?.split(' ') || [];
        firstName.value = nameParts[0] || '';
        lastName.value = nameParts.slice(1).join(' ') || '';
      }
      
      await fetchAllUsers();
      await fetchAllScanHistoryForUser();
      
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      filters.value.startDate = thirtyDaysAgo.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
    } else {
      router.push('/auth/signin');
    }
  });
});

onUnmounted(() => {
  if (authUnsubscribe.value) {
    authUnsubscribe.value();
  }
});

watch(() => filters.value.userId, () => {
  fetchAllScanHistoryForUser();
});
</script>

<style scoped>

/* Enhanced print and PDF styles with proper page breaks for detailed scan records */
.report-print-container {
  font-family: 'Times New Roman', serif;
  background-color: white;
  color: black;
  line-height: 1.4;
  font-size: 12pt; /* Standard report font size */
  width: 8.5in;
  min-height: 11in;
  margin: 0 auto;
  padding: 0.75in;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: -9999px;
  top: -9999px;
  z-index: -1;
}

.report-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

/* Force detailed scan records to always start on page 2 */
.detailed-scan-records-section-print {
  page-break-before: always !important;
  break-before: page !important;
  margin-top: 0 !important;
  padding-top: 1.5em;
  font-size: 12pt !important; /* Ensure 12pt font for detailed records */
}

.scan-detail-block-print {
  font-size: 12pt !important;
  margin-bottom: 1.2em;
  padding-bottom: 0.8em;
  border-bottom: 1px dashed #ddd;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

.scan-detail-heading-print {
  font-size: 12pt !important;
  font-weight: bold;
  color: #000 !important;
  margin-bottom: 0.6em;
}

.scan-detail-grid-print {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4em 0.8em;
  font-size: 12pt !important;
  color: #333 !important;
  line-height: 1.3;
}


/* Enhanced print media queries with proper page break controls */
@media print {
  body > *:not(.report-print-container) {
    display: none !important;
  }

  .report-print-container {
    display: block !important;
    position: static !important;
    left: auto !important;
    top: auto !important;
    z-index: 9999 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background-color: white !important;
    color: black !important;
  }

  .report-content-wrapper {
    margin: 0.75in auto;
    padding: 0.75in;
    box-shadow: none !important;
    background-color: #fff !important;
    color: #000 !important;
  }

  /* Force detailed scan records to always start on page 2 in print */
  .detailed-scan-records-section-print {
    page-break-before: always !important;
    break-before: page !important;
    font-size: 12pt !important;
  }

  .scan-detail-block-print {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    font-size: 12pt !important;
  }

  .scan-detail-grid-print {
    font-size: 12pt !important;
  }

  /* Better page break controls */
  .pest-report-section-print, 
  .signature-section-print,
  .report-header-print {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .pest-type-heading-print,
  .section-content-print h4 {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Ensure 1 copy default */
  @page {
    size: letter;
    margin: 0.75in;
  }
}

/* PDF capture mode for better rendering */
#report-preview-content.pdf-capture-mode {
  font-family: 'Times New Roman', serif !important;
  background-color: white !important;
  color: black !important;
  line-height: 1.4 !important;
  font-size: 12pt !important;
  padding: 0.75in !important;
  box-sizing: border-box !important;
  width: 8.5in !important;
  overflow: visible !important;
  height: auto !important;
}

#report-preview-content.pdf-capture-mode .detailed-scan-records-section-print {
  font-size: 12pt !important;
}

#report-preview-content.pdf-capture-mode .scan-detail-block-print {
  font-size: 12pt !important;
}

#report-preview-content.pdf-capture-mode .scan-detail-grid-print {
  font-size: 12pt !important;
}

</style>
