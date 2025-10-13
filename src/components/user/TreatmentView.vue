<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
    <!-- Navbar -->
    <UserNavbar
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :profile-image="profileImage"
      @sign-out="showSignOutConfirmation = true"
    />

    <div class="flex">
      <!-- Sidebar -->
      <UserSidebar />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <div class="max-w-7xl mx-auto space-y-10">

          <!-- Search Diseases Library -->
          <div class="bg-gray-800/70 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h2 class="text-2xl font-bold flex items-center text-emerald-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M11 4a7 7 0 100 14 7 7 0 000-14z"/>
              </svg>
              Search Diseases Library
            </h2>

            <!-- Search Input -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by disease name..."
                class="w-full py-3 pl-12 pr-4 rounded-full bg-gray-700 text-white text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-3.5 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M11 4a7 7 0 100 14 7 7 0 000-14z"/>
              </svg>
            </div>

            <!-- Results -->
            <ul v-if="filteredDiseases.length" class="mt-6 space-y-3">
              <li
                v-for="(d, idx) in filteredDiseases"
                :key="idx"
                @click="selectDisease(d)"
                class="flex items-center justify-between p-4 rounded-xl bg-gray-700/60 hover:bg-emerald-600/40 cursor-pointer transition transform hover:scale-[1.02]"
              >
                <div>
                  <p class="font-semibold text-white">{{ d.name }}</p>
                  <p class="text-sm text-gray-400 italic">{{ d.scientificName }}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            </ul>

            <p v-else class="text-gray-500 italic mt-6">No matching diseases found.</p>
          </div>

          <!-- Disease Details -->
          <div v-if="diseaseData" class="space-y-10">
            <div>
              <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
                {{ diseaseData.name }}
              </h1>
              <p class="text-gray-400 italic mt-1">{{ diseaseData.scientificName }}</p>
            </div>

            <!-- 2-Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- About -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-emerald-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM9 7h2v6H9V7zm0 8h2v2H9v-2z"/>
                  </svg>
                  About
                </h2>
                <p class="text-gray-300">{{ diseaseData.shortDescription }}</p>
              </div>

              <!-- Symptoms -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-yellow-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12h2v2H9v-2zm0-8h2v6H9V4z"/>
                  </svg>
                  Symptoms
                </h2>
                <div class="prose prose-invert max-w-none mt-2" v-html="diseaseData.symptoms"></div>
              </div>

              <!-- Treatment -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-red-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 7h2v6H9V7zm0 8h2v2H9v-2z"/>
                  </svg>
                  Treatment
                </h2>
                <div class="prose prose-invert max-w-none mt-2" v-html="diseaseData.treatment"></div>
              </div>

              <!-- Prevention -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-blue-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 7h2v6H9V7z"/>
                  </svg>
                  Prevention
                </h2>
                <div class="prose prose-invert max-w-none mt-2" v-html="diseaseData.prevention"></div>
              </div>
            </div>

            <!-- Farmer Logs -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Log Form -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-emerald-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v12l4-2 4 2 4-2 4 2V5a2 2 0 00-2-2H5z"/>
                  </svg>
                  Log Your Treatment
                </h2>
                <form @submit.prevent="addTreatmentLog" class="space-y-4">
                  <input
                    v-model="treatmentForm.notes"
                    placeholder="What did you apply?"
                    class="w-full bg-gray-700 text-white rounded-md p-2"
                  />
                  <button
                    type="submit"
                    class="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-md text-white font-medium flex items-center justify-center shadow-lg transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17 9H11V3H9v6H3v2h6v6h2v-6h6V9z"/>
                    </svg>
                    Save Treatment
                  </button>
                </form>
              </div>

              <!-- History -->
              <div class="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-md">
                <h2 class="text-xl font-semibold text-emerald-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 7h2v6H9V7z"/>
                  </svg>
                  Your Treatment History
                </h2>
                <ul v-if="treatmentLogs.length" class="space-y-3 text-gray-300 text-sm">
                  <li
                    v-for="(log, idx) in treatmentLogs"
                    :key="idx"
                    class="p-3 bg-gray-700/40 rounded-md"
                  >
                    <p>{{ log.notes }}</p>
                    <p class="text-xs text-gray-400">{{ new Date(log.date).toLocaleString() }}</p>
                  </li>
                </ul>
                <p v-else class="text-gray-500 italic">No treatments logged yet.</p>
              </div>
            </div>
          </div>

          <p v-else class="text-gray-500 italic">Select a disease to view details.</p>
        </div>
      </main>
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import UserNavbar from "../../components/user/UserNavbar.vue";
import UserSidebar from "../../components/user/UserSidebar.vue";
import SignOutConfirmation from "../../components/user/SignOutConfirmation.vue";

const router = useRouter();
const { t } = useI18n();

// Profile + auth state
const userInitials = ref("");
const userDisplayName = ref("");
const email = ref("");
const profileImage = ref(null);
const notificationCount = ref(0);
const showSignOutConfirmation = ref(false);
const error = ref(null);

// Disease state
const diseaseData = ref(null);
const allDiseases = ref([]);
const searchQuery = ref("");

// Treatment logs
const treatmentLogs = ref([]);
const treatmentForm = ref({ notes: "" });

// Filtered search
const filteredDiseases = computed(() => {
  if (!searchQuery.value) return allDiseases.value;
  return allDiseases.value.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Fetch user profile data
const fetchUserData = async () => {
  if (!auth.currentUser) {
    router.push("/signin");
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      userDisplayName.value = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      email.value = userData.email || "";
      profileImage.value = userData.profileImage || null;
      userInitials.value =
        (userData.firstName?.charAt(0) || "") + (userData.lastName?.charAt(0) || "");
    } else {
      userDisplayName.value = auth.currentUser.displayName || "User";
      email.value = auth.currentUser.email || "";
      profileImage.value = auth.currentUser.photoURL || null;
      userInitials.value =
        auth.currentUser.displayName?.charAt(0) || auth.currentUser.email?.charAt(0) || "U";
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};

// Fetch all diseases
const fetchDiseases = async () => {
  const diseasesSnap = await getDocs(collection(db, "diseases"));
  allDiseases.value = diseasesSnap.docs.map((doc) => doc.data());
};

// Select disease + load logs
const selectDisease = async (disease) => {
  diseaseData.value = disease;

  if (auth.currentUser) {
    const logsRef = collection(db, "treatment_logs");
    const q = query(
      logsRef,
      where("userId", "==", auth.currentUser.uid),
      where("diseaseId", "==", disease.name)
    );
    const snapshot = await getDocs(q);
    treatmentLogs.value = snapshot.docs.map(doc => doc.data());
  }
};

// Add farmer treatment log
const addTreatmentLog = async () => {
  if (!auth.currentUser || !diseaseData.value) return;

  const newLog = {
    userId: auth.currentUser.uid,
    diseaseId: diseaseData.value.name,
    notes: treatmentForm.value.notes,
    date: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "treatment_logs"), newLog);
    treatmentLogs.value.push(newLog);
    treatmentForm.value.notes = "";
  } catch (err) {
    console.error("Error saving treatment log:", err);
  }
};

// Handle sign out
const handleSignOut = async () => {
  try {
    showSignOutConfirmation.value = false;
    localStorage.removeItem("user");
    await signOut(auth);
    router.push("/signin");
  } catch (err) {
    console.error("Error signing out:", err);
    error.value = t("common.error.signOutFailed");
  }
};

onMounted(() => {
  fetchUserData();
  fetchDiseases();
});
</script>
