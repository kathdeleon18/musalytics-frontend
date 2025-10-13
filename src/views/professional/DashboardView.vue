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
      
      <!-- Main Dashboard Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Welcome Message - Mobile Only -->
        <div class="md:hidden mb-6">
          <h2 class="text-xl font-semibold">Welcome, {{ firstName }}</h2>
          <p class="text-gray-400 text-sm">Professional Dashboard</p>
        </div>
        
        <!-- Error State -->
        <div v-if="error" class="h-[calc(100vh-150px)] flex items-center justify-center">
          <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-lg mx-auto">
            <h3 class="font-medium text-lg mb-2">Error Loading Dashboard</h3>
            <p>{{ error }}</p>
            <button 
              @click="fetchUserData" 
              class="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        
        <!-- Dashboard Content -->
        <div v-else class="space-y-6">
          <!-- Welcome Section - Desktop Only -->
          <div class="hidden md:block">
                       <h2 class="text-4xl font-semibold mb-1">
              <span class="text-[#283618]">Welcome, </span>
              <span class="text-[#ffb902]">{{ firstName }}</span>
            </h2>
            <p class="text-gray-400">Professional Dashboard-System Overview</p>
          </div>
          
          <!-- System Overview Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- First Row: Total Users, Today's Detections, Active Farmers (3 cards) -->
            <!-- Total Users Card -->
            <div class="group relative bg-white shadow rounded-xl p-6  transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-emerald-500/10 rounded-xl">
                  <Users class="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">Total Users</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.totalUsers }}</h3>
                <p class="text-xs text-gray-400">{{ systemStats.professionals }} professionals</p>
              </div>
            </div>
            
            <!-- Today's Detections Card -->
            <div class="group relative bg-white shadow rounded-xl p-6 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-yellow-500/10 rounded-xl">
                  <AlertTriangle class="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">Today's Detections</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.recentDetections }}</h3>
                <p class="text-xs text-gray-400">{{ systemStats.criticalCases }} critical cases</p>
              </div>
            </div>
            
            <!-- Active Farmers Card -->
            <div class="group relative bg-white shadow rounded-xl p-6 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-orange-500/10 rounded-xl">
                  <Users class="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">Active Farmers</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.farmers }}</h3>
                <p class="text-xs text-gray-400">Registered farmers</p>
              </div>
            </div>
            
            <!-- Weather Conditions Card - Spans 2 rows -->
            <div class="group relative overflow-hidden rounded-2xl shadow-lg  transition-all duration-500 lg:row-span-2 weather-card">
              <!-- Minimalist Gradient Background with subtle pattern -->
              <div class="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-cyan-50/80"></div>
              
              <!-- Decorative floating orbs -->
              <div class="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-sky-300/20 to-blue-300/20 rounded-full blur-2xl animate-blob"></div>
              <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full blur-2xl animate-blob animation-delay-2000"></div>
              <div class="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-bl from-indigo-300/15 to-sky-300/15 rounded-full blur-2xl animate-blob animation-delay-4000"></div>
              
              <!-- Subtle grid pattern overlay -->
              <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
              
              <!-- Content -->
              <div class="relative z-10 p-7 h-full flex flex-col">
                <!-- Header with icon -->
                <div class="flex items-start justify-between mb-8">
                  <div class="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 group-hover:scale-110 transition-transform duration-300">
                    <CloudRain class="h-8 w-8 text-sky-600" />
                  </div>
                </div>
                
                <!-- Main content -->
                <div class="flex-1 flex flex-col">
                  <div class="mb-auto">
                    <p class="text-xs text-sky-600/80 font-bold mb-2 uppercase tracking-wider">Weather Conditions</p>
                    <h3 class="text-6xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                      {{ weatherData.temperature }}°C
                    </h3>
                    <div class="inline-flex items-center px-3 py-1.5 bg-sky-500/10 backdrop-blur-sm rounded-full border border-sky-200/50">
                      <div class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse"></div>
                      <p class="text-sm text-sky-700 font-semibold">{{ weatherData.condition }}</p>
              </div>
                  </div>
                  
                  <!-- Weather details -->
                  <div class="space-y-3 mt-8">
                    <div class="group/item flex items-center justify-between p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/60 hover:bg-white/90 hover:shadow-md transition-all duration-200">
                      <div class="flex items-center">
                        <div class="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl mr-3 group-hover/item:scale-110 transition-transform">
                          <Droplets class="h-5 w-5 text-sky-600" />
                        </div>
                        <span class="text-sm text-gray-700 font-semibold">Humidity</span>
                      </div>
                      <span class="text-xl font-bold text-gray-900">{{ weatherData.humidity }}%</span>
                    </div>
                    
                    <div class="group/item flex items-center justify-between p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/60 hover:bg-white/90 hover:shadow-md transition-all duration-200">
                      <div class="flex items-center">
                        <div class="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl mr-3 group-hover/item:scale-110 transition-transform">
                          <Cloud class="h-5 w-5 text-sky-600" />
                        </div>
                        <span class="text-sm text-gray-700 font-semibold">Status</span>
                      </div>
                      <span class="text-xl font-bold text-gray-900">{{ weatherData.condition }}</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Second Row: Model Accuracy, System Uptime, Disease Classes (3 cards) -->
            <!-- Model Accuracy Card -->
            <div class="group relative bg-white shadow rounded-xl p-6 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-blue-500/10 rounded-xl">
                  <BrainCircuit class="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">Model Accuracy</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.modelAccuracy }}%</h3>
                <p class="text-xs text-gray-400">{{ systemStats.diseaseClasses }} classes</p>
              </div>
            </div>
            
            <!-- System Uptime Card -->
            <div class="group relative bg-white shadow rounded-xl p-6 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-green-500/10 rounded-xl">
                  <Clock class="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">System Uptime</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.uptime }}%</h3>
                <p class="text-xs text-gray-400">Operational</p>
              </div>
            </div>
            
            <!-- Disease Classes Card -->
            <div class="group relative bg-white shadow rounded-xl p-6 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-purple-500/10 rounded-xl">
                  <FlaskConical class="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-500 font-medium">Disease Classes</p>
                <h3 class="text-3xl font-bold text-gray-900">{{ systemStats.diseaseClasses }}</h3>
                <p class="text-xs text-gray-400">Detectable diseases</p>
              </div>
            </div>
          </div>
          
          <!-- Main Dashboard Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Quick Actions & System Health -->
            <div class="lg:col-span-1 space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white shadow rounded-xl p-6">
              <h3 class="font-semibold text-lg mb-4 text-gray-900">Quick Actions</h3>
              <div class="space-y-2">
                  <router-link to="/professional/users" class="group/item w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/80 hover:shadow-md border border-gray-200/50 transition-all duration-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-emerald-500/10 rounded-full mr-3 group-hover/item:bg-emerald-500/20 transition-colors">
                      <Users class="h-5 w-5 text-emerald-600" />
                    </div>
                      <span class="text-sm font-medium text-gray-700">Manage Users</span>
                    </div>
                    <TrendingUp class="h-4 w-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                  </router-link>
                  
                  <router-link to="/professional/diseases" class="group/item w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white hover:shadow-md border border-gray-200/50 transition-all duration-200">
                    <div class="flex items-center">
                      <div class="p-2 bg-purple-500/10 rounded-lg mr-3 group-hover/item:bg-purple-500/20 transition-colors">
                        <FlaskConical class="h-5 w-5 text-purple-600" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Disease Management</span>
                    </div>
                    <TrendingUp class="h-4 w-4 text-gray-400 group-hover/item:text-purple-600 transition-colors" />
                  </router-link>
                  
                  <router-link to="/professional/learning" class="group/item w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white hover:shadow-md border border-gray-200/50 transition-all duration-200">
                    <div class="flex items-center">
                      <div class="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover/item:bg-blue-500/20 transition-colors">
                        <BarChart3 class="h-5 w-5 text-blue-600" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Learning Materials</span>
                  </div>
                  <TrendingUp class="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors" />
                  </router-link>
                
                  <router-link to="/professional/reports" class="group/item w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white hover:shadow-md border border-gray-200/50 transition-all duration-200">
                  <div class="flex items-center">
                    <div class="p-2 bg-amber-500/10 rounded-lg mr-3 group-hover/item:bg-amber-500/20 transition-colors">
                      <BarChart3 class="h-5 w-5 text-amber-600" />
                    </div>
                    <span class="text-sm font-medium text-gray-700">Generate Report</span>
                  </div>
                  <TrendingUp class="h-4 w-4 text-gray-400 group-hover/item:text-amber-600 transition-colors" />
                  </router-link>
                </div>
              </div>
              
              <!-- System Health -->
              <div class="bg-white shadow rounded-xl p-6">
                <h3 class="font-semibold text-lg mb-4 text-gray-900">System Health</h3>
                <div class="space-y-3">
                  <!-- ML Model Status -->
                  <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div class="flex items-center">
                      <div class="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                      <span class="text-sm text-gray-700">ML Model</span>
                    </div>
                    <span class="text-xs font-semibold text-green-600">Operational</span>
                  </div>
                  
                  <!-- API Status -->
                  <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div class="flex items-center">
                      <div class="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                      <span class="text-sm text-gray-700">API Services</span>
              </div>
                    <span class="text-xs font-semibold text-green-600">Online</span>
            </div>
            
                  <!-- Database Status -->
                  <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div class="flex items-center">
                      <div class="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                      <span class="text-sm text-gray-700">Database</span>
                    </div>
                    <span class="text-xs font-semibold text-green-600">Connected</span>
                      </div>
                  
                  <!-- Weather API -->
                  <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div class="flex items-center">
                      <div class="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                      <span class="text-sm text-gray-700">Weather API</span>
                    </div>
                    <span class="text-xs font-semibold text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Recent Activity & Alerts -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Recent Detections -->
              <div class="bg-white shadow rounded-xl p-6">
                <div class="flex items-center justify-between mb-5">
                  <h3 class="font-semibold text-lg text-gray-900">Recent Disease Detections</h3>
                  <router-link to="/professional/analytics" class="text-sm text-[#606c38] hover:text-[#c9d4a3]/100 font-medium transition-colors">View All</router-link>
                </div>
                
                <div v-if="recentDetections.length > 0" class="space-y-2">
                  <div v-for="detection in recentDetections" :key="detection.id" class="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white hover:shadow-sm border border-gray-200/50 transition-all duration-200">
                    <div class="flex items-center flex-1">
                      <div class="p-2 bg-blue-500/10 rounded-lg mr-3">
                        <ActivitySquare class="h-5 w-5 text-blue-600" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-gray-900 truncate">{{ detection.disease }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ detection.location }} • {{ detection.time }}</p>
                      </div>
                    </div>
                    <div class="ml-4">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-xl bg-blue-500/10 text-xs font-semibold text-blue-700">{{ detection.confidence }}%</span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-12">
                  <div class="inline-flex p-4 bg-gray-100/50 rounded-2xl mb-4">
                    <ActivitySquare class="h-10 w-10 text-gray-400" />
                  </div>
                  <p class="text-gray-600 text-sm font-medium">No recent disease detections</p>
                  <p class="text-gray-400 text-xs mt-1">Disease scans will appear here when users upload images</p>
                </div>
              </div>
              
            </div>
          </div>
          
          <!-- Performance Metrics -->
            <div class="bg-white shadow rounded-xl p-6">
            <h3 class="font-semibold text-lg mb-6 text-gray-900">System Performance & Model Metrics</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Model Accuracy -->
              <div class="bg-white/50 p-5 rounded-xl border border-gray-200/50">
                <div class="flex items-center mb-3">
                  <div class="p-2 bg-blue-500/10 rounded-lg mr-2">
                    <BrainCircuit class="h-4 w-4 text-blue-600" />
                      </div>
                  <h3 class="text-sm font-medium text-gray-700">Model Accuracy</h3>
                    </div>
                <div class="space-y-2">
                  <p class="text-3xl font-bold text-gray-900">{{ systemStats.modelAccuracy }}%</p>
                  <div class="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-500" :style="`width: ${systemStats.modelAccuracy}%`"></div>
                  </div>
                  <p class="text-xs text-gray-500">{{ systemStats.diseaseClasses }} disease classes</p>
                </div>
                </div>
                
                <!-- System Response Time -->
              <div class="bg-white/50 p-5 rounded-xl border border-gray-200/50">
                <div class="flex items-center mb-3">
                  <div class="p-2 bg-emerald-500/10 rounded-lg mr-2">
                    <Zap class="h-4 w-4 text-emerald-600" />
                      </div>
                  <h3 class="text-sm font-medium text-gray-700">Response Time</h3>
                    </div>
                <div class="space-y-2">
                  <p class="text-3xl font-bold text-gray-900">{{ systemStats.responseTime }}s</p>
                  <div class="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="`width: ${(systemStats.responseTime / 3) * 100}%`"></div>
                  </div>
                  <p class="text-xs text-gray-500">Average response</p>
                  </div>
                </div>
                
                <!-- User Engagement -->
              <div class="bg-white/50 p-5 rounded-xl border border-gray-200/50">
                <div class="flex items-center mb-3">
                  <div class="p-2 bg-amber-500/10 rounded-lg mr-2">
                    <TrendingUp class="h-4 w-4 text-amber-600" />
                      </div>
                  <h3 class="text-sm font-medium text-gray-700">User Engagement</h3>
                    </div>
                <div class="space-y-2">
                  <p class="text-3xl font-bold text-gray-900">{{ systemStats.engagement }}%</p>
                  <div class="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full transition-all duration-500" :style="`width: ${systemStats.engagement}%`"></div>
                  </div>
                  <p class="text-xs text-gray-500">Active users</p>
                  </div>
                </div>
                
                <!-- System Uptime -->
              <div class="bg-white/50 p-5 rounded-xl border border-gray-200/50">
                <div class="flex items-center mb-3">
                  <div class="p-2 bg-green-500/10 rounded-lg mr-2">
                    <ActivitySquare class="h-4 w-4 text-green-600" />
                      </div>
                  <h3 class="text-sm font-medium text-gray-700">System Uptime</h3>
                    </div>
                <div class="space-y-2">
                  <p class="text-3xl font-bold text-gray-900">{{ systemStats.uptime }}%</p>
                  <div class="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full transition-all duration-500" :style="`width: ${systemStats.uptime}%`"></div>
                  </div>
                  <p class="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import PageLoader from '../../components/professional/PageLoader.vue';
import { 
  Users, 
  BrainCircuit, 
  AlertTriangle, 
  ActivitySquare,
  CloudRain,
  Droplets,
  FlaskConical,
  TrendingUp,
  Database,
  Wifi,
  Cloud,
  Calendar,
  MapPin,
  Phone,
  Shield,
  BarChart3,
  Clock,
  Zap
} from 'lucide-vue-next';

// Router
const router = useRouter();

// State
const isLoading = ref(true);
const error = ref(null);
const showSignOutConfirmation = ref(false);

// User data
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const photoURL = ref(null);
const userRole = ref('Professional');
const location = ref(null);
const createdAt = ref(null);

// Dashboard data
const systemStats = ref({
  totalUsers: 0,
  professionals: 0,
  farmers: 0,
  modelAccuracy: 92.3,
  diseaseClasses: 11,
  recentDetections: 0,
  criticalCases: 0,
  uptime: 99.8,
  accuracy: 92.3,
  responseTime: 1.2,
  engagement: 78
});

const weatherData = ref({
  temperature: 28,
  humidity: 75,
  condition: 'Favorable'
});

const recentDetections = ref([]);

// Computed properties
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`;
  }
  return firstName.value || 'Professional';
});

// Compute user initials for avatar
const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'P';
});

// Notification count
const notificationCount = computed(() => {
  return 0; // No notifications for now
});

// Format location for display
const formattedLocation = computed(() => {
  if (!location.value) return '';

  const parts = [];

  if (location.value.municipality?.name) {
    parts.push(location.value.municipality.name);
  }

  if (location.value.province?.name) {
    parts.push(location.value.province.name);
  }

  if (location.value.country?.name) {
    parts.push(location.value.country.name);
  }

  return parts.join(', ');
});

// Format join date
const formattedJoinDate = computed(() => {
  if (!createdAt.value) return 'N/A';

  // If it's a Firestore timestamp, convert to JS Date
  const date = createdAt.value.toDate ? createdAt.value.toDate() : new Date(createdAt.value);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
});

// Fetch user data from Firestore
const fetchUserData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    console.log("Fetching user data...");
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      isLoading.value = false;
      router.push('/signin');
      return;
    }
    
    console.log("Current user:", auth.currentUser.uid);
    
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
    console.log("User data retrieved:", userData);
    
    // Update user data state
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    photoURL.value = userData.photoURL || null; // This gets the photo URL
    userRole.value = userData.role === 'professional' ? 'Professional' : 'User';
    location.value = userData.location || null;
    createdAt.value = userData.createdAt || null;
    
    // Check if user has correct role for this dashboard
    if (userData.role !== 'professional') {
      console.warn("User does not have professional role, redirecting to user dashboard");
      router.push('/user/dashboard');
      return;
    }
    
    // Fetch additional dashboard data
    await fetchDashboardData();
    
    console.log("User data loaded successfully");
    
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Fetch dashboard-specific data
const fetchDashboardData = async () => {
  try {
    // Fetch total users count
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    let professionals = 0;
    let farmers = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'professional') {
        professionals++;
      } else if (userData.role === 'user') {
        farmers++;
      }
    });
    
    systemStats.value.totalUsers = usersSnapshot.size;
    systemStats.value.professionals = professionals;
    systemStats.value.farmers = farmers;
    
    // Fetch recent detections from scan history
    const scanHistoryRef = collection(db, "scan_history");
    const recentScansQuery = query(
      scanHistoryRef, 
      orderBy("timestamp", "desc"), 
      limit(5)
    );
    const recentScansSnapshot = await getDocs(recentScansQuery);
    
    const recentScans = [];
    let criticalCases = 0;
    
    recentScansSnapshot.forEach((doc) => {
      const data = doc.data();
      const severity = data.severity || 'Low';
      if (severity === 'High') {
        criticalCases++;
      }
      
      // Format location from userLocationDetails structure
      let locationString = 'Unknown Location';
      if (data.userLocationDetails) {
        const locationDetails = data.userLocationDetails;
        const locationParts = [];
        
        if (locationDetails.barangay) {
          locationParts.push(locationDetails.barangay);
        }
        if (locationDetails.municipality) {
          locationParts.push(locationDetails.municipality);
        }
        if (locationDetails.farmName && locationDetails.farmName.trim() !== '') {
          locationParts.push(`Farm: ${locationDetails.farmName}`);
        }
        
        if (locationParts.length > 0) {
          locationString = locationParts.join(', ');
        }
      } else if (data.location?.name) {
        locationString = data.location.name;
      }
      
      recentScans.push({
        id: doc.id,
        disease: data.disease || 'Unknown',
        location: locationString,
        time: formatTimeAgo(data.timestamp),
        confidence: Math.round(data.confidence || 0)
      });
    });
    
    if (recentScans.length > 0) {
      recentDetections.value = recentScans;
    }
    
    // Update system stats with real data
    systemStats.value.recentDetections = recentScansSnapshot.size;
    systemStats.value.criticalCases = criticalCases;
    
    // Fetch today's detections count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayScansQuery = query(
      scanHistoryRef,
      where("timestamp", ">=", today)
    );
    const todayScansSnapshot = await getDocs(todayScansQuery);
    systemStats.value.recentDetections = todayScansSnapshot.size;
    
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    // Continue with default data if fetch fails
  }
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/professional/profile');
};

// Handle sign out
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
    
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = "Failed to sign out. Please try again.";
  }
};

// Fetch data on component mount
onMounted(() => {
  console.log("Professional dashboard component mounted");
  fetchUserData();
});
</script>

<style scoped>
/* Blob animation for floating orbs in weather card */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(10px, -10px) scale(1.05);
  }
  50% {
    transform: translate(-5px, 10px) scale(0.95);
  }
  75% {
    transform: translate(-10px, -5px) scale(1.02);
  }
}

.animate-blob {
  animation: blob 10s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Subtle hover lift effect for weather card */
.weather-card:hover {
  transform: translateY(-2px);
}

/* Smooth transitions for all cards */
.group {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

