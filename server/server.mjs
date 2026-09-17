import express from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

// =====================================================
// DATABASE SCHEMA & MODEL
// =====================================================
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  state: { type: String, default: "" },
  district: { type: String, default: "" },
  village: { type: String, default: "" },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  alertsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
// =====================================================
// SOS SCHEMA & MODEL
// =====================================================
const sosSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },

  reportedBy: {
    type: String,
    default: "Citizen"
  },

  userId: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["active", "queued-offline", "acknowledged", "responding", "resolved"],
    default: "active"
  },

  coordinates: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },

  accuracy: {
    type: Number,
    default: null
  },

  source: {
    type: String,
    enum: ["live-gps", "selected-state", "unknown"],
    default: "unknown"
  },

  locationName: {
    type: String,
    default: "Unknown location"
  },

  weather: {
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null },
    rain: { type: Number, default: null },
    weatherCode: { type: Number, default: null }
  },

  synced: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SOS = mongoose.model("SOS", sosSchema);

// =====================================================
// HAZARD REPORT SCHEMA & MODEL
// =====================================================

const reportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: String,
    default: null
  },

  reportedBy: {
    type: String,
    default: "Citizen"
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  severity: {
    type: String,
    default: "Moderate"
  },

  photo: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "submitted"
  },

  synced: {
    type: Boolean,
    default: true
  },

  coordinates: {
    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model("Report", reportSchema);
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB: CONNECTED successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

// =====================================================
// TELEGRAM CONFIGURATION
// =====================================================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// =====================================================
// MONGODB REGISTER / SIGNUP
// =====================================================
app.post("/api/register", async (req, res) => {
  try {
    const { name, mobile, password, state, district, village, latitude, longitude } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number and password are required."
      });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This mobile number is already registered."
      });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newUser = new User({
      id: "LG-" + Date.now(),
      name,
      mobile,
      password: passwordHash,
      state: state || "",
      district: district || "",
      village: village || "",
      location: {
        latitude: latitude || null,
        longitude: longitude || null
      },
      alertsEnabled: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful and saved to MongoDB.",
      user: {
        id: newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        state: newUser.state,
        district: newUser.district,
        village: newUser.village,
        location: newUser.location,
        alertsEnabled: newUser.alertsEnabled
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// =====================================================
// MONGODB LOGIN
// =====================================================
app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and password are required."
      });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please register first."
      });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (passwordHash !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password."
      });
    }

    res.json({
      success: true,
      message: "Login successful from MongoDB.",
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        state: user.state,
        district: user.district,
        village: user.village,
        location: user.location,
        alertsEnabled: user.alertsEnabled
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});
// =====================================================
// SOS — CREATE EMERGENCY ALERT
// =====================================================
app.post("/api/sos", async (req, res) => {
  try {
    const {
      userId,
      reportedBy,
      coordinates,
      accuracy,
      source,
      locationName,
      weather,
      synced = true
    } = req.body;

    // Validate GPS if provided
    let latitude = null;
    let longitude = null;

    if (coordinates) {
      latitude = Number(coordinates.latitude);
      longitude = Number(coordinates.longitude);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid GPS coordinates."
        });
      }
    }

    const sosId = "SOS-" + Date.now();

    const newSOS = new SOS({
      id: sosId,

      userId: userId || null,

      reportedBy: reportedBy || "Citizen",

      status: synced ? "active" : "queued-offline",

      coordinates: {
        latitude,
        longitude
      },

      accuracy:
        accuracy !== null && accuracy !== undefined
          ? Number(accuracy)
          : null,

      source:
        source || (coordinates ? "live-gps" : "unknown"),

      locationName:
        locationName || "Unknown location",

      weather: {
        temperature:
          weather?.temperature !== undefined
            ? Number(weather.temperature)
            : null,

        humidity:
          weather?.humidity !== undefined
            ? Number(weather.humidity)
            : null,

        rain:
          weather?.rain !== undefined
            ? Number(weather.rain)
            : null,

        weatherCode:
          weather?.weatherCode !== undefined
            ? Number(weather.weatherCode)
            : null
      },

      synced: Boolean(synced)
    });

    await newSOS.save();

    console.log("🚨 SOS SAVED TO MONGODB:", newSOS.id);

    // Telegram emergency alert
    if (synced) {
      const telegramResult = await sendTelegramAlert({
        location: locationName || "Emergency GPS Location",
        rainfall: weather?.rain || 0,
        soilMoisture: 0,
        slopeRisk: 0,
        riskScore: 100,
        latitude,
        longitude
      });

      return res.status(201).json({
        success: true,
        message: "SOS emergency alert saved successfully.",
        sos: newSOS,
        telegram: telegramResult
      });
    }

    res.status(201).json({
      success: true,
      message: "SOS saved offline and queued for synchronization.",
      sos: newSOS,
      telegram: null
    });

  } catch (error) {
    console.error("SOS CREATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create SOS alert."
    });
  }
});


// =====================================================
// SOS — GET ALL ALERTS
// =====================================================
app.get("/api/sos", async (req, res) => {
  try {
    const sosAlerts = await SOS
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sosAlerts.length,
      sosAlerts
    });

  } catch (error) {
    console.error("SOS FETCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch SOS alerts."
    });
  }
});


// =====================================================
// SOS — UPDATE STATUS
// =====================================================
app.patch("/api/sos/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "active",
      "queued-offline",
      "acknowledged",
      "responding",
      "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS status."
      });
    }

    const sos = await SOS.findOneAndUpdate(
      { id: req.params.id },
      {
        status,
        synced: true
      },
      {
        new: true
      }
    );

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "SOS alert not found."
      });
    }

    console.log(
      `🚑 SOS ${sos.id} status changed to ${status}`
    );

    res.json({
      success: true,
      message: `SOS status updated to ${status}.`,
      sos
    });

  } catch (error) {
    console.error("SOS STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update SOS status."
    });
  }
});
// =====================================================
// HAZARD REPORT — CREATE
// =====================================================

app.post("/api/reports", async (req, res) => {
  try {
    const {
      id,
      userId,
      reportedBy,
      title,
      description,
      severity,
      photo,
      status,
      synced,
      coordinates
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Report title is required."
      });
    }

    const report = new Report({
      id: id || `REP-${Date.now()}`,

      userId: userId || null,

      reportedBy:
        reportedBy || "Citizen",

      title,

      description:
        description || "",

      severity:
        severity || "Moderate",

      photo:
        photo || "",

      status:
        status || "submitted",

      synced:
        synced !== false,

      coordinates: {
        latitude:
          coordinates?.latitude ?? null,

        longitude:
          coordinates?.longitude ?? null
      }
    });

    await report.save();

    console.log(
      "📷 HAZARD REPORT SAVED:",
      report.id
    );

    res.status(201).json({
      success: true,
      message: "Hazard report saved successfully.",
      report
    });

  } catch (error) {

    console.error(
      "REPORT CREATE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to save hazard report."
    });
  }
});


// =====================================================
// HAZARD REPORT — GET ALL
// =====================================================

app.get("/api/reports", async (req, res) => {
  try {

    const reports = await Report
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });

  } catch (error) {

    console.error(
      "REPORT FETCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch reports."
    });
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/api/health", (req, res) => {
  res.json({
    online: true,
    system: "LANDGUARD AI",
    telegramConfigured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    message: "Backend is working!",
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// TELEGRAM ALERT FUNCTION
// =====================================================
async function sendTelegramAlert({
  location = "Unknown",
  rainfall = 0,
  soilMoisture = 0,
  slopeRisk = 0,
  riskScore = 0,
  latitude = null,
  longitude = null
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("⚠️ Telegram is not configured.");
    return { success: false, message: "Telegram credentials missing." };
  }

  const googleMapsLocation = latitude !== null && longitude !== null
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  const message = `
🚨 <b>LANDGUARD AI</b>
<b>HIGH-RISK LANDSLIDE WARNING</b>

━━━━━━━━━━━━━━━━━━

📍 <b>Location:</b>
${location}

⚠️ <b>Risk Score:</b>
${riskScore}%

🌧️ <b>Rainfall:</b>
${rainfall} mm/hr

💧 <b>Soil Moisture:</b>
${soilMoisture}%

⛰️ <b>Slope Risk:</b>
${slopeRisk}

${latitude !== null ? `🛰️ <b>Latitude:</b> ${latitude}` : ""}
${longitude !== null ? `🛰️ <b>Longitude:</b> ${longitude}` : ""}

━━━━━━━━━━━━━━━━━━

🚨 <b>RECOMMENDED ACTION</b>

Avoid vulnerable slopes,
hilly roads and unstable areas.

Follow instructions issued by
local disaster-management authorities.

${googleMapsLocation ? `📌 <a href="${googleMapsLocation}">OPEN LOCATION MAP</a>` : ""}

━━━━━━━━━━━━━━━━━━

🛡️ LANDGUARD AI
AI-Based Landslide Early Warning System

🕐 ${new Date().toLocaleString("en-IN")}
`;

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true
      },
      { timeout: 10000 }
    );

    console.log("✅ Telegram HIGH-RISK alert sent.");
    return {
      success: true,
      messageId: response.data?.result?.message_id,
      message: "Telegram alert sent successfully."
    };
  } catch (error) {
    console.error("❌ TELEGRAM ERROR:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.description || error.message
    };
  }
}

// =====================================================
// MANUAL TELEGRAM TEST
// =====================================================
app.get("/api/test-telegram", async (req, res) => {
  const result = await sendTelegramAlert({
    location: "East Sikkim",
    rainfall: 92,
    soilMoisture: 87,
    slopeRisk: 0.91,
    riskScore: 86,
    latitude: 27.533,
    longitude: 88.512
  });
  res.json(result);
});

// =====================================================
// GPS → LOCATION
// =====================================================
app.get("/api/location", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required."
      });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
          zoom: 18,
          addressdetails: 1
        },
        headers: {
          "User-Agent": "LANDGUARD-AI/1.0"
        }
      }
    );

    const address = response.data.address || {};

    res.json({
      success: true,
      coordinates: {
        latitude: Number(lat),
        longitude: Number(lon)
      },
      location: {
        village: address.village || address.hamlet || address.town || address.suburb || "Unknown",
        district: address.county || address.district || "Unknown",
        state: address.state || "Unknown",
        country: address.country || "India"
      },
      displayName: response.data.display_name
    });

  } catch (error) {
    console.error("LOCATION ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to detect location."
    });
  }
});

// =====================================================
// REAL-TIME WEATHER API — OPEN-METEO
// =====================================================
app.get("/api/weather", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required."
      });
    }

    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m"
          ].join(","),
          hourly: ["soil_moisture_0_to_1cm"].join(","),
          timezone: "auto"
        },
        timeout: 15000
      }
    );

    const data = response.data;
    const current = data.current || {};

    res.json({
      success: true,
      source: "Open-Meteo",
      sourceType: "Weather forecast model",
      coordinates: { latitude: lat, longitude: lon },
      weather: {
        temperature: current.temperature_2m ?? null,
        humidity: current.relative_humidity_2m ?? null,
        precipitation: current.precipitation ?? null,
        rain: current.rain ?? null,
        weatherCode: current.weather_code ?? null,
        windSpeed: current.wind_speed_10m ?? null
      },
      timestamp: current.time || new Date().toISOString(),
      timezone: data.timezone || null,
      units: {
        temperature: data.current_units?.temperature_2m || "°C",
        humidity: data.current_units?.relative_humidity_2m || "%",
        precipitation: data.current_units?.precipitation || "mm",
        rain: data.current_units?.rain || "mm",
        windSpeed: data.current_units?.wind_speed_10m || "km/h"
      },
      dataUpdatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ WEATHER API ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      source: "Open-Meteo",
      message: "Unable to retrieve current weather data."
    });
  }
});

// =====================================================
// NASA GPM IMERG
// =====================================================
app.get("/api/rainfall", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required."
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2);

    const formatDate = date => date.toISOString().split("T")[0];

    const nasaResponse = await axios.get(
      "https://pmmpublisher.pps.eosdis.nasa.gov/opensearch",
      {
        params: {
          q: "precip_30mn",
          lat,
          lon,
          limit: 1,
          startTime: formatDate(startDate),
          endTime: formatDate(endDate)
        },
        timeout: 20000
      }
    );

    const items = nasaResponse.data?.items || [];

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        source: "NASA GPM IMERG",
        message: "No recent NASA IMERG product found."
      });
    }

    const item = items[0];

    res.json({
      success: true,
      source: "NASA GPM IMERG Early Run",
      product: "30-minute precipitation",
      coordinates: { latitude: lat, longitude: lon },
      datasetName: item.displayName || item.title || "NASA GPM IMERG",
      published: item.published || item.updated || null,
      image: Array.isArray(item.image) ? item.image[0]?.url || null : null,
      links: item.url || item.links || null,
      nasaMetadata: item
    });

  } catch (error) {
    console.error("NASA RAINFALL ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      source: "NASA GPM IMERG",
      message: "Unable to retrieve NASA rainfall product."
    });
  }
});

// =====================================================
// AI RISK CALCULATOR
// =====================================================
app.post("/api/predict-risk", async (req, res) => {
  try {
    const {
      rainfall = 0,
      soilMoisture = 0,
      slopeRisk = 0,
      location = "Unknown",
      latitude = null,
      longitude = null
    } = req.body;

    const rainfallValue = Number(rainfall);
    const soilValue = Number(soilMoisture);
    const slopeValue = Number(slopeRisk);

    const rainfallScore = Math.min(Math.max(rainfallValue / 100, 0), 1);
    const soilScore = Math.min(Math.max(soilValue / 100, 0), 1);
    const slopeScore = Math.min(Math.max(slopeValue, 0), 1);

    const score = (rainfallScore * 0.40) + (soilScore * 0.35) + (slopeScore * 0.25);
    const riskScore = Math.round(score * 100);

    let riskLevel = "LOW";
    if (riskScore >= 70) {
      riskLevel = "HIGH";
    } else if (riskScore >= 40) {
      riskLevel = "MEDIUM";
    }

    let telegramAlert = null;
    if (riskLevel === "HIGH") {
      telegramAlert = await sendTelegramAlert({
        location,
        rainfall: rainfallValue,
        soilMoisture: soilValue,
        slopeRisk: slopeValue,
        riskScore,
        latitude,
        longitude
      });
    }

    res.json({
      success: true,
      location,
      rainfall: rainfallValue,
      soilMoisture: soilValue,
      slopeRisk: slopeValue,
      riskScore,
      riskLevel,
      automaticAlert: riskLevel === "HIGH",
      telegram: telegramAlert,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("RISK CALCULATION ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Risk calculation failed."
    });
  }
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log("            LANDGUARD AI BACKEND          ");
  console.log("==========================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Telegram: ${TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID ? "CONNECTED" : "NOT CONFIGURED"}`);
  console.log("==========================================");
});