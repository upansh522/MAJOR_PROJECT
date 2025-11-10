import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

connectDb();

connectRabbitMQ();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const allowedOrigins = [
  "https://major-project-theta-eight.vercel.app",
  "https://major-project-git-main-upanish522s-projects.vercel.app",
  "https://major-project-5mbz9d55q-upanish522s-projects.vercel.app",
];

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

const app = express();

app.use(express.json());



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


app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
