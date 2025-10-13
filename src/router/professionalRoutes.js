/*** Professional routes configuration * This file contains all routes for the professional dashboard */

// Import professional views
const professionalRoutes = [
  {
    path: "/professional/dashboard",
    name: "professional-dashboard",
    component: () => import("../views/professional/DashboardView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/users",
    name: "professional-users",
    component: () => import("../views/professional/UserManagementView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/learning",
    name: "professional-learning",
    component: () => import("../views/professional/LearningManagementView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/profile",
    name: "professional-profile",
    component: () => import("../views/professional/ProfileManagementView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/diseases",
    name: "professional-diseases",
    component: () => import("../views/professional/DiseaseManagementView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/reports", // New route for the Report Page
    name: "professional-reports",
    component: () => import("../views/professional/ReportPage.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/analytics", // New route for the Analytics Page
    name: "professional-analytics",
    component: () => import("../views/professional/AnalyticsPage.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  {
    path: "/professional/mapping", // New route for the Analytics Page
    name: "professional-mapping",
    component: () => import("../views/professional/MappingView.vue"),
    meta: { requiresAuth: true, role: "professional" },
  },
  // Additional routes will be added as their corresponding view files are created
]

export default professionalRoutes
