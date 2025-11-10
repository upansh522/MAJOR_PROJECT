import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";
import cors from "cors";
dotenv.config();

startSendOtpConsumer();

const app = express();
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
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
