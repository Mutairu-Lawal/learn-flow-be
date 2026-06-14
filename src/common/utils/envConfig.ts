import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV ?? "development";

const envFileMap: Record<string, string> = {
	test: ".env.test",
	development: ".env",
	production: ".env",
};

const envFile = envFileMap[nodeEnv] ?? ".env";

dotenv.config({
	path: path.resolve(process.cwd(), envFile),
	override: true,
});

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

	HOST: z.string().min(1).default("localhost"),

	PORT: z.coerce.number().int().positive().default(8080),

	CORS_ORIGIN: z.string().url().default("http://localhost:3000"),

	COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

	COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

	JWT_EXPIRES_IN: z.string().min(1).default("1h"),

	ADMIN_JWT_EXPIRES_IN: z.string().min(1).default("1h"),

	JWT_SECRET: z.string().min(1).default("my-strong-secret-key"),

	DATABASE_URL: z.string().url(),

	BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),

	API_PREFIX: z.string().default("/api/v1"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = {
	...parsedEnv.data,
	isDevelopment: parsedEnv.data.NODE_ENV === "development",
	isProduction: parsedEnv.data.NODE_ENV === "production",
	isTest: parsedEnv.data.NODE_ENV === "test",
};
