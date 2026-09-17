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
   Complete single-file frontend
   ========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const INDIA_CENTER = [22.5, 80.5];

const STATES = [
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
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
    capital: "Dispur",
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
    capital: "Agartala",
    lat: 23.8315,
    lng: 91.2868,
    rainfall: 58,
    soil: 13,
    slope: 67,
    risk: 49,
  },
];

const SAFE_ZONES = [
  { name: "Itanagar Safe Zone", lat: 27.0844, lng: 93.6053 },
  { name: "Guwahati Rescue Hub", lat: 26.1445, lng: 91.7362 },
  { name: "Shillong Safe Zone", lat: 25.5788, lng: 91.8933 },
  { name: "Imphal Emergency Hub", lat: 24.817, lng: 93.9368 },
  { name: "Aizawl Rescue Hub", lat: 23.7271, lng: 92.7176 },
  { name: "Gangtok Safe Zone", lat: 27.3389, lng: 88.6065 },
];

const INITIAL_REPORTS = [
  {
    id: "REP-DEMO-01",
    title: "Roadside soil cracks",
    description: "Visible cracks reported near a hill road.",
    severity: "High",
    photo: "",
    status: "submitted",
    synced: true,
    coordinates: [27.0844, 93.6053],
    createdAt: new Date().toISOString(),
    reportedBy: "Demo Citizen",
  },
];

const INITIAL_SOS = [];

const INITIAL_INCIDENTS = [
  {
    id: "INC-001",
    location: "Sikkim",
    state: "Sikkim",
    severity: "critical",
    type: "Landslide Warning",
    status: "dispatched",
    assignedTo: "Rescue Team Alpha",
    reportedBy: "Monitoring System",
    time: "Today",
  },
  {
    id: "INC-002",
    location: "Aizawl",
    state: "Mizoram",
    severity: "high",
    type: "Slope Instability",
    status: "responding",
    assignedTo: "Team Bravo",
    reportedBy: "Citizen Report",
    time: "Today",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

function riskLabel(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

function riskClass(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

function weatherDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  };

  return map[code] || "Weather data";
}

function getNearestSafeZone(lat, lng) {
  let nearest = SAFE_ZONES[0];
  let distance = Infinity;

  SAFE_ZONES.forEach((zone) => {
    const d =
      Math.pow(zone.lat - lat, 2) +
      Math.pow(zone.lng - lng, 2);

    if (d < distance) {
      distance = d;
      nearest = zone;
    }
  });

  return nearest;
}

/* =========================================================
   CUSTOM LEAFLET ICONS
   ========================================================= */

const stateIcon = (risk) =>
  L.divIcon({
    className: "custom-state-marker",
    html: `
      <div class="state-marker ${riskClass(risk)}">
        <span>${risk}</span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

const liveIcon = L.divIcon({
  className: "live-location-marker",
  html: `
    <div class="live-pulse">
      <div class="live-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const rescueIcon = L.divIcon({
  className: "rescue-marker",
  html: `<div>🚑</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

/* =========================================================
   MAP CONTROLLER
   ========================================================= */

function MapController({ locateSignal, liveLocation }) {
  const map = useMap();

  useEffect(() => {
    if (locateSignal > 0 && liveLocation) {
      map.flyTo(
        [liveLocation.latitude, liveLocation.longitude],
        10,
        { duration: 1.2 }
      );
    }
  }, [locateSignal, liveLocation, map]);

  return null;
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(() =>
    readJSON("landguard-user", null)
  );

  const [page, setPage] = useState("dashboard");

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const [liveLocation, setLiveLocation] = useState(null);
  const [locationPermission, setLocationPermission] =
    useState("idle");
  const [locationError, setLocationError] = useState("");
  const [locateSignal, setLocateSignal] = useState(0);

  const [liveWeather, setLiveWeather] = useState(() =>
    readJSON("landguard-weather", null)
  );

  const [weatherLoading, setWeatherLoading] = useState(false);

  const [selectedState, setSelectedState] = useState(
    STATES[0]
  );

  const [reports, setReports] = useState(() =>
    readJSON("landguard-reports", INITIAL_REPORTS)
  );

  const [sosAlerts, setSosAlerts] = useState(() =>
    readJSON("landguard-sos", INITIAL_SOS)
  );

  const [incidents, setIncidents] = useState(() =>
    readJSON("landguard-incidents", INITIAL_INCIDENTS)
  );

  const [showReport, setShowReport] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [toast, setToast] = useState("");
  const [language, setLanguage] = useState(() =>
    localStorage.getItem("landguard-language") || "en"
  );

  /* =====================================================
     PERSISTENCE
     ===================================================== */

  useEffect(() => {
    saveJSON("landguard-reports", reports);
  }, [reports]);

  useEffect(() => {
    saveJSON("landguard-sos", sosAlerts);
  }, [sosAlerts]);

  useEffect(() => {
    saveJSON("landguard-incidents", incidents);
  }, [incidents]);

  useEffect(() => {
    if (liveWeather) {
      saveJSON("landguard-weather", liveWeather);
    }
  }, [liveWeather]);

  /* =====================================================
     TOAST
     ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =====================================================
     ONLINE / OFFLINE MODE
     ===================================================== */

  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      setToast("🟢 Internet restored. Sync available.");
    };

    const offline = () => {
      setIsOnline(false);
      setToast(
        "📴 Offline mode enabled. Your reports and SOS can be queued."
      );
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  /* =====================================================
     LIVE GPS LOCATION
     ===================================================== */

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("unsupported");
      setLocationError("Geolocation is not supported.");
      return;
    }

    setLocationPermission("requesting");

    const watchId = navigator.geolocation.watchPosition(
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
          updatedAt: new Date().toISOString(),
        });

        setLocationPermission("granted");
        setLocationError("");
      },
      (error) => {
        setLocationPermission("denied");

        if (error.code === 1) {
          setLocationError(
            "Location permission denied. Allow location access in browser."
          );
        } else if (error.code === 2) {
          setLocationError("Location unavailable.");
        } else {
          setLocationError("Unable to detect live location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  /* =====================================================
     LIVE WEATHER
     ===================================================== */

  useEffect(() => {
    if (!liveLocation) return;

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);

        const url =
          `${API_BASE}/api/weather?latitude=${liveLocation.latitude}` +
          `&longitude=${liveLocation.longitude}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Backend weather failed");
        }

        const data = await response.json();

        if (data.success && data.weather) {
          setLiveWeather(data.weather);
          return;
        }

        throw new Error("Invalid weather response");
      } catch {
        try {
          const url =
            `https://api.open-meteo.com/v1/forecast?latitude=` +
            `${liveLocation.latitude}&longitude=${liveLocation.longitude}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=auto`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.current) {
            setLiveWeather(data.current);
          }
        } catch {
          // Keep previous weather
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [liveLocation]);

  /* =====================================================
     LOAD SOS FROM BACKEND
     ===================================================== */

  useEffect(() => {
    if (!isOnline) return;

    const loadSOS = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/sos`);

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && Array.isArray(data.sosAlerts)) {
          const backendSOS = data.sosAlerts.map((item) => ({
            ...item,
            coordinates:
              item.coordinates?.latitude != null
                ? [
                    item.coordinates.latitude,
                    item.coordinates.longitude,
                  ]
                : null,
          }));

          setSosAlerts((current) => {
            const localPending = current.filter(
              (item) =>
                item.status === "queued-offline" ||
                item.synced === false
            );

            const merged = [
              ...localPending,
              ...backendSOS,
            ];

            const unique = [];
            const ids = new Set();

            merged.forEach((item) => {
              if (!ids.has(item.id)) {
                ids.add(item.id);
                unique.push(item);
              }
            });

            return unique;
          });
        }
      } catch {
        // Backend unavailable
      }
    };

    loadSOS();
  }, [isOnline]);

  /* =====================================================
     SYNC OFFLINE SOS
     ===================================================== */

  useEffect(() => {
    if (!isOnline) return;

    const syncOfflineSOS = async () => {
      const pending = sosAlerts.filter(
        (item) =>
          item.status === "queued-offline" ||
          item.synced === false
      );

      for (const sos of pending) {
        try {
          const coords = sos.coordinates
            ? {
                latitude: sos.coordinates[0],
                longitude: sos.coordinates[1],
              }
            : null;

          const response = await fetch(`${API_BASE}/api/sos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: sos.id,
              userId: user?.id || null,
              reportedBy: sos.reportedBy || "Citizen",
              coordinates: coords,
              accuracy: sos.accuracy || null,
              source: sos.source || "unknown",
              locationName:
                sos.locationName || "Emergency GPS Location",
              weather: sos.weather || {},
              synced: true,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setSosAlerts((current) =>
              current.map((item) =>
                item.id === sos.id
                  ? {
                      ...item,
                      status: "active",
                      synced: true,
                      backendSaved: true,
                    }
                  : item
              )
            );
          }
        } catch {
          // Keep in offline queue
        }
      }
    };

    syncOfflineSOS();
  }, [isOnline]);

  /* =====================================================
     AUTH
     ===================================================== */

  function handleLogout() {
    localStorage.removeItem("landguard-user");
    setUser(null);
    setPage("dashboard");
    setToast("👋 Logged out successfully.");
  }

  function handleLogin(loginUser) {
    const finalUser = {
      ...loginUser,
      role: loginUser.role || "citizen",
    };

    setUser(finalUser);
    saveJSON("landguard-user", finalUser);
    setPage("dashboard");
    setToast(`Welcome back, ${finalUser.name || "User"} 👋`);
  }

  /* =====================================================
     SOS
     ===================================================== */

  async function sendSOS() {
    const selected = selectedState || STATES[0];

    const latitude = liveLocation
      ? liveLocation.latitude
      : selected.lat;

    const longitude = liveLocation
      ? liveLocation.longitude
      : selected.lng;

    const locationName = liveLocation
      ? `Live GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : `${selected.capital}, ${selected.name}`;

    const sosId = `SOS-${Date.now()}`;

    const sos = {
      id: sosId,
      status: isOnline ? "sending" : "queued-offline",
      synced: false,
      reportedBy: user?.name || "Citizen",
      coordinates: [latitude, longitude],
      accuracy: liveLocation?.accuracy || null,
      source: liveLocation
        ? "live-gps"
        : "selected-state",
      locationName,
      weather: liveWeather
        ? {
            temperature:
              liveWeather.temperature_2m ?? null,
            humidity:
              liveWeather.relative_humidity_2m ?? null,
            rain: liveWeather.rain ?? 0,
            weatherCode:
              liveWeather.weather_code ?? null,
          }
        : {},
      createdAt: new Date().toISOString(),
    };

    setSosAlerts((current) => [sos, ...current]);
    setShowSOS(false);

    const incident = {
      id: `INC-${Date.now()}`,
      location: locationName,
      state: selected.name,
      severity: "critical",
      type: "SOS Emergency",
      status: "dispatched",
      assignedTo: "Rescue Team",
      reportedBy: user?.name || "Citizen",
      time: "Just now",
    };

    setIncidents((current) => [incident, ...current]);

    if (!isOnline) {
      setToast(
        "📴 SOS saved offline. It will sync when internet returns."
      );
      setPage("sos");
      return;
    }

    try {
      setToast("🆘 Sending emergency SOS...");

      const response = await fetch(`${API_BASE}/api/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sosId,
          userId: user?.id || null,
          reportedBy: user?.name || "Citizen",
          coordinates: {
            latitude,
            longitude,
          },
          accuracy: liveLocation?.accuracy || null,
          source: liveLocation
            ? "live-gps"
            : "selected-state",
          locationName,
          weather: liveWeather
            ? {
                temperature:
                  liveWeather.temperature_2m ?? null,
                humidity:
                  liveWeather.relative_humidity_2m ?? null,
                rain: liveWeather.rain ?? 0,
                weatherCode:
                  liveWeather.weather_code ?? null,
              }
            : {},
          synced: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "SOS backend failed"
        );
      }

      setSosAlerts((current) =>
        current.map((item) =>
          item.id === sosId
            ? {
                ...item,
                status: "active",
                synced: true,
                backendSaved: true,
              }
            : item
        )
      );

      setToast(
        "🆘 SOS SENT! Rescue alert saved successfully."
      );
    } catch (error) {
      console.error("SOS BACKEND ERROR:", error);

      setSosAlerts((current) =>
        current.map((item) =>
          item.id === sosId
            ? {
                ...item,
                status: "queued-offline",
                synced: false,
                backendSaved: false,
              }
            : item
        )
      );

      setToast(
        "⚠️ Server unavailable. SOS saved locally for sync."
      );
    }

    setPage("sos");
  }

  /* =====================================================
     HAZARD REPORT
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
      createdAt: new Date().toISOString(),
      reportedBy: user?.name || "Citizen",
    };

    setReports((current) => [report, ...current]);
    setShowReport(false);

    if (isOnline) {
      setToast(
        "📷 Hazard report created successfully."
      );
    } else {
      setToast(
        "📴 Report saved offline. Sync pending."
      );
    }
  }

  /* =====================================================
     UPDATE SOS STATUS
     ===================================================== */

  async function updateSOSStatus(id, status) {
    setSosAlerts((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status }
          : item
      )
    );

    if (!isOnline) {
      setToast("📴 Status changed locally.");
      return;
    }

    try {
      await fetch(
        `${API_BASE}/api/sos/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      setToast(`SOS status updated → ${status}`);
    } catch {
      setToast(
        "Status updated locally. Server sync pending."
      );
    }
  }

  /* =====================================================
     NAVIGATION
     ===================================================== */

  const nav = (target) => {
    setPage(target);
  };

  const offlineCount =
    reports.filter((r) => !r.synced).length +
    sosAlerts.filter(
      (s) =>
        s.synced === false ||
        s.status === "queued-offline"
    ).length;

  const activeSOS = sosAlerts.filter(
    (s) =>
      s.status === "active" ||
      s.status === "sending" ||
      s.status === "queued-offline" ||
      s.status === "acknowledged" ||
      s.status === "responding"
  );

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="app-shell">
      {!isOnline && (
        <div className="offline-banner">
          <span>📴</span>
          <strong>OFFLINE MODE</strong>
          <span>
            Your emergency data is being stored locally.
          </span>
          {offlineCount > 0 && (
            <b>{offlineCount} pending</b>
          )}
        </div>
      )}

      <Sidebar
        page={page}
        nav={nav}
        user={user}
        onLogout={handleLogout}
        activeSOS={activeSOS.length}
      />

      <main className="main-area">
        <Topbar
          user={user}
          isOnline={isOnline}
          language={language}
          setLanguage={(value) => {
            setLanguage(value);
            localStorage.setItem(
              "landguard-language",
              value
            );
          }}
          onSOS={() => setShowSOS(true)}
          onLogout={handleLogout}
        />

        <div className="page-container">
          {page === "dashboard" && (
            <Dashboard
              user={user}
              states={STATES}
              nav={nav}
              liveLocation={liveLocation}
              weather={liveWeather}
              isOnline={isOnline}
              activeSOS={activeSOS.length}
              setSelectedState={setSelectedState}
            />
          )}

          {page === "map" && (
            <IndiaRiskMap
              states={STATES}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              liveLocation={liveLocation}
              locateSignal={locateSignal}
              onLocate={() =>
                setLocateSignal((x) => x + 1)
              }
              isOnline={isOnline}
              incidents={incidents}
            />
          )}

          {page === "weather" && (
            <WeatherPage
              weather={liveWeather}
              loading={weatherLoading}
              liveLocation={liveLocation}
              states={STATES}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
            />
          )}

          {page === "reports" && (
            <ReportsPage
              reports={reports}
              setShowReport={setShowReport}
              isOnline={isOnline}
            />
          )}

          {page === "sos" && (
            <SOSPage
              sosAlerts={sosAlerts}
              isOnline={isOnline}
              liveLocation={liveLocation}
              setPage={setPage}
              updateSOSStatus={updateSOSStatus}
            />
          )}

          {page === "analytics" && (
            <AnalyticsPage states={STATES} />
          )}

          {page === "calculator" && (
            <RiskCalculator
              isOnline={isOnline}
              selectedState={selectedState}
            />
          )}

          {page === "rescue" && (
            <RescueDashboard
              incidents={incidents}
              sosAlerts={sosAlerts}
              updateSOSStatus={updateSOSStatus}
              setIncidents={setIncidents}
            />
          )}

          {page === "incidents" && (
            <IncidentsPage
              incidents={incidents}
            />
          )}

          {page === "admin" && (
            <AdminDashboard
              states={STATES}
              reports={reports}
              sosAlerts={sosAlerts}
              incidents={incidents}
              isOnline={isOnline}
            />
          )}

          {page === "ai" && (
            <AIAgentPage
              states={STATES}
              selectedState={selectedState}
              weather={liveWeather}
            />
          )}

          {page === "profile" && (
            <ProfilePage
              user={user}
              liveLocation={liveLocation}
              isOnline={isOnline}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onCreate={createReport}
        />
      )}

      {showSOS && (
        <SOSModal
          onClose={() => setShowSOS(false)}
          onSend={sendSOS}
          liveLocation={liveLocation}
          liveWeather={liveWeather}
          isOnline={isOnline}
        />
      )}

      {showAI && (
        <AIAgentModal
          onClose={() => setShowAI(false)}
          states={STATES}
          selectedState={selectedState}
        />
      )}

      <button
        className="floating-ai"
        onClick={() => setShowAI(true)}
        title="AI Agent"
      >
        ✨
      </button>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   AUTH SCREEN
   ========================================================= */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!mobile || !password) {
      setError("Please enter mobile number and password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "/api/login"
          : "/api/register";

      const body =
        mode === "login"
          ? {
              mobile,
              password,
            }
          : {
              name,
              mobile,
              password,
              state: "",
              district: "",
              village: "",
            };

      const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Authentication failed."
        );
      }

      const loggedUser = data.user || {
        name,
        mobile,
      };

      onLogin({
        ...loggedUser,
        role:
          mode === "register"
            ? "citizen"
            : role,
      });
    } catch (err) {
      setError(
        err.message ||
          "Backend unavailable. Please check server."
      );
    } finally {
      setLoading(false);
    }
  }

  function demoLogin(selectedRole) {
    const demos = {
      citizen: {
        id: "demo-citizen",
        name: "Citizen User",
        mobile: "9999999999",
        role: "citizen",
      },
      rescue: {
        id: "demo-rescue",
        name: "Rescue Officer",
        mobile: "9999999998",
        role: "rescue",
      },
      admin: {
        id: "demo-admin",
        name: "System Admin",
        mobile: "9999999997",
        role: "admin",
      },
    };

    onLogin(demos[selectedRole]);
  }

  return (
    <div className="auth-page">
      <div className="auth-glow glow-one"></div>
      <div className="auth-glow glow-two"></div>

      <div className="auth-brand">
        <div className="brand-mark">L</div>
        <div>
          <strong>LandGuard AI</strong>
          <span>Early warning • Faster rescue</span>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">AI DISASTER INTELLIGENCE</span>
          <h1>
            Protecting lives with
            <span> intelligent warning.</span>
          </h1>
          <p>
            Landslide risk monitoring and emergency
            response for Northeast India.
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full Name
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />
            </label>
          )}

          <label>
            Mobile Number
            <input
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
              placeholder="10 digit mobile number"
              inputMode="numeric"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
            />
          </label>

          {mode === "login" && (
            <label>
              Dashboard
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >
                <option value="citizen">
                  Citizen Dashboard
                </option>
                <option value="rescue">
                  Rescue Dashboard
                </option>
                <option value="admin">
                  Admin Dashboard
                </option>
              </select>
            </label>
          )}

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}

          <button
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Connecting..."
              : mode === "login"
              ? "Enter LandGuard →"
              : "Create Account →"}
          </button>
        </form>

        <div className="demo-login">
          <small>DEMO ACCESS</small>

          <div className="demo-buttons">
            <button
              onClick={() => demoLogin("citizen")}
            >
              👤 Citizen
            </button>
            <button
              onClick={() => demoLogin("rescue")}
            >
              🚑 Rescue
            </button>
            <button
              onClick={() => demoLogin("admin")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>

      <div className="auth-footer">
        🇮🇳 AI-Based Early Warning & Landslide Risk
        Monitoring System • NER
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
  page,
  nav,
  user,
  onLogout,
  activeSOS,
}) {
  const role = user?.role || "citizen";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">L</div>
        <div>
          <strong>LandGuard</strong>
          <small>AI • NER</small>
        </div>
      </div>

      <div className="sidebar-scroll">
        <div className="nav-label">MAIN</div>

        <NavItem
          icon="⌂"
          label="Dashboard"
          active={page === "dashboard"}
          onClick={() => nav("dashboard")}
        />

        <NavItem
          icon="🇮🇳"
          label="India Risk Map"
          active={page === "map"}
          onClick={() => nav("map")}
        />

        <NavItem
          icon="🌦"
          label="Live Weather"
          active={page === "weather"}
          onClick={() => nav("weather")}
        />

        <NavItem
          icon="📷"
          label="Hazard Reports"
          active={page === "reports"}
          onClick={() => nav("reports")}
        />

        <NavItem
          icon="🆘"
          label="SOS Center"
          active={page === "sos"}
          badge={activeSOS > 0 ? activeSOS : null}
          onClick={() => nav("sos")}
        />

        <div className="nav-label">INTELLIGENCE</div>

        <NavItem
          icon="🤖"
          label="AI Agent"
          active={page === "ai"}
          onClick={() => nav("ai")}
        />

        <NavItem
          icon="📊"
          label="Risk Analytics"
          active={page === "analytics"}
          onClick={() => nav("analytics")}
        />

        <NavItem
          icon="🧮"
          label="Risk Calculator"
          active={page === "calculator"}
          onClick={() => nav("calculator")}
        />

        <div className="nav-label">OPERATIONS</div>

        {(role === "rescue" || role === "admin") && (
          <>
            <NavItem
              icon="🚑"
              label="Rescue Dashboard"
              active={page === "rescue"}
              onClick={() => nav("rescue")}
            />

            <NavItem
              icon="🚨"
              label="Incidents"
              active={page === "incidents"}
              onClick={() => nav("incidents")}
            />
          </>
        )}

        {role === "admin" && (
          <NavItem
            icon="🛡️"
            label="Admin Dashboard"
            active={page === "admin"}
            onClick={() => nav("admin")}
          />
        )}

        <div className="nav-label">ACCOUNT</div>

        <NavItem
          icon="👤"
          label="Profile"
          active={page === "profile"}
          onClick={() => nav("profile")}
        />
      </div>

      <div className="sidebar-bottom">
        <div className="user-mini">
          <div className="avatar">
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-mini-info">
            <strong>{user?.name || "User"}</strong>
            <small>
              {role.charAt(0).toUpperCase() +
                role.slice(1)}
            </small>
          </div>

          <button
            className="logout-icon"
            onClick={onLogout}
            title="Logout"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge && (
        <b className="nav-badge">{badge}</b>
      )}
    </button>
  );
}

/* =========================================================
   TOPBAR
   ========================================================= */

function Topbar({
  user,
  isOnline,
  language,
  setLanguage,
  onSOS,
  onLogout,
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <div className="brand-mark">L</div>
        <strong>LandGuard AI</strong>
      </div>

      <div className="topbar-right">
        <div
          className={`network-status ${
            isOnline ? "online" : "offline"
          }`}
        >
          <span></span>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </div>

        <select
          className="language-select"
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="as">অসমীয়া</option>
          <option value="bn">বাংলা</option>
          <option value="ne">नेपाली</option>
          <option value="mizo">Mizo</option>
          <option value="kok">Kokborok</option>
        </select>

        <button
          className="top-sos"
          onClick={onSOS}
        >
          🆘 SOS
        </button>

        <div className="top-profile">
          <div className="avatar">
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <small>
              {user?.role || "citizen"}
            </small>
          </div>

          <button
            className="top-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  user,
  states,
  nav,
  liveLocation,
  weather,
  isOnline,
  activeSOS,
  setSelectedState,
}) {
  const avgRisk = Math.round(
    states.reduce((a, b) => a + b.risk, 0) /
      states.length
  );

  const criticalCount = states.filter(
    (s) => s.risk >= 80
  ).length;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            NORTHEAST INDIA • LIVE MONITORING
          </span>

          <h1>
            Early warning.
            <br />
            <span>Faster rescue.</span>
          </h1>

          <p>
            LandGuard AI combines rainfall, soil moisture,
            terrain slope, GPS and citizen reports to
            monitor landslide risk across Northeast India.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => nav("map")}
            >
              🗺️ Open India Risk Map
            </button>

            <button
              className="secondary-btn"
              onClick={() => nav("ai")}
            >
              ✨ Ask AI Agent
            </button>
          </div>
        </div>

        <div className="hero-orb">
          <div className="risk-orb">
            <div>
              <small>REGIONAL RISK</small>
              <strong>{avgRisk}</strong>
              <span>{riskLabel(avgRisk)}</span>
            </div>
          </div>

          <div className="orb-ring ring-one"></div>
          <div className="orb-ring ring-two"></div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon="🗺️"
          label="NER STATES"
          value="08"
          detail="All states monitored"
        />

        <StatCard
          icon="⚠️"
          label="HIGH RISK"
          value={criticalCount}
          detail="States above 80 risk"
        />

        <StatCard
          icon="📍"
          label="GPS STATUS"
          value={
            liveLocation ? "LIVE" : "WAIT"
          }
          detail={
            liveLocation
              ? `±${Math.round(
                  liveLocation.accuracy || 0
                )}m accuracy`
              : "Waiting for permission"
          }
        />

        <StatCard
          icon="🆘"
          label="ACTIVE SOS"
          value={activeSOS}
          detail={
            activeSOS
              ? "Rescue response required"
              : "No active emergency"
          }
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                RISK MONITORING
              </span>
              <h2>8 Northeast States</h2>
            </div>

            <button
              className="text-btn"
              onClick={() => nav("map")}
            >
              View map →
            </button>
          </div>

          <div className="state-grid">
            {states.map((state) => (
              <button
                className="state-card"
                key={state.id}
                onClick={() => {
                  setSelectedState(state);
                  nav("map");
                }}
              >
                <div className="state-card-top">
                  <div>
                    <strong>{state.name}</strong>
                    <small>
                      {state.capital}
                    </small>
                  </div>

                  <span
                    className={`risk-badge ${riskClass(
                      state.risk
                    )}`}
                  >
                    {state.risk}
                  </span>
                </div>

                <div className="risk-progress">
                  <span
                    style={{
                      width: `${state.risk}%`,
                    }}
                  ></span>
                </div>

                <div className="state-metrics">
                  <span>
                    🌧 {state.rainfall}%
                  </span>
                  <span>
                    🌱 {state.soil}
                  </span>
                  <span>
                    ⛰ {state.slope}°
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel live-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                LIVE SIGNAL
              </span>
              <h2>Your Environment</h2>
            </div>

            <span
              className={`status-pill ${
                isOnline ? "good" : "warning"
              }`}
            >
              {isOnline
                ? "CONNECTED"
                : "OFFLINE"}
            </span>
          </div>

          <div className="live-location-box">
            <div className="live-location-icon">
              📍
            </div>

            <div>
              <strong>
                {liveLocation
                  ? "Live GPS detected"
                  : "GPS waiting"}
              </strong>

              <p>
                {liveLocation
                  ? `${liveLocation.latitude.toFixed(
                      5
                    )}, ${liveLocation.longitude.toFixed(
                      5
                    )}`
                  : "Allow browser location access"}
              </p>
            </div>
          </div>

          {weather ? (
            <div className="weather-mini">
              <div className="weather-temp">
                {Math.round(
                  weather.temperature_2m || 0
                )}
                °
              </div>

              <div>
                <strong>
                  {weatherDescription(
                    weather.weather_code
                  )}
                </strong>

                <small>
                  Humidity{" "}
                  {weather.relative_humidity_2m ??
                    "--"}
                  % • Rain{" "}
                  {weather.rain ?? 0} mm
                </small>
              </div>
            </div>
          ) : (
            <div className="empty-mini">
              Weather will appear after GPS lock.
            </div>
          )}

          <button
            className="primary-btn full-btn"
            onClick={() => nav("weather")}
          >
            View Live Weather →
          </button>
        </section>
      </div>

      <section className="ai-signal">
        <div className="ai-signal-icon">
          ✨
        </div>

        <div>
          <span className="eyebrow">
            LANDGUARD AI SIGNAL
          </span>
          <h3>
            Risk intelligence is continuously
            monitoring the Northeast region.
          </h3>
          <p>
            Current monitoring includes rainfall,
            terrain slope, soil moisture, GPS signals
            and citizen reports.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => nav("ai")}
        >
          Open AI Agent
        </button>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

/* =========================================================
   INDIA + NER MAP
   ========================================================= */

function IndiaRiskMap({
  states,
  selectedState,
  setSelectedState,
  liveLocation,
  locateSignal,
  onLocate,
  isOnline,
  incidents,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            GEOSPATIAL INTELLIGENCE
          </span>
          <div className="page-title">
            🇮🇳 India Risk Monitoring Map
          </div>
          <p>
            Full India map with live GPS and
            Northeast state-level risk monitoring.
          </p>
        </div>

        <div className="map-actions">
          <span
            className={`status-pill ${
              isOnline ? "good" : "warning"
            }`}
          >
            {isOnline
              ? "● LIVE NETWORK"
              : "● OFFLINE"}
          </span>

          <button
            className="primary-btn"
            onClick={onLocate}
            disabled={!liveLocation}
          >
            📍 Locate Me
          </button>
        </div>
      </div>

      <div className="map-layout">
        <section className="map-panel">
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            minZoom={4}
            maxZoom={15}
            scrollWheelZoom={true}
            className="risk-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              locateSignal={locateSignal}
              liveLocation={liveLocation}
            />

            {states.map((state) => (
              <Marker
                key={state.id}
                position={[state.lat, state.lng]}
                icon={stateIcon(state.risk)}
                eventHandlers={{
                  click: () =>
                    setSelectedState(state),
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{state.name}</strong>
                    <span>
                      Risk:{" "}
                      <b>{state.risk}/100</b>
                    </span>
                    <span>
                      Rainfall: {state.rainfall}
                    </span>
                    <span>
                      Soil moisture: {state.soil}
                    </span>
                    <span>
                      Slope: {state.slope}°
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {incidents
              .filter(
                (incident) =>
                  incident.state === "Sikkim" ||
                  incident.state === "Mizoram"
              )
              .map((incident, index) => (
                <Marker
                  key={incident.id}
                  position={[
                    index === 0
                      ? 27.3389
                      : 23.7271,
                    index === 0
                      ? 88.6065
                      : 92.7176,
                  ]}
                  icon={rescueIcon}
                >
                  <Popup>
                    <strong>
                      🚑 {incident.type}
                    </strong>
                    <br />
                    {incident.location}
                    <br />
                    Status: {incident.status}
                  </Popup>
                </Marker>
              ))}

            {liveLocation && (
              <>
                <CircleMarker
                  center={[
                    liveLocation.latitude,
                    liveLocation.longitude,
                  ]}
                  radius={28}
                  pathOptions={{
                    color: "#00ff9d",
                    fillColor: "#00ff9d",
                    fillOpacity: 0.08,
                    weight: 1,
                  }}
                />

                <Marker
                  position={[
                    liveLocation.latitude,
                    liveLocation.longitude,
                  ]}
                  icon={liveIcon}
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
              </>
            )}
          </MapContainer>

          <div className="map-legend">
            <span>
              <i className="legend-dot low"></i>
              Low
            </span>
            <span>
              <i className="legend-dot moderate"></i>
              Moderate
            </span>
            <span>
              <i className="legend-dot high"></i>
              High
            </span>
            <span>
              <i className="legend-dot critical"></i>
              Critical
            </span>
            <span>
              <i className="legend-live"></i>
              Live GPS
            </span>
          </div>
        </section>

        <aside className="map-side-panel">
          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">
                  SELECTED
                </span>
                <h2>
                  {selectedState?.name}
                </h2>
              </div>

              <span
                className={`risk-badge ${riskClass(
                  selectedState?.risk || 0
                )}`}
              >
                {selectedState?.risk}
              </span>
            </div>

            <div className="selected-state-grid">
              <Metric
                label="Rainfall"
                value={`${selectedState?.rainfall}%`}
                icon="🌧"
              />

              <Metric
                label="Soil"
                value={selectedState?.soil}
                icon="🌱"
              />

              <Metric
                label="Slope"
                value={`${selectedState?.slope}°`}
                icon="⛰"
              />

              <Metric
                label="Capital"
                value={selectedState?.capital}
                icon="🏙"
              />
            </div>

            <div
              className={`risk-message ${riskClass(
                selectedState?.risk || 0
              )}`}
            >
              <strong>
                {riskLabel(selectedState?.risk)}
                {" "}Risk
              </strong>

              <p>
                Monitoring signals indicate a{" "}
                {riskLabel(
                  selectedState?.risk
                ).toLowerCase()} landslide risk
                level for this demonstration
                region.
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>NER Monitoring</h2>
                <small>
                  8 states active
                </small>
              </div>
            </div>

            <div className="compact-state-list">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() =>
                    setSelectedState(state)
                  }
                  className={
                    selectedState?.id === state.id
                      ? "selected"
                      : ""
                  }
                >
                  <span>{state.name}</span>
                  <b
                    className={riskClass(
                      state.risk
                    )}
                  >
                    {state.risk}
                  </b>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="metric-box">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   WEATHER
   ========================================================= */

function WeatherPage({
  weather,
  loading,
  liveLocation,
  states,
  selectedState,
  setSelectedState,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            LIVE ENVIRONMENT
          </span>
          <div className="page-title">
            🌦️ Live Weather
          </div>
          <p>
            Weather conditions connected to your
            current GPS position.
          </p>
        </div>

        {loading && (
          <span className="status-pill">
            Updating...
          </span>
        )}
      </div>

      <div className="weather-grid">
        <section className="weather-main-card">
          {weather ? (
            <>
              <div className="weather-big-icon">
                {weatherDescription(
                  weather.weather_code
                ) === "Clear sky"
                  ? "☀️"
                  : "🌧️"}
              </div>

              <div>
                <span className="eyebrow">
                  CURRENT LOCATION
                </span>

                <h1>
                  {Math.round(
                    weather.temperature_2m || 0
                  )}
                  °C
                </h1>

                <h3>
                  {weatherDescription(
                    weather.weather_code
                  )}
                </h3>

                {liveLocation && (
                  <p>
                    📍{" "}
                    {liveLocation.latitude.toFixed(
                      4
                    )}
                    ,{" "}
                    {liveLocation.longitude.toFixed(
                      4
                    )}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="weather-empty">
              <span>🌦️</span>
              <h2>
                Waiting for live weather
              </h2>
              <p>
                Allow GPS location to fetch
                weather.
              </p>
            </div>
          )}
        </section>

        <section className="weather-details">
          <WeatherMetric
            icon="💧"
            label="Humidity"
            value={
              weather?.relative_humidity_2m != null
                ? `${weather.relative_humidity_2m}%`
                : "--"
            }
          />

          <WeatherMetric
            icon="🌧"
            label="Rain"
            value={
              weather?.rain != null
                ? `${weather.rain} mm`
                : "--"
            }
          />

          <WeatherMetric
            icon="💨"
            label="Wind"
            value={
              weather?.wind_speed_10m != null
                ? `${weather.wind_speed_10m} km/h`
                : "--"
            }
          />

          <WeatherMetric
            icon="🌡"
            label="Temperature"
            value={
              weather?.temperature_2m != null
                ? `${Math.round(
                    weather.temperature_2m
                  )}°C`
                : "--"
            }
          />
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              REGIONAL CONDITIONS
            </span>
            <h2>NER State Monitoring</h2>
          </div>
        </div>

        <div className="state-weather-grid">
          {states.map((state) => (
            <button
              className="state-weather-card"
              key={state.id}
              onClick={() =>
                setSelectedState(state)
              }
            >
              <div>
                <strong>{state.name}</strong>
                <small>{state.capital}</small>
              </div>

              <div className="weather-number">
                {state.rainfall}%
              </div>

              <span>
                🌧 Rainfall signal
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function WeatherMetric({
  icon,
  label,
  value,
}) {
  return (
    <div className="weather-metric">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   REPORTS
   ========================================================= */

function ReportsPage({
  reports,
  setShowReport,
  isOnline,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            CITIZEN INTELLIGENCE
          </span>
          <div className="page-title">
            📷 Hazard Reports
          </div>
          <p>
            Report cracks, landslides, falling
            rocks and other hazards.
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
            <h2>Submitted Reports</h2>
            <small>
              Photos • GPS • description
            </small>
          </div>

          <span
            className={`status-pill ${
              isOnline ? "good" : "warning"
            }`}
          >
            {isOnline
              ? "SYNC ACTIVE"
              : "OFFLINE QUEUE"}
          </span>
        </div>

        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <div>📷</div>
              <h3>No reports yet</h3>
              <p>
                Create a citizen hazard report.
              </p>
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
                      alt={report.title}
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
                        {report.title}
                      </strong>
                      <small>
                        {report.id}
                      </small>
                    </div>

                    <span
                      className={`severity-badge ${riskClass(
                        report.severity ===
                          "Critical"
                          ? 90
                          : report.severity ===
                            "High"
                          ? 70
                          : 45
                      )}`}
                    >
                      {report.severity}
                    </span>
                  </div>

                  <p>
                    {report.description}
                  </p>

                  <small>
                    📍{" "}
                    {report.coordinates
                      ? `${Number(
                          report.coordinates[0]
                        ).toFixed(4)}, ${Number(
                          report.coordinates[1]
                        ).toFixed(4)}`
                      : "GPS unavailable"}
                  </small>

                  <div className="report-footer">
                    <span>
                      {report.synced ? (
                        <b className="synced-text">
                          ✓ Synced
                        </b>
                      ) : (
                        <b className="pending-text">
                          ◌ Pending sync
                        </b>
                      )}
                    </span>

                    <span>
                      {new Date(
                        report.createdAt
                      ).toLocaleString()}
                    </span>
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
   SOS PAGE
   ========================================================= */

function SOSPage({
  sosAlerts,
  isOnline,
  liveLocation,
  setPage,
  updateSOSStatus,
}) {
  const active = sosAlerts.filter(
    (s) =>
      s.status === "active" ||
      s.status === "queued-offline" ||
      s.status === "sending" ||
      s.status === "acknowledged" ||
      s.status === "responding"
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow danger-text">
            EMERGENCY RESPONSE
          </span>
          <div className="page-title">
            🆘 SOS Emergency Center
          </div>
          <p>
            Emergency alerts, GPS status and
            rescue response.
          </p>
        </div>

        <span
          className={`status-pill ${
            isOnline ? "good" : "warning"
          }`}
        >
          {isOnline
            ? "● NETWORK ONLINE"
            : "● OFFLINE MODE"}
        </span>
      </div>

      <div className="emergency-stats">
        <EmergencyStat
          label="ACTIVE SOS"
          value={active.length}
          detail="Emergency requests"
        />

        <EmergencyStat
          label="GPS"
          value={
            liveLocation ? "LOCKED" : "WAIT"
          }
          detail={
            liveLocation
              ? "Live coordinates"
              : "No GPS lock"
          }
        />

        <EmergencyStat
          label="NETWORK"
          value={
            isOnline ? "ONLINE" : "OFFLINE"
          }
          detail={
            isOnline
              ? "Server sync available"
              : "Local queue active"
          }
        />

        <EmergencyStat
          label="RESPONSE"
          value={
            active.length ? "ACTIVE" : "READY"
          }
          detail="Rescue system status"
        />
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
                <div>🆘</div>
                <h3>No SOS alerts</h3>
                <p>
                  Emergency requests will
                  appear here.
                </p>
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
                    <strong>
                      {sos.id}
                    </strong>

                    <small>
                      {sos.reportedBy}
                    </small>

                    <small>
                      {sos.coordinates
                        ? `${Number(
                            sos.coordinates[0]
                          ).toFixed(
                            5
                          )}, ${Number(
                            sos.coordinates[1]
                          ).toFixed(
                            5
                          )}`
                        : "No coordinates"}
                    </small>

                    <small>
                      {sos.locationName ||
                        "Emergency location"}
                    </small>
                  </div>

                  <div className="sos-right">
                    <span className="sos-status">
                      {sos.status}
                    </span>

                    {(sos.status === "active" ||
                      sos.status ===
                        "acknowledged" ||
                      sos.status ===
                        "responding") && (
                      <select
                        value={sos.status}
                        onChange={(e) =>
                          updateSOSStatus(
                            sos.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="active">
                          Active
                        </option>
                        <option value="acknowledged">
                          Acknowledged
                        </option>
                        <option value="responding">
                          Responding
                        </option>
                        <option value="resolved">
                          Resolved
                        </option>
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Safe Route</h2>
              <small>
                Emergency route interface
              </small>
            </div>
          </div>

          <div className="route-preview">
            <div className="route-start">📍</div>
            <div className="route-line"></div>
            <div className="route-end">
              🏥
            </div>
          </div>

          <div className="route-info">
            <strong>
              Nearest Safe Zone
            </strong>

            <p>
              A demo emergency route can be
              generated from your GPS location.
            </p>

            <small>
              ⚠️ Safe zones shown in this demo
              must be verified with local
              authorities before real emergency
              use.
            </small>
          </div>

          <button
            className="primary-btn full-btn"
            onClick={() => setPage("map")}
          >
            Open India Map →
          </button>
        </section>
      </div>
    </div>
  );
}

function EmergencyStat({
  label,
  value,
  detail,
}) {
  return (
    <div className="emergency-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

/* =========================================================
   ANALYTICS
   ========================================================= */

function AnalyticsPage({ states }) {
  const sorted = [...states].sort(
    (a, b) => b.risk - a.risk
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            RISK INTELLIGENCE
          </span>
          <div className="page-title">
            📊 Risk Analytics
          </div>
          <p>
            State-level monitoring indicators.
          </p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="analytics-big">
          <span>REGIONAL RISK</span>
          <strong>
            {Math.round(
              states.reduce(
                (a, s) => a + s.risk,
                0
              ) / states.length
            )}
          </strong>
          <small>/ 100</small>
        </div>

        <div className="analytics-description">
          <h2>
            Northeast Monitoring Overview
          </h2>
          <p>
            The dashboard compares rainfall,
            soil moisture, terrain slope and
            calculated demonstration risk scores
            across all 8 NER states.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>State Risk Signals</h2>
            <small>
              Higher score indicates greater
              monitoring priority.
            </small>
          </div>
        </div>

        <div className="analytics-list">
          {sorted.map((state, index) => (
            <div
              className="analytics-row"
              key={state.id}
            >
              <div className="rank-number">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </div>

              <div className="analytics-state">
                <strong>
                  {state.name}
                </strong>
                <small>
                  {state.capital}
                </small>
              </div>

              <div className="analytics-bar">
                <span
                  style={{
                    width: `${state.risk}%`,
                  }}
                ></span>
              </div>

              <div
                className={`analytics-score ${riskClass(
                  state.risk
                )}`}
              >
                {state.risk}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RISK CALCULATOR
   ========================================================= */

function RiskCalculator({
  isOnline,
  selectedState,
}) {
  const [rainfall, setRainfall] = useState(
    selectedState?.rainfall || 70
  );
  const [soil, setSoil] = useState(
    selectedState?.soil || 20
  );
  const [slope, setSlope] = useState(
    selectedState?.slope || 70
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function calculate() {
    const localRisk = Math.min(
      99,
      Math.round(
        rainfall * 0.35 +
          soil * 1.1 +
          slope * 0.45
      )
    );

    if (!isOnline) {
      setResult(localRisk);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/predict-risk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rainfall,
            soilMoisture: soil,
            slopeAngle: slope,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(
          Number(
            data.riskScore ??
              data.risk ??
              localRisk
          )
        );
      } else {
        setResult(localRisk);
      }
    } catch {
      setResult(localRisk);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            PREDICTIVE SIGNAL
          </span>
          <div className="page-title">
            🧮 Risk Calculator
          </div>
          <p>
            Estimate landslide risk using
            environmental indicators.
          </p>
        </div>
      </div>

      <div className="calculator-layout">
        <section className="panel calculator-card">
          <div className="panel-head">
            <div>
              <h2>Environmental Inputs</h2>
              <small>
                Adjust the monitoring values.
              </small>
            </div>
          </div>

          <RangeInput
            label="Rainfall"
            value={rainfall}
            setValue={setRainfall}
            max={100}
            unit="%"
          />

          <RangeInput
            label="Soil Moisture"
            value={soil}
            setValue={setSoil}
            max={100}
            unit="%"
          />

          <RangeInput
            label="Slope Angle"
            value={slope}
            setValue={setSlope}
            max={90}
            unit="°"
          />

          <button
            className="primary-btn full-btn"
            onClick={calculate}
          >
            {loading
              ? "Analysing..."
              : "✨ Calculate Risk"}
          </button>
        </section>

        <section className="risk-result-card">
          <span className="eyebrow">
            AI RISK RESULT
          </span>

          {result == null ? (
            <div className="result-empty">
              <div>🧠</div>
              <h2>
                Ready to analyse
              </h2>
              <p>
                Enter environmental values and
                calculate risk.
              </p>
            </div>
          ) : (
            <div className="result-content">
              <div
                className={`result-orb ${riskClass(
                  result
                )}`}
              >
                <strong>{result}</strong>
                <span>/100</span>
              </div>

              <h2>
                {riskLabel(result)} Risk
              </h2>

              <p>
                The calculated monitoring score
                is {result}/100 based on the
                supplied environmental signals.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RangeInput({
  label,
  value,
  setValue,
  max,
  unit,
}) {
  return (
    <div className="range-input">
      <div>
        <strong>{label}</strong>
        <b>
          {value}
          {unit}
        </b>
      </div>

      <input
        type="range"
        min="0"
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
   RESCUE DASHBOARD
   ========================================================= */

function RescueDashboard({
  incidents,
  sosAlerts,
  updateSOSStatus,
  setIncidents,
}) {
  const activeIncidents = incidents.filter(
    (i) => i.status !== "resolved"
  );

  const activeSOS = sosAlerts.filter(
    (s) =>
      s.status !== "resolved" &&
      s.status !== "queued-offline"
  );

  function updateIncident(id, status) {
    setIncidents((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status }
          : item
      )
    );
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            EMERGENCY OPERATIONS
          </span>
          <div className="page-title">
            🚑 Rescue Dashboard
          </div>
          <p>
            Monitor emergency alerts and rescue
            response.
          </p>
        </div>

        <span className="status-pill good">
          ● RESCUE SYSTEM ACTIVE
        </span>
      </div>

      <div className="rescue-stats">
        <EmergencyStat
          label="ACTIVE INCIDENTS"
          value={activeIncidents.length}
          detail="Requires response"
        />

        <EmergencyStat
          label="ACTIVE SOS"
          value={activeSOS.length}
          detail="Citizen emergencies"
        />

        <EmergencyStat
          label="TEAMS"
          value="06"
          detail="Response teams"
        />

        <EmergencyStat
          label="DISPATCH"
          value="READY"
          detail="Coordination active"
        />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>SOS Queue</h2>
              <small>
                Emergency requests
              </small>
            </div>
          </div>

          {sosAlerts.length === 0 ? (
            <div className="empty-state">
              No emergency SOS currently.
            </div>
          ) : (
            <div className="operation-list">
              {sosAlerts.map((sos) => (
                <div
                  className="operation-item"
                  key={sos.id}
                >
                  <div className="operation-icon">
                    🆘
                  </div>

                  <div>
                    <strong>
                      {sos.id}
                    </strong>
                    <small>
                      {sos.locationName ||
                        "GPS location"}
                    </small>
                    <small>
                      {sos.reportedBy}
                    </small>
                  </div>

                  <div className="operation-actions">
                    <span
                      className={`status-tag ${riskClass(
                        sos.status ===
                          "resolved"
                          ? 20
                          : 90
                      )}`}
                    >
                      {sos.status}
                    </span>

                    {sos.status !==
                      "resolved" && (
                      <button
                        className="small-btn"
                        onClick={() =>
                          updateSOSStatus(
                            sos.id,
                            "responding"
                          )
                        }
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Incidents</h2>
              <small>
                Current rescue operations
              </small>
            </div>
          </div>

          <div className="operation-list">
            {incidents.map((incident) => (
              <div
                className="operation-item"
                key={incident.id}
              >
                <div className="operation-icon">
                  🚨
                </div>

                <div>
                  <strong>
                    {incident.type}
                  </strong>
                  <small>
                    {incident.location}
                  </small>
                  <small>
                    {incident.assignedTo}
                  </small>
                </div>

                <div className="operation-actions">
                  <span className="status-tag">
                    {incident.status}
                  </span>

                  {incident.status !==
                    "resolved" && (
                    <button
                      className="small-btn"
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
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   INCIDENTS
   ========================================================= */

function IncidentsPage({ incidents }) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            OPERATIONS DATABASE
          </span>
          <div className="page-title">
            🚨 Incidents
          </div>
          <p>
            Landslide warnings and emergency
            incidents.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>TYPE</th>
                <th>LOCATION</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th>ASSIGNED</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.id}</td>
                  <td>{incident.type}</td>
                  <td>{incident.location}</td>
                  <td>
                    <span
                      className={`severity-badge ${riskClass(
                        incident.severity ===
                          "critical"
                          ? 90
                          : 70
                      )}`}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td>{incident.status}</td>
                  <td>
                    {incident.assignedTo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

function AdminDashboard({
  states,
  reports,
  sosAlerts,
  incidents,
  isOnline,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            SYSTEM CONTROL
          </span>
          <div className="page-title">
            🛡️ Admin Dashboard
          </div>
          <p>
            LandGuard AI platform monitoring.
          </p>
        </div>

        <span
          className={`status-pill ${
            isOnline ? "good" : "warning"
          }`}
        >
          SYSTEM{" "}
          {isOnline
            ? "HEALTHY"
            : "OFFLINE"}
        </span>
      </div>

      <div className="admin-grid">
        <AdminMetric
          icon="👥"
          label="USERS"
          value="1,248"
        />

        <AdminMetric
          icon="🗺️"
          label="STATES"
          value={states.length}
        />

        <AdminMetric
          icon="📷"
          label="REPORTS"
          value={reports.length}
        />

        <AdminMetric
          icon="🆘"
          label="SOS"
          value={sosAlerts.length}
        />

        <AdminMetric
          icon="🚨"
          label="INCIDENTS"
          value={incidents.length}
        />

        <AdminMetric
          icon="🟢"
          label="API"
          value={isOnline ? "OK" : "OFF"}
        />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>System Health</h2>
              <small>
                Platform components
              </small>
            </div>
          </div>

          <HealthRow
            label="Frontend"
            status="Operational"
          />
          <HealthRow
            label="Backend API"
            status={
              isOnline
                ? "Operational"
                : "Offline"
            }
          />
          <HealthRow
            label="GPS Service"
            status="Browser based"
          />
          <HealthRow
            label="Risk Engine"
            status="Operational"
          />
          <HealthRow
            label="NER Monitoring"
            status="8/8 states"
          />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Platform Modules</h2>
              <small>
                Current capabilities
              </small>
            </div>
          </div>

          <div className="module-list">
            <span>✓ India Risk Map</span>
            <span>✓ Live GPS</span>
            <span>✓ Weather</span>
            <span>✓ Citizen Reports</span>
            <span>✓ SOS</span>
            <span>✓ Offline Queue</span>
            <span>✓ AI Agent</span>
            <span>✓ Rescue Operations</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminMetric({
  icon,
  label,
  value,
}) {
  return (
    <div className="admin-metric">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function HealthRow({ label, status }) {
  return (
    <div className="health-row">
      <span>
        <i></i>
        {label}
      </span>
      <strong>{status}</strong>
    </div>
  );
}

/* =========================================================
   AI AGENT
   ========================================================= */

function AIAgentPage({
  states,
  selectedState,
  weather,
}) {
  const [question, setQuestion] =
    useState("");
  const [answer, setAnswer] =
    useState(
      "Hello! I am LandGuard AI. Ask me about landslide risk, weather, SOS, or the 8 Northeast states."
    );

  function ask() {
    const q = question.toLowerCase();

    if (
      q.includes("highest") ||
      q.includes("risk")
    ) {
      const high = [...states].sort(
        (a, b) => b.risk - a.risk
      )[0];

      setAnswer(
        `Current demonstration monitoring data shows ${high.name} with a risk score of ${high.risk}/100.`
      );
    } else if (
      q.includes("weather")
    ) {
      setAnswer(
        weather
          ? `Your current weather signal is ${Math.round(
              weather.temperature_2m || 0
            )}°C, ${weatherDescription(
              weather.weather_code
            )}, humidity ${
              weather.relative_humidity_2m ??
              "--"
            }%.`
          : "Live weather is not available yet. Allow GPS location."
      );
    } else if (
      q.includes("sos")
    ) {
      setAnswer(
        "Use the red SOS button at the top. If internet is unavailable, LandGuard stores the emergency locally and queues it for synchronization."
      );
    } else {
      setAnswer(
        `For ${selectedState?.name}, the current demonstration risk score is ${selectedState?.risk}/100. Monitoring considers rainfall, soil moisture and slope signals.`
      );
    }

    setQuestion("");
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            LANDGUARD INTELLIGENCE
          </span>
          <div className="page-title">
            🤖 AI Agent
          </div>
          <p>
            Ask questions about risk monitoring
            and emergency response.
          </p>
        </div>
      </div>

      <div className="ai-agent-layout">
        <section className="ai-chat">
          <div className="ai-chat-header">
            <div className="ai-avatar">
              ✨
            </div>

            <div>
              <strong>
                LandGuard AI
              </strong>
              <small>
                Risk Intelligence Agent
              </small>
            </div>

            <span className="status-pill good">
              ONLINE
            </span>
          </div>

          <div className="ai-message">
            <div className="ai-message-icon">
              ✨
            </div>

            <p>{answer}</p>
          </div>

          <div className="ai-suggestions">
            <button
              onClick={() =>
                setQuestion(
                  "Which state has highest risk?"
                )
              }
            >
              Highest risk state?
            </button>

            <button
              onClick={() =>
                setQuestion(
                  "What is current weather?"
                )
              }
            >
              Current weather?
            </button>

            <button
              onClick={() =>
                setQuestion(
                  "How does SOS work?"
                )
              }
            >
              How does SOS work?
            </button>
          </div>

          <div className="ai-input">
            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
              placeholder="Ask LandGuard AI..."
            />

            <button onClick={ask}>
              →
            </button>
          </div>
        </section>

        <section className="panel ai-capabilities">
          <span className="eyebrow">
            CAPABILITIES
          </span>
          <h2>What AI monitors</h2>

          <div className="capability">
            <span>🌧</span>
            <div>
              <strong>
                Rainfall
              </strong>
              <small>
                Detect precipitation signals
              </small>
            </div>
          </div>

          <div className="capability">
            <span>🌱</span>
            <div>
              <strong>
                Soil Moisture
              </strong>
              <small>
                Identify saturation risk
              </small>
            </div>
          </div>

          <div className="capability">
            <span>⛰</span>
            <div>
              <strong>
                Terrain Slope
              </strong>
              <small>
                Monitor unstable terrain
              </small>
            </div>
          </div>

          <div className="capability">
            <span>📍</span>
            <div>
              <strong>
                GPS
              </strong>
              <small>
                Location-aware emergency response
              </small>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AIAgentModal({
  onClose,
  states,
  selectedState,
}) {
  const high = [...states].sort(
    (a, b) => b.risk - a.risk
  )[0];

  return (
    <div className="modal-backdrop">
      <div className="modal-card ai-modal">
        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="ai-avatar large">
          ✨
        </div>

        <span className="eyebrow">
          LANDGUARD AI
        </span>

        <h2>
          Monitoring intelligence ready.
        </h2>

        <p>
          Current selected state:{" "}
          <strong>
            {selectedState?.name}
          </strong>
        </p>

        <div className="ai-modal-insight">
          <strong>
            Current high-risk signal
          </strong>
          <span>
            {high.name} • {high.risk}/100
          </span>
        </div>

        <button
          className="primary-btn full-btn"
          onClick={onClose}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function ProfilePage({
  user,
  liveLocation,
  isOnline,
  onLogout,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            ACCOUNT
          </span>
          <div className="page-title">
            👤 Profile
          </div>
          <p>
            Your LandGuard account and device
            status.
          </p>
        </div>

        <button
          className="danger-outline-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-avatar">
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2>{user?.name}</h2>
          <p>
            {user?.role || "citizen"}
          </p>

          <div className="profile-badge">
            🛡️ LandGuard Member
          </div>
        </section>

        <section className="panel">
          <div className="profile-info-row">
            <span>Name</span>
            <strong>
              {user?.name || "--"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Mobile</span>
            <strong>
              {user?.mobile || "--"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Dashboard</span>
            <strong>
              {user?.role || "citizen"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Network</span>
            <strong>
              {isOnline
                ? "Online"
                : "Offline"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>GPS</span>
            <strong>
              {liveLocation
                ? "Live"
                : "Unavailable"}
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT MODAL
   ========================================================= */

function ReportModal({
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [severity, setSeverity] =
    useState("Moderate");
  const [photo, setPhoto] =
    useState("");

  function handlePhoto(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function submit(e) {
    e.preventDefault();

    if (!title || !description) {
      return;
    }

    onCreate({
      title,
      description,
      severity,
      photo,
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <span className="eyebrow">
          CITIZEN REPORT
        </span>

        <h2>
          Create Hazard Report
        </h2>

        <p>
          Add details and a photo if available.
        </p>

        <form onSubmit={submit}>
          <label>
            Hazard Title
            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Example: Road cracks"
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe what you observed..."
              rows="4"
            />
          </label>

          <label>
            Severity
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

          <label>
            Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
            />
          </label>

          {photo && (
            <img
              className="photo-preview"
              src={photo}
              alt="Preview"
            />
          )}

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
              📷 Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SOS MODAL
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
        <div className="danger-ring">
          🆘
        </div>

        <span className="eyebrow danger-text">
          EMERGENCY ALERT
        </span>

        <h2>Send SOS?</h2>

        <p>
          This creates an emergency alert
          using your available GPS location.
        </p>

        <div className="sos-location-box">
          <div className="sos-location-head">
            <strong>
              📍 Location
            </strong>

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
                <small>
                  Latitude
                </small>
                <strong>
                  {liveLocation.latitude.toFixed(
                    6
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Longitude
                </small>
                <strong>
                  {liveLocation.longitude.toFixed(
                    6
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Accuracy
                </small>
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
              GPS is unavailable. The SOS can
              still be saved locally.
            </p>
          )}
        </div>

        {liveWeather && (
          <div className="sos-weather">
            <span>🌦</span>

            <div>
              <strong>
                {Math.round(
                  liveWeather.temperature_2m ||
                    0
                )}
                °C •{" "}
                {weatherDescription(
                  liveWeather.weather_code
                )}
              </strong>

              <small>
                Humidity{" "}
                {liveWeather.relative_humidity_2m ??
                  "--"}
                % • Rain{" "}
                {liveWeather.rain ?? 0} mm
              </small>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="sos-offline">
            📴{" "}
            <strong>
              Offline SOS:
            </strong>{" "}
            This alert will be stored on the
            device and synchronized when the
            internet returns.
          </div>
        )}

        <label className="confirm-check">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) =>
              setConfirmed(
                e.target.checked
              )
            }
          />

          <span>
            I confirm that this is an
            emergency.
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