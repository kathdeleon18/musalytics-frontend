import { db } from "../firebase/config" // Assuming firebase/config exports 'db'
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"

const OPEN_METEO_API_URL = import.meta.env.VITE_OPEN_METEO_API_URL || "https://api.open-meteo.com/v1/forecast"
const OPEN_METEO_ARCHIVE_API_URL =
  import.meta.env.VITE_OPEN_METEO_ARCHIVE_API_URL || "https://archive-api.open-meteo.com/v1/archive"

// Changed to WeatherAPI endpoint for alerts
const WEATHERAPI_API_URL = "https://api.weatherapi.com/v1/current.json"
const WEATHERAPI_API_KEY = import.meta.env.VITE_WEATHERAPI_API_KEY // Your WeatherAPI Key

/**
 * Fetches current weather data and forecast data from Open-Meteo for a given latitude and longitude.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing current, hourly, and daily forecast data, or null if an error occurs.
 */
export async function fetchCurrentAndForecastWeatherData(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index", // Added uv_index
      hourly: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m", // Added for hourly forecast
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max", // Added uv_index_max for daily forecast
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use user's local timezone
    })
    const response = await fetch(`${OPEN_METEO_API_URL}?${params.toString()}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const data = await response.json()
    console.log("Open-Meteo current and forecast data:", data)
    return data
  } catch (err) {
    console.error("Error fetching current and forecast weather data:", err)
    return null
  }
}

/**
 * Fetches historical daily weather data from Open-Meteo Archive API.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {string} startDate - Start date in YYYY-MM-DD format.
 * @param {string} endDate - End date in YYYY-MM-DD format.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing daily historical data, or null if an error occurs.
 */
export async function fetchHistoricalDailyArchiveData(latitude, longitude, startDate, endDate) {
  try {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      start_date: startDate,
      end_date: endDate,
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    const response = await fetch(`${OPEN_METEO_ARCHIVE_API_URL}?${params.toString()}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Open-Meteo Archive API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const data = await response.json()
    console.log("Open-Meteo historical daily data:", data)
    return data
  } catch (err) {
    console.error("Error fetching historical daily weather data:", err)
    return null
  }
}

/**
 * Fetches historical hourly weather data from Open-Meteo Archive API.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {string} startDate - Start date in YYYY-MM-DD format.
 * @param {string} endDate - End date in YYYY-MM-DD format.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing hourly historical data, or null if an error occurs.
 */
export async function fetchHistoricalHourlyArchiveData(latitude, longitude, startDate, endDate) {
  try {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      start_date: startDate,
      end_date: endDate,
      hourly: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    const response = await fetch(`${OPEN_METEO_ARCHIVE_API_URL}?${params.toString()}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Open-Meteo Archive API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const data = await response.json()
    console.log("Open-Meteo historical hourly data:", data)
    return data
  } catch (err) {
    console.error("Error fetching historical hourly weather data:", err)
    return null
  }
}

/**
 * Fetches active weather alerts from WeatherAPI.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Array>} - A promise that resolves to an array of weather alerts.
 */
export async function fetchWeatherAPIAlerts(latitude, longitude) {
  if (!WEATHERAPI_API_KEY) {
    console.warn("WeatherAPI Key is not set. Weather alerts will not be fetched.")
    return []
  }
  try {
    const params = new URLSearchParams({
      key: WEATHERAPI_API_KEY,
      q: `${latitude},${longitude}`,
      alerts: "yes", // Request alerts data
    })
    const response = await fetch(`${WEATHERAPI_API_URL}?${params.toString()}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WeatherAPI error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const data = await response.json()
    console.log("WeatherAPI alerts data:", data)
    if (!data.alerts || !data.alerts.alert || data.alerts.alert.length === 0) {
      return []
    }
    // Map WeatherAPI alerts to the existing alert structure
    return data.alerts.alert.map((alert) => {
      const effectiveDate = new Date(alert.effective)
      const expiresDate = new Date(alert.expires)
      const effectiveTime = effectiveDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      const expiresTime = expiresDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      const duration = expiresDate
        ? `Until ${expiresDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${expiresTime}`
        : "Ongoing"
      // Map WeatherAPI severity to existing categories
      let severity = "advisory"
      const weatherApiSeverity = alert.severity.toLowerCase()
      if (weatherApiSeverity === "extreme" || weatherApiSeverity === "severe") {
        severity = "severe"
      } else if (weatherApiSeverity === "moderate") {
        severity = "warning"
      } else if (weatherApiSeverity === "minor") {
        severity = "low"
      }
      return {
        title: alert.event || alert.headline || "Weather Alert",
        description: alert.msg || "No specific description provided.",
        severity: severity,
        time: effectiveTime, // Use formatted effective time
        duration: duration, // Use formatted duration
        preventionTips: alert.instruction ? [alert.instruction] : [], // WeatherAPI has 'instruction'
      }
    })
  } catch (err) {
    console.error("Error fetching WeatherAPI weather alerts:", err)
    return [] // Return empty array on error
  }
}

/**
 * Returns a human-readable description for a given WMO weather code.
 * @param {number} weatherCode - The WMO weather code.
 * @returns {string} - The human-readable weather description.
 */
export function getWeatherDescription(weatherCode) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  }
  return codes[weatherCode] || "Unknown"
}

/**
 * Returns a simplified weather condition for icon mapping.
 * @param {number} wmoCode - The WMO weather code.
 * @returns {string} - The simplified weather condition.
 */
export function getSimplifiedCondition(wmoCode) {
  if ([0, 1].includes(wmoCode)) return "Clear"
  if ([2].includes(wmoCode)) return "Partly Cloudy"
  if ([3].includes(wmoCode)) return "Cloudy"
  if ([45, 48].includes(wmoCode)) return "Fog"
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(wmoCode)) return "Rain"
  if ([71, 73, 75, 77, 85, 86].includes(wmoCode)) return "Snow"
  if ([95, 96, 99].includes(wmoCode)) return "Thunderstorm"
  return "Unknown"
}

/**
 * Classifies current weather into broad categories for trend analysis.
 * @param {Object} weatherData - An object containing temperature, humidity, and precipitation.
 * @returns {string} - A simplified weather classification (e.g., "Warm & Humid", "Dry Season").
 */
export function getSimplifiedWeatherClassification(weatherData) {
  const temp = weatherData.temperature
  const humidity = weatherData.humidity
  const rainfall = weatherData.precipitation // Use precipitation from scan_history

  if (temp >= 28 && humidity >= 80 && rainfall > 5) {
    return "Hot & Rainy"
  } else if (temp >= 25 && humidity >= 70) {
    return "Warm & Humid"
  } else if (temp < 20 && rainfall > 0) {
    return "Cool & Wet"
  } else if (temp >= 25 && rainfall < 2) {
    return "Warm & Dry"
  } else if (temp < 25 && rainfall < 2) {
    return "Mild & Dry"
  }
  return "Moderate" // Default or unclassified
}

/**
 * Fetches historical scan data from Firestore for a given user and location.
 * @param {string} userId - The ID of the user.
 * @param {number} latitude - The latitude of the farm location.
 * @param {number} longitude - The longitude of the farm location.
 * @param {number} daysBack - Number of days to fetch historical data for.
 * @returns {Promise<Array>} - A promise that resolves to an array of scan history documents.
 */
export async function fetchScanHistory(userId, latitude, longitude, daysBack = 365) {
  try {
    const scanHistoryRef = collection(db, "scan_history")
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - daysBack)

    const q = query(
      scanHistoryRef,
      where("userId", "==", userId),
      where("location.latitude", "==", latitude),
      where("location.longitude", "==", longitude),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate)),
    )

    const querySnapshot = await getDocs(q)
    const scanHistoryData = []
    querySnapshot.forEach((doc) => {
      scanHistoryData.push({ id: doc.id, ...doc.data() })
    })
    console.log(`Fetched ${scanHistoryData.length} historical scan records.`)
    return scanHistoryData
  } catch (error) {
    console.error("Error fetching scan history:", error)
    return []
  }
}

/**
 * Processes raw scan history data to identify and summarize historical disease and pest trends.
 * @param {Array} scanHistoryData - An array of raw scan history documents.
 * @returns {Array} - An array of trend-based alerts derived from historical data.
 */
export function processScanHistoryForTrends(scanHistoryData) {
  const trendsMap = new Map()

  scanHistoryData.forEach((scan) => {
    const diseaseOrPestName = scan.disease || scan.pest // Assuming 'pest' field might exist for pests
    if (!diseaseOrPestName) return

    const simplifiedWeather = getSimplifiedWeatherClassification(scan.weather)
    const severity = scan.severity || "low" // Default to low if not specified

    if (!trendsMap.has(diseaseOrPestName)) {
      trendsMap.set(diseaseOrPestName, {
        title: `${diseaseOrPestName} Risk (Historical Trend)`,
        description: `Historically, this has been observed with specific weather patterns.`,
        severity: "low", // Will be updated based on max severity
        relevantConditions: new Set(),
        preventionTips: new Set(),
        occurrences: 0,
        highSeverityCount: 0,
      })
    }

    const trend = trendsMap.get(diseaseOrPestName)
    trend.occurrences++
    trend.relevantConditions.add(simplifiedWeather)

    // Aggregate prevention tips
    if (scan.preventionTips && Array.isArray(scan.preventionTips)) {
      scan.preventionTips.forEach((tip) => trend.preventionTips.add(tip))
    }
    if (scan.diseaseDetails && scan.diseaseDetails.prevention) {
      // Assuming prevention is a string that might contain HTML list items
      const parser = new DOMParser()
      const doc = parser.parseFromString(scan.diseaseDetails.prevention, "text/html")
      const listItems = doc.querySelectorAll("li")
      listItems.forEach((li) => trend.preventionTips.add(li.textContent.trim()))
    }

    // Update overall severity for the trend
    if (severity === "High") {
      trend.severity = "severe" // If any high severity, mark trend as severe
    } else if (severity === "Medium" && trend.severity !== "severe") {
      trend.severity = "medium"
    } else if (severity === "Low" && trend.severity !== "severe" && trend.severity !== "medium") {
      trend.severity = "low"
    }
  })

  const processedTrends = Array.from(trendsMap.values()).map((trend) => ({
    ...trend,
    relevantConditions: Array.from(trend.relevantConditions).join(", "),
    preventionTips: Array.from(trend.preventionTips),
    description: `Observed ${trend.occurrences} time(s) under conditions like: ${Array.from(trend.relevantConditions).join(", ")}.`,
  }))

  console.log("Processed historical disease/pest trends:", processedTrends)
  return processedTrends
}

/**
 * Identifies current disease and pest correlations based on current weather and historical scan data.
 * @param {Object} currentWeather - The current weather data (temperature, humidity, precipitation).
 * @param {Array} scanHistoryData - An array of raw historical scan documents.
 * @returns {Array} - An array of current correlation alerts.
 */
export function getCurrentDiseasePestCorrelations(currentWeather, scanHistoryData) {
  const correlationsMap = new Map()

  scanHistoryData.forEach((scan) => {
    const scanWeather = scan.weather
    const diseaseOrPestName = scan.disease || scan.pest
    if (!diseaseOrPestName || !scanWeather) return

    // Simple similarity check
    const tempDiff = Math.abs(currentWeather.temperature - scanWeather.temperature)
    const humidityDiff = Math.abs(currentWeather.humidity - scanWeather.humidity)
    const rainfallCurrent = currentWeather.rainfall > 0 ? "rainy" : "dry"
    const rainfallScan = scanWeather.precipitation > 0 ? "rainy" : "dry"

    const isSimilar =
      tempDiff <= 3 && // within 3 degrees C
      humidityDiff <= 10 && // within 10% humidity
      rainfallCurrent === rainfallScan // same general rainfall condition

    if (isSimilar) {
      if (!correlationsMap.has(diseaseOrPestName)) {
        correlationsMap.set(diseaseOrPestName, {
          title: `${diseaseOrPestName} Risk`,
          description: scan.description || scan.diseaseDetails?.shortDescription || "No specific description provided.",
          severity: scan.severity || "low",
          preventionTips: new Set(),
          occurrences: 0,
          avgTemp: 0,
          avgHumidity: 0,
          avgRainfall: 0,
        })
      }
      const correlation = correlationsMap.get(diseaseOrPestName)
      correlation.occurrences++
      correlation.avgTemp += scanWeather.temperature
      correlation.avgHumidity += scanWeather.humidity
      correlation.avgRainfall += scanWeather.precipitation

      // Aggregate prevention tips
      if (scan.preventionTips && Array.isArray(scan.preventionTips)) {
        scan.preventionTips.forEach((tip) => correlation.preventionTips.add(tip))
      }
      if (scan.diseaseDetails && scan.diseaseDetails.prevention) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(scan.diseaseDetails.prevention, "text/html")
        const listItems = doc.querySelectorAll("li")
        listItems.forEach((li) => correlation.preventionTips.add(li.textContent.trim()))
      }
    }
  })

  const result = Array.from(correlationsMap.values()).map((corr) => {
    return {
      ...corr,
      description: `Observed ${corr.occurrences} time(s) under similar weather conditions. ${corr.description}`,
      preventionTips: Array.from(corr.preventionTips),
      avgTemp: (corr.avgTemp / corr.occurrences).toFixed(1),
      avgHumidity: (corr.avgHumidity / corr.occurrences).toFixed(1),
      avgRainfall: (corr.avgRainfall / corr.occurrences).toFixed(1),
    }
  })

  // Sort by severity (High > Medium > Low)
  result.sort((a, b) => {
    const severityOrder = { High: 3, Medium: 2, Low: 1, advisory: 0, severe: 3, warning: 2 } // Map WeatherAPI severities too
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
  })

  console.log("Current disease/pest correlations:", result)
  return result
}
