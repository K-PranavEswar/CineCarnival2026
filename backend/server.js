import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theatreRoutes from "./routes/theatreRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

/* =========================
   CONFIG
========================= */

const PORT = process.env.PORT || 10000;

/* Allow BOTH local + vercel */
const allowedOrigins = [
  "http://localhost:5173",
  "https://cine-carnival2026.vercel.app"
];

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "Cine Carnival API",
    time: new Date(),
  });
});

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/bookings", bookingRoutes);

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {

    console.error("MongoDB connection failed");
    console.error(err);

    process.exit(1);

  });

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });

});
