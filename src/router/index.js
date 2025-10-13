import { createRouter, createWebHistory } from "vue-router"
import { auth, db } from "../firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"

// Import professional routes
import professionalRoutes from "./professionalRoutes"

// Import views that are not lazy-loaded
import LandingView from "../views/LandingView.vue"
import SignInView from "../views/SignInView.vue"
import SignUpView from "../views/SignUpView.vue"

const routes = [
  // Public routes
  {
    path: "/",
    name: "landing",
    component: LandingView,
    meta: { requiresAuth: false },
  },
  {
    path: "/signin",
    name: "signin",
    component: SignInView,
    meta: { requiresAuth: false },
  },
  {
    path: "/signup",
    name: "signup",
    component: SignUpView,
    meta: { requiresAuth: false },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("../views/ResetPasswordView.vue"),
    meta: { requiresAuth: false },
  },

  // User routes - kept in the main router file
  {
    path: "/user/dashboard",
    name: "user-dashboard",
    component: () => import("../views/user/DashboardView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/scan",
    name: "user-scan",
    component: () => import("../views/user/ScanView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/scan-history",
    name: "user-scan-history",
    component: () => import("../views/user/ScanHistoryView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/reports",
    name: "user-reports",
    component: () => import("../views/user/ReportsView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/treatments",
    name: "user-treatments",
    component: () => import("../views/user/TreatmentView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/weather",
    name: "user-weather",
    component: () => import("../views/user/WeatherMonitoring.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/profile",
    name: "user-profile",
    component: () => import("../views/user/ProfileView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  // Learning Center route
  {
    path: "/user/learning",
    name: "user-learning",
    component: () => import("../views/user/LearningCenterView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  // Task Scheduler route
  {
    path: "/user/task-scheduler",
    name: "user-task-scheduler",
    component: () => import("../views/user/TaskScheduler.vue"),
    meta: { requiresAuth: true, role: "user" },
  },

  // Add professional routes
  ...professionalRoutes,

  // Add a catch-all route to handle any undefined routes
  {
    path: "/:pathMatch(.*)*",
    redirect: "/user/dashboard",
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global variable to track authentication state
let authInitialized = false
let currentUser = null

// Get user role from Firestore
const getUserRole = async (user) => {
  if (!user) return null

  try {
    // Find the user document by authUid
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("authUid", "==", user.uid))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.warn("No user document found for authUid:", user.uid)
      return "user" // Default to user role if not found
    }

    const userData = querySnapshot.docs[0].data()
    console.log("User data from Firestore:", userData)
    console.log("User role from Firestore:", userData.role || "user")
    return userData.role || "user" // Default to 'user' if role is not set
  } catch (error) {
    console.error("Error getting user role:", error)
    return "user" // Default to user role on error
  }
}

const getUserVerificationStatus = async (user) => {
  if (!user) return { role: null, isVerified: false }

  try {
    // Find the user document by authUid
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("authUid", "==", user.uid))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.warn("No user document found for authUid:", user.uid)
      return { role: "user", isVerified: false }
    }

    const userData = querySnapshot.docs[0].data()
    console.log("User verification data:", { role: userData.role || "user", isVerified: userData.isVerified })
    return {
      role: userData.role || "user",
      isVerified: userData.isVerified || false,
    }
  } catch (error) {
    console.error("Error getting user verification status:", error)
    return { role: "user", isVerified: false }
  }
}

// Wait for Firebase Auth to initialize
const initializeAuth = () => {
  return new Promise((resolve) => {
    // If auth is already initialized, resolve immediately
    if (authInitialized) {
      resolve(currentUser)
      return
    }

    // Wait for onAuthStateChanged to fire
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      authInitialized = true
      currentUser = user
      resolve(user)
    })
  })
}

// Keep currentUser updated with the latest auth state
onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "User logged out")
  currentUser = user
})

router.beforeEach(async (to, from, next) => {
  console.log(`Navigation from ${from.path} to ${to.path}`)

  // Wait for Firebase Auth to initialize
  const user = await initializeAuth()
  console.log("Current auth user:", user ? `User ${user.uid}` : "No user")

  // Debug: Log the route requirements
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log(`Route ${to.path} requires auth: ${to.meta.requiresAuth}, role: ${to.meta.role || "any"}`)
  }

  // Special case for sign out - if going to signin, signup, or landing page, don't check role
  if (!user && (to.path === "/signin" || to.path === "/signup" || to.path === "/")) {
    // Clear any stale user data from localStorage when going to auth pages without being authenticated
    if (localStorage.getItem("user")) {
      console.log("Clearing stale user data from localStorage")
      localStorage.removeItem("user")
    }
    next()
    return
  }

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // If not authenticated, redirect to login
    if (!user) {
      console.log("Route requires auth but user is not authenticated, redirecting to signin")
      next({
        path: "/signin",
        query: { redirect: to.fullPath },
      })
      return
    }

    const { role: userRole, isVerified } = await getUserVerificationStatus(user)
    console.log(`Route requires auth - user role: ${userRole}, verified: ${isVerified}`)

    // If user is not verified, redirect to signin for verification
    if (!isVerified) {
      console.log("User is not verified, redirecting to signin for verification")
      next({
        path: "/signin",
        query: { redirect: to.fullPath },
      })
      return
    }

    // If route requires specific role, check user role
    if (to.meta.role) {
      console.log(`Route requires role ${to.meta.role}, user has role ${userRole}`)

      // If user doesn't have required role, redirect to appropriate dashboard
      if (userRole !== to.meta.role) {
        console.log(`User role ${userRole} doesn't match required role ${to.meta.role}, redirecting`)
        if (userRole === "professional") {
          next({ path: "/professional/dashboard" })
        } else {
          next({ path: "/user/dashboard" })
        }
        return
      }
    }

    // User is authenticated, verified, and has required role, proceed
    console.log("User is authenticated, verified, and has required role, proceeding")
    next()
  } else {
    if (user && (to.path === "/signin" || to.path === "/signup" || to.path === "/")) {
      // Check user verification status to determine if they should be redirected
      const { role: userRole, isVerified } = await getUserVerificationStatus(user)
      console.log(`User accessing auth page - role: ${userRole}, verified: ${isVerified}`)

      // Only redirect to dashboard if user is verified
      if (isVerified) {
        console.log(`Verified user trying to access ${to.path}, redirecting to ${userRole} dashboard`)
        if (userRole === "professional") {
          next({ path: "/professional/dashboard" })
        } else {
          next({ path: "/user/dashboard" })
        }
        return
      } else {
        // Unverified user can stay on signin/signup pages for verification
        console.log("Unverified user accessing auth page, allowing access for verification")
        next()
        return
      }
    }

    // Otherwise proceed normally
    console.log("Route doesn't require auth, proceeding normally")
    next()
  }
})

export default router


