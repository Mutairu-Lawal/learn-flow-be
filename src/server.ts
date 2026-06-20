import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { authRouter } from "@/api/v1/auth/authRouter";
import { healthCheckRouter } from "@/api/v1/healthCheck/healthCheckRouter";
import { topicRouter } from "@/api/v1/topic/topicRouter";
import { userRouter } from "@/api/v1/user/userRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { quizRouter } from "@/api/v1/quiz/quizRouter";

const [notFoundHandler, errorLogger] = errorHandler();
const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", "loopback");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging{{
app.use(requestLogger);

// Routes
app.use(`${env.API_PREFIX}/health-check`, healthCheckRouter);
app.use(`${env.API_PREFIX}/users`, userRouter);
app.use(`${env.API_PREFIX}/auth`, authRouter);
app.use(`${env.API_PREFIX}/topics`, topicRouter);
app.use(`${env.API_PREFIX}/quizzes`, quizRouter);

// Swagger UI
app.use("/api-docs", openAPIRouter);

// 404 handler
app.use(notFoundHandler);

// Error middleware
app.use(errorLogger);

export { app, logger };
