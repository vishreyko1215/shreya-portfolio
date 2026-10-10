const fs = require("fs");
const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = 5000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync(
    path.join(__dirname, "supabase-ca.crt"),
    "utf8"
  ),
},
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please try again in 15 minutes.",
  },
});

// Test the database connection
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "Portfolio backend and PostgreSQL are connected!",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// Receive contact form messages
app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  
if (
  typeof name !== "string" ||
  typeof email !== "string" ||
  typeof message !== "string" ||
  !name.trim() ||
  !email.trim() ||
  !message.trim() ||
  name.trim().length > 100 ||
  email.trim().length > 254 ||
  message.trim().length > 5000 ||
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
)
 {
    return res.status(400).json({
      success: false,
      message: "Please enter valid contact details and a message.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.contact_messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [name.trim(), email.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Your message was saved successfully!",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Contact submission failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save your message. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
