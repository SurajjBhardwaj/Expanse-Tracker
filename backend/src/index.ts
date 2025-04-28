import express, { Application, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import AppRoute from "./routes";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("dev"));

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic middleware
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming request from:", origin);
      const allowedOrigins = [
        "http://localhost:5173",
        "https://expanse-tracker-wkxm.vercel.app/",
        process.env.CLIENT_URL,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

AppRoute(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
