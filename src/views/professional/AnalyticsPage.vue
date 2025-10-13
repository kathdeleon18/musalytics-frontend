<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16" @click="closeExportDropdown">
    <ProfessionalNavbar 
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :photoURL="photoURL"
      @manage-profile="goToProfile"
      @sign-out="showSignOutConfirmation = true"
    />
    
    <div class="pt-8 md:pl-64 flex">
      <ProfessionalSidebar />
      
      <main class="flex-1 p-6 overflow-auto">
        <!-- Reduced padding from p-8 to p-4 and removed max-width constraint -->
        <div class="w-full">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4">
            <div>
              <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Analytics Dashboard</h1>
              <p class="text-sm sm:text-base text-gray-400">Visualize and analyze pest and disease detection data</p>
            </div>
            <div class="flex flex-wrap gap-3 mt-6 md:mt-0 relative">
              <div class="relative">
                <button
                  @click.stop="showExportDropdown = !showExportDropdown"
                  :disabled="filteredScans.length === 0"
                  class="flex items-center justify-center px-7 py-3 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-white text-base"
                >
                  <DownloadIcon class="h-5 w-5 mr-2" />
                  Export Data
                  <ChevronDownIcon class="h-4 w-4 ml-2" />
                </button>
                
                <!-- Export Dropdown Menu -->
                <div
                  v-if="showExportDropdown"
                  class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  @click.stop
                >
                  <div class="py-2">
                    <button
                      @click="exportCSV(); closeExportDropdown()"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FileText class="h-5 w-5 mr-3 text-green-600" />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">Data Export (CSV)</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Export detailed scan data as CSV file</div>
                      </div>
                    </button>
                    
                    <button
                      @click="exportPDF(); closeExportDropdown()"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FileText class="h-5 w-5 mr-3 text-red-600" />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">Analytics Report (PDF)</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Export analytics report with charts</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-lg p-6 ">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Total Scans</p>
                  <p class="text-3xl font-bold">{{ totalScans }}</p>
                </div>
                <div class="bg-blue-500/20 p-3 rounded-full">
                  <BarChart3 class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Active Users</p>
                  <p class="text-3xl font-bold">{{ activeUsers }}</p>
                </div>
                <div class="bg-green-500/20 p-3 rounded-full">
                  <Users class="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Diseases Detected</p>
                  <p class="text-3xl font-bold">{{ uniqueDiseases }}</p>
                </div>
                <div class="bg-red-500/20 p-3 rounded-full">
                  <AlertTriangle class="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Avg Confidence</p>
                  <p class="text-3xl font-bold">{{ averageConfidence }}%</p>
                </div>
                <div class="bg-yellow-500/20 p-3 rounded-full">
                  <Zap class="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs Navigation -->
          <div class="flex space-x-2 mb-8">
            <button
              @click="selectedTab = 'overview'"
              :class="{ 'bg-[#606c38] text-white': selectedTab === 'overview', 'text-gray-600 hover:bg-gray-400/20': selectedTab !== 'overview' }"
              class="px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Overview
            </button>
            <button
              @click="selectedTab = 'trends'"
              :class="{ 'bg-[#606c38] text-white': selectedTab === 'trends', 'text-gray-600 hover:bg-gray-400/20': selectedTab !== 'trends' }"
              class="px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Trends
            </button>
            <button
              @click="selectedTab = 'mapView'"
              :class="{ 'bg-[#606c38] text-white': selectedTab === 'mapView', 'text-gray-600 hover:bg-gray-400/20': selectedTab !== 'mapView' }"
              class="px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Map View
            </button>
            <button
              @click="selectedTab = 'userActivity'"
              :class="{ 'bg-[#606c38] text-white': selectedTab === 'userActivity', 'text-gray-600 hover:bg-gray-400/20': selectedTab !== 'userActivity' }"
              class="px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              User Activity
            </button>
          </div>

          <!-- Main Content Grid -->
          <!-- Adjusted grid layout for better full-screen utilization -->
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <!-- Filters Section -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center mb-4">
                  <FilterIcon class="w-5 h-5 text-[#283618] mr-2" />
                  <h3 class="text-lg font-semibold text-[#283618]">Filters</h3>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
                    <div class="flex space-x-2">
                      <input type="date" v-model="filters.dateRange.start" class="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <input type="date" v-model="filters.dateRange.end" class="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
                    <select v-model="filters.municipality" class=" py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="municipality in uniqueMunicipalities" :key="municipality" :value="municipality">{{ municipality }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Plant Type</label>
                    <select v-model="filters.plantType" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="plantType in uniquePlantTypes" :key="plantType" :value="plantType">{{ plantType }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Disease</label>
                    <select v-model="filters.disease" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="disease in uniqueDiseasesArray" :key="disease" :value="disease">{{ disease }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Severity Level</label>
                    <select v-model="filters.severity" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl  text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div class="pt-4 border-t border-gray-400/50">
                    <button @click="clearFilters" class="w-full px-4 py-2 text-red-600 hover:text-red-600/50 transition-all text-sm font-medium">Clear Filters</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visualizations Section -->
            <div class="lg:col-span-4">
              <div class="bg-white shadow-lg rounded-xl p-6  mb-6">
                <div class="flex items-center mb-6">
                  <LineChartIcon class="w-5 h-5 text-[#283618] mr-2" />
                  <h3 class="text-lg font-semibold text-[#283618]">Visualizations</h3>
                </div>
                <div v-if="filteredScans.length === 0" class="text-center py-12">
                  <div class="text-gray-500 text-lg mb-4">No data available for charts</div>
                  <p class="text-gray-400">Adjust your filters or check back when scan data is available.</p>
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-white rounded-xl p-4 border border-gray-400/50">
                    <h4 class="text-md font-semibold text-gray-600 mb-3">Detections by Type</h4>
                    <div class="h-64 flex items-center justify-center">
                      <canvas ref="scanCategoriesChartCanvas"></canvas>
                    </div>
                  </div>
                  <div class="bg-white rounded-xl p-4 border border-gray-400/50">
                    <h4 class="text-md font-semibold text-gray-600 mb-3">Severity Distribution</h4>
                    <div class="h-64 flex items-center justify-center">
                      <canvas ref="severityDistributionChartCanvas"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Scans Section -->
              <div class="bg-white rounded-xl shadow-lg p-6 ">
                <h3 class="text-lg font-semibold text-[#283618] mb-4">Recent Scans</h3>
                
                <!-- Added proper pagination controls and improved table layout -->
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="bg-[#283618] border border-gray-400">
                        <th class="text-left py-3 px-2 text-white">Date</th>
                        <th class="text-left py-3 px-2 text-white">Plant Type</th>
                        <th class="text-left py-3 px-2 text-white">Disease</th>
                        <th class="text-left py-3 px-2 text-white">Confidence</th>
                        <th class="text-left py-3 px-2 text-white">Location</th>
                        <th class="text-left py-3 px-2 text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="scan in paginatedScans" :key="scan.analysisId" class="border border-gray-400 hover:bg-[#f7f2df] transition-colors">
                        <td class="py-3 px-2">{{ formatDate(scan.timestamp) }}</td>
                        <td class="py-3 px-2 capitalize">{{ scan.plantType?.replace(/_/g, ' ') || 'N/A' }}</td>
                        <td class="py-3 px-2 capitalize">{{ scan.disease?.replace(/_/g, ' ') || 'N/A' }}</td>
                        <td class="py-3 px-2">
                          <span class="px-2 py-1 rounded-full text-xs" :class="getConfidenceColor(scan.confidence)">
                            {{ Math.round(scan.confidence || 0) }}%
                          </span>
                        </td>
                        <td class="py-3 px-2">{{ scan.userLocationDetails?.municipality || 'N/A' }}</td>
                        <td class="py-3 px-2">
                          <button @click="selectedScan = scan" class="text-blue-600 hover:text-blue-600/50 text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Enhanced pagination controls with better styling -->
                <div class="bg-[#f7f2df] px-6 py-4 flex items-center justify-between mt-6 pt-4">
                  <div class="text-sm text-gray-400">
                    Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredScans.length) }} of {{ filteredScans.length }} results
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="currentPage = Math.max(1, currentPage - 1)"
                      :disabled="currentPage === 1"
                      class="px-3 py-1 text-sm text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                    >
                      Previous
                    </button>
                    <span class="px-3 py-1 bg-[#606c38] text-white rounded text-sm">
                      {{ currentPage }}
                    </span>
                    <span class="text-gray-400 text-sm">of {{ totalPages }}</span>
                    <button 
                      @click="currentPage = Math.min(totalPages, currentPage + 1)"
                      :disabled="currentPage === totalPages"
                      class="px-3 py-1 text-sm text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reduced bottom padding -->
        <div class="pb-4"></div>
      </main>
    </div>

    <!-- Scan Details Modal -->
    <div v-if="selectedScan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="selectedScan = null">
      <div class="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl text-[#283618] font-semibold">Scan Details</h3>
          <button @click="selectedScan = null" class="text-gray-600 hover:text-gray-600/50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: Basic Scan Information -->
          <div>
            <img v-if="selectedScan.imageUrl" :src="selectedScan.imageUrl" alt="Scan Image" class="w-full h-48 object-cover rounded-xl shadow mb-4">
            
            <div class="space-y-3">
              <div>
                <label class="text-gray-400 text-sm">Analysis ID:</label>
                <p class="text-gray-600">{{ selectedScan.analysisId }}</p>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Plant Type:</label>
                <p class="text-gray-600">{{ selectedScan.plantType }}</p>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Disease:</label>
                <p class="text-gray-600">{{ formatDiseaseName(selectedScan.disease) }}</p>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Severity:</label>
                <span :class="getSeverityColor(selectedScan.severity)" class="px-3 py-1 text-xs font-medium rounded-full">
                  {{ selectedScan.severity }}
                </span>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Confidence:</label>
                <p class="text-gray-600">{{ Math.round(selectedScan.confidence) }}%</p>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Location:</label>
                <p class="text-gray-600">{{ selectedScan.userLocationDetails?.municipality || 'N/A' }}, {{ selectedScan.userLocationDetails?.barangay || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Date:</label>
                <p class="text-gray-600">{{ formatDate(selectedScan.timestamp) }}</p>
              </div>
            </div>
            
            <div v-if="selectedScan.description" class="mt-4">
              <label class="text-gray-400 text-sm">Description:</label>
              <p class="text-gray-600 mt-1">{{ selectedScan.description }}</p>
            </div>
            
            <div v-if="selectedScan.notes" class="mt-4">
              <label class="text-gray-400 text-sm">Notes:</label>
              <p class="text-white mt-1">{{ selectedScan.notes }}</p>
            </div>
            
            <div v-if="selectedScan.weather" class="mt-4">
              <label class="text-gray-400 text-sm">Weather Conditions:</label>
              <div class="text-white mt-1">
                <p>Temperature: {{ selectedScan.weather.temperature }}°C</p>
                <p>Humidity: {{ selectedScan.weather.humidity }}%</p>
                <p>Wind Speed: {{ selectedScan.weather.windSpeed }} km/h</p>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Disease Management Information -->
          <!-- Added comprehensive disease management information from diseases collection -->
          <div v-if="selectedScan.diseaseManagement" class="space-y-4">
            <h4 class="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2">Disease Management Information</h4>
            
            <div v-if="selectedScan.diseaseManagement.shortDescription">
              <label class="text-gray-400 text-sm font-medium">Description:</label>
              <p class="text-white mt-1 text-sm">{{ selectedScan.diseaseManagement.shortDescription }}</p>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.scientificName">
              <label class="text-gray-400 text-sm font-medium">Scientific Name:</label>
              <p class="text-white mt-1 italic">{{ selectedScan.diseaseManagement.scientificName }}</p>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.symptoms">
              <label class="text-gray-400 text-sm font-medium">Symptoms:</label>
              <div class="text-white mt-1 text-sm" v-html="selectedScan.diseaseManagement.symptoms"></div>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.causes">
              <label class="text-gray-400 text-sm font-medium">Causes:</label>
              <div class="text-white mt-1 text-sm" v-html="selectedScan.diseaseManagement.causes"></div>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.treatment">
              <label class="text-gray-400 text-sm font-medium">Treatment:</label>
              <div class="text-white mt-1 text-sm" v-html="selectedScan.diseaseManagement.treatment"></div>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.prevention">
              <label class="text-gray-400 text-sm font-medium">Prevention:</label>
              <div class="text-white mt-1 text-sm" v-html="selectedScan.diseaseManagement.prevention"></div>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.additionalInfo">
              <label class="text-gray-400 text-sm font-medium">Additional Information:</label>
              <div class="text-white mt-1 text-sm" v-html="selectedScan.diseaseManagement.additionalInfo"></div>
            </div>
            
            <div v-if="selectedScan.diseaseManagement.affectedCrops && selectedScan.diseaseManagement.affectedCrops.length > 0">
              <label class="text-gray-400 text-sm font-medium">Affected Crops:</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="crop in selectedScan.diseaseManagement.affectedCrops" :key="crop" 
                      class="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                  {{ crop }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Fallback for scans without disease management data -->
          <div v-else class="space-y-4">
            <div v-if="selectedScan.preventionTips && selectedScan.preventionTips.length > 0">
              <label class="text-gray-400 text-sm">Prevention Tips:</label>
              <ul class="text-white mt-1 list-disc list-inside">
                <li v-for="tip in selectedScan.preventionTips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
            
            <div v-if="selectedScan.treatments && selectedScan.treatments.length > 0">
              <label class="text-gray-400 text-sm">Treatments:</label>
              <ul class="text-white mt-1 list-disc list-inside">
                <li v-for="treatment in selectedScan.treatments" :key="treatment">{{ treatment }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
    
    <!-- Page Loader -->
    <PageLoader :is-loading="loading" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { collection, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Component imports
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import PageLoader from '../../components/professional/PageLoader.vue';

import {
  DownloadIcon, FilterIcon, BarChartIcon, LineChartIcon, LightbulbIcon, TableIcon, CalendarIcon, ChevronDownIcon, FileText, BarChart3, Users, AlertTriangle, Zap
} from 'lucide-vue-next';

// Import Chart.js
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
Chart.register(...registerables);

export default {
  name: 'AnalyticsDashboard',
  components: {
    ProfessionalNavbar,
    ProfessionalSidebar,
    PageLoader,
    DownloadIcon,
    FilterIcon,
    BarChartIcon,
    LineChartIcon,
    LightbulbIcon,
    TableIcon,
    CalendarIcon,
    ChevronDownIcon,
    FileText,
    BarChart3,
    Users,
    AlertTriangle,
    Zap
  },
  data() {
    return {
      loading: true,
      error: null,
      scans: [],
      users: [],
      diseases: [],
      selectedTab: 'overview',
      currentPage: 1,
      itemsPerPage: 5,
      currentUser: null,
      email: '',
      firstName: '',
      lastName: '',
      photoURL: null,
      showSignOutConfirmation: false,
      showExportDropdown: false,
      filters: {
        dateRange: { start: '', end: '' },
        municipality: 'All',
        plantType: 'All',
        disease: 'All',
        severity: 'All'
      },
      selectedScan: null,
      scanCategoriesChart: null,
      severityDistributionChart: null
    }
  },
  computed: {
    userDisplayName() {
      if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
      }
      return this.firstName || 'Professional';
    },
    userInitials() {
      if (this.firstName && this.lastName) {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`;
      }
      return this.firstName.charAt(0) || 'P';
    },
    notificationCount() {
      return 0; // Can be updated with real notification logic
    },
    uniquePlantTypes() {
      return [...new Set(this.scans.map(scan => scan.plantType).filter(Boolean))];
    },
    uniqueDiseases() {
      const diseaseSet = new Set(this.scans.map(scan => scan.disease).filter(Boolean));
      return diseaseSet.size;
    },
    uniqueDiseasesArray() {
      return [...new Set(this.scans.map(scan => scan.disease).filter(Boolean))];
    },
    uniqueMunicipalities() {
      return [...new Set(this.scans.map(scan => scan.userLocationDetails?.municipality).filter(Boolean))];
    },
    totalScans() {
      return this.scans.length;
    },
    activeUsers() {
      const uniqueUsers = [...new Set(this.scans.map(scan => scan.userId))];
      return uniqueUsers.length;
    },
    averageConfidence() {
      if (this.filteredScans.length === 0) return 0;
      const total = this.filteredScans.reduce((sum, scan) => sum + (scan.confidence || 0), 0);
      return Math.round(total / this.filteredScans.length);
    },
    filteredScans() {
      let filtered = this.scans;

      if (this.filters.plantType !== 'All') {
        filtered = filtered.filter(scan => scan.plantType === this.filters.plantType);
      }

      if (this.filters.disease !== 'All') {
        filtered = filtered.filter(scan => scan.disease === this.filters.disease);
      }

      if (this.filters.severity !== 'All') {
        filtered = filtered.filter(scan => scan.severity === this.filters.severity.toLowerCase());
      }

      if (this.filters.municipality !== 'All') {
        filtered = filtered.filter(scan => scan.userLocationDetails?.municipality === this.filters.municipality);
      }

      if (this.filters.dateRange.start && this.filters.dateRange.end) {
        const startDate = new Date(this.filters.dateRange.start);
        const endDate = new Date(this.filters.dateRange.end);
        filtered = filtered.filter(scan => {
          const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
          return scanDate >= startDate && scanDate <= endDate;
        });
      }

      return filtered.sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB - dateA; // Most recent first
      });
    },
    paginatedScans() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredScans.slice(start, end);
    },
    paginationStart() {
      return this.filteredScans.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredScans.length);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredScans.length / this.itemsPerPage));
    },
    insights() {
      const data = this.filteredScans;
      
      if (data.length === 0) {
        return {
          mostCommonDetection: 'N/A',
          peakScanningPeriod: 'N/A',
          averageConfidence: 'N/A'
        };
      }

      // Most common detection
      const detectionCounts = data.reduce((acc, scan) => {
        const disease = scan.disease || 'Unknown';
        if (disease !== 'healthy' && disease !== 'none') {
          acc[disease] = (acc[disease] || 0) + 1;
        }
        return acc;
      }, {});
      const sortedDetections = Object.entries(detectionCounts).sort(([, a], [, b]) => b - a);
      const mostCommonDetection = sortedDetections.length > 0 ? sortedDetections[0][0] : 'No diseases detected';

      // Peak scanning period
      const dayOfWeekCounts = data.reduce((acc, scan) => {
        const date = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      const sortedDays = Object.entries(dayOfWeekCounts).sort(([, a], [, b]) => b - a);
      const peakScanningPeriod = sortedDays.length > 0 ? `Most scans on ${sortedDays[0][0]}s` : 'N/A';

      // Average confidence
      const confidenceScores = data.map(scan => scan.confidence || 0).filter(conf => conf > 0);
      const averageConfidence = confidenceScores.length > 0 
        ? Math.round(confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length)
        : 'N/A';

      return {
        mostCommonDetection,
        peakScanningPeriod,
        averageConfidence
      };
    }
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;
        
        await Promise.all([
          this.fetchScanHistory(),
          this.fetchUsers(),
          this.fetchDiseases()
        ]);
      } catch (err) {
        this.error = err.message || 'Failed to load data';
      } finally {
        this.loading = false;
      }
    },
    async fetchScanHistory() {
      try {
        this.loading = true;
        const scanHistoryRef = collection(db, 'scan_history');
        const q = query(scanHistoryRef, orderBy('timestamp', 'desc'), limit(1000));
        const querySnapshot = await getDocs(q);
        
        this.scans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('[v0] Fetched scans:', this.scans.length);
      } catch (error) {
        console.error('[v0] Error fetching scan history:', error);
        this.error = 'Failed to fetch scan history';
      } finally {
        this.loading = false;
      }
    },
    async fetchUsers() {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        this.users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          authUid: doc.data().authUid,
          displayName: doc.data().displayName,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          email: doc.data().email,
          location: doc.data().location,
          createdAt: doc.data().createdAt,
          lastLoginAt: doc.data().lastLoginAt,
          isVerified: doc.data().isVerified,
          role: doc.data().role
        }));
        
        console.log('[v0] Fetched users:', this.users.length);
      } catch (error) {
        console.error('[v0] Error fetching users:', error);
      }
    },
    async fetchDiseases() {
      try {
        const diseasesRef = collection(db, 'diseases');
        const querySnapshot = await getDocs(diseasesRef);
        
        this.diseases = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('[v0] Fetched diseases:', this.diseases.length);
      } catch (error) {
        console.error('[v0] Error fetching diseases:', error);
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      
      let date;
      if (timestamp.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatDiseaseName(disease) {
      if (!disease) return 'N/A';
      
      // First try to find the disease in the diseases collection
      const diseaseDoc = this.diseases.find(d => 
        d.name?.toLowerCase().replace(/\s+/g, '_') === disease.toLowerCase() ||
        d.id === disease
      );
      
      if (diseaseDoc && diseaseDoc.name) {
        return diseaseDoc.name;
      }
      
      // Fallback to formatting the raw disease name
      return disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getSeverityColor(severity) {
      switch (severity?.toLowerCase()) {
        case 'high':
          return 'bg-red-500 text-white';
        case 'medium':
          return 'bg-yellow-500 text-black';
        case 'low':
          return 'bg-green-500 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    },
    clearFilters() {
      this.filters = {
        dateRange: { start: '', end: '' },
        municipality: 'All',
        plantType: 'All',
        disease: 'All',
        severity: 'All'
      };
      this.currentPage = 1;
    },
    exportCSV() {
      this.showExportDropdown = false;
      if (this.filteredScans.length === 0) {
        alert('No data to export');
        return;
      }
      
      // Create CSV content
      const headers = ['Analysis ID', 'Plant Type', 'Disease', 'Severity', 'Confidence', 'Location', 'Date'];
      const csvContent = [
        headers.join(','),
        ...this.filteredScans.map(scan => [
          scan.analysisId,
          scan.plantType,
          this.formatDiseaseName(scan.disease),
          scan.severity,
          Math.round(scan.confidence),
          `${scan.userLocationDetails?.municipality || ''}, ${scan.userLocationDetails?.barangay || ''}`.replace(/^, |, $/, '') || 'N/A',
          this.formatDate(scan.timestamp)
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    async exportPDF() {
      this.showExportDropdown = false;
      if (this.filteredScans.length === 0) {
        alert('No data to export');
        return;
      }

      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 15;

        // Add title and header
        pdf.setFontSize(16);
        pdf.setTextColor(16, 185, 129); // emerald color
        pdf.text('Analytics Dashboard Report', 20, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
        
        yPosition += 12;
        pdf.setTextColor(0, 0, 0);

        // Add summary statistics
        pdf.setFontSize(12);
        pdf.text('Summary Statistics', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        const stats = [
          `Total Scans: ${this.totalScans}`,
          `Active Users: ${this.activeUsers}`,
          `Unique Diseases: ${this.uniqueDiseases}`,
          `Average Confidence: ${this.averageConfidence}%`
        ];

        stats.forEach(stat => {
          pdf.text(stat, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 8;

        // Add disease distribution
        pdf.setFontSize(12);
        pdf.text('Disease Distribution', 20, yPosition);
        yPosition += 8;

        const diseaseStats = {};
        this.filteredScans.forEach(scan => {
          const disease = this.formatDiseaseName(scan.disease);
          diseaseStats[disease] = (diseaseStats[disease] || 0) + 1;
        });

        pdf.setFontSize(9);
        Object.entries(diseaseStats).forEach(([disease, count]) => {
          const percentage = ((count / this.filteredScans.length) * 100).toFixed(1);
          pdf.text(`${disease}: ${count} scans (${percentage}%)`, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 8;

        // Add severity distribution
        pdf.setFontSize(12);
        pdf.text('Severity Distribution', 20, yPosition);
        yPosition += 8;

        const severityStats = {};
        this.filteredScans.forEach(scan => {
          severityStats[scan.severity] = (severityStats[scan.severity] || 0) + 1;
        });

        pdf.setFontSize(9);
        Object.entries(severityStats).forEach(([severity, count]) => {
          const percentage = ((count / this.filteredScans.length) * 100).toFixed(1);
          pdf.text(`${severity}: ${count} scans (${percentage}%)`, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 12;

        // Capture charts if they exist
        const chartElements = document.querySelectorAll('canvas');
        if (chartElements.length > 0) {
          pdf.setFontSize(12);
          pdf.text('Data Visualizations', 20, yPosition);
          yPosition += 8;

          for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
            const canvas = chartElements[i];
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 80; // Reduced from 170
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            if (yPosition + imgHeight > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }
            
            // Position charts side by side if possible
            const xPos = i % 2 === 0 ? 20 : 110;
            if (i % 2 === 0 && i > 0) yPosition += 5;
            
            pdf.addImage(imgData, 'PNG', xPos, yPosition, imgWidth, imgHeight);
            
            if (i % 2 === 1 || i === chartElements.length - 1) {
              yPosition += imgHeight + 8;
            }
          }
        }

        // Add new page for detailed data if needed
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        // Add recent scans table
        pdf.setFontSize(12);
        pdf.text('Recent Scan Data', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(8);
        const recentScans = this.filteredScans.slice(0, 15);
        
        // Table headers with better spacing
        const headers = ['Plant Type', 'Disease', 'Severity', 'Confidence', 'Date'];
        const columnWidths = [30, 40, 25, 25, 30];
        let xPosition = 20;
        
        headers.forEach((header, index) => {
          pdf.setFont(undefined, 'bold');
          pdf.text(header, xPosition, yPosition);
          xPosition += columnWidths[index];
        });
        yPosition += 6;

        // Table data
        pdf.setFont(undefined, 'normal');
        recentScans.forEach(scan => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = 20;
          }
          
          xPosition = 20;
          const rowData = [
            (scan.plantType || 'N/A').substring(0, 12),
            this.formatDiseaseName(scan.disease).substring(0, 15),
            (scan.severity || 'N/A').substring(0, 10),
            `${Math.round(scan.confidence)}%`,
            this.formatDate(scan.timestamp).substring(0, 10)
          ];
          
          rowData.forEach((data, index) => {
            pdf.text(String(data), xPosition, yPosition);
            xPosition += columnWidths[index];
          });
          yPosition += 4;
        });

        // Save the PDF
        pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF report. Please try again.');
      }
    },

    closeExportDropdown() {
      this.showExportDropdown = false;
    },

    // Function to navigate to profile page
    goToProfile() {
      this.$router.push('/professional/profile');
    },

    async handleSignOut() {
      try {
        console.log("Signing out...");
        
        // First close the confirmation dialog
        this.showSignOutConfirmation = false;
        
        // Clear user data from localStorage
        localStorage.removeItem('user');
        console.log("Cleared user data from localStorage");
        
        // Sign out from Firebase Auth
        const auth = getAuth();
        await auth.signOut();
        console.log("Sign out successful");
        
        // Force immediate navigation to sign in page using window.location
        // This ensures a complete page reload and fresh authentication state
        window.location.href = '/signin';
        
      } catch (err) {
        console.error("Error signing out:", err);
        alert("Error signing out. Please try again.");
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    viewScanDetails(scan) {
      // Get disease details from diseases collection
      const diseaseDetails = this.getDiseaseDetails(scan.disease);
      
      // Enhance scan object with disease management information
      this.selectedScan = {
        ...scan,
        diseaseManagement: diseaseDetails
      };
    },
    deleteScan(scanId) {
      // Implement delete functionality here
      console.log('Delete scan with ID:', scanId);
    },
    renderCharts() {
      this.renderScanCategoriesChart();
      this.renderSeverityDistributionChart();
    },
    renderScanCategoriesChart() {
      if (this.scanCategoriesChart) {
        this.scanCategoriesChart.destroy();
      }
      
      const canvas = this.$refs.scanCategoriesChartCanvas;
      if (!canvas || this.filteredScans.length === 0) return;
      
      const ctx = canvas.getContext('2d');
      const diseaseData = this.filteredScans.reduce((acc, scan) => {
        const disease = this.formatDiseaseName(scan.disease) || 'Unknown';
        acc[disease] = (acc[disease] || 0) + 1;
        return acc;
      }, {});
      
      this.scanCategoriesChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(diseaseData),
          datasets: [{
            data: Object.values(diseaseData),
            backgroundColor: [
              '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#D1D5DB' }
            }
          }
        }
      });
    },
    renderSeverityDistributionChart() {
      if (this.severityDistributionChart) {
        this.severityDistributionChart.destroy();
      }
      
      const canvas = this.$refs.severityDistributionChartCanvas;
      if (!canvas || this.filteredScans.length === 0) return;
      
      const ctx = canvas.getContext('2d');
      const severityData = this.filteredScans.reduce((acc, scan) => {
        const severity = scan.severity || 'Unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});
      
      this.severityDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(severityData),
          datasets: [{
            label: 'Count',
            data: Object.values(severityData),
            backgroundColor: '#10B981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#D1D5DB' }
            }
          },
          scales: {
            x: {
              ticks: { color: '#D1D5DB' },
              grid: { color: '#374151' }
            },
            y: {
              ticks: { color: '#D1D5DB' },
              grid: { color: '#374151' }
            }
          }
        }
      });
    },
    getDiseaseDetails(diseaseName) {
      return this.diseases.find(d => 
        d.name?.toLowerCase().replace(/\s+/g, '_') === diseaseName.toLowerCase() ||
        d.id === diseaseName
      );
    },
    getConfidenceColor(confidence) {
      if (confidence >= 75) {
        return 'bg-green-500 text-white';
      } else if (confidence >= 50) {
        return 'bg-yellow-500 text-gray-800';
      } else {
        return 'bg-red-500 text-white';
      }
    }
  },
  mounted() {
    // Set up auth listener
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        
        // Fetch user profile data from Firestore
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("authUid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            this.firstName = userData.firstName || '';
            this.lastName = userData.lastName || '';
            this.email = userData.email || user.email;
            this.photoURL = userData.photoURL || null;
          } else {
            // Fallback if the user document isn't in Firestore
            this.email = user.email || '';
            const nameParts = user.displayName?.split(' ') || [];
            this.firstName = nameParts[0] || '';
            this.lastName = nameParts.slice(1).join(' ') || '';
          }
        } catch (error) {
          console.error("Failed to fetch user profile from Firestore:", error);
          // Use basic auth info as a fallback on error
          this.email = user.email || '';
          const nameParts = user.displayName?.split(' ') || [];
          this.firstName = nameParts[0] || '';
          this.lastName = nameParts.slice(1).join(' ') || '';
        }
      }
    });

    // Fetch initial data
    this.fetchData();
    
    // Render charts after data is loaded
    nextTick(() => {
      this.renderCharts();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.closeExportDropdown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeExportDropdown);
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1;
        nextTick(() => {
          this.renderCharts();
        });
      },
      deep: true
    },
    filteredScans() {
      nextTick(() => {
        this.renderCharts();
      });
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
</style>
