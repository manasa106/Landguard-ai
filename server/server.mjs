import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;


// =====================================================
// TELEGRAM CONFIGURATION
// =====================================================

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID;


// =====================================================
// USER STORAGE
// =====================================================

const USERS_FILE = "./users.json";

function readUsers() {

  try {

    if (!fs.existsSync(USERS_FILE)) {

      fs.writeFileSync(
        USERS_FILE,
        "[]"
      );

    }

    const data =
      fs.readFileSync(
        USERS_FILE,
        "utf8"
      );

    return JSON.parse(
      data || "[]"
    );

  } catch (error) {

    console.error(
      "USER FILE ERROR:",
      error.message
    );

    return [];

  }

}


function saveUsers(users) {

  fs.writeFileSync(

    USERS_FILE,

    JSON.stringify(
      users,
      null,
      2
    )

  );

}


// =====================================================
// REGISTER
// =====================================================

app.post(
  "/api/register",
  (req, res) => {

    const {

      name,
      mobile,
      password,
      state,
      district,
      village,
      latitude,
      longitude

    } = req.body;


    if (
      !name ||
      !mobile ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, mobile number and password are required."

      });

    }


    const users =
      readUsers();


    const existingUser =
      users.find(
        user =>
          user.mobile === mobile
      );


    if (existingUser) {

      return res.status(409).json({

        success: false,

        message:
          "This mobile number is already registered."

      });

    }


    const passwordHash =
      crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");


    const newUser = {

      id:
        "LG-" +
        Date.now(),

      name,

      mobile,

      passwordHash,

      state:
        state || "",

      district:
        district || "",

      village:
        village || "",

      location: {

        latitude:
          latitude || null,

        longitude:
          longitude || null

      },

      alertsEnabled:
        true,

      createdAt:
        new Date().toISOString()

    };


    users.push(
      newUser
    );

    saveUsers(users);


    res.status(201).json({

      success: true,

      message:
        "Registration successful.",

      user: {

        id:
          newUser.id,

        name:
          newUser.name,

        mobile:
          newUser.mobile,

        state:
          newUser.state,

        district:
          newUser.district,

        village:
          newUser.village,

        location:
          newUser.location,

        alertsEnabled:
          newUser.alertsEnabled

      }

    });

  }
);


// =====================================================
// LOGIN
// =====================================================

app.post(
  "/api/login",
  (req, res) => {

    const {

      mobile,
      password

    } = req.body;


    if (
      !mobile ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Mobile number and password are required."

      });

    }


    const users =
      readUsers();


    const user =
      users.find(
        user =>
          user.mobile === mobile
      );


    if (!user) {

      return res.status(401).json({

        success: false,

        message:
          "Account not found. Please register first."

      });

    }


    const passwordHash =
      crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");


    if (
      passwordHash !==
      user.passwordHash
    ) {

      return res.status(401).json({

        success: false,

        message:
          "Incorrect password."

      });

    }


    res.json({

      success: true,

      message:
        "Login successful.",

      user: {

        id:
          user.id,

        name:
          user.name,

        mobile:
          user.mobile,

        state:
          user.state,

        district:
          user.district,

        village:
          user.village,

        location:
          user.location,

        alertsEnabled:
          user.alertsEnabled

      }

    });

  }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      online:
        true,

      system:
        "LANDGUARD AI",

      telegramConfigured:
        Boolean(
          TELEGRAM_BOT_TOKEN &&
          TELEGRAM_CHAT_ID
        ),

      message:
        "Backend is working!",

      timestamp:
        new Date().toISOString()

    });

  }
);


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

  if (
    !TELEGRAM_BOT_TOKEN ||
    !TELEGRAM_CHAT_ID
  ) {

    console.log(
      "⚠️ Telegram is not configured."
    );

    return {

      success:
        false,

      message:
        "Telegram credentials missing."

    };

  }


  const googleMapsLocation =
    latitude !== null &&
    longitude !== null

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

${latitude !== null
    ? `🛰️ <b>Latitude:</b> ${latitude}`
    : ""}

${longitude !== null
    ? `🛰️ <b>Longitude:</b> ${longitude}`
    : ""}

━━━━━━━━━━━━━━━━━━

🚨 <b>RECOMMENDED ACTION</b>

Avoid vulnerable slopes,
hilly roads and unstable areas.

Follow instructions issued by
local disaster-management authorities.

${googleMapsLocation
    ? `📌 <a href="${googleMapsLocation}">OPEN LOCATION MAP</a>`
    : ""}

━━━━━━━━━━━━━━━━━━

🛡️ LANDGUARD AI
AI-Based Landslide Early Warning System

🕐 ${new Date().toLocaleString("en-IN")}

`;


  try {

    const response =
      await axios.post(

        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,

        {

          chat_id:
            TELEGRAM_CHAT_ID,

          text:
            message,

          parse_mode:
            "HTML",

          disable_web_page_preview:
            true

        },

        {

          timeout:
            10000

        }

      );


    console.log(
      "✅ Telegram HIGH-RISK alert sent."
    );


    return {

      success:
        true,

      messageId:
        response.data?.result?.message_id,

      message:
        "Telegram alert sent successfully."

    };


  } catch (error) {

    console.error(

      "❌ TELEGRAM ERROR:",

      error.response?.data ||
      error.message

    );


    return {

      success:
        false,

      message:
        error.response?.data?.description ||
        error.message

    };

  }

}


// =====================================================
// MANUAL TELEGRAM TEST
// =====================================================

app.get(
  "/api/test-telegram",
  async (req, res) => {

    const result =
      await sendTelegramAlert({

        location:
          "East Sikkim",

        rainfall:
          92,

        soilMoisture:
          87,

        slopeRisk:
          0.91,

        riskScore:
          86,

        latitude:
          27.533,

        longitude:
          88.512

      });


    res.json(result);

  }
);


// =====================================================
// GPS → LOCATION
// =====================================================

app.get(
  "/api/location",
  async (req, res) => {

    try {

      const {
        lat,
        lon
      } = req.query;


      if (
        !lat ||
        !lon
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Latitude and longitude are required."

        });

      }


      const response =
        await axios.get(

          "https://nominatim.openstreetmap.org/reverse",

          {

            params: {

              lat,

              lon,

              format:
                "json",

              zoom:
                18,

              addressdetails:
                1

            },

            headers: {

              "User-Agent":
                "LANDGUARD-AI/1.0"

            }

          }

        );


      const address =
        response.data.address ||
        {};


      res.json({

        success:
          true,

        coordinates: {

          latitude:
            Number(lat),

          longitude:
            Number(lon)

        },

        location: {

          village:

            address.village ||

            address.hamlet ||

            address.town ||

            address.suburb ||

            "Unknown",

          district:

            address.county ||

            address.district ||

            "Unknown",

          state:

            address.state ||

            "Unknown",

          country:

            address.country ||

            "India"

        },

        displayName:
          response.data.display_name

      });


    } catch (error) {

      console.error(

        "LOCATION ERROR:",

        error.message

      );


      res.status(500).json({

        success:
          false,

        message:
          "Unable to detect location."

      });

    }

  }
);
// =====================================================
// REAL-TIME WEATHER API — OPEN-METEO
// =====================================================

app.get(
  "/api/weather",
  async (req, res) => {

    try {

      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);

      // -----------------------------------------------
      // VALIDATE COORDINATES
      // -----------------------------------------------

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

          message:
            "Valid latitude and longitude are required."

        });

      }


      // -----------------------------------------------
      // OPEN-METEO REQUEST
      // -----------------------------------------------

      const response =
        await axios.get(

          "https://api.open-meteo.com/v1/forecast",

          {

            params: {

              latitude: lat,

              longitude: lon,

              current:
                [
                  "temperature_2m",
                  "relative_humidity_2m",
                  "precipitation",
                  "rain",
                  "weather_code",
                  "wind_speed_10m"
                ].join(","),

              hourly:
                [
                  "soil_moisture_0_to_1cm"
                ].join(","),

              timezone:
                "auto"

            },

            timeout: 15000

          }

        );


      const data =
        response.data;


      const current =
        data.current || {};


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      res.json({

        success: true,

        source: "Open-Meteo",

        sourceType:
          "Weather forecast model",

        coordinates: {

          latitude: lat,

          longitude: lon

        },

        weather: {

          temperature:
            current.temperature_2m ?? null,

          humidity:
            current.relative_humidity_2m ?? null,

          precipitation:
            current.precipitation ?? null,

          rain:
            current.rain ?? null,

          weatherCode:
            current.weather_code ?? null,

          windSpeed:
            current.wind_speed_10m ?? null

        },

        timestamp:
          current.time ||
          new Date().toISOString(),

        timezone:
          data.timezone || null,

        units: {

          temperature:
            data.current_units?.temperature_2m ||
            "°C",

          humidity:
            data.current_units?.relative_humidity_2m ||
            "%",

          precipitation:
            data.current_units?.precipitation ||
            "mm",

          rain:
            data.current_units?.rain ||
            "mm",

          windSpeed:
            data.current_units?.wind_speed_10m ||
            "km/h"

        },

        dataUpdatedAt:
          new Date().toISOString()

      });

    }

    catch (error) {

      console.error(

        "❌ WEATHER API ERROR:",

        error.response?.data ||
        error.message

      );


      res.status(500).json({

        success: false,

        source: "Open-Meteo",

        message:
          "Unable to retrieve current weather data."

      });

    }

  }
);


// =====================================================
// NASA GPM IMERG
// =====================================================

app.get(
  "/api/rainfall",
  async (req, res) => {

    try {

      const lat =
        Number(req.query.lat);

      const lon =
        Number(req.query.lon);


      if (
        Number.isNaN(lat) ||
        Number.isNaN(lon)
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Valid latitude and longitude are required."

        });

      }


      const endDate =
        new Date();


      const startDate =
        new Date();


      startDate.setDate(
        startDate.getDate() - 2
      );


      const formatDate =
        date =>
          date
            .toISOString()
            .split("T")[0];


      const nasaResponse =
        await axios.get(

          "https://pmmpublisher.pps.eosdis.nasa.gov/opensearch",

          {

            params: {

              q:
                "precip_30mn",

              lat,

              lon,

              limit:
                1,

              startTime:
                formatDate(
                  startDate
                ),

              endTime:
                formatDate(
                  endDate
                )

            },

            timeout:
              20000

          }

        );


      const items =
        nasaResponse.data?.items ||
        [];


      if (
        items.length === 0
      ) {

        return res.status(404).json({

          success:
            false,

          source:
            "NASA GPM IMERG",

          message:
            "No recent NASA IMERG product found."

        });

      }


      const item =
        items[0];


      res.json({

        success:
          true,

        source:
          "NASA GPM IMERG Early Run",

        product:
          "30-minute precipitation",

        coordinates: {

          latitude:
            lat,

          longitude:
            lon

        },

        datasetName:

          item.displayName ||

          item.title ||

          "NASA GPM IMERG",

        published:

          item.published ||

          item.updated ||

          null,

        image:

          Array.isArray(
            item.image
          )

            ? item.image[0]?.url ||
              null

            : null,

        links:

          item.url ||
          item.links ||
          null,

        nasaMetadata:
          item

      });


    } catch (error) {

      console.error(

        "NASA RAINFALL ERROR:",

        error.response?.data ||
        error.message

      );


      res.status(500).json({

        success:
          false,

        source:
          "NASA GPM IMERG",

        message:
          "Unable to retrieve NASA rainfall product."

      });

    }

  }
);


// =====================================================
// AI RISK CALCULATOR
// =====================================================

app.post(
  "/api/predict-risk",
  async (req, res) => {

    try {

      const {

        rainfall = 0,

        soilMoisture = 0,

        slopeRisk = 0,

        location = "Unknown",

        latitude = null,

        longitude = null

      } = req.body;


      const rainfallValue =
        Number(rainfall);

      const soilValue =
        Number(soilMoisture);

      const slopeValue =
        Number(slopeRisk);


      const rainfallScore =
        Math.min(
          Math.max(
            rainfallValue / 100,
            0
          ),
          1
        );


      const soilScore =
        Math.min(
          Math.max(
            soilValue / 100,
            0
          ),
          1
        );


      const slopeScore =
        Math.min(
          Math.max(
            slopeValue,
            0
          ),
          1
        );


      const score =

        rainfallScore *
        0.40 +

        soilScore *
        0.35 +

        slopeScore *
        0.25;


      const riskScore =
        Math.round(
          score * 100
        );


      let riskLevel =
        "LOW";


      if (
        riskScore >= 70
      ) {

        riskLevel =
          "HIGH";

      }

      else if (
        riskScore >= 40
      ) {

        riskLevel =
          "MEDIUM";

      }


      // =================================================
      // AUTOMATIC TELEGRAM ALERT
      // =================================================

      let telegramAlert =
        null;


      if (
        riskLevel === "HIGH"
      ) {

        telegramAlert =
          await sendTelegramAlert({

            location,

            rainfall:
              rainfallValue,

            soilMoisture:
              soilValue,

            slopeRisk:
              slopeValue,

            riskScore,

            latitude,

            longitude

          });

      }


      res.json({

        success:
          true,

        location,

        rainfall:
          rainfallValue,

        soilMoisture:
          soilValue,

        slopeRisk:
          slopeValue,

        riskScore,

        riskLevel,

        automaticAlert:
          riskLevel === "HIGH",

        telegram:
          telegramAlert,

        timestamp:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(

        "RISK CALCULATION ERROR:",

        error.message

      );


      res.status(500).json({

        success:
          false,

        message:
          "Risk calculation failed."

      });

    }

  }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      "        LANDGUARD AI BACKEND"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `Server: http://localhost:${PORT}`
    );

    console.log(
      `Telegram: ${
        TELEGRAM_BOT_TOKEN &&
        TELEGRAM_CHAT_ID
          ? "CONNECTED"
          : "NOT CONFIGURED"
      }`
    );

    console.log(
      "=========================================="
    );

  }
);