<template>
  <div class="font-serif bg-white text-black leading-relaxed tracking-wide text-sm p-4 max-w-[8.4in] mx-auto box-border">
    <!-- Header Section -->
    <header class="text-center mb-6 pb-4 border-b-2 border-gray-800">
      <div class="text-center text-xs leading-tight text-gray-700 mb-4">
        <p class="mb-1 font-bold">Republic of the Philippines</p>
        <p class="mb-1 font-bold">DEPARTMENT OF AGRICULTURE</p>
        <p class="mb-1 font-bold">MIMAROPA REGION</p>
      </div>
      <h1 class="text-base font-bold text-black my-4 uppercase text-center">
        {{ reportData.title || 'PEST INFESTATION REPORT' }}
      </h1>
      <div class="text-xs text-gray-700 mt-4">
        <p class="my-2 font-normal">Date: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        <p class="my-2 font-normal">Location: {{ getReportLocationComputed }}</p>
      </div>
    </header>

    <!-- General Remarks / Introductory Notes -->
    <section v-if="reportData.remarks" class="mb-6">
      <h4 class="text-sm font-bold text-black mt-4 mb-3">General Remarks</h4>
      <p class="text-xs text-gray-700 text-justify mb-4 leading-relaxed">{{ reportData.remarks }}</p>
    </section>

    <!-- Specific Report Content (Pest Details) -->
    <template v-if="reportType === 'specific'">
      <section v-for="(pestReport, index) in reportData.pestReports" :key="index" class="mb-6 pb-4 border-b border-gray-300 last:border-b-0 last:mb-4">
        <h3 class="text-sm font-bold text-black mb-4">
          Pest Type: {{ pestReport.pestName }} <span v-if="pestReport.pestScientificName">({{ pestReport.pestScientificName }})</span>
        </h3>
        
        <div class="mb-5">
          <h4 class="text-xs font-bold text-black mt-4 mb-2">Description of Infestation:</h4>
          <p class="text-xs text-gray-700 text-justify mb-4 leading-relaxed">{{ pestReport.description }}</p>
        </div>
        
        <div class="mb-5">
          <h4 class="text-xs font-bold text-black mt-4 mb-2">Recommendations:</h4>
          <ol class="list-decimal ml-6 pl-0 text-gray-700 text-xs space-y-2">
            <li v-for="(rec, recIndex) in pestReport.recommendations.split('\n').filter(Boolean)" :key="recIndex" class="leading-relaxed">{{ rec }}</li>
            <li v-if="pestReport.recommendations.split('\n').filter(Boolean).length === 0" class="text-gray-500">No recommendations provided.</li>
          </ol>
        </div>
        
        <div v-if="pestReport.actionsTaken && pestReport.actionsTaken.split('\n').filter(Boolean).length > 0" class="mb-5">
          <h4 class="text-xs font-bold text-black mt-4 mb-2">Actions Taken:</h4>
          <ol class="list-decimal ml-6 pl-0 text-gray-700 text-xs space-y-2">
            <li v-for="(action, actionIndex) in pestReport.actionsTaken.split('\n').filter(Boolean)" :key="actionIndex" class="leading-relaxed">{{ action }}</li>
          </ol>
        </div>
      </section>
    </template>

    <!-- General Report Content (Summary & Trends) -->
    <template v-else-if="reportType === 'general'">
      <section class="mb-6">
        <h3 class="text-sm font-bold text-black mt-4 mb-3">Summary of Detections</h3>
        
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-gray-50 p-3 border border-gray-300 rounded text-center">
            <h4 class="text-xs font-normal text-gray-600 mb-1">Total Detections</h4>
            <p class="text-sm font-bold text-green-600 m-0">{{ reportSummaryComputed.totalDetections }}</p>
          </div>
          <div class="bg-gray-50 p-3 border border-gray-300 rounded text-center">
            <h4 class="text-xs font-normal text-gray-600 mb-1">Overall Risk Level</h4>
            <p class="text-sm font-bold m-0" :class="{
              'text-red-600': reportSummaryComputed.overallRiskLevel === 'High',
              'text-yellow-500': reportSummaryComputed.overallRiskLevel === 'Medium',
              'text-green-600': reportSummaryComputed.overallRiskLevel === 'Low'
            }">
              {{ reportSummaryComputed.overallRiskLevel }}
            </p>
          </div>
          <div class="bg-gray-50 p-3 border border-gray-300 rounded text-center">
            <h4 class="text-xs font-normal text-gray-600 mb-1">Unique Farms Affected</h4>
            <p class="text-sm font-bold text-green-600 m-0">{{ reportSummaryComputed.uniqueFarmsCount }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5 mt-5">
          <div>
            <h4 class="text-sm font-bold text-black mt-4 mb-3">Top 3 Most Common Issues</h4>
            <ul class="list-decimal ml-6 pl-0 text-gray-700 text-xs space-y-2">
              <li v-for="(issue, index) in reportSummaryComputed.topIssues" :key="index" class="leading-relaxed">
                {{ issue.name }} ({{ issue.type }}) - {{ issue.count }} detections
              </li>
              <li v-if="reportSummaryComputed.topIssues.length === 0" class="text-gray-500">No issues detected in this period.</li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-bold text-black mt-4 mb-3">Top 3 Locations by Detections</h4>
            <ul class="list-decimal ml-6 pl-0 text-gray-700 text-xs space-y-2">
              <li v-for="(location, index) in reportSummaryComputed.topLocations" :key="index" class="leading-relaxed">
                {{ location.name }} - {{ location.count }} detections
              </li>
              <li v-if="reportSummaryComputed.topLocations.length === 0" class="text-gray-500">No locations with detections in this period.</li>
            </ul>
          </div>
        </div>
        
        <div v-if="reportData.includeChartSnapshot" class="mt-5 text-center">
          <h4 class="text-sm font-bold text-black mt-4 mb-3">Analytics Chart Snapshot</h4>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'%3E%3Crect width='600' height='300' fill='%23eee'/%3E%3Ctext x='300' y='150' font-family='sans-serif' font-size='30' fill='%23aaa' text-anchor='middle' dominant-baseline='middle'%3EAnalytics Chart Placeholder%3C/text%3E%3C/svg%3E" alt="Analytics Chart" class="max-w-full h-auto max-h-24 border border-gray-300 rounded mt-2" />
        </div>
      </section>
    </template>

    <!-- Detailed Scan Records Section - INLINE with main content -->
    <div v-if="reportType === 'specific' && scanData.length > 0" class="mt-6 mb-5 pt-4 border-t border-gray-800">
      <h3 class="text-sm font-bold text-black mt-4 mb-3">Detailed Scan Records</h3>
      <div v-for="(scan, scanIndex) in scanData" :key="scan.analysisId" class="mb-4 pb-3 border-b border-dashed border-gray-300 last:border-b-0 last:mb-2">
        <h4 class="text-xs font-bold text-black mb-2">Scan Record #{{ scanIndex + 1 }} (ID: {{ scan.analysisId.substring(0, 8) }}...)</h4>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs text-gray-700 leading-relaxed">
          <div><strong class="text-black">Date:</strong> {{ formatDate(scan.timestamp) }}</div>
          <div><strong class="text-black">User/Farm:</strong> {{ scan.userDisplayName || 'N/A' }} / {{ scan.userLocationDetails?.farmName || 'N/A' }}</div>
          <div><strong class="text-black">Location:</strong> {{ scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay || 'N/A' }}, {{ scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality || 'N/A' }}</div>
          <div><strong class="text-black">Plant Type:</strong> {{ scan.plantType || 'N/A' }}</div>
          <div><strong class="text-black">Detected Issue:</strong> {{ scan.diseaseDetails?.name || scan.disease || 'N/A' }} ({{ scan.confidence || 'N/A' }}% conf.)</div>
          <div><strong class="text-black">Severity:</strong> 
            <span :class="{ 
              'text-red-600': scan.severity === 'High', 
              'text-yellow-500': scan.severity === 'Medium', 
              'text-green-600': scan.severity === 'Low' 
            }">{{ scan.severity || 'N/A' }}</span>
          </div>
          <div><strong class="text-black">Weather:</strong> {{ scan.weather?.condition || 'N/A' }} ({{ scan.weather?.temperature || 'N/A' }}°C, {{ scan.weather?.humidity || 'N/A' }}% humidity)</div>
          <div><strong class="text-black">Technical:</strong> {{ scan.captureMethod || 'N/A' }} / {{ scan.deviceType || 'N/A' }}</div>
          <div class="col-span-2">
            <strong class="text-black">Image:</strong>
            <span v-if="scan.imageUrl">Image available (not embedded for print)</span>
            <span v-else>No image available</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Information and Signatures -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-xs text-gray-700 text-justify mb-4 leading-relaxed">
        Report generated for {{ getReportPlantTypesComputed }} plantation(s) in {{ getReportLocationComputed }} on {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}.
      </p>
      <p class="text-xs text-gray-700 text-justify mb-4 leading-relaxed">
        The farms of {{ getReportFarmNamesComputed }} were included in this report.
      </p>
      <p class="text-xs text-gray-700 text-justify mb-6 leading-relaxed">
        For further clarifications, please contact {{ reportData.contactInfo.name }} at
        {{ reportData.contactInfo.phone1 }} <span v-if="reportData.contactInfo.phone2">or {{ reportData.contactInfo.phone2 }}</span> or email us at
        {{ reportData.contactInfo.email }}.
      </p>

      <div class="flex justify-around mt-8 mb-5 text-center">
        <div class="flex-1 px-6">
          <p class="font-bold mb-8 text-black text-xs">Prepared by:</p>
          <p class="font-bold border-b border-black pb-2 mb-2 text-black uppercase text-xs">{{ reportData.preparedBy.name }}</p>
          <p class="text-2xs text-gray-700 mt-1">{{ reportData.preparedBy.title }}</p>
        </div>
        <div class="flex-1 px-6">
          <p class="font-bold mb-8 text-black text-xs">Noted by:</p>
          <p class="font-bold border-b border-black pb-2 mb-2 text-black uppercase text-xs">{{ reportData.notedBy.name }}</p>
          <p class="text-2xs text-gray-700 mt-1">{{ reportData.notedBy.title }}</p>
        </div>
      </div>

      <div class="text-center text-2xs text-gray-500 mt-5 pt-4 border-t border-gray-200">
        <p>&copy; {{ new Date().getFullYear() }} Department of Agriculture - MIMAROPA Region. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  reportData: Object,
  scanData: Array,
  reportType: String,
});

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

const getReportLocationComputed = computed(() => {
  const municipalities = new Set();
  const barangays = new Set();
  props.scanData.forEach(scan => {
    if (scan.userLocationDetails?.municipality?.name || scan.userLocationDetails?.municipality) {
      municipalities.add(scan.userLocationDetails.municipality.name || scan.userLocationDetails.municipality);
    }
    if (scan.userLocationDetails?.barangay?.name || scan.userLocationDetails?.barangay) {
      barangays.add(scan.userLocationDetails.barangay.name || scan.userLocationDetails.barangay);
    }
  });
  const muniStr = [...municipalities].join(', ');
  const brgyStr = [...barangays].join(', ');
  if (brgyStr && muniStr) return `${brgyStr}, ${muniStr}`;
  if (muniStr) return `${muniStr}`;
  return 'Various Locations';
});

const getReportPlantTypesComputed = computed(() => {
  const plantTypes = new Set();
  props.scanData.forEach(scan => {
    if (scan.plantType) {
      plantTypes.add(scan.plantType);
    }
  });
  return [...plantTypes].join(', ') || 'various';
});

const getReportFarmNamesComputed = computed(() => {
  const farmNames = new Set();
  props.scanData.forEach(scan => {
    if (scan.userLocationDetails?.farmName) {
      farmNames.add(scan.userLocationDetails.farmName);
    }
  });
  return [...farmNames].join(', ') || 'various farms';
});

const reportSummaryComputed = computed(() => {
  const data = props.scanData;

  const totalDetections = data.length;
  const issueCounts = {};
  const locationCounts = {};
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
    overallRiskLevel = 'Low';
  }

  return {
    totalDetections,
    overallRiskLevel,
    topIssues,
    topLocations,
    uniqueFarmsCount: uniqueFarmNames.size,
  };
});
</script>

<style scoped>
/* Minimal custom CSS with Tailwind classes handling most styling */
@media print {
  @page {
    size: 8.5in 13in;
    margin: 0.1in !important;
  }

  .font-serif {
    font-size: 9pt !important;
    line-height: 1.5 !important;
  }

  * {
    page-break-before: avoid !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
    break-before: avoid !important;
    break-after: avoid !important;
    break-inside: avoid !important;
  }
}

/* Custom text size for very small text */
.text-2xs {
  font-size: 0.625rem;
  line-height: 0.75rem;
}
</style>
