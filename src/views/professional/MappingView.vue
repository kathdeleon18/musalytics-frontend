<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Top Navigation Bar -->
   <ProfessionalNavbar 
        :user-initials="userInitials"
        :user-display-name="`${firstName} ${lastName}`" :email="email"
        :notification-count="0"
        :photoURL="photoURL" 
        @manage-profile="goToProfile"
        @sign-out="showSignOutConfirmation = true"
    />

    <div class="pt-8 md:pl-64 flex">
      <ProfessionalSidebar />

      <main class="flex-1 p-6 overflow-auto">
        <div class="w-full">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4">
            <div>
              <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Disease Map View</h1>
              <p class="text-sm sm:text-base text-gray-400">Geographic visualization of pest and disease detections.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div class="lg-col-span-1">
              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center mb-4">
                  <FilterIcon class="w-5 h-5 text-[#283618] mr-2" />
                  <h3 class="text-lg font-semibold text-[#283618]">Filters</h3>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
                    <div class="flex flex-col space-y-2">
                      <input type="date" placeholder="Start Date" v-model="filters.dateRange.start" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <input type="date" placeholder="End Date" v-model="filters.dateRange.end" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
                    <select v-model="filters.municipality" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="municipality in uniqueMunicipalities" :key="municipality" :value="municipality">{{ municipality }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Plant Type</label>
                    <select v-model="filters.plantType" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="plantType in uniquePlantTypes" :key="plantType" :value="plantType">{{ plantType }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Disease</label>
                    <select v-model="filters.disease" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
                      <option value="All">All</option>
                      <option v-for="disease in uniqueDiseases" :key="disease" :value="disease">{{ disease }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Severity Level</label>
                    <select v-model="filters.severity" class="py-2 pl-4 pr-8 w-full bg-white border border-gray-300 rounded-xl text-gray-500 appearance-none transition-all duration-200 text-sm">
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

            <div class="lg:col-span-4">
                <div class="bg-white shadow-lg rounded-xl p-6 relative">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div class="flex items-center mb-3 sm:mb-0">
                        <MapPinIcon class="w-5 h-5 text-[#283618] mr-2" />
                        <h3 class="text-lg font-semibold text-[#283618]">Geographic Scan Distribution</h3>
                        </div>
                        <div class="flex items-center bg-gray-200/70 rounded-lg p-1 space-x-1">
                        <button
                            @click="activeLayer = 'clusters'"
                            :class="['px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200', activeLayer === 'clusters' ? 'bg-white text-[#606c38] shadow-sm' : 'text-gray-600 hover:bg-white/50']"
                        >
                            Clusters
                        </button>
                        <button
                            @click="activeLayer = 'heatmap'"
                            :class="['px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200', activeLayer === 'heatmap' ? 'bg-white text-[#606c38] shadow-sm' : 'text-gray-600 hover:bg-white/50']"
                        >
                            Heatmap
                        </button>
                        </div>
                    </div>
                    
                    <div v-if="loading" class="text-center py-24 text-gray-500">Loading map data...</div>
                    <div v-else-if="scansWithLocation.length === 0 && !loading" class="text-center py-24">
                        <div class="text-gray-500 text-lg mb-4">No location data for the current filters.</div>
                        <p class="text-gray-400">Scans must have coordinates to be displayed on the map.</p>
                    </div>
                    <div ref="mapContainer" class="w-full h-[600px] rounded-lg z-10"></div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <SignOutConfirmation
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
    
    <!-- Page Loader -->
    <PageLoader :is-loading="isLoading" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'; // NEW: Import router
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';


// Component imports
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue'; // NEW: Import confirmation modal
import PageLoader from '../../components/professional/PageLoader.vue';
import { FilterIcon, MapPinIcon } from 'lucide-vue-next';

// Leaflet and plugin imports
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';

// Fix for default Leaflet marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default {
  name: 'MapPage',
  components: {
    ProfessionalNavbar,
    ProfessionalSidebar,
    SignOutConfirmation, // NEW: Register component
    PageLoader,
    FilterIcon,
    MapPinIcon
  },
  setup() {
    const router = useRouter(); // NEW: Initialize router
    const loading = ref(true);
    const isLoading = ref(true);
    const scans = ref([]);
    const filters = ref({
      dateRange: { start: '', end: '' },
      municipality: 'All',
      plantType: 'All',
      disease: 'All',
      severity: 'All'
    });
    const activeLayer = ref('clusters');
    const mapContainer = ref(null);
    let map = null;
    let markerClusterGroup = null;
    let heatLayer = null;

    // --- User Profile State ---
    const auth = getAuth();
    const email = ref('');
    const firstName = ref('');
    const lastName = ref('');
    const photoURL = ref(null);
    const showSignOutConfirmation = ref(false); // NEW: State for modal visibility

    // --- Computed Properties for Filters ---
    const uniquePlantTypes = computed(() => [...new Set(scans.value.map(s => s.plantType).filter(Boolean))]);
    const uniqueDiseases = computed(() => [...new Set(scans.value.map(s => s.disease).filter(Boolean))]);
    const uniqueMunicipalities = computed(() => [...new Set(scans.value.map(s => s.userLocationDetails?.municipality).filter(Boolean))]);

    const filteredScans = computed(() => {
      let filtered = scans.value;
      if (filters.value.plantType !== 'All') filtered = filtered.filter(s => s.plantType === filters.value.plantType);
      if (filters.value.disease !== 'All') filtered = filtered.filter(s => s.disease === filters.value.disease);
      if (filters.value.severity !== 'All') filtered = filtered.filter(s => s.severity === filters.value.severity.toLowerCase());
      if (filters.value.municipality !== 'All') filtered = filtered.filter(s => s.userLocationDetails?.municipality === filters.value.municipality);
      if (filters.value.dateRange.start && filters.value.dateRange.end) {
        const start = new Date(filters.value.dateRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.value.dateRange.end);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(s => {
          const scanDate = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
          return scanDate >= start && scanDate <= end;
        });
      }
      return filtered;
    });

    const scansWithLocation = computed(() => {
        return filteredScans.value.filter(scan => 
            scan.location && 
            typeof scan.location.latitude === 'number' && 
            typeof scan.location.longitude === 'number'
        );
    });
    
    // --- Data Fetching ---
    const fetchScanHistory = async () => {
      try {
        loading.value = true;
        isLoading.value = true;
        const scanHistoryRef = collection(db, 'scan_history');
        const q = query(scanHistoryRef, orderBy('timestamp', 'desc'), limit(1000));
        const querySnapshot = await getDocs(q);
        scans.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        loading.value = false;
        isLoading.value = false;
      }
    };

    const clearFilters = () => {
      filters.value = {
        dateRange: { start: '', end: '' },
        municipality: 'All',
        plantType: 'All',
        disease: 'All',
        severity: 'All'
      };
    };

    // --- Map Logic ---
    const initializeMap = () => {
      if (mapContainer.value && !map) {
        map = L.map(mapContainer.value).setView([12.8797, 121.7740], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        
        markerClusterGroup = L.markerClusterGroup();
        map.addLayer(markerClusterGroup);
      }
    };

    const updateMapLayers = () => {
        if (!map) return;
        if (heatLayer) map.removeLayer(heatLayer);
        markerClusterGroup.clearLayers();
        if (scansWithLocation.value.length === 0) return;

        if (activeLayer.value === 'clusters') {
            if (!map.hasLayer(markerClusterGroup)) map.addLayer(markerClusterGroup);
            const markers = scansWithLocation.value.map(scan => {
                const popupContent = `<div class="font-sans w-48"><strong class="text-base text-gray-800 capitalize">${scan.disease?.replace(/_/g, ' ') || 'N/A'}</strong><p class="text-sm text-gray-600 capitalize">${scan.plantType?.replace(/_/g, ' ') || 'N/A'}</p><hr class="my-1.5"><p class="text-xs text-gray-500">Confidence: <strong class="text-gray-700">${Math.round(scan.confidence || 0)}%</strong></p><p class="text-xs text-gray-500">Severity: <strong class="text-gray-700 capitalize">${scan.severity || 'N/A'}</strong></p><p class="text-xs text-gray-500">Location: <strong class="text-gray-700">${scan.userLocationDetails?.municipality || 'N/A'}</strong></p><p class="text-xs text-gray-500">Date: <strong class="text-gray-700">${new Date(scan.timestamp?.toDate ? scan.timestamp.toDate() : scan.timestamp).toLocaleDateString()}</strong></p></div>`;
                const marker = L.marker([scan.location.latitude, scan.location.longitude]);
                marker.bindPopup(popupContent);
                return marker;
            });
            markerClusterGroup.addLayers(markers);
        } else {
            if (map.hasLayer(markerClusterGroup)) map.removeLayer(markerClusterGroup);
            const heatPoints = scansWithLocation.value.map(s => [s.location.latitude, s.location.longitude, (s.confidence || 50) / 100]);
            heatLayer = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 12 }).addTo(map);
        }
    };
    
    // NEW: Function to navigate to profile page
    const goToProfile = () => {
      router.push('/professional/profile');
    };

    // UPDATED: Sign out handler
    const handleSignOut = async () => {
      showSignOutConfirmation.value = false; // Close the modal first
      try {
        await signOut(auth);
        // Force a full page reload to the sign-in page to clear all state
        window.location.href = '/signin';
      } catch (error) {
        console.error("Error signing out: ", error);
        // Optionally, show an error message to the user
      }
    };

    // --- Lifecycle Hooks ---
    onMounted(async () => {
      onAuthStateChanged(auth, async (user) => { // Added async here
        if (user) {
          // --- Start of new/updated block ---
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("authUid", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              firstName.value = userData.firstName || '';
              lastName.value = userData.lastName || '';
              email.value = userData.email || user.email;
              photoURL.value = userData.photoURL || null; // This gets the photo URL
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
          }
          // --- End of new/updated block ---

        } else {
          // If no user is authenticated, redirect to sign-in
          router.replace('/signin');
        }
      });
      
        await fetchScanHistory();
        initializeMap();
        updateMapLayers();
      });

    onBeforeUnmount(() => {
      if (map) { map.remove(); map = null; }
    });

    // --- Watchers ---
    watch(filteredScans, updateMapLayers, { deep: true });
    watch(activeLayer, updateMapLayers);
    watch(() => scansWithLocation.value.length, updateMapLayers);

    return {
      loading,
      isLoading,
      filters,
      uniqueMunicipalities,
      uniquePlantTypes,
      uniqueDiseases,
      clearFilters,
      mapContainer,
      activeLayer,
      scansWithLocation,
      firstName,
      lastName,
      email,
      photoURL,
      userInitials: computed(() => (firstName.value.charAt(0) + lastName.value.charAt(0)).toUpperCase() || 'P'),
      // NEW and UPDATED exports
      handleSignOut,
      goToProfile,
      showSignOutConfirmation,
    };
  }
}
</script>

<style>
/* (Your existing styles remain unchanged) */
.leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.leaflet-popup-content {
    margin: 14px !important;
    font-size: 14px;
    line-height: 1.6;
}
.marker-cluster-small { background-color: rgba(180, 210, 155, 0.6); }
.marker-cluster-small div { background-color: rgba(96, 108, 56, 0.6); }
.marker-cluster-medium { background-color: rgba(245, 230, 175, 0.6); }
.marker-cluster-medium div { background-color: rgba(200, 160, 50, 0.6); }
.marker-cluster-large { background-color: rgba(253, 156, 156, 0.6); }
.marker-cluster-large div { background-color: rgba(240, 110, 110, 0.6); }
.marker-cluster { color: #fff; text-shadow: 1px 1px 2px #333; }
.marker-cluster div { width: 30px; height: 30px; margin-left: 5px; margin-top: 5px; text-align: center; border-radius: 15px; font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif; }
.marker-cluster span { line-height: 30px; }
</style>