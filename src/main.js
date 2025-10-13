import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.css"
import App from "./App.vue"
import router from "./router/index.js"
import { auth } from "./firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import "v-calendar/dist/style.css" // Import V-Calendar styles
import VCalendar from "v-calendar" // Import V-Calendar
import { createI18n } from 'vue-i18n';

import en from './locales/en.json';
import tl from './locales/tl.json'; 

// Create WebSocket
const ws = new WebSocket("ws://localhost:8080")

// Make WebSocket available globally immediately
window.ws = ws

ws.onopen = () => {
  console.log("Connected to WebSocket")
  ws.send("Hello from Frontend!")
}

ws.onmessage = (event) => {
  console.log("Received:", event.data)
}

// Create Pinia (store)
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Wait for Firebase Auth to initialize before starting app
let appInitialized = false
onAuthStateChanged(auth, (user) => {
  if (!appInitialized) {
    app.use(router)
    app.use(pinia)
    app.use(VCalendar, {}) // Register V-Calendar plugin here
    app.use(i18n)
    app.config.globalProperties.$ws = ws
    app.mount("#app")
    appInitialized = true
  }
})
const i18n = createI18n({
  legacy: false,
  locale: 'en', // The language that shows up first
  fallbackLocale: 'en',
  messages: {
    en, // English messages
    tl  // 🇹🇬 Tagalog messages
  },
});

export default ws
