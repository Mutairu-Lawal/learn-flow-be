import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const SignUpSchema = z
	.object({
		username: z.string().min(3).max(20),
		email: z.string().email(),
		password: z.string().min(6),
	})
	.openapi("SignUpRequest", {
		description: "Schema for user sign-up",
		example: {
			username: "john_doe",
			email: "john.doe@example.com",
			password: "securePassword123",
		},
	});

export const LoginSchema = z
	.object({
		username: z.string().min(3).max(20),
		password: z.string().min(6).max(100),
	})
	.openapi("LoginRequest", {
		description: "Schema for user login",
		example: {
			username: "john_doe",
			password: "securePassword123",
		},
	});
