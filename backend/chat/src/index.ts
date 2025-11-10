import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";
import { app, server } from "./config/socket.js";

dotenv.config();

connectDb();

app.use(express.json());
const allowedOrigins = [
  "https://major-project-theta-eight.vercel.app",
  "https://major-project-git-main-upanish522s-projects.vercel.app",
  "https://major-project-5mbz9d55q-upanish522s-projects.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use("/api/v1", chatRoutes);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
