import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const SignUpSchema = z
	.object({
		username: z
			.string()
			.min(3)
			.max(20)
			.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
			.trim()
			.toLowerCase(),
		email: z.string().email().trim().toLowerCase(),
		password: z.string().min(6),
	})
	.openapi("SignUpRequest", {
		description: "Schema for user sign-up",
		example: {
			username: "john_doe123",
			email: "john.doe@example.com",
			password: "securePassword123",
		},
	});

export const LoginSchema = z
	.object({
		identifier: z.string().trim().toLowerCase(),
		password: z.string().min(6).max(100),
	})
	.openapi("LoginRequest", {
		description: "Schema for user login (accepts either username or email)",
		example: {
			identifier: "john_doe123",
			password: "securePassword123",
		},
	});
