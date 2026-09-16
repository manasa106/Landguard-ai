import React, { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

/* =========================================================
   LANDGUARD AI
   Complete React Frontend Demo
========================================================= */

/* =========================================================
   1. LANGUAGES
========================================================= */

const LANGUAGES = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  as: "অসমীয়া",
  bn: "বাংলা",
  ne: "नेपाली",
  mizo: "Mizo",
  kok: "Kokborok",
  mni: "Meitei",
  kh: "Khasi",
  nag: "Nagamese",
};

const T = {
  en: {
    dashboard: "Dashboard",
    map: "India Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "Locate Me",
    newReport: "New Report",
    calculate: "Calculate Risk",
    safeRoute: "Safe Route",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "Send SOS",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Rainfall",
    soil: "Soil Moisture",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },

  hi: {
    dashboard: "डैशबोर्ड",
    map: "भारत जोखिम मानचित्र",
    weather: "लाइव मौसम",
    analytics: "जोखिम विश्लेषण",
    calculator: "जोखिम कैलकुलेटर",
    reports: "खतरा रिपोर्ट",
    rescue: "रेस्क्यू डैशबोर्ड",
    incidents: "घटनाएँ",
    sos: "SOS अलर्ट",
    admin: "एडमिन डैशबोर्ड",
    monitor: "रिपोर्ट मॉनिटर",
    users: "उपयोगकर्ता",
    logout: "लॉगआउट",
    locate: "मेरा स्थान",
    newReport: "नई रिपोर्ट",
    calculate: "जोखिम गणना",
    safeRoute: "सुरक्षित मार्ग",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    gps: "GPS",
    emergency: "आपातकाल",
    cancel: "रद्द करें",
    sendSOS: "SOS भेजें",
    weatherTitle: "लाइव मौसम",
    risk: "जोखिम",
    rainfall: "बारिश",
    soil: "मिट्टी की नमी",
    slope: "ढलान",
    high: "उच्च",
    critical: "गंभीर",
    moderate: "मध्यम",
    low: "कम",
    aiAgent: "AI एजेंट",
  },

  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    map: "ಭಾರತ ಅಪಾಯ ನಕ್ಷೆ",
    weather: "ಲೈವ್ ಹವಾಮಾನ",
    analytics: "ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ",
    calculator: "ಅಪಾಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    reports: "ಅಪಾಯ ವರದಿಗಳು",
    rescue: "ರಕ್ಷಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    incidents: "ಘಟನೆಗಳು",
    sos: "SOS ಎಚ್ಚರಿಕೆಗಳು",
    admin: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    monitor: "ವರದಿ ಮಾನಿಟರ್",
    users: "ಬಳಕೆದಾರರು",
    logout: "ಲಾಗ್‌ಔಟ್",
    locate: "ನನ್ನ ಸ್ಥಳ",
    newReport: "ಹೊಸ ವರದಿ",
    calculate: "ಅಪಾಯ ಲೆಕ್ಕಿಸಿ",
    safeRoute: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ",
    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್",
    gps: "GPS",
    emergency: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
    cancel: "ರದ್ದು",
    sendSOS: "SOS ಕಳುಹಿಸಿ",
    weatherTitle: "ಲೈವ್ ಹವಾಮಾನ",
    risk: "ಅಪಾಯ",
    rainfall: "ಮಳೆ",
    soil: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    slope: "ಇಳಿಜಾರು",
    high: "ಹೆಚ್ಚು",
    critical: "ಅತ್ಯಂತ ಹೆಚ್ಚು",
    moderate: "ಮಧ್ಯಮ",
    low: "ಕಡಿಮೆ",
    aiAgent: "AI ಏಜೆಂಟ್",
  },

  as: {
    dashboard: "ডেশ্বব'ৰ্ড",
    map: "ভাৰত বিপদ মানচিত্ৰ",
    weather: "লাইভ বতৰ",
    analytics: "বিপদ বিশ্লেষণ",
    calculator: "বিপদ কেলকুলেটৰ",
    reports: "বিপদ প্ৰতিবেদন",
    rescue: "উদ্ধাৰ ডেশ্বব'ৰ্ড",
    incidents: "ঘটনা",
    sos: "SOS সতৰ্কতা",
    admin: "এডমিন ডেশ্বব'ৰ্ড",
    monitor: "প্ৰতিবেদন মনিটৰ",
    users: "ব্যৱহাৰকাৰী",
    logout: "লগআউট",
    locate: "মোৰ স্থান",
    newReport: "নতুন প্ৰতিবেদন",
    calculate: "বিপদ গণনা",
    safeRoute: "নিৰাপদ পথ",
    online: "অনলাইন",
    offline: "অফলাইন",
    gps: "GPS",
    emergency: "জৰুৰীকালীন",
    cancel: "বাতিল",
    sendSOS: "SOS পঠাওক",
    weatherTitle: "লাইভ বতৰ",
    risk: "বিপদ",
    rainfall: "বৰষুণ",
    soil: "মাটিৰ আৰ্দ্ৰতা",
    slope: "ঢাল",
    high: "উচ্চ",
    critical: "গুৰুতৰ",
    moderate: "মধ্যম",
    low: "কম",
    aiAgent: "AI এজেন্ট",
  },

  bn: {
    dashboard: "ড্যাশবোর্ড",
    map: "ভারত ঝুঁকি মানচিত্র",
    weather: "লাইভ আবহাওয়া",
    analytics: "ঝুঁকি বিশ্লেষণ",
    calculator: "ঝুঁকি ক্যালকুলেটর",
    reports: "বিপদ রিপোর্ট",
    rescue: "রেসকিউ ড্যাশবোর্ড",
    incidents: "ঘটনা",
    sos: "SOS সতর্কতা",
    admin: "অ্যাডমিন ড্যাশবোর্ড",
    monitor: "রিপোর্ট মনিটর",
    users: "ব্যবহারকারী",
    logout: "লগআউট",
    locate: "আমার অবস্থান",
    newReport: "নতুন রিপোর্ট",
    calculate: "ঝুঁকি গণনা",
    safeRoute: "নিরাপদ পথ",
    online: "অনলাইন",
    offline: "অফলাইন",
    gps: "GPS",
    emergency: "জরুরি",
    cancel: "বাতিল",
    sendSOS: "SOS পাঠান",
    weatherTitle: "লাইভ আবহাওয়া",
    risk: "ঝুঁকি",
    rainfall: "বৃষ্টি",
    soil: "মাটির আর্দ্রতা",
    slope: "ঢাল",
    high: "উচ্চ",
    critical: "গুরুতর",
    moderate: "মাঝারি",
    low: "কম",
    aiAgent: "AI এজেন্ট",
  },

  ne: {
    dashboard: "ड्यासबोर्ड",
    map: "भारत जोखिम नक्सा",
    weather: "लाइभ मौसम",
    analytics: "जोखिम विश्लेषण",
    calculator: "जोखिम क्याल्कुलेटर",
    reports: "जोखिम रिपोर्ट",
    rescue: "रेस्क्यु ड्यासबोर्ड",
    incidents: "घटनाहरू",
    sos: "SOS अलर्ट",
    admin: "एडमिन ड्यासबोर्ड",
    monitor: "रिपोर्ट मोनिटर",
    users: "प्रयोगकर्ताहरू",
    logout: "लगआउट",
    locate: "मेरो स्थान",
    newReport: "नयाँ रिपोर्ट",
    calculate: "जोखिम गणना",
    safeRoute: "सुरक्षित मार्ग",
    online: "अनलाइन",
    offline: "अफलाइन",
    gps: "GPS",
    emergency: "आपतकालीन",
    cancel: "रद्द",
    sendSOS: "SOS पठाउनुहोस्",
    weatherTitle: "लाइभ मौसम",
    risk: "जोखिम",
    rainfall: "वर्षा",
    soil: "माटोको नमी",
    slope: "ढलान",
    high: "उच्च",
    critical: "गम्भीर",
    moderate: "मध्यम",
    low: "कम",
    aiAgent: "AI एजेन्ट",
  },

  mizo: {
    dashboard: "Dashboard",
    map: "India Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "Ka awmna",
    newReport: "Report Thar",
    calculate: "Risk Chhut",
    safeRoute: "Khawvel Him",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "SOS Thawn",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Ruah",
    soil: "Lei tui",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },

  kok: {
    dashboard: "Dashboard",
    map: "Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "Locate Me",
    newReport: "New Report",
    calculate: "Calculate Risk",
    safeRoute: "Safe Route",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "Send SOS",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Rainfall",
    soil: "Soil Moisture",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },

  mni: {
    dashboard: "Dashboard",
    map: "Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "My Location",
    newReport: "New Report",
    calculate: "Calculate Risk",
    safeRoute: "Safe Route",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "Send SOS",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Rainfall",
    soil: "Soil Moisture",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },

  kh: {
    dashboard: "Dashboard",
    map: "Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "Locate Me",
    newReport: "New Report",
    calculate: "Calculate Risk",
    safeRoute: "Safe Route",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "Send SOS",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Rainfall",
    soil: "Soil Moisture",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },

  nag: {
    dashboard: "Dashboard",
    map: "Risk Map",
    weather: "Live Weather",
    analytics: "Risk Analytics",
    calculator: "Risk Calculator",
    reports: "Hazard Reports",
    rescue: "Rescue Dashboard",
    incidents: "Incidents",
    sos: "SOS Alerts",
    admin: "Admin Dashboard",
    monitor: "Monitor Reports",
    users: "Users",
    logout: "Logout",
    locate: "Locate Me",
    newReport: "New Report",
    calculate: "Calculate Risk",
    safeRoute: "Safe Route",
    online: "ONLINE",
    offline: "OFFLINE",
    gps: "GPS",
    emergency: "Emergency",
    cancel: "Cancel",
    sendSOS: "Send SOS",
    weatherTitle: "Live Weather",
    risk: "Risk",
    rainfall: "Rainfall",
    soil: "Soil Moisture",
    slope: "Slope",
    high: "High",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    aiAgent: "AI Agent",
  },
};

/* =========================================================
   2. NORTHEAST STATES
========================================================= */

const STATES = [
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    short: "AR",
    capital: "Itanagar",
    lat: 27.0844,
    lng: 93.6053,
    rainfall: 72,
    soil: 18,
    slope: 71,
    risk: 82,
  },
  {
    id: "assam",
    name: "Assam",
    short: "AS",
    capital: "Guwahati",
    lat: 26.1445,
    lng: 91.7362,
    rainfall: 64,
    soil: 14,
    slope: 76,
    risk: 42,
  },
  {
    id: "manipur",
    name: "Manipur",
    short: "MN",
    capital: "Imphal",
    lat: 24.817,
    lng: 93.9368,
    rainfall: 69,
    soil: 17,
    slope: 73,
    risk: 68,
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    short: "ML",
    capital: "Shillong",
    lat: 25.5788,
    lng: 91.8933,
    rainfall: 81,
    soil: 24,
    slope: 84,
    risk: 78,
  },
  {
    id: "mizoram",
    name: "Mizoram",
    short: "MZ",
    capital: "Aizawl",
    lat: 23.7271,
    lng: 92.7176,
    rainfall: 77,
    soil: 21,
    slope: 79,
    risk: 88,
  },
  {
    id: "nagaland",
    name: "Nagaland",
    short: "NL",
    capital: "Kohima",
    lat: 25.6751,
    lng: 94.1086,
    rainfall: 74,
    soil: 19,
    slope: 75,
    risk: 81,
  },
  {
    id: "sikkim",
    name: "Sikkim",
    short: "SK",
    capital: "Gangtok",
    lat: 27.3389,
    lng: 88.6065,
    rainfall: 86,
    soil: 28,
    slope: 82,
    risk: 93,
  },
  {
    id: "tripura",
    name: "Tripura",
    short: "TR",
    capital: "Agartala",
    lat: 23.8315,
    lng: 91.2868,
    rainfall: 58,
    soil: 13,
    slope: 67,
    risk: 49,
  },
];

/* =========================================================
   3. SAFE ZONES
========================================================= */

const SAFE_ZONES = [
  {
    id: "safe-1",
    name: "Itanagar Emergency Safe Zone",
    state: "Arunachal Pradesh",
    lat: 27.0844,
    lng: 93.6053,
    type: "Emergency Shelter",
  },
  {
    id: "safe-2",
    name: "Guwahati Emergency Centre",
    state: "Assam",
    lat: 26.1445,
    lng: 91.7362,
    type: "Rescue Centre",
  },
  {
    id: "safe-3",
    name: "Shillong Emergency Shelter",
    state: "Meghalaya",
    lat: 25.5788,
    lng: 91.8933,
    type: "Emergency Shelter",
  },
  {
    id: "safe-4",
    name: "Aizawl Emergency Centre",
    state: "Mizoram",
    lat: 23.7271,
    lng: 92.7176,
    type: "Rescue Centre",
  },
  {
    id: "safe-5",
    name: "Kohima Emergency Centre",
    state: "Nagaland",
    lat: 25.6751,
    lng: 94.1086,
    type: "Emergency Shelter",
  },
  {
    id: "safe-6",
    name: "Gangtok Emergency Shelter",
    state: "Sikkim",
    lat: 27.3389,
    lng: 88.6065,
    type: "Rescue Centre",
  },
  {
    id: "safe-7",
    name: "Agartala Emergency Centre",
    state: "Tripura",
    lat: 23.8315,
    lng: 91.2868,
    type: "Emergency Shelter",
  },
  {
    id: "safe-8",
    name: "Imphal Emergency Centre",
    state: "Manipur",
    lat: 24.817,
    lng: 93.9368,
    type: "Rescue Centre",
  },
];

/* =========================================================
   4. DEMO USERS
========================================================= */

const USERS = [
  {
    email: "citizen@landguard.ai",
    password: "123456",
    name: "Citizen User",
    role: "citizen",
  },
  {
    email: "rescue@landguard.ai",
    password: "123456",
    name: "Rescue Officer",
    role: "rescue",
  },
  {
    email: "admin@landguard.ai",
    password: "123456",
    name: "System Admin",
    role: "admin",
  },
];

/* =========================================================
   5. DEMO DATA
========================================================= */

const INITIAL_INCIDENTS = [
  {
    id: "INC-1001",
    location: "Tawang",
    state: "Arunachal Pradesh",
    severity: "high",
    type: "Slope instability",
    status: "responding",
    assignedTo: "Team Alpha",
    reportedBy: "Monitoring System",
    time: "12 min ago",
  },
  {
    id: "INC-1002",
    location: "Aizawl",
    state: "Mizoram",
    severity: "critical",
    type: "Heavy rainfall",
    status: "dispatched",
    assignedTo: "Team Bravo",
    reportedBy: "Monitoring System",
    time: "21 min ago",
  },
  {
    id: "INC-1003",
    location: "Gangtok",
    state: "Sikkim",
    severity: "critical",
    type: "Landslide warning",
    status: "dispatched",
    assignedTo: "Unassigned",
    reportedBy: "Monitoring System",
    time: "34 min ago",
  },
];

const INITIAL_REPORTS = [
  {
    id: "REP-1001",
    title: "Crack near hillside road",
    description:
      "Visible cracks observed close to the hillside road.",
    severity: "High",
    status: "reviewing",
    synced: true,
    photo: "",
    coordinates: null,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SOS = [
  {
    id: "SOS-1001",
    status: "acknowledged",
    reportedBy: "Demo Citizen",
    coordinates: [25.5788, 91.8933],
    accuracy: 20,
    source: "demo",
    synced: true,
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   6. HELPERS
========================================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage failures
  }
}

function riskLabel(value) {
  if (value >= 85) return "Critical";
  if (value >= 70) return "High";
  if (value >= 45) return "Moderate";
  return "Low";
}

function riskClass(value) {
  if (value >= 85) return "critical";
  if (value >= 70) return "high";
  if (value >= 45) return "moderate";
  return "low";
}

function severityClass(value) {
  return String(value || "moderate").toLowerCase();
}

function weatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather conditions";
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function findNearestSafeZone(location) {
  if (!location) return null;

  let nearest = null;

  SAFE_ZONES.forEach((zone) => {
    const distance = calculateDistanceKm(
      location.latitude,
      location.longitude,
      zone.lat,
      zone.lng
    );

    if (!nearest || distance < nearest.distance) {
      nearest = {
        ...zone,
        distance,
      };
    }
  });

  return nearest;
}

function createGoogleMapsRoute(origin, destination) {
  if (!destination) return "";

  const destinationText = `${destination.lat},${destination.lng}`;

  if (!origin) {
    return (
      "https://www.google.com/maps/dir/?api=1" +
      `&destination=${encodeURIComponent(destinationText)}` +
      "&travelmode=driving"
    );
  }

  const originText = `${origin.latitude},${origin.longitude}`;

  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&origin=${encodeURIComponent(originText)}` +
    `&destination=${encodeURIComponent(destinationText)}` +
    "&travelmode=driving"
  );
}

function createLiveLocationIcon() {
  return L.divIcon({
    className: "live-location-icon",
    html: `
      <div class="gps-pulse">
        <div class="gps-dot"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createRescueIcon() {
  return L.divIcon({
    className: "rescue-map-icon",
    html: `<div>🚑</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function createSafeIcon() {
  return L.divIcon({
    className: "safe-map-icon",
    html: `<div>🛟</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function compressImage(file, maxSize = 900, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(
          1,
          maxSize / Math.max(img.width, img.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   7. MAP CONTROLLER
========================================================= */

function MapController({ liveLocation, locateSignal }) {
  const map = useMap();

  useEffect(() => {
    if (!liveLocation || locateSignal === 0) return;

    map.flyTo(
      [liveLocation.latitude, liveLocation.longitude],
      14,
      {
        duration: 1.2,
      }
    );
  }, [liveLocation, locateSignal, map]);

  return null;
}

/* =========================================================
   8. LANGUAGE SELECTOR
========================================================= */

function LanguageSelector({ language, setLanguage }) {
  function changeLanguage(event) {
    const value = event.target.value;

    setLanguage(value);

    try {
      localStorage.setItem("landguard-language", value);
    } catch {
      // ignore
    }
  }

  return (
    <select
      className="language-select"
      value={language}
      onChange={changeLanguage}
      aria-label="Language"
    >
      {Object.entries(LANGUAGES).map(([key, name]) => (
        <option value={key} key={key}>
          {name}
        </option>
      ))}
    </select>
  );
}

/* =========================================================
   9. LOGIN SCREEN
========================================================= */

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState(
    "citizen@landguard.ai"
  );

  const [password, setPassword] = useState("123456");

  const [name, setName] = useState("");

  const [role, setRole] = useState("citizen");

  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    setError("");

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      writeJSON("landguard-user", newUser);
      onLogin(newUser);

      return;
    }

    const found = USERS.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (!found) {
      const localUsers = readJSON(
        "landguard-registered-users",
        []
      );

      const localFound = localUsers.find(
        (user) =>
          user.email.toLowerCase() ===
            email.toLowerCase() &&
          user.password === password
      );

      if (localFound) {
        onLogin(localFound);
        return;
      }

      setError(
        "Invalid login. Use one of the demo credentials below."
      );

      return;
    }

    onLogin(found);
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-one"></div>
      <div className="login-bg-orb orb-two"></div>

      <div className="login-card">
        <div className="brand-large">
          <div className="brand-symbol">🌿</div>

          <div>
            <strong>LandGuard</strong>
            <span>AI</span>
          </div>
        </div>

        <p className="login-tagline">
          Early warning. Faster rescue.
        </p>

        <div className="auth-tabs">
          <button
            className={
              mode === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={
              mode === "register"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label className="field">
              <span>Full name</span>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              required
            />
          </label>

          {mode === "register" && (
            <label className="field">
              <span>Account type</span>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >
                <option value="citizen">
                  Citizen
                </option>

                <option value="rescue">
                  Rescue Officer
                </option>
              </select>
            </label>
          )}

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}

          <button className="login-submit">
            {mode === "login"
              ? "Enter LandGuard AI →"
              : "Create Account →"}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo accounts</strong>

          <small>
            Citizen: citizen@landguard.ai / 123456
          </small>

          <small>
            Rescue: rescue@landguard.ai / 123456
          </small>

          <small>
            Admin: admin@landguard.ai / 123456
          </small>
        </div>

        <div className="login-footer">
          AI-assisted disaster monitoring platform
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   10. SIDEBAR
========================================================= */

function Sidebar({
  user,
  page,
  setPage,
  logout,
  language,
}) {
  const text = T[language] || T.en;

  let items = [];

  if (user.role === "citizen") {
    items = [
      {
        id: "dashboard",
        icon: "⌂",
        label: text.dashboard,
      },
      {
        id: "map",
        icon: "◉",
        label: text.map,
      },
      {
        id: "weather",
        icon: "☁",
        label: text.weather,
      },
      {
        id: "analytics",
        icon: "◒",
        label: text.analytics,
      },
      {
        id: "calculator",
        icon: "⌗",
        label: text.calculator,
      },
      {
        id: "reports",
        icon: "▣",
        label: text.reports,
      },
      {
        id: "sos",
        icon: "🆘",
        label: text.sos,
      },
    ];
  }

  if (user.role === "rescue") {
    items = [
      {
        id: "rescue",
        icon: "🚑",
        label: text.rescue,
      },
      {
        id: "incidents",
        icon: "⚠",
        label: text.incidents,
      },
      {
        id: "sos",
        icon: "🆘",
        label: text.sos,
      },
      {
        id: "map",
        icon: "◉",
        label: text.map,
      },
      {
        id: "weather",
        icon: "☁",
        label: text.weather,
      },
    ];
  }

  if (user.role === "admin") {
    items = [
      {
        id: "admin",
        icon: "⌂",
        label: text.admin,
      },
      {
        id: "monitor",
        icon: "▣",
        label: text.monitor,
      },
      {
        id: "incidents",
        icon: "⚠",
        label: text.incidents,
      },
      {
        id: "users",
        icon: "♙",
        label: text.users,
      },
      {
        id: "map",
        icon: "◉",
        label: text.map,
      },
      {
        id: "analytics",
        icon: "◒",
        label: text.analytics,
      },
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mini">🌿</div>

        <div>
          <strong>LandGuard</strong>
          <span>AI</span>
        </div>
      </div>

      <div className="role-pill">
        <span className="role-dot"></span>

        {user.role.toUpperCase()} MODE
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={
              page === item.id
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-mini">
          <span className="status-dot"></span>

          <div>
            <strong>AI Monitoring</strong>
            <small>System active</small>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          ↪ {text.logout}
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   11. TOPBAR
========================================================= */

function Topbar({
  user,
  isOnline,
  liveLocation,
  locationPermission,
  onSOS,
  language,
  setLanguage,
  setShowAI,
}) {
  const text = T[language] || T.en;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mobile-brand">
          🌿 <strong>LandGuard</strong>
          <span>AI</span>
        </div>

        <div className="system-status">
          <span
            className={
              isOnline
                ? "status-dot"
                : "status-dot offline"
            }
          ></span>

          {isOnline
            ? "System Online"
            : "Offline Mode"}
        </div>

        <div className="ai-active">
          ✦ AI Monitoring Active
        </div>
      </div>

      <div className="topbar-right">
        <LanguageSelector
          language={language}
          setLanguage={setLanguage}
        />

        <div className="gps-status">
          <span>📍</span>

          <div>
            <strong>
              {liveLocation
                ? text.gps + " Active"
                : text.gps + " Waiting"}
            </strong>

            <small>
              {liveLocation
                ? `${liveLocation.latitude.toFixed(
                    4
                  )}, ${liveLocation.longitude.toFixed(
                    4
                  )}`
                : locationPermission ===
                  "denied"
                ? "Permission denied"
                : "Searching..."}
            </small>
          </div>
        </div>

        {user.role === "citizen" && (
          <button
            className="top-sos"
            onClick={onSOS}
          >
            🆘 SOS
          </button>
        )}

        <button
          className="ai-top-button"
          onClick={() => setShowAI(true)}
        >
          ✦ AI
        </button>

        <div className="profile-chip">
          <div className="profile-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   12. DASHBOARD
========================================================= */

function Dashboard({
  setPage,
  selectedState,
  setSelectedState,
  liveLocation,
  liveWeather,
}) {
  const averageRisk = Math.round(
    STATES.reduce((sum, state) => sum + state.risk, 0) /
      STATES.length
  );

  const criticalCount = STATES.filter(
    (state) => state.risk >= 85
  ).length;

  const highCount = STATES.filter(
    (state) =>
      state.risk >= 70 && state.risk < 85
  ).length;

  const highest = [...STATES].sort(
    (a, b) => b.risk - a.risk
  )[0];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            ● EARLY WARNING SYSTEM
          </span>

          <h1>
            Early warning.
            <br />
            <span>Faster rescue.</span>
          </h1>

          <p>
            LandGuard AI combines environmental
            signals, location intelligence and
            citizen reports to monitor landslide
            risk across Northeast India.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => setPage("map")}
            >
              🗺 Open India Map
            </button>

            <button
              className="secondary-btn"
              onClick={() => setPage("calculator")}
            >
              ⌗ Calculate Risk
            </button>
          </div>
        </div>

        <div className="risk-orb-wrap">
          <div className="risk-orb">
            <div className="orb-glow"></div>

            <span>REGIONAL RISK</span>

            <strong>{averageRisk}</strong>

            <small> / 100</small>

            <em>{riskLabel(averageRisk)}</em>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          icon="⚠"
          title="High Risk States"
          value={highCount}
          note="Risk 70–84"
        />

        <MetricCard
          icon="🚨"
          title="Critical States"
          value={criticalCount}
          note="Risk 85+"
        />

        <MetricCard
          icon="⛰"
          title="Highest Risk"
          value={`${highest.risk}%`}
          note={highest.name}
        />

        <MetricCard
          icon="📍"
          title="GPS Status"
          value={liveLocation ? "LIVE" : "WAIT"}
          note={
            liveLocation
              ? "Location detected"
              : "Waiting for permission"
          }
        />

        <MetricCard
          icon="🌡"
          title="Temperature"
          value={
            liveWeather
              ? `${Math.round(
                  liveWeather.temperature_2m
                )}°C`
              : "--"
          }
          note="Live weather"
        />
      </section>

      <div className="section-heading">
        <div>
          <span className="eyebrow">
            NORTHEAST INDIA
          </span>

          <h2>State Risk Monitor</h2>
        </div>

        <button
          className="text-btn"
          onClick={() => setPage("analytics")}
        >
          View analytics →
        </button>
      </div>

      <section className="state-grid">
        {STATES.map((state) => (
          <button
            className={`state-card ${
              selectedState.id === state.id
                ? "selected"
                : ""
            }`}
            key={state.id}
            onClick={() => setSelectedState(state)}
          >
            <div className="state-card-top">
              <div className="state-code">
                {state.short}
              </div>

              <span
                className={`risk-badge ${riskClass(
                  state.risk
                )}`}
              >
                {riskLabel(state.risk)}
              </span>
            </div>

            <strong>{state.name}</strong>

            <small>{state.capital}</small>

            <div className="risk-progress">
              <span
                style={{
                  width: `${state.risk}%`,
                }}
              ></span>
            </div>

            <div className="state-risk-value">
              {state.risk}
              <small>/100</small>
            </div>
          </button>
        ))}
      </section>

      <section className="two-col dashboard-bottom">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                AI SIGNAL
              </span>

              <h2>
                {selectedState.name}
              </h2>
            </div>

            <span
              className={`risk-badge ${riskClass(
                selectedState.risk
              )}`}
            >
              {selectedState.risk}%
            </span>
          </div>

          <div className="signal-grid">
            <Signal
              label="Rainfall"
              value={selectedState.rainfall}
              suffix="%"
            />

            <Signal
              label="Soil Moisture"
              value={selectedState.soil}
              suffix="%"
            />

            <Signal
              label="Slope"
              value={selectedState.slope}
              suffix="°"
            />
          </div>

          <div className="ai-insight">
            <span>✦</span>

            <p>
              AI monitoring indicates{" "}
              <strong>
                {riskLabel(selectedState.risk).toLowerCase()}
              </strong>{" "}
              landslide conditions. Rainfall,
              terrain slope and soil moisture
              should be monitored continuously.
            </p>
          </div>
        </div>

        <div className="panel quick-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                QUICK ACTIONS
              </span>

              <h2>Emergency tools</h2>
            </div>
          </div>

          <QuickAction
            icon="📍"
            title="Locate Me"
            description="Open live GPS location"
            onClick={() => setPage("map")}
          />

          <QuickAction
            icon="🌦️"
            title="Live Weather"
            description="Check current conditions"
            onClick={() => setPage("weather")}
          />

          <QuickAction
            icon="📷"
            title="Report Hazard"
            description="Submit photo + location"
            onClick={() => setPage("reports")}
          />

          <QuickAction
            icon="🛟"
            title="Safe Route"
            description="Find nearest demo safe zone"
            onClick={() => setPage("sos")}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  note,
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>

      <div>
        <small>{title}</small>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    </div>
  );
}

function Signal({ label, value, suffix }) {
  return (
    <div className="signal">
      <div>
        <span>{label}</span>

        <strong>
          {value}
          <small>{suffix}</small>
        </strong>
      </div>

      <div className="signal-bar">
        <span
          style={{
            width: `${Math.min(
              100,
              value
            )}%`,
          }}
        ></span>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="quick-action"
      onClick={onClick}
    >
      <span>{icon}</span>

      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>

      <b>→</b>
    </button>
  );
}

/* =========================================================
   13. INDIA RISK MAP
========================================================= */

function IndiaRiskMap({
  liveLocation,
  locateSignal,
  setLocateSignal,
  setPage,
}) {
  const center = [22.5, 80.5];

  const rescuePoints = [
    [27.1, 93.62, "Rescue Team Alpha"],
    [23.72, 92.72, "Rescue Team Bravo"],
    [27.34, 88.61, "Rescue Team Charlie"],
  ];

  return (
    <div className="page map-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            GEOSPATIAL MONITORING
          </span>

          <div className="page-title">
            India Risk Map
          </div>

          <p>
            Live GPS, Northeast risk zones,
            rescue teams and safe zones.
          </p>
        </div>

        <div className="map-actions">
          <button
            className="secondary-btn"
            onClick={() => {
              if (liveLocation) {
                setLocateSignal((value) =>
                  value + 1
                );
              } else {
                alert(
                  "GPS location is not available yet."
                );
              }
            }}
          >
            📍 Locate Me
          </button>

          <button
            className="primary-btn"
            onClick={() => setPage("sos")}
          >
            🛟 Safe Route
          </button>
        </div>
      </div>

      <div className="map-container-shell">
        <MapContainer
          center={center}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          scrollWheelZoom={true}
          className="risk-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            liveLocation={liveLocation}
            locateSignal={locateSignal}
          />

          {STATES.map((state) => (
            <CircleMarker
              key={state.id}
              center={[state.lat, state.lng]}
              radius={
                state.risk >= 85
                  ? 20
                  : state.risk >= 70
                  ? 17
                  : 14
              }
              pathOptions={{
                className: "risk-circle",
                fillColor:
                  state.risk >= 85
                    ? "#ff315b"
                    : state.risk >= 70
                    ? "#ff9f43"
                    : state.risk >= 45
                    ? "#ffd166"
                    : "#32d583",
                color: "#ffffff",
                weight: 2,
                fillOpacity: 0.78,
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{state.name}</strong>

                  <span>
                    Capital: {state.capital}
                  </span>

                  <span>
                    Risk: {state.risk}/100
                  </span>

                  <span>
                    Status: {riskLabel(state.risk)}
                  </span>

                  <span>
                    Rainfall: {state.rainfall}%
                  </span>

                  <span>
                    Slope: {state.slope}°
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {SAFE_ZONES.map((zone) => (
            <Marker
              key={zone.id}
              position={[zone.lat, zone.lng]}
              icon={createSafeIcon()}
            >
              <Popup>
                <div className="map-popup">
                  <strong>🛟 {zone.name}</strong>

                  <span>{zone.type}</span>

                  <span>{zone.state}</span>

                  <small>
                    DEMO SAFE ZONE — verify local
                    emergency facilities before
                    real-world use.
                  </small>
                </div>
              </Popup>
            </Marker>
          ))}

          {rescuePoints.map(
            ([lat, lng, name], index) => (
              <Marker
                key={index}
                position={[lat, lng]}
                icon={createRescueIcon()}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>
                      🚑 {name}
                    </strong>

                    <span>
                      Rescue unit available
                    </span>

                    <span>
                      Status: Monitoring
                    </span>
                  </div>
                </Popup>
              </Marker>
            )
          )}

          {liveLocation && (
            <Marker
              position={[
                liveLocation.latitude,
                liveLocation.longitude,
              ]}
              icon={createLiveLocationIcon()}
            >
              <Popup>
                <div className="map-popup">
                  <strong>
                    📍 Your Live Location
                  </strong>

                  <span>
                    Latitude:{" "}
                    {liveLocation.latitude.toFixed(
                      6
                    )}
                  </span>

                  <span>
                    Longitude:{" "}
                    {liveLocation.longitude.toFixed(
                      6
                    )}
                  </span>

                  <span>
                    Accuracy: ±
                    {Math.round(
                      liveLocation.accuracy || 0
                    )}
                    m
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="map-overlay">
          <div className="map-live-card">
            <span className="status-dot"></span>

            <div>
              <strong>LIVE MONITORING</strong>
              <small>
                Northeast India • 8 states
              </small>
            </div>
          </div>

          <div className="map-legend">
            <strong>Risk level</strong>

            <Legend color="green" label="Low" />
            <Legend color="yellow" label="Moderate" />
            <Legend color="orange" label="High" />
            <Legend color="red" label="Critical" />
            <Legend color="blue" label="Your location" />
            <Legend color="white" label="Safe zone" />
          </div>
        </div>
      </div>

      <div className="map-note">
        <span>ⓘ</span>

        <p>
          Risk values shown here are demonstration
          values for the prototype. They are not
          official government disaster warnings.
        </p>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="legend-row">
      <span
        className={`legend-dot ${color}`}
      ></span>

      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   14. WEATHER
========================================================= */

function WeatherPage({
  liveLocation,
  liveWeather,
  weatherLoading,
  weatherError,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            LIVE ENVIRONMENT
          </span>

          <div className="page-title">
            Live Weather
          </div>

          <p>
            Weather data based on your GPS
            location.
          </p>
        </div>

        <span className="online-badge">
          ● OPEN-METEO
        </span>
      </div>

      {!liveLocation && (
        <div className="warning-panel">
          📍 GPS location is not available.
          Allow location access in your browser
          to load live weather.
        </div>
      )}

      {weatherError && (
        <div className="warning-panel">
          ⚠️ {weatherError}
        </div>
      )}

      {weatherLoading && (
        <div className="loading-card">
          <div className="spinner"></div>
          Loading live weather...
        </div>
      )}

      {liveWeather && (
        <>
          <div className="weather-main-card">
            <div className="weather-symbol">
              {weatherIcon(
                liveWeather.weather_code
              )}
            </div>

            <div className="weather-temp">
              <span>Current temperature</span>

              <strong>
                {Math.round(
                  liveWeather.temperature_2m
                )}
                °C
              </strong>

              <small>
                {weatherDescription(
                  liveWeather.weather_code
                )}
              </small>
            </div>

            <div className="weather-location">
              <span>📍 GPS LOCATION</span>

              <strong>
                {liveLocation?.latitude.toFixed(
                  5
                )}
                ,{" "}
                {liveLocation?.longitude.toFixed(
                  5
                )}
              </strong>

              <small>
                Updated{" "}
                {liveWeather.updatedAt
                  ? new Date(
                      liveWeather.updatedAt
                    ).toLocaleTimeString()
                  : "now"}
              </small>
            </div>
          </div>

          <div className="weather-grid">
            <WeatherMetric
              icon="💧"
              label="Humidity"
              value={`${Math.round(
                liveWeather.relative_humidity_2m
              )}%`}
            />

            <WeatherMetric
              icon="🌧️"
              label="Rain"
              value={`${liveWeather.rain || 0} mm`}
            />

            <WeatherMetric
              icon="💨"
              label="Wind"
              value={`${Math.round(
                liveWeather.wind_speed_10m
              )} km/h`}
            />

            <WeatherMetric
              icon="🌧"
              label="Precipitation"
              value={`${liveWeather.precipitation || 0} mm`}
            />
          </div>
        </>
      )}

      <div className="section-heading">
        <div>
          <span className="eyebrow">
            REGIONAL SNAPSHOT
          </span>

          <h2>Northeast conditions</h2>
        </div>
      </div>

      <div className="forecast-grid">
        {STATES.map((state) => (
          <div
            className="forecast-card"
            key={state.id}
          >
            <div className="forecast-icon">
              🌦️
            </div>

            <div>
              <strong>{state.name}</strong>

              <small>
                Rain indicator {state.rainfall}%
              </small>
            </div>

            <b>{state.risk}% risk</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function weatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return "🌧️";
  if ([95, 96, 99].includes(code))
    return "⛈️";

  return "🌤️";
}

function WeatherMetric({ icon, label, value }) {
  return (
    <div className="weather-metric">
      <span>{icon}</span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   15. ANALYTICS
========================================================= */

function Analytics() {
  const sorted = [...STATES].sort(
    (a, b) => b.risk - a.risk
  );

  const avg = Math.round(
    STATES.reduce(
      (sum, state) => sum + state.risk,
      0
    ) / STATES.length
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            DATA INTELLIGENCE
          </span>

          <div className="page-title">
            Risk Analytics
          </div>

          <p>
            Prototype risk indicators across
            Northeast India.
          </p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="analytics-score">
          <span>REGIONAL RISK</span>

          <strong>{avg}</strong>

          <small>/100</small>

          <em>{riskLabel(avg)}</em>
        </div>

        <div className="analytics-components">
          <AnalyticsBar
            label="Rainfall influence"
            value={73}
          />

          <AnalyticsBar
            label="Soil moisture influence"
            value={61}
          />

          <AnalyticsBar
            label="Slope instability"
            value={76}
          />

          <AnalyticsBar
            label="Historical activity"
            value={68}
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              STATE COMPARISON
            </span>

            <h2>Risk signals</h2>
          </div>
        </div>

        <div className="ranking-list">
          {sorted.map((state, index) => (
            <div
              className="ranking-row"
              key={state.id}
            >
              <span className="ranking-number">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <div className="ranking-name">
                <strong>{state.name}</strong>
                <small>{state.capital}</small>
              </div>

              <div className="ranking-bar">
                <span
                  style={{
                    width: `${state.risk}%`,
                  }}
                ></span>
              </div>

              <strong className="ranking-value">
                {state.risk}
              </strong>

              <span
                className={`risk-badge ${riskClass(
                  state.risk
                )}`}
              >
                {riskLabel(state.risk)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-grid">
        <InfoCard
          icon="🌧️"
          title="Rainfall"
          text="Heavy and persistent rainfall can increase soil saturation and slope instability."
        />

        <InfoCard
          icon="🪨"
          title="Terrain"
          text="Steeper terrain generally requires closer landslide monitoring."
        />

        <InfoCard
          icon="💧"
          title="Soil Moisture"
          text="Higher soil moisture can be an important environmental signal."
        />

        <InfoCard
          icon="📚"
          title="Historical Data"
          text="Historical landslide records can support risk-model development."
        />
      </div>

      <div className="map-note">
        ⓘ Prototype analytics are for demonstration
        and should not be interpreted as official
        warnings.
      </div>
    </div>
  );
}

function AnalyticsBar({ label, value }) {
  return (
    <div className="analytics-bar">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>

      <div className="analytics-track">
        <span
          style={{
            width: `${value}%`,
          }}
        ></span>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="info-card">
      <span>{icon}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

/* =========================================================
   16. RISK CALCULATOR
========================================================= */

function RiskCalculator() {
  const [rainfall, setRainfall] = useState(60);
  const [soil, setSoil] = useState(20);
  const [slope, setSlope] = useState(70);

  const result = Math.min(
    99,
    Math.round(
      rainfall * 0.35 +
        soil * 1.1 +
        slope * 0.45
    )
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            AI SIMULATION
          </span>

          <div className="page-title">
            Risk Calculator
          </div>

          <p>
            Adjust environmental indicators to
            simulate a prototype risk score.
          </p>
        </div>
      </div>

      <div className="calculator-layout">
        <div className="panel calculator-panel">
          <CalculatorSlider
            label="Rainfall"
            value={rainfall}
            setValue={setRainfall}
            min={0}
            max={100}
            unit="%"
          />

          <CalculatorSlider
            label="Soil Moisture"
            value={soil}
            setValue={setSoil}
            min={0}
            max={50}
            unit="%"
          />

          <CalculatorSlider
            label="Slope Angle"
            value={slope}
            setValue={setSlope}
            min={0}
            max={90}
            unit="°"
          />

          <div className="formula-box">
            <strong>Prototype model</strong>

            <code>
              Risk = Rainfall × 0.35 + Soil ×
              1.1 + Slope × 0.45
            </code>
          </div>
        </div>

        <div
          className={`calculator-result ${riskClass(
            result
          )}`}
        >
          <span>SIMULATED RISK</span>

          <strong>{result}</strong>

          <small>/ 100</small>

          <em>{riskLabel(result)}</em>

          <div className="result-circle">
            <div
              style={{
                "--score": `${result}%`,
              }}
            >
              {result}
            </div>
          </div>
        </div>
      </div>

      <div className="map-note">
        ⚠️ This is a demonstration calculation.
        It is not an official disaster prediction
        or evacuation recommendation.
      </div>
    </div>
  );
}

function CalculatorSlider({
  label,
  value,
  setValue,
  min,
  max,
  unit,
}) {
  return (
    <div className="calculator-slider">
      <div className="slider-heading">
        <span>{label}</span>

        <strong>
          {value}
          {unit}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          setValue(Number(e.target.value))
        }
      />
    </div>
  );
}

/* =========================================================
   17. REPORT MODAL
========================================================= */

function ReportModal({
  onClose,
  onSubmit,
  liveLocation,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [severity, setSeverity] =
    useState("Moderate");
  const [photo, setPhoto] = useState("");
  const [photoLoading, setPhotoLoading] =
    useState(false);

  async function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setPhotoLoading(true);

      const compressed = await compressImage(
        file
      );

      setPhoto(compressed);
    } catch {
      alert("Could not process image.");
    } finally {
      setPhotoLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a report title.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description:
        description.trim() ||
        "No description provided.",
      severity,
      photo,
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              CITIZEN REPORT
            </span>

            <h2>Report a hazard</h2>

            <p>
              Add a photo and your current GPS
              location.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            <span>Hazard title</span>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Example: Crack near hillside road"
            />
          </label>

          <label className="field">
            <span>Description</span>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what you observed..."
              rows="4"
            />
          </label>

          <label className="field">
            <span>Severity</span>

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value)
              }
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>

          <label className="photo-upload">
            <span>📷</span>

            <div>
              <strong>
                Capture / upload photo
              </strong>

              <small>
                Use your phone camera or choose an
                image.
              </small>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
            />
          </label>

          {photoLoading && (
            <div className="upload-status">
              Processing image...
            </div>
          )}

          {photo && (
            <div className="photo-preview">
              <img
                src={photo}
                alt="Hazard preview"
              />

              <button
                type="button"
                onClick={() => setPhoto("")}
              >
                Remove
              </button>
            </div>
          )}

          <div className="location-attached">
            <span>📍</span>

            <div>
              <strong>
                {liveLocation
                  ? "GPS location attached"
                  : "GPS unavailable"}
              </strong>

              <small>
                {liveLocation
                  ? `${liveLocation.latitude.toFixed(
                      6
                    )}, ${liveLocation.longitude.toFixed(
                      6
                    )}`
                  : "Report can still be saved locally."}
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              Submit Report →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   18. REPORTS
========================================================= */

function Reports({
  reports,
  setShowReport,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            CITIZEN SAFETY NETWORK
          </span>

          <div className="page-title">
            Hazard Reports
          </div>

          <p>
            Citizen-submitted landslide and hazard
            reports.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowReport(true)}
        >
          + New Report
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>My Hazard Reports</h2>

            <small>
              Photos, descriptions and GPS
              coordinates
            </small>
          </div>

          <span className="online-badge">
            ● REPORTING ACTIVE
          </span>
        </div>

        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                📷
              </div>

              <h3>No reports yet</h3>

              <p>
                Report cracks, landslides, falling
                rocks or other hazards.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowReport(true)
                }
              >
                Create First Report
              </button>
            </div>
          ) : (
            reports.map((report) => (
              <div
                className="report-card"
                key={report.id}
              >
                <div className="report-image">
                  {report.photo ? (
                    <img
                      src={report.photo}
                      alt={
                        report.title ||
                        "Hazard report"
                      }
                    />
                  ) : (
                    <div className="report-image-placeholder">
                      📷
                    </div>
                  )}
                </div>

                <div className="report-content">
                  <div className="report-top">
                    <div>
                      <strong>
                        {report.title ||
                          "Untitled Hazard"}
                      </strong>

                      <small className="report-id">
                        {report.id}
                      </small>
                    </div>

                    <span
                      className={`severity-badge ${severityClass(
                        report.severity
                      )}`}
                    >
                      {report.severity ||
                        "Moderate"}
                    </span>
                  </div>

                  <p>
                    {report.description ||
                      "No description provided."}
                  </p>

                  <small>
                    {report.coordinates ? (
                      <>
                        📍{" "}
                        {Number(
                          report.coordinates[0]
                        ).toFixed(4)}
                        ,{" "}
                        {Number(
                          report.coordinates[1]
                        ).toFixed(4)}
                      </>
                    ) : (
                      "📍 Location not attached"
                    )}

                    {" • "}

                    {report.synced ? (
                      <span className="synced-text">
                        ✓ Synced
                      </span>
                    ) : (
                      <span className="pending-text">
                        ◌ Pending sync
                      </span>
                    )}
                  </small>

                  <div className="report-footer">
                    <span>
                      Status:{" "}
                      <strong>
                        {report.status ||
                          "submitted"}
                      </strong>
                    </span>

                    {report.createdAt && (
                      <span>
                        {new Date(
                          report.createdAt
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   19. SOS MODAL
========================================================= */

function SOSModal({
  onClose,
  onSend,
  liveLocation,
  liveWeather,
  isOnline,
}) {
  const [confirmed, setConfirmed] =
    useState(false);

  return (
    <div className="modal-backdrop">
      <div className="modal-card sos-modal">
        <div className="danger-ring">🆘</div>

        <span className="eyebrow danger-text">
          EMERGENCY ALERT
        </span>

        <h2>Send SOS?</h2>

        <p>
          This creates an emergency alert using
          your available GPS location.
        </p>

        <div className="sos-location-box">
          <div className="sos-location-head">
            <strong>📍 Location</strong>

            <span
              className={
                liveLocation
                  ? "gps-locked"
                  : "gps-not-locked"
              }
            >
              {liveLocation
                ? "GPS LOCKED"
                : "GPS UNAVAILABLE"}
            </span>
          </div>

          {liveLocation ? (
            <div className="coordinates">
              <div>
                <small>Latitude</small>

                <strong>
                  {liveLocation.latitude.toFixed(
                    6
                  )}
                </strong>
              </div>

              <div>
                <small>Longitude</small>

                <strong>
                  {liveLocation.longitude.toFixed(
                    6
                  )}
                </strong>
              </div>

              <div>
                <small>Accuracy</small>

                <strong>
                  ±
                  {Math.round(
                    liveLocation.accuracy || 0
                  )}
                  m
                </strong>
              </div>
            </div>
          ) : (
            <p>
              GPS location could not be detected.
              The emergency will still be saved
              locally.
            </p>
          )}
        </div>

        {liveWeather && (
          <div className="sos-weather">
            <span>🌦</span>

            <div>
              <strong>
                {Math.round(
                  liveWeather.temperature_2m
                )}
                °C •{" "}
                {weatherDescription(
                  liveWeather.weather_code
                )}
              </strong>

              <small>
                Humidity{" "}
                {liveWeather.relative_humidity_2m}
                % • Rain{" "}
                {liveWeather.rain || 0} mm
              </small>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="sos-offline">
            📴 <strong>Offline SOS:</strong>{" "}
            The alert will be stored on this
            device and marked for synchronization
            when the internet connection returns.
          </div>
        )}

        <label className="confirm-check">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) =>
              setConfirmed(e.target.checked)
            }
          />

          <span>
            I confirm that this is an emergency.
          </span>
        </label>

        <div className="modal-actions">
          <button
            className="secondary-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="danger-btn"
            disabled={!confirmed}
            onClick={onSend}
          >
            🆘 Send SOS
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   20. SOS PAGE + SAFE ROUTE
========================================================= */

function SOSPage({
  sosAlerts,
  isOnline,
  liveLocation,
  setPage,
}) {
  const active = sosAlerts.filter(
    (s) =>
      s.status === "active" ||
      s.status === "queued-offline"
  );

  const nearestZone =
    findNearestSafeZone(liveLocation);

  const routeCoordinates =
    liveLocation && nearestZone
      ? [
          [
            liveLocation.latitude,
            liveLocation.longitude,
          ],
          [nearestZone.lat, nearestZone.lng],
        ]
      : [];

  function openNavigation() {
    const url = createGoogleMapsRoute(
      liveLocation,
      nearestZone
    );

    if (url) {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow danger-text">
            EMERGENCY CENTER
          </span>

          <div className="page-title">
            SOS Emergency Center
          </div>

          <p>
            Emergency alerts and safe-route
            interface.
          </p>
        </div>

        <span
          className={
            isOnline
              ? "online-badge"
              : "offline-badge"
          }
        >
          {isOnline
            ? "● ONLINE"
            : "● OFFLINE"}
        </span>
      </div>

      <div className="sos-dashboard">
        <div className="emergency-card">
          <span>ACTIVE SOS</span>

          <strong>{active.length}</strong>

          <small>
            Waiting for rescue response
          </small>
        </div>

        <div className="emergency-card">
          <span>GPS STATUS</span>

          <strong>
            {liveLocation
              ? "LOCKED"
              : "WAIT"}
          </strong>

          <small>
            {liveLocation
              ? "Live coordinates available"
              : "Location unavailable"}
          </small>
        </div>

        <div className="emergency-card">
          <span>NETWORK</span>

          <strong>
            {isOnline
              ? "ONLINE"
              : "OFFLINE"}
          </strong>

          <small>
            {isOnline
              ? "Sync available"
              : "Local queue active"}
          </small>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Emergency Alerts</h2>

              <small>
                Latest SOS requests
              </small>
            </div>
          </div>

          <div className="sos-list">
            {sosAlerts.length === 0 ? (
              <div className="empty-state">
                No SOS alerts.
              </div>
            ) : (
              sosAlerts.map((sos) => (
                <div
                  className={`sos-card ${sos.status}`}
                  key={sos.id}
                >
                  <div className="sos-avatar">
                    🆘
                  </div>

                  <div className="sos-info">
                    <strong>{sos.id}</strong>

                    <small>
                      {sos.reportedBy}
                    </small>

                    <small>
                      {sos.coordinates
                        ? `${Number(
                            sos.coordinates[0]
                          ).toFixed(4)}, ${Number(
                            sos.coordinates[1]
                          ).toFixed(4)}`
                        : "No coordinates"}
                    </small>
                  </div>

                  <span className="sos-status">
                    {sos.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel safe-route-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                ROUTE ASSIST
              </span>

              <h2>Safe Route</h2>

              <small>
                Nearest demo safe zone
              </small>
            </div>

            <span className="route-icon">
              🛟
            </span>
          </div>

          {liveLocation &&
          nearestZone ? (
            <>
              <div className="route-map-real">
                <MapContainer
                  center={[
                    (liveLocation.latitude +
                      nearestZone.lat) /
                      2,
                    (liveLocation.longitude +
                      nearestZone.lng) /
                      2,
                  ]}
                  zoom={7}
                  scrollWheelZoom={false}
                  dragging={true}
                  zoomControl={true}
                  className="route-mini-map"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      liveLocation.latitude,
                      liveLocation.longitude,
                    ]}
                    icon={createLiveLocationIcon()}
                  />

                  <Marker
                    position={[
                      nearestZone.lat,
                      nearestZone.lng,
                    ]}
                    icon={createSafeIcon()}
                  />

                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#2ddf91",
                      weight: 5,
                      dashArray: "10 8",
                    }}
                  />
                </MapContainer>
              </div>

              <div className="route-info">
                <div className="route-destination">
                  <span>🛟</span>

                  <div>
                    <strong>
                      {nearestZone.name}
                    </strong>

                    <small>
                      {nearestZone.type} •{" "}
                      {nearestZone.state}
                    </small>
                  </div>
                </div>

                <div className="distance-pill">
                  {nearestZone.distance.toFixed(
                    1
                  )}{" "}
                  km
                </div>
              </div>

              <div className="route-warning">
                ⚠️ The line shown in the prototype
                is a direct visual line, not a
                verified road route. Use navigation
                services and official emergency
                instructions in a real emergency.
              </div>

              <button
                className="primary-btn full-btn"
                onClick={openNavigation}
              >
                🧭 Open Navigation
              </button>
            </>
          ) : (
            <div className="route-empty">
              <div>📍</div>

              <h3>
                Waiting for your GPS
              </h3>

              <p>
                Allow location access to calculate
                the nearest demo safe zone.
              </p>

              <button
                className="secondary-btn"
                onClick={() =>
                  setPage("map")
                }
              >
                Open Map
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="map-note">
        ⚠️ Safe zones in this prototype are
        demonstration points and are not verified
        emergency shelters.
      </div>
    </div>
  );
}

/* =========================================================
   21. AI AGENT
========================================================= */

function AIAgent({ onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text:
        "Hello! I am LandGuard AI Agent. Ask me about landslide risk, SOS, weather, GPS, safe routes or offline mode.",
    },
  ]);

  const [input, setInput] = useState("");

  function answer(question) {
    const q = question.toLowerCase();

    if (
      q.includes("sos") ||
      q.includes("emergency")
    ) {
      return (
        "For an emergency, use the red SOS button. LandGuard stores an SOS locally when offline and marks it for synchronization when the network returns."
      );
    }

    if (
      q.includes("risk") ||
      q.includes("landslide")
    ) {
      return (
        "LandGuard's prototype combines rainfall, soil moisture, slope and historical activity signals to generate a demonstration risk score."
      );
    }

    if (q.includes("weather")) {
      return (
        "Live weather is loaded from Open-Meteo using your GPS coordinates. Allow location permission for the best result."
      );
    }

    if (q.includes("offline")) {
      return (
        "Offline mode keeps reports and SOS records on this device. A production version should use a service worker, IndexedDB and a real backend synchronization queue."
      );
    }

    if (
      q.includes("location") ||
      q.includes("gps")
    ) {
      return (
        "GPS is detected through your browser's location service. You can use Locate Me on the map to center the map on your current position."
      );
    }

    if (
      q.includes("route") ||
      q.includes("safe")
    ) {
      return (
        "The Safe Route feature identifies the nearest demonstration safe zone from your GPS location and can open navigation. The prototype line is not a verified road route."
      );
    }

    return (
      "I can help with risk monitoring, weather, GPS, SOS, offline mode, hazard reporting and safe-route features."
    );
  }

  function send(text = input) {
    const value = text.trim();

    if (!value) return;

    setMessages((current) => [
      ...current,
      {
        from: "user",
        text: value,
      },
      {
        from: "ai",
        text: answer(value),
      },
    ]);

    setInput("");
  }

  return (
    <div className="ai-dock">
      <div className="ai-dock-head">
        <div>
          <div className="ai-title">
            <span>✦</span>

            <strong>LandGuard AI</strong>
          </div>

          <small>
            Safety intelligence assistant
          </small>
        </div>

        <button onClick={onClose}>×</button>
      </div>

      <div className="ai-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`ai-message ${message.from}`}
          >
            <span>
              {message.from === "ai"
                ? "✦"
                : "You"}
            </span>

            <p>{message.text}</p>
          </div>
        ))}
      </div>

      <div className="ai-suggestions">
        <button
          onClick={() => send("What is my risk?")}
        >
          Risk
        </button>

        <button
          onClick={() =>
            send("How does SOS work?")
          }
        >
          SOS
        </button>

        <button
          onClick={() =>
            send("How does offline mode work?")
          }
        >
          Offline
        </button>

        <button
          onClick={() =>
            send("How does safe route work?")
          }
        >
          Safe Route
        </button>
      </div>

      <div className="ai-input">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
          placeholder="Ask LandGuard AI..."
        />

        <button onClick={() => send()}>
          →
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   22. RESCUE DASHBOARD
========================================================= */

function RescueDashboard({
  incidents,
  sosAlerts,
  setIncidents,
}) {
  const activeIncidents =
    incidents.filter(
      (item) =>
        item.status !== "resolved"
    ).length;

  const activeSOS = sosAlerts.filter(
    (item) =>
      item.status === "active" ||
      item.status === "queued-offline"
  ).length;

  function updateIncident(
    id,
    nextStatus
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              status: nextStatus,
              time: "Just now",
            }
          : incident
      )
    );
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            RESPONSE OPERATIONS
          </span>

          <div className="page-title">
            Rescue Dashboard
          </div>

          <p>
            Monitor SOS alerts and active rescue
            incidents.
          </p>
        </div>

        <span className="online-badge">
          ● RESPONSE SYSTEM ACTIVE
        </span>
      </div>

      <div className="rescue-metrics">
        <MetricCard
          icon="🚨"
          title="Active Incidents"
          value={activeIncidents}
          note="Requires response"
        />

        <MetricCard
          icon="🆘"
          title="Active SOS"
          value={activeSOS}
          note="Citizen alerts"
        />

        <MetricCard
          icon="🚑"
          title="Available Teams"
          value="06"
          note="Demo availability"
        />

        <MetricCard
          icon="📡"
          title="Network"
          value="ONLINE"
          note="Dispatch enabled"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              INCIDENT QUEUE
            </span>

            <h2>Priority incidents</h2>
          </div>
        </div>

        <div className="incident-list">
          {incidents.map((incident) => (
            <div
              className="incident-card"
              key={incident.id}
            >
              <div className="incident-icon">
                {incident.severity ===
                "critical"
                  ? "🚨"
                  : "⚠️"}
              </div>

              <div className="incident-main">
                <strong>
                  {incident.type}
                </strong>

                <span>
                  {incident.id} •{" "}
                  {incident.location},{" "}
                  {incident.state}
                </span>

                <small>
                  Assigned:{" "}
                  {incident.assignedTo}
                </small>
              </div>

              <span
                className={`status-pill ${incident.status}`}
              >
                {incident.status}
              </span>

              <div className="incident-actions">
                {incident.status ===
                  "dispatched" && (
                  <button
                    className="small-primary"
                    onClick={() =>
                      updateIncident(
                        incident.id,
                        "responding"
                      )
                    }
                  >
                    Accept
                  </button>
                )}

                {incident.status ===
                  "responding" && (
                  <button
                    className="small-success"
                    onClick={() =>
                      updateIncident(
                        incident.id,
                        "resolved"
                      )
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   23. INCIDENTS
========================================================= */

function Incidents({ incidents }) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            RESPONSE LOG
          </span>

          <div className="page-title">
            Incidents
          </div>

          <p>
            Centralized incident monitoring.
          </p>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <strong>
                      {incident.id}
                    </strong>
                  </td>

                  <td>
                    {incident.location}
                    <small>
                      {incident.state}
                    </small>
                  </td>

                  <td>
                    <span
                      className={`severity-badge ${incident.severity}`}
                    >
                      {incident.severity}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${incident.status}`}
                    >
                      {incident.status}
                    </span>
                  </td>

                  <td>
                    {incident.assignedTo}
                  </td>

                  <td>{incident.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   24. ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  reports,
  incidents,
  sosAlerts,
}) {
  const criticalStates = STATES.filter(
    (state) => state.risk >= 85
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            SYSTEM CONTROL
          </span>

          <div className="page-title">
            Admin Dashboard
          </div>

          <p>
            Platform health and monitoring
            overview.
          </p>
        </div>

        <span className="online-badge">
          ● ALL SYSTEMS OPERATIONAL
        </span>
      </div>

      <div className="metrics-grid">
        <MetricCard
          icon="♙"
          title="Total Users"
          value="1,284"
          note="Demo platform data"
        />

        <MetricCard
          icon="▣"
          title="Hazard Reports"
          value={reports.length}
          note="Citizen reports"
        />

        <MetricCard
          icon="⚠"
          title="Active Incidents"
          value={
            incidents.filter(
              (i) => i.status !== "resolved"
            ).length
          }
          note="Response queue"
        />

        <MetricCard
          icon="🆘"
          title="SOS Records"
          value={sosAlerts.length}
          note="Emergency queue"
        />

        <MetricCard
          icon="🚨"
          title="Critical States"
          value={criticalStates.length}
          note="Risk 85+"
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                SYSTEM HEALTH
              </span>

              <h2>Services</h2>
            </div>
          </div>

          {[
            "AI Prediction Engine",
            "GPS Monitoring",
            "Risk Map",
            "Emergency Queue",
            "Weather Service",
            "Citizen Reporting",
          ].map((service) => (
            <div
              className="service-row"
              key={service}
            >
              <span className="status-dot"></span>

              <strong>{service}</strong>

              <span className="service-online">
                ONLINE
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                CRITICAL WATCH
              </span>

              <h2>
                Highest risk states
              </h2>
            </div>
          </div>

          {criticalStates.map((state) => (
            <div
              className="critical-watch-row"
              key={state.id}
            >
              <div>
                <strong>
                  {state.name}
                </strong>

                <small>
                  {state.capital}
                </small>
              </div>

              <span className="critical-score">
                {state.risk}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   25. MONITOR REPORTS
========================================================= */

function MonitorReports({ reports }) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            CITIZEN INTELLIGENCE
          </span>

          <div className="page-title">
            Monitor Reports
          </div>

          <p>
            Review citizen-submitted hazards.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="reports-list">
          {reports.map((report) => (
            <div
              className="monitor-report"
              key={report.id}
            >
              <div className="monitor-report-image">
                {report.photo ? (
                  <img
                    src={report.photo}
                    alt={report.title}
                  />
                ) : (
                  "📷"
                )}
              </div>

              <div className="monitor-report-content">
                <div>
                  <strong>
                    {report.title}
                  </strong>

                  <span className="report-id">
                    {report.id}
                  </span>
                </div>

                <p>
                  {report.description}
                </p>

                <small>
                  Status: {report.status}
                </small>
              </div>

              <span
                className={`severity-badge ${severityClass(
                  report.severity
                )}`}
              >
                {report.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   26. USERS PAGE
========================================================= */

function UsersPage() {
  const users = [
    ...USERS,
    {
      email: "registered@landguard.ai",
      password: "******",
      name: "Registered Citizen",
      role: "citizen",
    },
  ];

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            PLATFORM ACCESS
          </span>

          <div className="page-title">
            Users
          </div>

          <p>
            User and role management.
          </p>
        </div>
      </div>

      <div className="user-grid">
        {users.map((user, index) => (
          <div
            className="user-card"
            key={`${user.email}-${index}`}
          >
            <div className="user-avatar">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>

              <small>{user.email}</small>

              <span
                className={`role-badge ${user.role}`}
              >
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   27. MAIN APP
========================================================= */

export default function App() {
  const [user, setUser] = useState(() =>
    readJSON("landguard-user", null)
  );

  const [page, setPage] =
    useState("dashboard");

  const [language, setLanguage] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "landguard-language"
          ) || "en"
        );
      } catch {
        return "en";
      }
    });

  const [isOnline, setIsOnline] =
    useState(
      typeof navigator !== "undefined"
        ? navigator.onLine
        : true
    );

  const [liveLocation, setLiveLocation] =
    useState(null);

  const [locationPermission, setLocationPermission] =
    useState("idle");

  const [locationError, setLocationError] =
    useState("");

  const [locateSignal, setLocateSignal] =
    useState(0);

  const [liveWeather, setLiveWeather] =
    useState(() =>
      readJSON(
        "landguard-live-weather",
        null
      )
    );

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState("");

  const [selectedState, setSelectedState] =
    useState(STATES[0]);

  const [reports, setReports] = useState(() =>
    readJSON(
      "landguard-reports",
      INITIAL_REPORTS
    )
  );

  const [incidents, setIncidents] =
    useState(() =>
      readJSON(
        "landguard-incidents",
        INITIAL_INCIDENTS
      )
    );

  const [sosAlerts, setSosAlerts] =
    useState(() =>
      readJSON(
        "landguard-sos",
        INITIAL_SOS
      )
    );

  const [showReport, setShowReport] =
    useState(false);

  const [showSOS, setShowSOS] =
    useState(false);

  const [showAI, setShowAI] =
    useState(false);

  const [toast, setToast] =
    useState("");

  /* =====================================================
     ONLINE / OFFLINE
  ===================================================== */

  useEffect(() => {
    function online() {
      setIsOnline(true);
      setToast(
        "Internet restored. Offline records are ready for synchronization."
      );
    }

    function offline() {
      setIsOnline(false);
      setToast(
        "Offline mode enabled. New SOS and reports will be stored locally."
      );
    }

    window.addEventListener(
      "online",
      online
    );

    window.addEventListener(
      "offline",
      offline
    );

    return () => {
      window.removeEventListener(
        "online",
        online
      );

      window.removeEventListener(
        "offline",
        offline
      );
    };
  }, []);

  /* =====================================================
     TOAST AUTO HIDE
  ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      4500
    );

    return () => clearTimeout(timer);
  }, [toast]);

  /* =====================================================
     GPS
  ===================================================== */

  useEffect(() => {
    if (!user) return;

    if (!navigator.geolocation) {
      setLocationPermission("unsupported");
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationPermission("requesting");

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          setLiveLocation({
            latitude,
            longitude,
            accuracy,
            updatedAt:
              new Date().toISOString(),
          });

          setLocationPermission(
            "granted"
          );

          setLocationError("");
        },
        (error) => {
          setLocationPermission(
            error.code === 1
              ? "denied"
              : "error"
          );

          if (error.code === 1) {
            setLocationError(
              "Location permission was denied."
            );
          } else if (error.code === 2) {
            setLocationError(
              "Location is currently unavailable."
            );
          } else if (error.code === 3) {
            setLocationError(
              "Location request timed out."
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );

    return () =>
      navigator.geolocation.clearWatch(
        watchId
      );
  }, [user]);

  /* =====================================================
     LIVE WEATHER
  ===================================================== */

  useEffect(() => {
    if (!liveLocation) return;

    let cancelled = false;

    async function fetchWeather() {
      const latKey =
        Math.round(
          liveLocation.latitude * 100
        ) / 100;

      const lngKey =
        Math.round(
          liveLocation.longitude * 100
        ) / 100;

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latKey}` +
        `&longitude=${lngKey}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m` +
        `&timezone=auto`;

      try {
        setWeatherLoading(true);
        setWeatherError("");

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Weather service unavailable."
          );
        }

        const data = await response.json();

        if (cancelled) return;

        const current = {
          ...data.current,
          updatedAt:
            new Date().toISOString(),
        };

        setLiveWeather(current);

        writeJSON(
          "landguard-live-weather",
          current
        );
      } catch (error) {
        if (!cancelled) {
          setWeatherError(
            error.message ||
              "Unable to load weather."
          );
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    fetchWeather();

    const interval = setInterval(
      fetchWeather,
      10 * 60 * 1000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    liveLocation?.latitude,
    liveLocation?.longitude,
  ]);

  /* =====================================================
     PERSISTENCE
  ===================================================== */

  useEffect(() => {
    writeJSON(
      "landguard-reports",
      reports
    );
  }, [reports]);

  useEffect(() => {
    writeJSON(
      "landguard-incidents",
      incidents
    );
  }, [incidents]);

  useEffect(() => {
    writeJSON(
      "landguard-sos",
      sosAlerts
    );
  }, [sosAlerts]);

  /* =====================================================
     OFFLINE SYNC QUEUE
  ===================================================== */

  useEffect(() => {
    if (!isOnline) return;

    setReports((current) =>
      current.map((report) =>
        report.synced
          ? report
          : {
              ...report,
              synced: true,
              status: "submitted",
            }
      )
    );

    setSosAlerts((current) =>
      current.map((sos) =>
        sos.synced
          ? sos
          : {
              ...sos,
              synced: true,
              status: "active",
            }
      )
    );
  }, [isOnline]);

  /* =====================================================
     LOGIN
  ===================================================== */

  function handleLogin(nextUser) {
    setUser(nextUser);

    writeJSON(
      "landguard-user",
      nextUser
    );

    if (nextUser.role === "citizen") {
      setPage("dashboard");
    } else if (
      nextUser.role === "rescue"
    ) {
      setPage("rescue");
    } else {
      setPage("admin");
    }

    setToast(
      `Welcome to LandGuard AI, ${nextUser.name}`
    );
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function logout() {
    try {
      localStorage.removeItem(
        "landguard-user"
      );
    } catch {
      // ignore
    }

    setUser(null);
    setPage("dashboard");
    setShowAI(false);
  }

  /* =====================================================
     CREATE REPORT
  ===================================================== */

  function createReport(data) {
    const report = {
      id: `REP-${Date.now()}`,
      title: data.title,
      description: data.description,
      severity: data.severity,
      photo: data.photo || "",
      status: isOnline
        ? "submitted"
        : "pending-offline",
      synced: isOnline,
      coordinates: liveLocation
        ? [
            liveLocation.latitude,
            liveLocation.longitude,
          ]
        : null,
      createdAt:
        new Date().toISOString(),
      reportedBy:
        user?.name || "Citizen",
    };

    setReports((current) => [
      report,
      ...current,
    ]);

    setShowReport(false);

    setToast(
      isOnline
        ? "Hazard report submitted successfully."
        : "Report saved offline. It will sync when online."
    );
  }

  /* =====================================================
     SEND SOS
  ===================================================== */

  function sendSOS() {
    const selected =
      selectedState || STATES[0];

    const sos = {
      id: `SOS-${Date.now()}`,
      status: isOnline
        ? "active"
        : "queued-offline",
      synced: isOnline,
      reportedBy:
        user?.name || "Citizen",
      coordinates: liveLocation
        ? [
            liveLocation.latitude,
            liveLocation.longitude,
          ]
        : [
            selected.lat,
            selected.lng,
          ],
      accuracy:
        liveLocation?.accuracy || null,
      source: liveLocation
        ? "live-gps"
        : "selected-state",
      createdAt:
        new Date().toISOString(),
    };

    const incident = {
      id: `INC-${Date.now()}`,
      location: liveLocation
        ? `${liveLocation.latitude.toFixed(
            5
          )}, ${liveLocation.longitude.toFixed(
            5
          )}`
        : `${selected.capital}, ${selected.name}`,
      state: selected.name,
      severity: "critical",
      type: "SOS Emergency",
      status: "dispatched",
      assignedTo: "Unassigned",
      reportedBy:
        user?.name || "Citizen",
      time: "Just now",
    };

    setSosAlerts((current) => [
      sos,
      ...current,
    ]);

    setIncidents((current) => [
      incident,
      ...current,
    ]);

    setShowSOS(false);

    setToast(
      isOnline
        ? "🆘 SOS sent. Rescue queue updated."
        : "🆘 SOS saved offline and queued for synchronization."
    );

    setPage("sos");
  }

  /* =====================================================
     PAGE ROUTING
  ===================================================== */

  const pageContent = useMemo(() => {
    if (!user) return null;

    if (
      page === "dashboard" &&
      user.role === "citizen"
    ) {
      return (
        <Dashboard
          setPage={setPage}
          selectedState={selectedState}
          setSelectedState={
            setSelectedState
          }
          liveLocation={liveLocation}
          liveWeather={liveWeather}
        />
      );
    }

    if (page === "map") {
      return (
        <IndiaRiskMap
          liveLocation={liveLocation}
          locateSignal={locateSignal}
          setLocateSignal={
            setLocateSignal
          }
          setPage={setPage}
        />
      );
    }

    if (page === "weather") {
      return (
        <WeatherPage
          liveLocation={liveLocation}
          liveWeather={liveWeather}
          weatherLoading={
            weatherLoading
          }
          weatherError={weatherError}
        />
      );
    }

    if (page === "analytics") {
      return <Analytics />;
    }

    if (page === "calculator") {
      return <RiskCalculator />;
    }

    if (
      page === "reports" &&
      user.role === "citizen"
    ) {
      return (
        <Reports
          reports={reports}
          setShowReport={
            setShowReport
          }
        />
      );
    }

    if (page === "sos") {
      return (
        <SOSPage
          sosAlerts={sosAlerts}
          isOnline={isOnline}
          liveLocation={liveLocation}
          setPage={setPage}
        />
      );
    }

    if (
      page === "rescue" &&
      user.role === "rescue"
    ) {
      return (
        <RescueDashboard
          incidents={incidents}
          sosAlerts={sosAlerts}
          setIncidents={setIncidents}
        />
      );
    }

    if (page === "incidents") {
      return (
        <Incidents
          incidents={incidents}
        />
      );
    }

    if (
      page === "admin" &&
      user.role === "admin"
    ) {
      return (
        <AdminDashboard
          reports={reports}
          incidents={incidents}
          sosAlerts={sosAlerts}
        />
      );
    }

    if (
      page === "monitor" &&
      user.role === "admin"
    ) {
      return (
        <MonitorReports
          reports={reports}
        />
      );
    }

    if (
      page === "users" &&
      user.role === "admin"
    ) {
      return <UsersPage />;
    }

    return (
      <Dashboard
        setPage={setPage}
        selectedState={selectedState}
        setSelectedState={
          setSelectedState
        }
        liveLocation={liveLocation}
        liveWeather={liveWeather}
      />
    );
  }, [
    user,
    page,
    selectedState,
    liveLocation,
    liveWeather,
    locateSignal,
    weatherLoading,
    weatherError,
    reports,
    incidents,
    sosAlerts,
    isOnline,
  ]);

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
        language={language}
      />

      <main className="main-area">
        <Topbar
          user={user}
          isOnline={isOnline}
          liveLocation={liveLocation}
          locationPermission={
            locationPermission
          }
          onSOS={() =>
            setShowSOS(true)
          }
          language={language}
          setLanguage={setLanguage}
          setShowAI={setShowAI}
        />

        {locationError && (
          <div className="location-warning">
            📍 {locationError}
          </div>
        )}

        <div className="page-wrapper">
          {pageContent}
        </div>
      </main>

      {showAI && (
        <AIAgent
          onClose={() =>
            setShowAI(false)
          }
        />
      )}

      {showReport && (
        <ReportModal
          onClose={() =>
            setShowReport(false)
          }
          onSubmit={createReport}
          liveLocation={liveLocation}
        />
      )}

      {showSOS && (
        <SOSModal
          onClose={() =>
            setShowSOS(false)
          }
          onSend={sendSOS}
          liveLocation={liveLocation}
          liveWeather={liveWeather}
          isOnline={isOnline}
        />
      )}

      {toast && (
        <div className="toast">
          <span>✦</span>

          <div>
            <strong>
              LandGuard AI
            </strong>

            <small>{toast}</small>
          </div>

          <button
            onClick={() =>
              setToast("")
            }
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}