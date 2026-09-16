import React, { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

/* =========================================================
   LANDGUARD AI
   COMPLETE SMART INDIA HACKATHON DEMO
   ========================================================= */

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

const INITIAL_INCIDENTS = [
  {
    id: "INC-1001",
    location: "Tawang, Arunachal Pradesh",
    state: "Arunachal Pradesh",
    severity: "high",
    type: "Slope instability",
    status: "responding",
    assignedTo: "Team Alpha",
    reportedBy: "Sensor Network",
    time: "12 min ago",
  },
  {
    id: "INC-1002",
    location: "Aizawl, Mizoram",
    state: "Mizoram",
    severity: "critical",
    type: "Heavy rainfall",
    status: "dispatched",
    assignedTo: "Team Bravo",
    reportedBy: "Citizen Report",
    time: "28 min ago",
  },
  {
    id: "INC-1003",
    location: "Gangtok, Sikkim",
    state: "Sikkim",
    severity: "critical",
    type: "Landslide warning",
    status: "dispatched",
    assignedTo: "Unassigned",
    reportedBy: "AI Detection",
    time: "41 min ago",
  },
];

const INITIAL_REPORTS = [
  {
    id: "REP-1001",
    title: "Crack near hillside road",
    description:
      "Large cracks observed close to the roadside slope.",
    severity: "high",
    status: "reviewing",
    createdAt: new Date().toISOString(),
    photo: null,
    coordinates: null,
  },
];

const INITIAL_SOS = [
  {
    id: "SOS-1001",
    status: "acknowledged",
    reportedBy: "Demo Citizen",
    coordinates: [25.5788, 91.8933],
    createdAt: new Date().toISOString(),
    accuracy: 20,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function readJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function riskLabel(risk) {
  if (risk >= 85) return "Critical";
  if (risk >= 70) return "High";
  if (risk >= 50) return "Moderate";
  return "Low";
}

function riskClass(risk) {
  if (risk >= 85) return "critical";
  if (risk >= 70) return "high";
  if (risk >= 50) return "moderate";
  return "low";
}

function severityClass(value) {
  return value?.toLowerCase() || "medium";
}

function weatherDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };

  return map[code] || "Unknown";
}

function createLiveLocationIcon() {
  return L.divIcon({
    className: "live-location-marker",
    html: `
      <div class="live-location-dot">
        <span></span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function createRescueIcon() {
  return L.divIcon({
    className: "rescue-map-marker",
    html: `<div>🚑</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/* =========================================================
   IMAGE COMPRESSION
   ========================================================= */

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

        resolve(
          canvas.toDataURL("image/jpeg", quality)
        );
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   MAP CONTROLLER
   ========================================================= */

function MapController({ liveLocation, locateSignal }) {
  const map = useMap();

  useEffect(() => {
    if (!liveLocation || locateSignal === 0) return;

    map.flyTo(
      [
        liveLocation.latitude,
        liveLocation.longitude,
      ],
      14,
      {
        animate: true,
        duration: 1.2,
      }
    );
  }, [liveLocation, locateSignal, map]);

  return null;
}

/* =========================================================
   LOGIN
   ========================================================= */

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("citizen");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    "citizen@landguard.ai"
  );
  const [password, setPassword] = useState("123456");

  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name || !email || !password) {
        setError("Please fill all fields.");
        return;
      }

      const user = {
        name,
        email,
        password,
        role,
      };

      localStorage.setItem(
        "landguard-user",
        JSON.stringify(user)
      );

      onLogin(user);
      return;
    }

    const found = USERS.find(
      (u) =>
        u.email === email &&
        u.password === password &&
        u.role === role
    );

    if (!found) {
      setError(
        "Invalid login. Use one of the demo accounts below."
      );
      return;
    }

    localStorage.setItem(
      "landguard-user",
      JSON.stringify(found)
    );

    onLogin(found);
  }

  return (
    <div className="login-screen">
      <div className="login-glow glow-one"></div>
      <div className="login-glow glow-two"></div>

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mini">L</div>

          <div>
            <strong>LandGuard AI</strong>
            <small>EARLY WARNING SYSTEM</small>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">
            🇮🇳 SMART INDIA HACKATHON
          </span>

          <h1>
            Protecting communities
            <span> before disaster strikes.</span>
          </h1>

          <p>
            AI-powered landslide risk monitoring,
            live location intelligence and emergency
            response.
          </p>
        </div>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={
              mode === "register" ? "active" : ""
            }
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <div className="role-selector">
          {["citizen", "rescue", "admin"].map(
            (item) => (
              <button
                type="button"
                key={item}
                className={`role-option ${
                  role === item ? "selected" : ""
                }`}
                onClick={() => setRole(item)}
              >
                <span>
                  {item === "citizen"
                    ? "👤"
                    : item === "rescue"
                    ? "🚑"
                    : "🛡️"}
                </span>

                {item}
              </button>
            )
          )}
        </div>

        <form
          className="login-form"
          onSubmit={submit}
        >
          {mode === "register" && (
            <>
              <label>Full Name</label>
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />
            </>
          )}

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter email"
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
          />

          {error && (
            <div className="form-error">
              ⚠ {error}
            </div>
          )}

          <button className="login-btn">
            {mode === "login"
              ? "Enter LandGuard AI →"
              : "Create Account →"}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo Login</strong>

          <span>
            Citizen:
            citizen@landguard.ai / 123456
          </span>

          <span>
            Rescue:
            rescue@landguard.ai / 123456
          </span>

          <span>
            Admin:
            admin@landguard.ai / 123456
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
  user,
  page,
  setPage,
  logout,
}) {
  const citizen = [
    ["dashboard", "⌂", "Dashboard"],
    ["map", "◉", "India Risk Map"],
    ["weather", "☁", "Live Weather"],
    ["analytics", "◫", "Risk Analytics"],
    ["calculator", "⌁", "Risk Calculator"],
    ["reports", "▣", "Hazard Reports"],
  ];

  const rescue = [
    ["rescue", "🚑", "Rescue Dashboard"],
    ["incidents", "⚠", "Incidents"],
    ["sos", "🆘", "SOS Alerts"],
    ["map", "◉", "India Risk Map"],
  ];

  const admin = [
    ["admin", "⌂", "Admin Dashboard"],
    ["monitor", "◉", "Monitor Reports"],
    ["incidents", "⚠", "Incidents"],
    ["users", "♙", "Users"],
    ["map", "◉", "India Risk Map"],
  ];

  const nav =
    user.role === "citizen"
      ? citizen
      : user.role === "rescue"
      ? rescue
      : admin;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mini">L</div>

        <div>
          <strong>LandGuard</strong>
          <small>AI MONITORING</small>
        </div>
      </div>

      <div className="role-badge">
        ● {user.role.toUpperCase()} MODE
      </div>

      <nav className="side-nav">
        {nav.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-btn ${
              page === id ? "active" : ""
            }`}
            onClick={() => setPage(id)}
          >
            <span>{icon}</span>
            <label>{label}</label>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          ↪ Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOPBAR
   ========================================================= */

function Topbar({
  user,
  isOnline,
  liveLocation,
  locationPermission,
  onSOS,
}) {
  return (
    <header className="topbar">
      <div className="top-status">
        <span
          className={`status-dot ${
            isOnline ? "online" : "offline"
          }`}
        />

        <span>
          {isOnline
            ? "System Online"
            : "Offline Mode"}
        </span>

        <span className="top-muted">
          • AI Monitoring Active
        </span>
      </div>

      <div className="top-actions">
        <div className="location-top">
          <span
            className={`location-pulse ${
              locationPermission === "granted"
                ? "active"
                : ""
            }`}
          />

          <div>
            <strong>
              {locationPermission === "granted"
                ? "GPS Active"
                : "GPS Waiting"}
            </strong>

            <small>
              {liveLocation
                ? `${liveLocation.latitude.toFixed(
                    4
                  )}, ${liveLocation.longitude.toFixed(
                    4
                  )}`
                : "Allow location"}
            </small>
          </div>
        </div>

        {user.role === "citizen" && (
          <button
            className="sos-btn"
            onClick={onSOS}
          >
            🆘 SOS
          </button>
        )}

        <div className="profile-chip">
          <div className="avatar small">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   RISK ORB
   ========================================================= */

function RiskOrb({ risk }) {
  return (
    <div className={`risk-orb ${riskClass(risk)}`}>
      <div className="orb-ring"></div>

      <div className="orb-content">
        <small>AI RISK SCORE</small>
        <strong>{risk}%</strong>
        <span>{riskLabel(risk)} Risk</span>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  setPage,
  selectedState,
  setSelectedState,
  liveLocation,
  liveWeather,
}) {
  const averageRisk = Math.round(
    STATES.reduce(
      (sum, state) => sum + state.risk,
      0
    ) / STATES.length
  );

  const highest = [...STATES].sort(
    (a, b) => b.risk - a.risk
  )[0];

  return (
    <div className="page">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">
            AI-POWERED LANDSLIDE MONITORING
          </span>

          <h1>
            Early warning.
            <br />
            <span>Faster rescue.</span>
          </h1>

          <p>
            Monitor rainfall, soil moisture, slope
            conditions and landslide risk across
            Northeast India in one intelligent
            platform.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => setPage("map")}
            >
              Open India Map →
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                setPage("calculator")
              }
            >
              Calculate Risk
            </button>
          </div>
        </div>

        <RiskOrb risk={averageRisk} />
      </section>

      <div className="section-head">
        <div>
          <h2>Live Situation</h2>
          <p>
            Real-time monitoring overview
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <small>HIGH / CRITICAL STATES</small>
          <strong>
            {
              STATES.filter(
                (s) => s.risk >= 70
              ).length
            }
          </strong>
          <span>Requires attention</span>
        </div>

        <div className="metric">
          <small>HIGHEST RISK</small>
          <strong>{highest.risk}%</strong>
          <span>{highest.name}</span>
        </div>

        <div className="metric">
          <small>GPS STATUS</small>
          <strong>
            {liveLocation ? "ON" : "WAIT"}
          </strong>
          <span>
            {liveLocation
              ? "Live location detected"
              : "Permission required"}
          </span>
        </div>

        <div className="metric">
          <small>LIVE TEMPERATURE</small>
          <strong>
            {liveWeather
              ? `${Math.round(
                  liveWeather.temperature_2m
                )}°`
              : "--"}
          </strong>
          <span>
            {liveWeather
              ? weatherDescription(
                  liveWeather.weather_code
                )
              : "GPS required"}
          </span>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Risk by State</h2>
              <small>
                Northeast India
              </small>
            </div>

            <button
              className="text-btn"
              onClick={() => setPage("map")}
            >
              View map →
            </button>
          </div>

          <div className="state-grid">
            {STATES.map((state) => (
              <button
                key={state.id}
                className={`state-card ${
                  selectedState.id === state.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedState(state)
                }
              >
                <div className="state-name">
                  {state.name}
                </div>

                <span
                  className={`pill ${riskClass(
                    state.risk
                  )}`}
                >
                  {riskLabel(state.risk)}
                </span>

                <div className="state-risk">
                  <strong>
                    {state.risk}%
                  </strong>

                  <div className="progress">
                    <span
                      style={{
                        width: `${state.risk}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>AI Signal</h2>
              <small>
                {selectedState.name}
              </small>
            </div>
          </div>

          <div className="signal-list">
            <div>
              <span>🌧 Rainfall</span>
              <strong>
                {selectedState.rainfall}%
              </strong>
            </div>

            <div>
              <span>💧 Soil moisture</span>
              <strong>
                {selectedState.soil}%
              </strong>
            </div>

            <div>
              <span>⛰ Slope angle</span>
              <strong>
                {selectedState.slope}°
              </strong>
            </div>

            <div>
              <span>⚠ Risk probability</span>
              <strong>
                {selectedState.risk}%
              </strong>
            </div>
          </div>

          <div className="ai-insight">
            <span>🤖 AI Insight</span>
            <p>
              Current environmental indicators
              suggest{" "}
              <strong>
                {riskLabel(
                  selectedState.risk
                ).toLowerCase()}
              </strong>{" "}
              landslide risk in this region.
              Continue monitoring rainfall and
              slope conditions.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   INDIA RISK MAP
   ========================================================= */

function IndiaRiskMap({
  liveLocation,
  locateSignal,
  setLocateSignal,
  setPage,
}) {
  const INDIA_CENTER = [22.5, 80.5];

  const rescueLocations = [
    [26.1445, 91.7362],
    [25.5788, 91.8933],
    [27.3389, 88.6065],
  ];

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            🇮🇳 NATIONAL MONITORING
          </span>

          <h1 className="page-title">
            India Risk Map
          </h1>

          <p>
            Full India map with Northeast
            landslide risk zones and your live
            GPS location.
          </p>
        </div>

        <button
          className="locate-me-btn"
          onClick={() => {
            if (!liveLocation) {
              alert(
                "GPS location is not available. Please allow location permission."
              );
              return;
            }

            setLocateSignal(
              (value) => value + 1
            );
          }}
        >
          📍 Locate Me
        </button>
      </div>

      <div className="map-panel">
        <div className="map-header">
          <div>
            <h2>Live India Monitoring</h2>
            <p>
              Green = low • Yellow = moderate •
              Orange = high • Red = critical
            </p>
          </div>

          <div className="map-live-badge">
            {liveLocation
              ? "● GPS ACTIVE"
              : "○ GPS WAITING"}
          </div>
        </div>

        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          scrollWheelZoom={true}
          className="big-map"
        >
          <MapController
            liveLocation={liveLocation}
            locateSignal={locateSignal}
          />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {STATES.map((state) => (
            <CircleMarker
              key={state.id}
              center={[
                state.lat,
                state.lng,
              ]}
              radius={
                state.risk >= 85
                  ? 15
                  : state.risk >= 70
                  ? 13
                  : 10
              }
              pathOptions={{
                color:
                  state.risk >= 85
                    ? "#ff416c"
                    : state.risk >= 70
                    ? "#ff9f43"
                    : state.risk >= 50
                    ? "#ffd166"
                    : "#35e88b",
                fillColor:
                  state.risk >= 85
                    ? "#ff416c"
                    : state.risk >= 70
                    ? "#ff9f43"
                    : state.risk >= 50
                    ? "#ffd166"
                    : "#35e88b",
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{state.name}</strong>

                  <span>
                    Capital: {state.capital}
                  </span>

                  <span>
                    Risk: {state.risk}%
                  </span>

                  <span>
                    Status:{" "}
                    {riskLabel(state.risk)}
                  </span>

                  <hr />

                  <span>
                    Rainfall:{" "}
                    {state.rainfall}%
                  </span>

                  <span>
                    Soil moisture:{" "}
                    {state.soil}%
                  </span>

                  <span>
                    Slope: {state.slope}°
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {rescueLocations.map(
            ([lat, lng], index) => (
              <Marker
                key={index}
                position={[lat, lng]}
                icon={createRescueIcon()}
              >
                <Popup>
                  🚑 <strong>Rescue Unit</strong>
                  <br />
                  Emergency response unit available
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
                    📍 You are here
                  </strong>

                  <span>
                    Live GPS location
                  </span>

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
                      liveLocation.accuracy ||
                        0
                    )}{" "}
                    m
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="map-bottom">
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
              <i className="legend-dot live"></i>
              You
            </span>
          </div>

          <button
            className="secondary-btn"
            onClick={() => setPage("sos")}
          >
            🆘 Emergency Safe Route
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LIVE WEATHER
   ========================================================= */

function WeatherPage({
  liveLocation,
  liveWeather,
  weatherLoading,
  weatherError,
}) {
  return (
    <div className="page">
      <div className="page-title">
        Live Weather
      </div>

      <p className="page-subtitle">
        Weather conditions detected from your
        current GPS location.
      </p>

      {!liveLocation && (
        <div className="warning-box">
          📍 Allow location access to load live
          weather for your location.
        </div>
      )}

      {liveWeather ? (
        <div className="weather-live-card">
          <div className="weather-live-head">
            <div>
              <span className="eyebrow">
                YOUR LOCATION
              </span>

              <h2>
                {weatherDescription(
                  liveWeather.weather_code
                )}
              </h2>

              <p>
                {liveWeather.latitude?.toFixed(
                  4
                )}
                ,{" "}
                {liveWeather.longitude?.toFixed(
                  4
                )}
              </p>
            </div>

            <div className="weather-temperature">
              {Math.round(
                liveWeather.temperature_2m
              )}
              °
            </div>
          </div>

          <div className="weather-grid">
            <div>
              <span>🌡 Temperature</span>
              <strong>
                {liveWeather.temperature_2m}{" "}
                {liveWeather.units
                  ?.temperature_2m || "°C"}
              </strong>
            </div>

            <div>
              <span>💧 Humidity</span>
              <strong>
                {
                  liveWeather.relative_humidity_2m
                }
                %
              </strong>
            </div>

            <div>
              <span>🌧 Rain</span>
              <strong>
                {liveWeather.rain || 0} mm
              </strong>
            </div>

            <div>
              <span>☔ Precipitation</span>
              <strong>
                {liveWeather.precipitation || 0}{" "}
                mm
              </strong>
            </div>

            <div>
              <span>💨 Wind</span>
              <strong>
                {liveWeather.wind_speed_10m}{" "}
                km/h
              </strong>
            </div>

            <div>
              <span>🕒 Updated</span>
              <strong>
                {liveWeather.fetchedAt
                  ? new Date(
                      liveWeather.fetchedAt
                    ).toLocaleTimeString()
                  : "--"}
              </strong>
            </div>
          </div>

          {weatherLoading && (
            <div className="weather-loading">
              Updating weather...
            </div>
          )}

          {weatherError && (
            <div className="weather-error">
              {weatherError}
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div>☁️</div>
          <h3>Waiting for weather data</h3>
          <p>
            Enable GPS location to retrieve live
            weather.
          </p>
        </div>
      )}

      <div className="forecast-grid">
        {STATES.slice(0, 6).map((state) => (
          <div
            className="forecast-card"
            key={state.id}
          >
            <div className="forecast-top">
              <div>
                <strong>{state.name}</strong>
                <small>{state.capital}</small>
              </div>

              <span>🌧</span>
            </div>

            <div className="forecast-temp">
              {22 + (state.rainfall % 10)}°
            </div>

            <p>
              Rainfall indicator{" "}
              {state.rainfall}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS
   ========================================================= */

function Analytics() {
  const sorted = [...STATES].sort(
    (a, b) => b.risk - a.risk
  );

  return (
    <div className="page">
      <div className="page-title">
        Risk Analytics
      </div>

      <p className="page-subtitle">
        AI indicators used for landslide risk
        assessment.
      </p>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>State Risk Ranking</h2>
              <small>
                Higher score indicates higher
                modeled risk.
              </small>
            </div>
          </div>

          <div className="ranking">
            {sorted.map((state, index) => (
              <div
                className="rank-row"
                key={state.id}
              >
                <div className="rank-number">
                  {index + 1}
                </div>

                <div className="rank-name">
                  <strong>{state.name}</strong>

                  <div className="rank-bar">
                    <span
                      className={riskClass(
                        state.risk
                      )}
                      style={{
                        width: `${state.risk}%`,
                      }}
                    />
                  </div>
                </div>

                <strong className="rank-score">
                  {state.risk}%
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Risk Components</h2>
              <small>
                Environmental indicators
              </small>
            </div>
          </div>

          <div className="analytics-components">
            <div>
              <span>Rainfall</span>
              <strong>73%</strong>
            </div>

            <div>
              <span>Soil moisture</span>
              <strong>19%</strong>
            </div>

            <div>
              <span>Slope instability</span>
              <strong>76%</strong>
            </div>

            <div>
              <span>Historical activity</span>
              <strong>68%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RISK CALCULATOR
   ========================================================= */

function RiskCalculator() {
  const [rainfall, setRainfall] =
    useState(60);

  const [soil, setSoil] = useState(20);

  const [slope, setSlope] = useState(70);

  const risk = Math.min(
    99,
    Math.round(
      rainfall * 0.35 +
        soil * 1.1 +
        slope * 0.45
    )
  );

  return (
    <div className="page">
      <div className="page-title">
        AI Risk Calculator
      </div>

      <p className="page-subtitle">
        Adjust environmental parameters to
        simulate a risk score.
      </p>

      <div className="calculator-grid">
        <div className="panel controls-panel">
          <div className="range-control">
            <label>
              <span>🌧 Rainfall</span>
              <strong>{rainfall}%</strong>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={rainfall}
              onChange={(e) =>
                setRainfall(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="range-control">
            <label>
              <span>💧 Soil moisture</span>
              <strong>{soil}%</strong>
            </label>

            <input
              type="range"
              min="0"
              max="50"
              value={soil}
              onChange={(e) =>
                setSoil(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="range-control">
            <label>
              <span>⛰ Slope angle</span>
              <strong>{slope}°</strong>
            </label>

            <input
              type="range"
              min="0"
              max="90"
              value={slope}
              onChange={(e) =>
                setSlope(
                  Number(e.target.value)
                )
              }
            />
          </div>
        </div>

        <div className="scenario-result">
          <small>SIMULATED RISK</small>

          <div
            className={`calculator-score ${riskClass(
              risk
            )}`}
          >
            {risk}%
          </div>

          <h2>{riskLabel(risk)} Risk</h2>

          <p>
            This is a demonstration calculation
            for the prototype and is not an
            official disaster warning.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT MODAL
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
    useState("medium");

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] =
    useState("");

  const [saving, setSaving] = useState(false);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const compressed =
        await compressImage(file);

      setPhoto(file);
      setPreview(compressed);
    } catch {
      alert("Unable to process image.");
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!title || !description) {
      alert(
        "Please enter title and description."
      );
      return;
    }

    setSaving(true);

    await onSubmit({
      title,
      description,
      severity,
      photo: preview || null,
      coordinates: liveLocation
        ? [
            liveLocation.latitude,
            liveLocation.longitude,
          ]
        : null,
    });

    setSaving(false);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card report-modal">
        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <span className="eyebrow">
          HAZARD REPORT
        </span>

        <h2>Report a hazard</h2>

        <p>
          Help the rescue team understand what is
          happening around you.
        </p>

        <form
          className="report-form"
          onSubmit={submit}
        >
          <label>Report title</label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Example: Roadside slope crack"
          />

          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe the hazard..."
            rows="4"
          />

          <label>Severity</label>

          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
          >
            <option value="low">Low</option>
            <option value="medium">
              Medium
            </option>
            <option value="high">High</option>
            <option value="critical">
              Critical
            </option>
          </select>

          <label>Photo / Camera</label>

          <label className="camera-upload">
            <span>📷</span>

            <strong>
              {photo
                ? "Photo selected"
                : "Take / upload photo"}
            </strong>

            <small>
              On mobile, camera can open directly.
            </small>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
            />
          </label>

          {preview && (
            <div className="photo-preview">
              <img
                src={preview}
                alt="Hazard preview"
              />
            </div>
          )}

          <div className="location-capture">
            <span>📍</span>

            <div>
              <strong>
                Location attached
              </strong>

              <small>
                {liveLocation
                  ? `${liveLocation.latitude.toFixed(
                      5
                    )}, ${liveLocation.longitude.toFixed(
                      5
                    )}`
                  : "GPS unavailable"}
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
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Submit Report →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   REPORTS PAGE
   ========================================================= */

function Reports({
  reports,
  setShowReport,
  isOnline,
}) {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">
            Hazard Reports
          </div>

          <p>
            Submit photos and location-based
            hazard information.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowReport(true)}
        >
          📷 New Report
        </button>
      </div>

      {!isOnline && (
        <div className="offline-banner">
          📴 Offline mode — reports will be saved
          locally.
        </div>
      )}

      <div className="report-list">
        {reports.map((report) => (
          <div
            className="report-row"
            key={report.id}
          >
            <div className="report-photo">
              {report.photo ? (
                <img
                  src={report.photo}
                  alt="Hazard"
                />
              ) : (
                <span>📷</span>
              )}
            </div>

            <div className="report-content">
              <div className="report-title-line">
                <h3>{report.title}</h3>

                <span
                  className={`pill ${severityClass(
                    report.severity
                  )}`}
                >
                  {report.severity}
                </span>
              </div>

              <p>
                {report.description}
              </p>

              <small>
                {report.coordinates
                  ? `📍 ${report.coordinates[0].toFixed(
                      4
                    )}, ${report.coordinates[1].toFixed(
                      4
                    )}`
                  : "📍 Location not attached"}

                {" • "}

                {report.synced
                  ? "✓ Synced"
                  : "◌ Pending sync"}
              </small>
            </div>
          </div>
        ))}
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
                {
                  liveWeather.relative_humidity_2m
                }
                % • Rain{" "}
                {liveWeather.rain || 0} mm
              </small>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="sos-offline">
            📴 <strong>Offline SOS:</strong> The
            alert will be stored on this device
            and marked for synchronization when
            the internet connection returns.
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
   SOS PAGE
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

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
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
            {liveLocation ? "LOCKED" : "WAIT"}
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
            {isOnline ? "ONLINE" : "OFFLINE"}
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
                  className={`sos-card ${
                    sos.status
                  }`}
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
                        ? `${sos.coordinates[0].toFixed(
                            4
                          )}, ${sos.coordinates[1].toFixed(
                            4
                          )}`
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
              <h2>Safe Route</h2>
              <small>
                Emergency route interface
              </small>
            </div>
          </div>

          <div className="route-preview">
            <div className="route-map-fake">
              <div className="route-line"></div>
              <div className="route-start">
                📍
              </div>
              <div className="route-end">
                🏥
              </div>
            </div>
          </div>

          <div className="route-info">
            <strong>
              Nearest Safe Zone
            </strong>

            <p>
              Rescue route can be generated from
              current location when map routing
              services are available.
            </p>
          </div>

          <button
            className="primary-btn full-btn"
            onClick={() => setPage("map")}
          >
            Open Map →
          </button>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   AI AGENT
   ========================================================= */

function AIAgent({ onClose }) {
  const [messages, setMessages] =
    useState([
      {
        from: "ai",
        text:
          "Hello! I am LandGuard AI Agent. Ask me about landslide risk, SOS, weather or safety.",
      },
    ]);

  const [input, setInput] = useState("");

  function answer(question) {
    const q = question.toLowerCase();

    if (
      q.includes("sos") ||
      q.includes("emergency")
    ) {
      return "For an emergency, use the red SOS button. Your GPS coordinates are attached when available. If offline, the alert is saved locally for synchronization.";
    }

    if (
      q.includes("risk") ||
      q.includes("landslide")
    ) {
      return "LandGuard AI combines environmental indicators such as rainfall, soil moisture and slope conditions to demonstrate landslide risk assessment.";
    }

    if (q.includes("weather")) {
      return "The Live Weather page uses your GPS coordinates to retrieve current weather conditions when an internet connection is available.";
    }

    if (q.includes("offline")) {
      return "Offline Mode keeps reports and SOS records on the device. Network-dependent transmission cannot occur until connectivity returns.";
    }

    if (q.includes("location")) {
      return "Allow browser location permission to display your live GPS position on the India Risk Map.";
    }

    return "I can help with risk monitoring, live location, weather, hazard reporting, offline SOS and emergency safety information.";
  }

  function send(text = input) {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text,
      },
      {
        from: "ai",
        text: answer(text),
      },
    ]);

    setInput("");
  }

  return (
    <div className="agent-dock">
      <div className="agent-head">
        <div>
          <div className="ai-pulse">
            ✦
          </div>

          <div>
            <strong>LandGuard AI</strong>
            <small>AI SAFETY AGENT</small>
          </div>
        </div>

        <button onClick={onClose}>×</button>
      </div>

      <div className="agent-suggestions">
        <button
          onClick={() =>
            send("What is my landslide risk?")
          }
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
            send("Show weather information")
          }
        >
          Weather
        </button>
      </div>

      <div className="agent-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`msg ${message.from}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="agent-input">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
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
   RESCUE DASHBOARD
   ========================================================= */

function RescueDashboard({
  incidents,
  setIncidents,
  sosAlerts,
}) {
  const active = incidents.filter(
    (i) => i.status !== "resolved"
  );

  function changeStatus(id, status) {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id
          ? { ...incident, status }
          : incident
      )
    );
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            RESCUE OPERATIONS
          </span>

          <div className="page-title">
            Rescue Dashboard
          </div>

          <p>
            Monitor incidents and emergency
            response requests.
          </p>
        </div>

        <div className="rescue-online">
          ● TEAM ONLINE
        </div>
      </div>

      <div className="rescue-metrics">
        <div className="emergency-card">
          <span>ACTIVE INCIDENTS</span>
          <strong>{active.length}</strong>
          <small>Needs response</small>
        </div>

        <div className="emergency-card">
          <span>ACTIVE SOS</span>
          <strong>
            {
              sosAlerts.filter(
                (s) =>
                  s.status !== "resolved"
              ).length
            }
          </strong>
          <small>Emergency requests</small>
        </div>

        <div className="emergency-card">
          <span>AVAILABLE TEAMS</span>
          <strong>06</strong>
          <small>Ready for deployment</small>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Incident Queue</h2>
            <small>
              Dispatch and response status
            </small>
          </div>
        </div>

        <div className="incident-list">
          {incidents.map((incident) => (
            <div
              className="incident-card"
              key={incident.id}
            >
              <div
                className={`severity-dot ${severityClass(
                  incident.severity
                )}`}
              ></div>

              <div className="incident-info">
                <div className="incident-title">
                  {incident.type}
                </div>

                <strong>
                  {incident.location}
                </strong>

                <p>
                  {incident.reportedBy} •{" "}
                  {incident.time}
                </p>

                <small>
                  Assigned:{" "}
                  {incident.assignedTo}
                </small>
              </div>

              <span
                className={`incident-status ${incident.status}`}
              >
                {incident.status}
              </span>

              <div className="incident-actions">
                {incident.status ===
                  "dispatched" && (
                  <button
                    className="accept-btn"
                    onClick={() =>
                      changeStatus(
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
                    className="status-btn resolved"
                    onClick={() =>
                      changeStatus(
                        incident.id,
                        "resolved"
                      )
                    }
                  >
                    Resolve
                  </button>
                )}

                {incident.status ===
                  "resolved" && (
                  <span className="resolved-text">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   INCIDENTS
   ========================================================= */

function Incidents({ incidents }) {
  return (
    <div className="page">
      <div className="page-title">
        Rescue Incidents
      </div>

      <p className="page-subtitle">
        Incident tracking and response status.
      </p>

      <div className="incident-table">
        <div className="table-header">
          <span>ID</span>
          <span>Location</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Assigned</span>
        </div>

        {incidents.map((incident) => (
          <div
            className="table-row"
            key={incident.id}
          >
            <strong>{incident.id}</strong>

            <span>{incident.location}</span>

            <span
              className={`pill ${severityClass(
                incident.severity
              )}`}
            >
              {incident.severity}
            </span>

            <span>
              {incident.status}
            </span>

            <span>
              {incident.assignedTo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

function AdminDashboard({
  reports,
  incidents,
  sosAlerts,
}) {
  const critical = STATES.filter(
    (s) => s.risk >= 85
  );

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            SYSTEM CONTROL CENTER
          </span>

          <div className="page-title">
            Admin Dashboard
          </div>

          <p>
            National monitoring system overview.
          </p>
        </div>

        <span className="system-status">
          ● ALL SYSTEMS OPERATIONAL
        </span>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <small>TOTAL USERS</small>
          <strong>1,284</strong>
          <span>Registered users</span>
        </div>

        <div className="admin-stat-card">
          <small>HAZARD REPORTS</small>
          <strong>
            {reports.length}
          </strong>
          <span>Submitted reports</span>
        </div>

        <div className="admin-stat-card high">
          <small>ACTIVE INCIDENTS</small>
          <strong>
            {
              incidents.filter(
                (i) =>
                  i.status !== "resolved"
              ).length
            }
          </strong>
          <span>Under response</span>
        </div>

        <div className="admin-stat-card critical">
          <small>ACTIVE SOS</small>
          <strong>
            {
              sosAlerts.filter(
                (s) =>
                  s.status !== "resolved"
              ).length
            }
          </strong>
          <span>Emergency alerts</span>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Critical States</h2>
              <small>
                Current prototype risk values
              </small>
            </div>
          </div>

          <div className="critical-state-list">
            {critical.map((state) => (
              <div
                className="critical-state-row"
                key={state.id}
              >
                <div>
                  <strong>{state.name}</strong>
                  <small>
                    {state.capital}
                  </small>
                </div>

                <span className="critical-score">
                  {state.risk}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>System Health</h2>
              <small>
                Service monitoring
              </small>
            </div>
          </div>

          <div className="system-list">
            <div>
              <span>AI Prediction Engine</span>
              <strong>ONLINE</strong>
            </div>

            <div>
              <span>GPS Monitoring</span>
              <strong>ONLINE</strong>
            </div>

            <div>
              <span>Risk Map</span>
              <strong>ONLINE</strong>
            </div>

            <div>
              <span>Emergency Queue</span>
              <strong>ONLINE</strong>
            </div>

            <div>
              <span>Weather Service</span>
              <strong>ONLINE</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   USERS
   ========================================================= */

function UsersPage() {
  const users = [
    [
      "Citizen User",
      "citizen@landguard.ai",
      "Citizen",
    ],
    [
      "Rescue Officer",
      "rescue@landguard.ai",
      "Rescue",
    ],
    [
      "System Admin",
      "admin@landguard.ai",
      "Admin",
    ],
  ];

  return (
    <div className="page">
      <div className="page-title">
        Users
      </div>

      <p className="page-subtitle">
        LandGuard AI platform accounts.
      </p>

      <div className="user-list">
        {users.map(
          ([name, email, role]) => (
            <div
              className="user-row"
              key={email}
            >
              <div className="avatar">
                {name.charAt(0)}
              </div>

              <div>
                <strong>{name}</strong>
                <small>{email}</small>
              </div>

              <span className="role-text">
                {role}
              </span>

              <span className="user-status">
                Active
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MONITOR REPORTS
   ========================================================= */

function MonitorReports({ reports }) {
  return (
    <div className="page">
      <div className="page-title">
        Monitor Reports
      </div>

      <p className="page-subtitle">
        Citizen hazard submissions.
      </p>

      <div className="report-list">
        {reports.map((report) => (
          <div
            className="report-row"
            key={report.id}
          >
            <div className="report-photo">
              {report.photo ? (
                <img
                  src={report.photo}
                  alt=""
                />
              ) : (
                "📷"
              )}
            </div>

            <div className="report-content">
              <div className="report-title-line">
                <h3>{report.title}</h3>

                <span
                  className={`pill ${severityClass(
                    report.severity
                  )}`}
                >
                  {report.severity}
                </span>
              </div>

              <p>{report.description}</p>

              <small>
                Status: {report.status}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(
    () =>
      readJSON("landguard-user", null)
  );

  const [page, setPage] =
    useState("dashboard");

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

  const [reports, setReports] = useState(
    () =>
      readJSON(
        "landguard-reports",
        INITIAL_REPORTS
      )
  );

  const [incidents, setIncidents] =
    useState(
      () =>
        readJSON(
          "landguard-incidents",
          INITIAL_INCIDENTS
        )
    );

  const [sosAlerts, setSosAlerts] =
    useState(
      () =>
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

  const [toast, setToast] = useState("");

  /* =====================================================
     TOAST
     ===================================================== */

  function notify(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3500);
  }

  /* =====================================================
     ONLINE / OFFLINE
     ===================================================== */

  useEffect(() => {
    function online() {
      setIsOnline(true);
      notify(
        "🟢 Internet restored. Offline queue ready for sync."
      );
    }

    function offline() {
      setIsOnline(false);
      notify(
        "📴 Offline Mode enabled. SOS and reports are saved locally."
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
     GPS
     ===================================================== */

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission(
        "unsupported"
      );

      setLocationError(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setLocationPermission(
      "requesting"
    );

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
          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setLocationPermission(
              "denied"
            );

            setLocationError(
              "Location permission denied."
            );
          } else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            setLocationError(
              "Current location unavailable."
            );
          } else if (
            error.code ===
            error.TIMEOUT
          ) {
            setLocationError(
              "GPS request timed out."
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
  }, []);

  /* =====================================================
     LIVE WEATHER
     ===================================================== */

  const latKey = liveLocation
    ? Number(
        liveLocation.latitude.toFixed(2)
      )
    : null;

  const lngKey = liveLocation
    ? Number(
        liveLocation.longitude.toFixed(2)
      )
    : null;

  useEffect(() => {
    if (
      latKey === null ||
      lngKey === null
    ) {
      return;
    }

    const cached = readJSON(
      "landguard-live-weather",
      null
    );

    const last =
      cached?.fetchedAt
        ? new Date(
            cached.fetchedAt
          ).getTime()
        : 0;

    if (
      Date.now() - last <
      10 * 60 * 1000
    ) {
      setLiveWeather(cached);
      return;
    }

    if (!navigator.onLine) {
      setWeatherError(
        "Offline. Showing last saved weather."
      );
      return;
    }

    const controller =
      new AbortController();

    async function loadWeather() {
      setWeatherLoading(true);

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latKey}&longitude=${lngKey}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m` +
          `&timezone=auto`;

        const response =
          await fetch(url, {
            signal:
              controller.signal,
          });

        if (!response.ok) {
          throw new Error(
            "Weather failed"
          );
        }

        const data =
          await response.json();

        const weather = {
          ...data.current,
          units: data.current_units,
          latitude: latKey,
          longitude: lngKey,
          fetchedAt:
            new Date().toISOString(),
        };

        setLiveWeather(weather);

        writeJSON(
          "landguard-live-weather",
          weather
        );

        setWeatherError("");
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          const saved = readJSON(
            "landguard-live-weather",
            null
          );

          setLiveWeather(saved);

          setWeatherError(
            "Live weather unavailable. Showing saved weather."
          );
        }
      } finally {
        setWeatherLoading(false);
      }
    }

    loadWeather();

    return () =>
      controller.abort();
  }, [latKey, lngKey]);

  /* =====================================================
     SAVE DATA
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
     OFFLINE QUEUE SYNC STATUS
     ===================================================== */

  useEffect(() => {
    if (!isOnline) return;

    setReports((prev) =>
      prev.map((report) =>
        report.synced === false
          ? {
              ...report,
              synced: true,
              status: "submitted",
            }
          : report
      )
    );

    setSosAlerts((prev) =>
      prev.map((sos) =>
        sos.synced === false
          ? {
              ...sos,
              synced: true,
              status: "active",
            }
          : sos
      )
    );
  }, [isOnline]);

  /* =====================================================
     REPORT
     ===================================================== */

  async function createReport(data) {
    const report = {
      id: `REP-${Date.now()}`,
      title: data.title,
      description: data.description,
      severity: data.severity,
      photo: data.photo,
      coordinates:
        data.coordinates,
      createdAt:
        new Date().toISOString(),
      synced: isOnline,
      status: isOnline
        ? "submitted"
        : "pending-offline",
    };

    const saved = writeJSON(
      "landguard-reports",
      [report, ...reports]
    );

    if (!saved && data.photo) {
      notify(
        "⚠ Photo is too large for local storage."
      );
      return;
    }

    setReports((prev) => [
      report,
      ...prev,
    ]);

    setShowReport(false);

    notify(
      isOnline
        ? "✅ Hazard report submitted successfully."
        : "📴 Report saved offline. It will sync when online."
    );
  }

  /* =====================================================
     SOS
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

    setSosAlerts((prev) => [
      sos,
      ...prev,
    ]);

    setIncidents((prev) => [
      incident,
      ...prev,
    ]);

    setShowSOS(false);

    notify(
      isOnline
        ? "🆘 SOS sent. Rescue team has been notified."
        : "📴 SOS saved offline. It will sync when connection returns."
    );
  }

  /* =====================================================
     LOGOUT
     ===================================================== */

  function logout() {
    localStorage.removeItem(
      "landguard-user"
    );

    setUser(null);
    setPage("dashboard");

    notify("Logged out.");
  }

  /* =====================================================
     PAGE
     ===================================================== */

  const pageContent = useMemo(() => {
    if (!user) return null;

    if (
      user.role === "citizen" &&
      page === "dashboard"
    ) {
      return (
        <Dashboard
          setPage={setPage}
          selectedState={
            selectedState
          }
          setSelectedState={
            setSelectedState
          }
          liveLocation={
            liveLocation
          }
          liveWeather={
            liveWeather
          }
        />
      );
    }

    if (page === "map") {
      return (
        <IndiaRiskMap
          liveLocation={
            liveLocation
          }
          locateSignal={
            locateSignal
          }
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
          liveLocation={
            liveLocation
          }
          liveWeather={
            liveWeather
          }
          weatherLoading={
            weatherLoading
          }
          weatherError={
            weatherError
          }
        />
      );
    }

    if (page === "analytics") {
      return <Analytics />;
    }

    if (page === "calculator") {
      return <RiskCalculator />;
    }

    if (page === "reports") {
      return (
        <Reports
          reports={reports}
          setShowReport={
            setShowReport
          }
          isOnline={isOnline}
        />
      );
    }

    if (
      user.role === "rescue" &&
      page === "rescue"
    ) {
      return (
        <RescueDashboard
          incidents={incidents}
          setIncidents={
            setIncidents
          }
          sosAlerts={sosAlerts}
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

    if (page === "sos") {
      return (
        <SOSPage
          sosAlerts={sosAlerts}
          isOnline={isOnline}
          liveLocation={
            liveLocation
          }
          setPage={setPage}
        />
      );
    }

    if (
      user.role === "admin" &&
      page === "admin"
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
      user.role === "admin" &&
      page === "monitor"
    ) {
      return (
        <MonitorReports
          reports={reports}
        />
      );
    }

    if (
      user.role === "admin" &&
      page === "users"
    ) {
      return <UsersPage />;
    }

    return (
      <Dashboard
        setPage={setPage}
        selectedState={
          selectedState
        }
        setSelectedState={
          setSelectedState
        }
        liveLocation={
          liveLocation
        }
        liveWeather={
          liveWeather
        }
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
        onLogin={(newUser) => {
          setUser(newUser);

          setPage(
            newUser.role === "citizen"
              ? "dashboard"
              : newUser.role ===
                "rescue"
              ? "rescue"
              : "admin"
          );
        }}
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
      />

      <main className="main">
        <Topbar
          user={user}
          isOnline={isOnline}
          liveLocation={
            liveLocation
          }
          locationPermission={
            locationPermission
          }
          onSOS={() =>
            setShowSOS(true)
          }
        />

        {!isOnline && (
          <div className="offline-banner global">
            <span>●</span>

            <strong>
              Offline Mode
            </strong>

            <span>
              SOS and reports are saved locally.
              Network transmission will resume
              after reconnection.
            </span>
          </div>
        )}

        <div className="content">
          {locationError && (
            <div className="location-warning">
              📍 {locationError}
            </div>
          )}

          {pageContent}
        </div>
      </main>

      {/* AI AGENT */}

      {!showAI && (
        <button
          className="ai-floating-btn"
          onClick={() =>
            setShowAI(true)
          }
        >
          <span>✦</span>
          AI Agent
        </button>
      )}

      {showAI && (
        <AIAgent
          onClose={() =>
            setShowAI(false)
          }
        />
      )}

      {/* REPORT */}

      {showReport && (
        <ReportModal
          onClose={() =>
            setShowReport(false)
          }
          onSubmit={createReport}
          liveLocation={
            liveLocation
          }
        />
      )}

      {/* SOS */}

      {showSOS && (
        <SOSModal
          onClose={() =>
            setShowSOS(false)
          }
          onSend={sendSOS}
          liveLocation={
            liveLocation
          }
          liveWeather={
            liveWeather
          }
          isOnline={isOnline}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}