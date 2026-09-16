import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

 
const STATES = [
  { id: "arunachal", name: "Arunachal Pradesh", short: "AR", capital: "Itanagar", lat: 27.0844, lng: 93.6053, base: 72, slope: 82, soil: 71 },
  { id: "assam", name: "Assam", short: "AS", capital: "Dispur", lat: 26.1445, lng: 91.7362, base: 64, slope: 42, soil: 76 },
  { id: "manipur", name: "Manipur", short: "MN", capital: "Imphal", lat: 24.817, lng: 93.9368, base: 69, slope: 73, soil: 74 },
  { id: "meghalaya", name: "Meghalaya", short: "ML", capital: "Shillong", lat: 25.5788, lng: 91.8933, base: 81, slope: 78, soil: 84 },
  { id: "mizoram", name: "Mizoram", short: "MZ", capital: "Aizawl", lat: 23.7271, lng: 92.7176, base: 77, slope: 88, soil: 79 },
  { id: "nagaland", name: "Nagaland", short: "NL", capital: "Kohima", lat: 25.6751, lng: 94.1086, base: 74, slope: 81, soil: 76 },
  { id: "sikkim", name: "Sikkim", short: "SK", capital: "Gangtok", lat: 27.3389, lng: 88.6065, base: 86, slope: 93, soil: 82 },
  { id: "tripura", name: "Tripura", short: "TR", capital: "Agartala", lat: 23.8315, lng: 91.2868, base: 58, slope: 49, soil: 67 },
];

const SAFE_ZONES = [
  { name: "Shillong High-Ground Safe Zone", lat: 25.5916, lng: 91.889, type: "shelter" },
  { name: "Dispur Emergency Relief Camp", lat: 26.151, lng: 91.79, type: "camp" },
  { name: "Gangtok High-Ground Safe Zone", lat: 27.325, lng: 88.61, type: "shelter" },
  { name: "Aizawl Community Shelter", lat: 23.73, lng: 92.72, type: "shelter" },
];

const LANGS = {
  en: { label: "English", title: "LandGuard AI", dashboard: "Dashboard", weather: "Weather Intelligence", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Report Hazard", calculator: "Risk Lab", detect: "Detect Live Location", safe: "Find Safe Route", sos: "SOS Emergency", login: "Login", signup: "Create Account", welcome: "Welcome to LandGuard AI", location: "Location", risk: "Risk", today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday", compare: "Comparison", send: "Send Report", signout: "Logout" },
  hi: { label: "हिन्दी", title: "LandGuard AI", dashboard: "डैशबोर्ड", weather: "मौसम जानकारी", map: "जोखिम मानचित्र", analytics: "विश्लेषण", agent: "AI एजेंट", report: "जोखिम रिपोर्ट", calculator: "जोखिम लैब", detect: "लाइव स्थान पता करें", safe: "सुरक्षित मार्ग", sos: "SOS आपातकाल", login: "लॉगिन", signup: "खाता बनाएं", welcome: "LandGuard AI में आपका स्वागत है", location: "स्थान", risk: "जोखिम", today: "आज", tomorrow: "कल", yesterday: "कल का मौसम", compare: "तुलना", send: "रिपोर्ट भेजें", signout: "लॉगआउट" },
  kn: { label: "ಕನ್ನಡ", title: "LandGuard AI", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", weather: "ಹವಾಮಾನ ಮಾಹಿತಿ", map: "ಅಪಾಯ ನಕ್ಷೆ", analytics: "ವಿಶ್ಲೇಷಣೆ", agent: "AI ಏಜೆಂಟ್", report: "ಅಪಾಯ ವರದಿ", calculator: "ರಿಸ್ಕ್ ಲ್ಯಾಬ್", detect: "ಲೈವ್ ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ", safe: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ", sos: "SOS ತುರ್ತು ಸಹಾಯ", login: "ಲಾಗಿನ್", signup: "ಖಾತೆ ತೆರೆಯಿರಿ", welcome: "LandGuard AI ಗೆ ಸ್ವಾಗತ", location: "ಸ್ಥಳ", risk: "ಅಪಾಯ", today: "ಇಂದು", tomorrow: "ನಾಳೆ", yesterday: "ನಿನ್ನೆ", compare: "ಹೋಲಿಕೆ", send: "ವರದಿ ಕಳುಹಿಸಿ", signout: "ಲಾಗ್‌ಔಟ್" },
  as: { label: "অসমীয়া", title: "LandGuard AI", dashboard: "ডেশ্বব’ৰ্ড", weather: "বতৰৰ তথ্য", map: "ঝুঁকি মানচিত্ৰ", analytics: "বিশ্লেষণ", agent: "AI এজেণ্ট", report: "বিপদৰ প্ৰতিবেদন", calculator: "ঝুঁকি লেব", detect: "লাইভ অৱস্থান ধৰা", safe: "নিৰাপদ পথ", sos: "SOS জৰুৰী", login: "লগইন", signup: "একাউণ্ট খোলক", welcome: "LandGuard AI লৈ স্বাগতম", location: "স্থান", risk: "ঝুঁকি", today: "আজি", tomorrow: "কাইলৈ", yesterday: "কালি", compare: "তুলনা", send: "প্ৰতিবেদন পঠিয়াওক", signout: "লগআউট" },
  bn: { label: "বাংলা", title: "LandGuard AI", dashboard: "ড্যাশবোর্ড", weather: "আবহাওয়া তথ্য", map: "ঝুঁকি মানচিত্র", analytics: "বিশ্লেষণ", agent: "AI এজেন্ট", report: "ঝুঁকি রিপোর্ট", calculator: "রিস্ক ল্যাব", detect: "লাইভ অবস্থান শনাক্ত করুন", safe: "নিরাপদ রুট", sos: "SOS জরুরি", login: "লগইন", signup: "অ্যাকাউন্ট তৈরি", welcome: "LandGuard AI-তে স্বাগতম", location: "অবস্থান", risk: "ঝুঁকি", today: "আজ", tomorrow: "আগামীকাল", yesterday: "গতকাল", compare: "তুলনা", send: "রিপোর্ট পাঠান", signout: "লগআউট" },
  ne: { label: "नेपाली", title: "LandGuard AI", dashboard: "ड्यासबोर्ड", weather: "मौसम जानकारी", map: "जोखिम नक्सा", analytics: "विश्लेषण", agent: "AI एजेन्ट", report: "जोखिम रिपोर्ट", calculator: "रिस्क ल्याब", detect: "लाइभ स्थान पत्ता लगाउनुहोस्", safe: "सुरक्षित मार्ग", sos: "SOS आपतकाल", login: "लगइन", signup: "खाता बनाउनुहोस्", welcome: "LandGuard AI मा स्वागत छ", location: "स्थान", risk: "जोखिम", today: "आज", tomorrow: "भोलि", yesterday: "हिजो", compare: "तुलना", send: "रिपोर्ट पठाउनुहोस्", signout: "लगआउट" },
  lus: { label: "Mizo", title: "LandGuard AI", dashboard: "Dashboard", weather: "Kum tih hmanraw", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Thil hlauhawm report", calculator: "Risk Lab", detect: "Live location hmuh rawh", safe: "Hmunhim zawng", sos: "SOS Emergency", login: "Login", signup: "Account siam", welcome: "LandGuard AI ah kan lo lawm", location: "Hmun", risk: "Risk", today: "Vawiin", tomorrow: "Naktuk", yesterday: "Nimin", compare: "Compare", send: "Report thawn", signout: "Logout" },
  kok: { label: "Kokborok", title: "LandGuard AI", dashboard: "Dashboard", weather: "Khura Thang", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Report", calculator: "Risk Lab", detect: "Live Location", safe: "Safe Route", sos: "SOS", login: "Login", signup: "Create Account", welcome: "LandGuard AI-ao swagat", location: "Location", risk: "Risk", today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday", compare: "Compare", send: "Send Report", signout: "Logout" },
  mni: { label: "Manipuri", title: "LandGuard AI", dashboard: "Dashboard", weather: "Weather", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Report", calculator: "Risk Lab", detect: "Live Location", safe: "Safe Route", sos: "SOS", login: "Login", signup: "Create Account", welcome: "LandGuard AI-da yaipha thokpa", location: "Location", risk: "Risk", today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday", compare: "Compare", send: "Send Report", signout: "Logout" },
  nag: { label: "Nagamese", title: "LandGuard AI", dashboard: "Dashboard", weather: "Weather Info", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Hazard Report", calculator: "Risk Lab", detect: "Live Location", safe: "Safe Route", sos: "SOS Emergency", login: "Login", signup: "Create Account", welcome: "Welcome to LandGuard AI", location: "Location", risk: "Risk", today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday", compare: "Compare", send: "Send Report", signout: "Logout" },
  kha: { label: "Khasi", title: "LandGuard AI", dashboard: "Dashboard", weather: "Ka Jingtip ka Lyer", map: "Risk Map", analytics: "Analytics", agent: "AI Agent", report: "Report jingeh", calculator: "Risk Lab", detect: "Pynithuh ia ka jaka", safe: "Lynti kaba shngain", sos: "SOS Emergency", login: "Login", signup: "Create Account", welcome: "Pdiang sngewbha sha LandGuard AI", location: "Jaka", risk: "Risk", today: "Mynta", tomorrow: "Lashai", yesterday: "Mynta mynshwa", compare: "Compare", send: "Send Report", signout: "Logout" },
};

const STATE_LANG = { Assam: "as", Tripura: "bn", Sikkim: "ne", Mizoram: "lus", Nagaland: "nag", Meghalaya: "kha", Manipur: "mni", "Arunachal Pradesh": "hi" };

const icon = (emoji) => L.divIcon({ className: "lg-emoji-marker", html: `<div>${emoji}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });

function riskLevel(score) {
  if (score >= 80) return { label: "CRITICAL", cls: "critical" };
  if (score >= 65) return { label: "HIGH", cls: "high" };
  if (score >= 40) return { label: "MODERATE", cls: "moderate" };
  return { label: "LOW", cls: "low" };
}

function weatherText(code) {
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Rainfall";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow / Ice";
  if ([45, 48].includes(code)) return "Foggy";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  return "Clear / Stable";
}

function calcRisk(base, rain, soil, slope) {
  const r = Math.min(Number(rain || 0) / 30, 1);
  const s = Math.min(Number(soil || 60) / 100, 1);
  const p = Math.min(Number(slope || base.slope || 45) / 90, 1);
  const raw = base * 0.42 + r * 23 + s * 20 + p * 17 - 22;
  return Math.max(8, Math.min(98, Math.round(raw)));
}

function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function ImpactSystemPanel() {
  return (
    <section className="impact-system-panel">

      <div className="impact-header">
        <div>
          <span className="eyebrow">LANDGUARD AI</span>
          <h2>Impact & System Intelligence</h2>
          <p>
            AI-assisted early warning, GIS monitoring,
            emergency coordination and resilient offline safety.
          </p>
        </div>

        <div className="impact-live">
          <span className="live-dot" />
          SYSTEM ONLINE
        </div>
      </div>

      <div className="impact-metrics">

        <div className="impact-card">
          <Map size={22} />
          <strong>8</strong>
          <span>NER States</span>
        </div>

        <div className="impact-card">
          <Languages size={22} />
          <strong>11</strong>
          <span>Supported Languages</span>
        </div>

        <div className="impact-card">
          <CloudRain size={22} />
          <strong>24/7</strong>
          <span>Weather Monitoring</span>
        </div>

        <div className="impact-card">
          <AlertTriangle size={22} />
          <strong>&lt;10s*</strong>
          <span>Prototype Alert Target</span>
        </div>

      </div>

      <div className="system-grid">

        <div className="system-card">
          <Brain size={24} />
          <h3>AI Risk Engine</h3>

          <div className="flow">
            <span>Weather + GPS + Terrain</span>
            <b>↓</b>
            <span>Risk Engine / ML</span>
            <b>↓</b>
            <span>Risk Score 0–100</span>
            <b>↓</b>
            <span>Alert Decision</span>
          </div>

          <small>
            Model validation status: In progress
          </small>
        </div>

        <div className="system-card">
          <Database size={24} />
          <h3>Technology Stack</h3>

          <div className="tech-list">
            <span>React</span>
            <span>Node.js + Express</span>
            <span>Leaflet + OpenStreetMap</span>
            <span>Open-Meteo</span>
            <span>REST / JSON</span>
            <span>Telegram Bot API</span>
            <span>localStorage / IndexedDB</span>
            <span>Random Forest*</span>
          </div>
        </div>

        <div className="system-card">
          <WifiOff size={24} />
          <h3>Failure Handling</h3>

          <div className="failure-list">
            <div>
              <b>GPS unavailable</b>
              <span>Use manual location</span>
            </div>

            <div>
              <b>Weather API unavailable</b>
              <span>Use cached weather</span>
            </div>

            <div>
              <b>ML unavailable</b>
              <span>Fallback risk engine</span>
            </div>

            <div>
              <b>Internet unavailable</b>
              <span>Offline safety mode</span>
            </div>

            <div>
              <b>False positive</b>
              <span>Advisory only</span>
            </div>
          </div>
        </div>

        <div className="system-card">
          <Building2 size={24} />
          <h3>Authority Workflow</h3>

          <div className="authority-flow">
            <span>Citizen Report</span>
            <b>→</b>
            <span>LandGuard AI</span>
            <b>→</b>
            <span>Risk Detection</span>
            <b>→</b>
            <span>District Alert</span>
            <b>→</b>
            <span>Emergency Team</span>
          </div>
        </div>

      </div>

      <div className="impact-note">
        <span>*</span>
        Prototype targets and planned ML components are clearly
        identified and should not be treated as field-validated results.
      </div>

    </section>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => localStorage.getItem("lg_auth") === "1");
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [lang, setLang] = useState(localStorage.getItem("lg_lang") || "en");
  const [selectedState, setSelectedState] = useState(STATES[0]);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [route, setRoute] = useState(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [reports, setReports] = useState(() => JSON.parse(localStorage.getItem("lg_reports") || "[]"));
  const [toast, setToast] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState([
    { from: "ai", text: "Hi! I am LandGuard AI. Ask me about your current risk, tomorrow's forecast, safe routes, SOS, or how to report a hazard." },
  ]);
  const [calc, setCalc] = useState({ rain: 25, soil: 70, slope: 50 });
  const [online, setOnline] = useState(navigator.onLine);

  const t = LANGS[lang] || LANGS.en;
  const risk = useMemo(() => calcRisk(selectedState, weather?.rain, weather?.soil, selectedState.slope), [selectedState, weather]);
  const riskInfo = riskLevel(risk);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    localStorage.setItem("lg_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (location) loadWeather(location.lat, location.lng);
  }, [location]);

  const toastMsg = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__lg_toast);
    window.__lg_toast = window.setTimeout(() => setToast(""), 3200);
  };

  const doLogin = (e) => {
    e.preventDefault();
    if (authMode === "signup" && !loginForm.name.trim()) return toastMsg("Please enter your name.");
    if (!loginForm.email.trim() || !loginForm.password.trim()) return toastMsg("Please enter email and password.");
    localStorage.setItem("lg_auth", "1");
    localStorage.setItem("lg_user", JSON.stringify({ name: loginForm.name || loginForm.email.split("@")[0], email: loginForm.email }));
    setAuth(true);
    setWelcome(true);
    setTimeout(() => setWelcome(false), 1800);
  };

  const demoLogin = () => {
    setLoginForm({ name: "Demo Responder", email: "demo@landguard.ai", password: "demo123" });
    localStorage.setItem("lg_auth", "1");
    localStorage.setItem("lg_user", JSON.stringify({ name: "Demo Responder", email: "demo@landguard.ai" }));
    setAuth(true);
    setWelcome(true);
    setTimeout(() => setWelcome(false), 1800);
  };

  const doLogout = () => {
    localStorage.removeItem("lg_auth");
    setAuth(false);
    setAgentOpen(false);
    toastMsg("Logged out safely.");
  };

  const loadWeather = async (lat, lng) => {
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_moisture_0_to_1cm&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m,relative_humidity_2m,soil_moisture_0_to_1cm&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&past_days=1&forecast_days=2&timezone=auto`;
      const res = await fetch(u);
      if (!res.ok) throw new Error("weather");
      const d = await res.json();
      setWeather({ temp: d.current?.temperature_2m ?? 25, humidity: d.current?.relative_humidity_2m ?? 70, rain: d.current?.precipitation ?? 0, wind: d.current?.wind_speed_10m ?? 10, code: d.current?.weather_code ?? 1, soil: (d.current?.soil_moisture_0_to_1cm ?? 0.55) * 100 });
      setForecast({ dates: d.daily?.time || [], code: d.daily?.weather_code || [], max: d.daily?.temperature_2m_max || [], min: d.daily?.temperature_2m_min || [], rain: d.daily?.precipitation_sum || [], wind: d.daily?.wind_speed_10m_max || [] });
    } catch {
      setWeather({ temp: 25, humidity: 72, rain: 8, wind: 12, code: 2, soil: selectedState.soil });
      setForecast({ dates: [], code: [2, 61, 80], max: [29, 27, 25], min: [19, 18, 17], rain: [5, 15, 28], wind: [10, 17, 22] });
      toastMsg("Live weather unavailable — showing safe demo fallback data.");
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toastMsg("GPS is not available on this device.");
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let place = { lat, lng, village: "Detected Area", district: "Local District", state: "India" };
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const d = await r.json();
        const a = d.address || {};
        place = { lat, lng, village: a.village || a.town || a.suburb || a.hamlet || "Detected Area", district: a.state_district || a.county || "Local District", state: a.state || "India" };
      } catch {}
      setLocation(place);
      const match = STATES.find((s) => s.name.toLowerCase().includes(String(place.state).toLowerCase())) || STATES.reduce((best, s) => distanceKm(place, s) < distanceKm(place, best) ? s : best, STATES[0]);
      setSelectedState(match);
      setLoadingLocation(false);
      toastMsg(`Location detected: ${place.village}, ${place.district}`);
    }, () => {
      setLoadingLocation(false);
      toastMsg("Location permission denied. You can still select a NER state manually.");
    }, { enableHighAccuracy: true, timeout: 12000 });
  };

  const selectState = (state) => {
    setSelectedState(state);
    const auto = STATE_LANG[state.name];
    if (auto) setLang(auto);
    loadWeather(state.lat, state.lng);
    toastMsg(`${state.name} selected`);
  };

  const nearestSafe = useMemo(() => {
    if (!location) return SAFE_ZONES[0];
    return SAFE_ZONES.reduce((best, z) => distanceKm(location, z) < distanceKm(location, best) ? z : best, SAFE_ZONES[0]);
  }, [location]);

  const findSafeRoute = () => {
    if (!location) return toastMsg("Detect your location first.");
    setRoute({ start: location, dest: nearestSafe });
    toastMsg(`Safe route prepared to ${nearestSafe.name}`);
  };

  const sendSOS = () => {
    setSosOpen(false);
    const payload = { type: "SOS", time: new Date().toISOString(), location: location || { state: selectedState.name }, risk };
    const next = [payload, ...reports];
    setReports(next);
    localStorage.setItem("lg_reports", JSON.stringify(next));
    toastMsg(online ? "SOS alert prepared. Connect your backend/Telegram endpoint to dispatch it." : "Offline SOS saved locally. It will be available when connection returns.");
    setActive("dashboard");
  };

  const saveReport = () => {
    if (!reportText.trim()) return toastMsg("Describe the hazard first.");
    const r = { type: "Hazard Report", text: reportText, time: new Date().toISOString(), location: location || { state: selectedState.name }, photo };
    const next = [r, ...reports];
    setReports(next);
    localStorage.setItem("lg_reports", JSON.stringify(next));
    setReportText(""); setPhoto(null); setReportOpen(false);
    toastMsg("Hazard report saved locally and ready for sync.");
  };

  const agentReply = (q) => {
    const s = q.toLowerCase();
    if (s.includes("tomorrow") || s.includes("forecast")) return `Tomorrow's rainfall outlook is ${forecast?.rain?.[2] ?? 28} mm with a ${weatherText(forecast?.code?.[2] ?? 80)} pattern. Weather-based risk trend is ${risk >= 65 ? "rising" : "stable"}.`;
    if (s.includes("compare") || s.includes("yesterday")) return `Yesterday → ${forecast?.rain?.[0] ?? 5} mm, Today → ${weather?.rain ?? 0} mm, Tomorrow → ${forecast?.rain?.[2] ?? 28} mm. The trend is ${((forecast?.rain?.[2] ?? 28) > (weather?.rain ?? 0)) ? "increasing rainfall" : "improving rainfall"}.`;
    if (s.includes("safe") || s.includes("route")) return location ? `The nearest saved safe zone is ${nearestSafe.name}, about ${distanceKm(location, nearestSafe)?.toFixed(1)} km away. Press “Find Safe Route” to map it.` : "Detect your live location first, then I can prepare the nearest safe-zone route.";
    if (s.includes("sos") || s.includes("emergency")) return "Use SOS Emergency on the top bar. Confirm it to save an emergency event with the latest location and risk score. Connect the existing backend/Telegram endpoint to dispatch it to authorities.";
    if (s.includes("risk")) return `Current ${selectedState.name} risk is ${risk}% — ${riskInfo.label}. Key drivers: terrain slope ${selectedState.slope}°, soil moisture ${Math.round(weather?.soil ?? selectedState.soil)}%, and current precipitation ${weather?.rain ?? 0} mm.`;
    return `I can help with ${selectedState.name} risk, yesterday/today/tomorrow weather, safe routes, SOS, and hazard reporting. Try: “Compare weather” or “What is my risk?”`;
  };

  const askAgent = (q = agentInput) => {
    if (!q.trim()) return;
    setAgentMessages((m) => [...m, { from: "user", text: q }, { from: "ai", text: agentReply(q) }]);
    setAgentInput("");
  };

  const forecastCards = useMemo(() => {
    const f = forecast || { dates: [], code: [2, 61, 80], max: [29, 27, 25], min: [19, 18, 17], rain: [5, 15, 28], wind: [10, 17, 22] };
    return [
      { label: t.yesterday, date: f.dates[0], code: f.code[0], max: f.max[0], min: f.min[0], rain: f.rain[0], wind: f.wind[0] },
      { label: t.today, date: f.dates[1], code: f.code[1], max: f.max[1], min: f.min[1], rain: f.rain[1], wind: f.wind[1] },
      { label: t.tomorrow, date: f.dates[2], code: f.code[2], max: f.max[2], min: f.min[2], rain: f.rain[2], wind: f.wind[2] },
    ];
  }, [forecast, t]);

  if (!auth) {
    return (
      <div className="auth-stage">
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="auth-grid" />
        <div className="auth-card glass-card bounce-in">
          <div className="brand-orbit"><div className="brand-core">◈</div><span className="orbit orbit-1" /><span className="orbit orbit-2" /></div>
          <div className="eyebrow">AI DISASTER INTELLIGENCE • NER INDIA</div>
          <h1>LandGuard <span>AI</span></h1>
          <p className="auth-lead">Early warning, weather intelligence, risk mapping and emergency response in one command center.</p>
          <form onSubmit={doLogin} className="auth-form">
            {authMode === "signup" && <input value={loginForm.name} onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="Full name" />}
            <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Email address" />
            <div className="password-wrap"><input type={showPass ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Password" /><button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "Hide" : "Show"}</button></div>
            <button className="primary-btn full" type="submit">{authMode === "login" ? "Enter Command Center" : "Create & Enter"}</button>
          </form>
          <button className="demo-btn" onClick={demoLogin}>⚡ One-click Demo Login</button>
          <div className="auth-switch">{authMode === "login" ? "New here?" : "Already registered?"} <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Create account" : "Login"}</button></div>
          <div className="auth-mini-row"><span>🛡️ Secure session</span><span>📡 Offline ready</span><span>🌏 8 NER states</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {welcome && <div className="welcome-overlay"><div className="welcome-card bounce-in"><div className="welcome-badge">✓</div><div className="eyebrow">LANDGUARD AI</div><h2>{t.welcome}</h2><p>Command center is ready.</p></div></div>}
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="brand-mini">◈</div><div><strong>LandGuard <span>AI</span></strong><small>NER Risk Command Center</small></div></div>
        <nav>
          {[["dashboard", "⌂", t.dashboard], ["weather", "◒", t.weather], ["map", "◎", t.map], ["analytics", "◫", t.analytics], ["agent", "✦", t.agent], ["calculator", "◇", t.calculator], ["report", "⌁", t.report]].map(([id, ic, label]) => <button key={id} className={active === id ? "nav-btn active" : "nav-btn"} onClick={() => id === "agent" ? setAgentOpen(true) : setActive(id)}><span>{ic}</span>{label}<i>{id === "agent" ? "AI" : ""}</i></button>)}
        </nav>
        <div className="sidebar-bottom"><button className="nav-btn" onClick={() => setSosOpen(true)}><span>🚨</span>{t.sos}</button><button className="logout-btn" onClick={doLogout}>↪ {t.signout}</button></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="status-line"><span className={online ? "status-dot" : "status-dot offline"} />{online ? "Systems Online" : "Offline Mode"}<span className="muted">• {new Date().toLocaleTimeString()}</span></div><h2>{selectedState.name} <span className="thin">/ {location?.village || "Regional Monitoring"}</span></h2></div>
          <div className="top-actions"><select value={lang} onChange={(e) => setLang(e.target.value)}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select><button className="ghost-btn" onClick={detectLocation}>{loadingLocation ? "Locating…" : "⌖ " + t.detect}</button><button className="sos-btn" onClick={() => setSosOpen(true)}>🚨 SOS</button><button className="avatar-btn" onClick={() => toastMsg("Profile panel is included in the account session")}>LG</button></div>
        </header>

        <div className="content">
          {active === "dashboard" && <>
            <section className="hero-grid">
              <div className="hero-card glass-card">
                <div className="hero-copy"><div className="eyebrow">AI-ASSISTED EARLY WARNING</div><h1>Know the risk <span>before the slope moves.</span></h1><p>LandGuard combines live weather, terrain profile, state risk history and emergency workflows into one fast response layer.</p><div className="hero-actions"><button className="primary-btn" onClick={detectLocation}>{loadingLocation ? "Detecting…" : "⌖ Detect & Analyze"}</button><button className="secondary-btn" onClick={() => setAgentOpen(true)}>✦ Ask AI Agent</button></div></div>
                <div className={`risk-orb ${riskInfo.cls}`}><div className="orb-ring"><strong>{risk}%</strong><span>{riskInfo.label}</span></div><div className="orb-caption">Current risk outlook</div></div>
              </div>
              <div className="quick-grid"><div className="mini-card"><span>🌧️</span><div><small>Precipitation</small><strong>{weather?.rain ?? 0} mm</strong><em>{weatherText(weather?.code ?? 2)}</em></div></div><div className="mini-card"><span>💧</span><div><small>Soil moisture</small><strong>{Math.round(weather?.soil ?? selectedState.soil)}%</strong><em>Near-surface</em></div></div><div className="mini-card"><span>🌡️</span><div><small>Temperature</small><strong>{weather?.temp ?? 25}°C</strong><em>Current</em></div></div><div className="mini-card"><span>⛰️</span><div><small>Slope profile</small><strong>{selectedState.slope}°</strong><em>{riskInfo.label} terrain</em></div></div></div>
            </section>

            <section className="section-head"><div><div className="eyebrow">3-DAY WEATHER INTELLIGENCE</div><h3>{t.compare}: {t.yesterday} → {t.today} → {t.tomorrow}</h3></div><button className="text-btn" onClick={() => setActive("weather")}>Open detailed weather →</button></section>
            <section className="forecast-grid">{forecastCards.map((f, i) => <div className={`forecast-card ${i === 2 ? "featured" : ""}`} key={f.label}><div className="forecast-top"><span>{f.label}</span><span>{f.date || "Local"}</span></div><div className="weather-icon">{f.rain > 20 ? "⛈️" : f.rain > 5 ? "🌦️" : "☀️"}</div><strong>{f.max ?? 27}° / {f.min ?? 18}°</strong><p>{weatherText(f.code)}</p><div className="forecast-stats"><span>🌧 {f.rain ?? 0} mm</span><span>💨 {f.wind ?? 0} km/h</span></div></div>)}</section>

            <section className="section-head"><div><div className="eyebrow">REGIONAL MONITORING</div><h3>NER State Risk Pulse</h3></div><button className="text-btn" onClick={() => setActive("map")}>Open risk map →</button></section>
            <section className="state-grid">{STATES.map((s) => { const ri = riskLevel(s.base); return <button className="state-card" key={s.id} onClick={() => selectState(s)}><div className="state-name"><span>{s.short}</span><div><strong>{s.name}</strong><small>{s.capital}</small></div></div><div className="state-risk"><strong>{s.base}%</strong><span className={`pill ${ri.cls}`}>{ri.label}</span></div><div className="progress"><i style={{ width: `${s.base}%` }} /></div></button> })}</section>

            <section className="two-col"><div className="panel"><div className="panel-head"><div><div className="eyebrow">ACTION CENTER</div><h3>Emergency response</h3></div></div><div className="action-grid"><button onClick={findSafeRoute}>🛣️<span>Find Safe Route</span><small>Nearest safe zone</small></button><button onClick={() => setSosOpen(true)} className="danger-action">🚨<span>SOS Emergency</span><small>Immediate response</small></button><button onClick={() => setReportOpen(true)}>📸<span>Report Hazard</span><small>Photo + location</small></button><button onClick={() => setAgentOpen(true)}>✦<span>Ask AI Agent</span><small>Risk assistant</small></button></div></div><div className="panel"><div className="panel-head"><div><div className="eyebrow">WHY THIS RISK?</div><h3>Explainable signals</h3></div></div><div className="signal-list"><div><span>Rainfall contribution</span><strong>{Math.min(100, Math.round((weather?.rain ?? 0) * 2.7))}%</strong></div><div><span>Soil moisture</span><strong>{Math.round(weather?.soil ?? selectedState.soil)}%</strong></div><div><span>Terrain slope</span><strong>{selectedState.slope}°</strong></div><p>Risk increases when heavy rainfall combines with saturated near-surface soil and steep terrain. This is an AI-assisted prototype risk signal, not a guaranteed landslide probability.</p></div></div></section>
          </>}

          {active === "weather" && <section><div className="page-title"><div className="eyebrow">WEATHER INTELLIGENCE</div><h1>Yesterday • Today • Tomorrow</h1><p>Location-aware weather comparison for {selectedState.name}.</p></div><div className="forecast-grid large">{forecastCards.map((f, i) => <div className={`forecast-card ${i === 2 ? "featured" : ""}`} key={f.label}><div className="forecast-top"><span>{f.label}</span><span>{f.date || "Local"}</span></div><div className="weather-icon">{f.rain > 20 ? "⛈️" : f.rain > 5 ? "🌦️" : "☀️"}</div><strong>{f.max ?? 27}° / {f.min ?? 18}°</strong><p>{weatherText(f.code)}</p><div className="big-rain">{f.rain ?? 0} <small>mm precipitation</small></div><div className="forecast-stats"><span>💨 {f.wind ?? 0} km/h</span></div></div>)}</div><div className="comparison-panel panel"><h3>Trend comparison</h3><div className="compare-bars"><div><span>Rainfall</span><i style={{ width: `${Math.min(100, (forecastCards[0]?.rain || 0) * 2)}%` }} /><b>{forecastCards[0]?.rain ?? 0} mm</b></div><div><span>Today</span><i style={{ width: `${Math.min(100, (weather?.rain || 0) * 2)}%` }} /><b>{weather?.rain ?? 0} mm</b></div><div><span>Tomorrow</span><i style={{ width: `${Math.min(100, (forecastCards[2]?.rain || 0) * 2)}%` }} /><b>{forecastCards[2]?.rain ?? 0} mm</b></div></div><div className="trend-pill">{(forecastCards[2]?.rain ?? 0) > (weather?.rain ?? 0) ? "↗ Rising rainfall trend" : "↘ Improving rainfall trend"}</div></div></section>}

          {active === "map" && <section><div className="page-title"><div className="eyebrow">GIS COMMAND MAP</div><h1>NER Landslide Risk Map</h1><p>Select any state to inspect its risk profile. Detect your GPS location to generate a safe-route line.</p></div><div className="panel map-panel"><MapContainer center={[25.6, 92.3]} zoom={6} scrollWheelZoom className="big-map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{STATES.map(s => <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={Math.max(10, s.base / 7)} pathOptions={{ color: riskLevel(s.base).cls === "critical" ? "#fb7185" : riskLevel(s.base).cls === "high" ? "#f59e0b" : "#34d399", fillOpacity: 0.45 }} eventHandlers={{ click: () => selectState(s) }}><Popup><strong>{s.name}</strong><br />Risk: {s.base}%<br />Slope: {s.slope}°<br /><button onClick={() => selectState(s)}>Open</button></Popup></CircleMarker>)}{location && <Marker position={[location.lat, location.lng]} icon={icon("📍")}><Popup>Your location<br />{location.village}</Popup></Marker>}{SAFE_ZONES.map(z => <Marker key={z.name} position={[z.lat, z.lng]} icon={icon("🟢")}><Popup>{z.name}</Popup></Marker>)}{route && <Polyline positions={[[route.start.lat, route.start.lng], [route.dest.lat, route.dest.lng]]} pathOptions={{ color: "#34d399", weight: 6, dashArray: "10 8" }} />}</MapContainer></div><div className="map-controls"><button className="primary-btn" onClick={detectLocation}>⌖ Detect My Location</button><button className="secondary-btn" onClick={findSafeRoute}>🛣️ {t.safe}</button><div className="legend"><span><i className="dot low" />Low</span><span><i className="dot moderate" />Moderate</span><span><i className="dot high" />High</span><span><i className="dot critical" />Critical</span></div></div></section>}

          {active === "analytics" && <section><div className="page-title"><div className="eyebrow">RISK ANALYTICS</div><h1>State Intelligence</h1><p>Current regional snapshot for the eight Northeast states.</p></div><div className="metric-grid"><div className="metric"><small>States monitored</small><strong>08</strong><span>NER region</span></div><div className="metric"><small>High / Critical</small><strong>{STATES.filter(s => s.base >= 65).length}</strong><span>priority zones</span></div><div className="metric"><small>Highest risk</small><strong>86%</strong><span>Sikkim</span></div><div className="metric"><small>System status</small><strong>{online ? "LIVE" : "OFFLINE"}</strong><span>local fail-safe</span></div></div><div className="panel ranking"><h3>Risk ranking</h3>{[...STATES].sort((a,b) => b.base-a.base).map((s,i)=><div className="rank-row" key={s.id}><b>#{i+1}</b><span>{s.name}</span><div className="rank-bar"><i style={{width:`${s.base}%`}} /></div><strong>{s.base}%</strong></div>)}</div></section>}

          {active === "calculator" && <section><div className="page-title"><div className="eyebrow">RISK SIMULATION LAB</div><h1>Scenario testing</h1><p>Adjust the environmental values to see how the explainable risk engine responds.</p></div><div className="calculator-grid"><div className="panel controls-panel">{[["Rainfall", "rain", 0, 100, "mm"], ["Soil moisture", "soil", 0, 100, "%"], ["Slope angle", "slope", 0, 90, "°"]].map(([label,key,min,max,unit]) => <label key={key}><div><span>{label}</span><b>{calc[key]}{unit}</b></div><input type="range" min={min} max={max} value={calc[key]} onChange={e => setCalc({ ...calc, [key]: Number(e.target.value) })} /></label>)}<button className="primary-btn" onClick={() => toastMsg("Scenario evaluated.")}>Run AI Scenario</button></div><div className={`scenario-result ${riskLevel(calcRisk(selectedState, calc.rain, calc.soil, calc.slope)).cls}`}><div className="eyebrow">SIMULATED OUTLOOK</div><strong>{calcRisk(selectedState, calc.rain, calc.soil, calc.slope)}%</strong><span>{riskLevel(calcRisk(selectedState, calc.rain, calc.soil, calc.slope)).label}</span><p>Based on rainfall, near-surface soil moisture and terrain slope inputs.</p></div></div></section>}

          {active === "report" && <section><div className="page-title"><div className="eyebrow">FIELD REPORTING</div><h1>Hazard reports</h1><p>Reports are stored locally first, so field teams can keep working during connectivity loss.</p></div><div className="panel"><button className="primary-btn" onClick={() => setReportOpen(true)}>＋ Create Hazard Report</button><div className="report-list">{reports.length ? reports.map((r, i) => <div className="report-row" key={i}><div><strong>{r.type}</strong><small>{new Date(r.time).toLocaleString()}</small><p>{r.text || "SOS emergency event"}</p></div><span className="pill high">{risk}%</span></div>) : <div className="empty-state">No reports yet.</div>}</div></div></section>}
        </div>
      </main>

      {route && <div className="route-float glass-card"><div><span>🛣️ Safe route ready</span><strong>{route.dest.name}</strong><small>{location ? `${distanceKm(location, route.dest)?.toFixed(1)} km estimated` : "Location detected"}</small></div><button onClick={() => setActive("map")}>Open Map</button><button className="icon-btn" onClick={() => setRoute(null)}>×</button></div>}

      {sosOpen && <div className="modal-backdrop"><div className="modal-card danger-modal bounce-in"><div className="danger-ring">🚨</div><div className="eyebrow">EMERGENCY CONFIRMATION</div><h2>Activate SOS?</h2><p>This will create an emergency event using your latest available location and current risk score of <strong>{risk}%</strong>.</p><div className="modal-actions"><button className="secondary-btn" onClick={() => setSosOpen(false)}>Cancel</button><button className="danger-btn" onClick={sendSOS}>Confirm SOS</button></div></div></div>}

      {reportOpen && <div className="modal-backdrop"><div className="modal-card bounce-in"><div className="eyebrow">OFFLINE-FIRST FIELD REPORT</div><h2>Report a hazard</h2><textarea rows="5" value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Describe cracks, rockfall, blocked road, drainage overflow, fresh movement…" /><label className="file-drop">📸 Add photo<input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0]?.name || null)} /></label>{photo && <small>Selected: {photo}</small>}<div className="modal-actions"><button className="secondary-btn" onClick={() => setReportOpen(false)}>Cancel</button><button className="primary-btn" onClick={saveReport}>{t.send}</button></div></div></div>}

      {agentOpen && <div className="agent-dock glass-card"><div className="agent-head"><div><span className="ai-pulse">✦</span><div><strong>LandGuard AI Agent</strong><small>Explainable • offline-friendly • context aware</small></div></div><button onClick={() => setAgentOpen(false)}>×</button></div><div className="agent-suggestions">{["What is my risk?", "Compare yesterday today tomorrow", "Find a safe route", "How does SOS work?"] .map(q => <button key={q} onClick={() => askAgent(q)}>{q}</button>)}</div><div className="agent-messages">{agentMessages.map((m,i) => <div key={i} className={m.from === "ai" ? "msg ai" : "msg user"}>{m.text}</div>)}</div><form className="agent-input" onSubmit={(e) => { e.preventDefault(); askAgent(); }}><input value={agentInput} onChange={e => setAgentInput(e.target.value)} placeholder="Ask LandGuard AI…" /><button>➤</button></form></div>}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
