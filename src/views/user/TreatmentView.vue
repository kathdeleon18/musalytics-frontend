<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Navbar -->
    <UserNavbar
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :profile-image="profileImage"
      @sign-out="showSignOutConfirmation = true"
    />

    <div class="pt-2 md:pl-64 flex">
      <!-- Sidebar -->
      <UserSidebar />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <header class="mb-4 sm:mb-8">
          <h1 class="text-2xl font-semibold mb-1 text-[#283618]">{{ $t('treatment.title') }}</h1>
          <p class="text-sm sm:text-base text-gray-400">{{ $t('treatment.subtitle') }}</p>
        </header>

        <div class="max-w-7xl mx-auto space-y-10">
          <!-- Search Diseases Library -->
          <div class="bg-white p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold flex items-center text-[#283618] mb-6">
              {{ $t('treatment.searchTitle') }}
            </h2>

            <!-- Search Input -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('treatment.searchPlaceholder')"
                class="w-full py-3 pl-12 pr-4 rounded-2xl bg-white text-sm border border-gray-400/50 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                class="flex items-center justify-between p-4 rounded-xl bg-white border borde-gray-400/50 cursor-pointer transition transform hover:scale-[1.02]"
              >
                <div>
                  <p class="font-semibold">{{ d.name }}</p>
                  <p class="text-sm italic text-gray-400">{{ d.scientificName }}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            </ul>

            <p v-else class="text-gray-600 text-sm italic mt-6">{{ $t('treatment.noResults') }}</p>
          </div>

          <!-- Disease Details Modal -->
          <div v-if="showDiseaseModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 pt-20">
            <div class="bg-white rounded-xl w-full max-w-4xl max-h-[calc(100vh-120px)] overflow-hidden shadow-2xl">
              <!-- Modal Header -->
              <div class="bg-[#606c38] p-4 flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ diseaseData?.name }}</h2>
                  <p class="text-[#c9d4a3] italic">{{ diseaseData?.scientificName }}</p>
                </div>
                <button @click="closeDiseaseModal" class="text-white hover:text-gray-300 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal Content -->
              <div class="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <!-- 2-Column Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- About -->
                  <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="text-xl font-semibold  mb-1 flex items-center">
                      {{ $t('treatment.about') }}
                    </h3>
                    <p class="text-gray-700">{{ diseaseData?.shortDescription }}</p>
                  </div>

                  <!-- Symptoms -->
                  <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="text-xl font-semibold mb-1 flex items-center">
                      {{ $t('treatment.symptoms') }}
                    </h3>
                    <div class="prose prose-gray max-w-none" v-html="diseaseData?.symptoms"></div>
                  </div>

                  <!-- Treatment -->
                  <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="text-xl font-semibold mb-1 flex items-center">
                      {{ $t('treatment.treatment') }}
                    </h3>
                    <div class="prose prose-gray max-w-none" v-html="diseaseData?.treatment"></div>
                  </div>

                  <!-- Prevention -->
                  <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="text-xl font-semibold  mb-1 flex items-center">
                      {{ $t('treatment.prevention') }}
                    </h3>
                    <div class="prose prose-gray max-w-none" v-html="diseaseData?.prevention"></div>
                  </div>
                </div>

                <!-- Farmer Logs Section -->
                <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Log Form -->
                  <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="text-xl font-semibold  mb-1 flex items-center">
                      {{ $t('treatment.logTitle') }}
                    </h3>
                    <form @submit.prevent="addTreatmentLog" class="space-y-4">
                      <textarea
                        v-model="treatmentForm.notes"
                        :placeholder="$t('treatment.logPlaceholder')"
                        rows="3"
                        class="w-full px-3 py-2 bg-white border border-gray-400/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                      ></textarea>
                      <button
                        type="submit"
                        class="w-full py-2 bg-[#606c38] hover:bg-[#c9d4a3]/100 text-white hover:text-[#606c38] rounded-xl flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        {{ $t('treatment.saveTreatment') }}
                      </button>
                    </form>
                  </div>

                  <!-- History -->
                  <div class="bg-white p-6 rounded-xl  shadow">
                    <h3 class="text-xl font-semibold  mb-2 flex items-center">
                      {{ $t('treatment.historyTitle') }}
                    </h3>
                    <div class="max-h-64 overflow-y-auto">
                      <ul v-if="treatmentLogs.length" class="space-y-3">
                        <li
                          v-for="(log, idx) in treatmentLogs"
                          :key="idx"
                          class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                        >
                          <p class="text-gray-700 text-sm">{{ log.notes }}</p>
                          <p class="text-xs text-gray-500 mt-1">{{ new Date(log.date).toLocaleString() }}</p>
                        </li>
                      </ul>
                      <p v-else class="text-gray-500 italic text-center py-4">{{ $t('treatment.noLogs') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-if="!diseaseData" class="text-gray-500 italic text-center py-8">{{ $t('treatment.selectPrompt') }}</p>
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
import { signOut, onAuthStateChanged } from "firebase/auth";
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

// Core setup
const router = useRouter();
const { t } = useI18n();

// UI & user state
const userInitials = ref("");
const userDisplayName = ref("");
const email = ref("");
const profileImage = ref(null);
const notificationCount = ref(0);
const showSignOutConfirmation = ref(false);
const error = ref(null);
const isLoading = ref(true);

// Disease-related state
const diseaseData = ref(null);
const allDiseases = ref([]);
const searchQuery = ref("");
const showDiseaseModal = ref(false);

// Treatment logs
const treatmentLogs = ref([]);
const treatmentForm = ref({ notes: "" });

// Filtered disease list
const filteredDiseases = computed(() => {
  if (!searchQuery.value) return allDiseases.value;
  return allDiseases.value.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// ✅ Fetch user profile safely
const fetchUserData = async (user) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      userDisplayName.value = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      email.value = userData.email || "";
      profileImage.value = userData.profileImage || null;
      userInitials.value =
        (userData.firstName?.charAt(0) || "") + (userData.lastName?.charAt(0) || "");
    } else {
      // Fallback from Firebase Auth
      userDisplayName.value = user.displayName || "User";
      email.value = user.email || "";
      profileImage.value = user.photoURL || null;
      userInitials.value =
        user.displayName?.charAt(0) || user.email?.charAt(0) || "U";
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = t("common.error.fetchUserFailed");
  }
};

// ✅ Fetch all diseases (with safe catch)
const fetchDiseases = async () => {
  try {
    const diseasesSnap = await getDocs(collection(db, "diseases"));
    allDiseases.value = diseasesSnap.docs.map((doc) => doc.data());
  } catch (err) {
    console.error("Error fetching diseases:", err);
    allDiseases.value = [];
  }
};

// ✅ Select a disease and load treatment logs
const selectDisease = async (disease) => {
  diseaseData.value = disease;
  showDiseaseModal.value = true;

  if (auth.currentUser) {
    try {
      const logsRef = collection(db, "treatment_logs");
      const q = query(
        logsRef,
        where("userId", "==", auth.currentUser.uid),
        where("diseaseId", "==", disease.name)
      );
      const snapshot = await getDocs(q);
      treatmentLogs.value = snapshot.docs.map((doc) => doc.data());
    } catch (err) {
      console.error("Error fetching treatment logs:", err);
      treatmentLogs.value = [];
    }
  }
};

// ✅ Close disease modal
const closeDiseaseModal = () => {
  showDiseaseModal.value = false;
  diseaseData.value = null;
  treatmentLogs.value = [];
  treatmentForm.value.notes = "";
};

// ✅ Add a new treatment log
const addTreatmentLog = async () => {
  if (!auth.currentUser || !diseaseData.value || !treatmentForm.value.notes.trim()) return;

  const newLog = {
    userId: auth.currentUser.uid,
    diseaseId: diseaseData.value.name,
    notes: treatmentForm.value.notes.trim(),
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

// ✅ Sign-out handler
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

// ✅ Wait for Firebase Auth before loading anything
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await fetchUserData(user);
        await fetchDiseases();
      } finally {
        isLoading.value = false;
      }
    } else {
      router.push("/signin");
    }
  });
});
</script>

