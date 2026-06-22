import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Role } from "@prisma/client";
import { z } from "zod";

extendZodWithOpenApi(z);

export const SignUpSchema = z
	.object({
		username: z.string().min(3).max(20).trim().toLowerCase(),
		email: z.string().email().trim().toLowerCase(),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters long" })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/, {
				message:
					"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
			}),
	})
	.openapi("SignUpRequest", {
		description: "Schema for user sign-up",
		example: {
			username: "john_doe123",
			email: "john.doe@example.com",
			password: "securePassword@123",
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

export const ForgotPasswordSchema = z
	.object({
		email: z.string().email().trim().toLowerCase(),
	})
	.openapi("ForgotPasswordRequest", {
		description: "Schema for requesting password reset",
		example: {
			email: "john.doe@example.com",
		},
	});

export const UserCreationResponse = z.object({
	data: z.object({
		id: z.string(),
		username: z.string(),
		email: z.string(),
		createdAt: z.date(),
		updatedAt: z.date(),
		delectedAt: z.date(),
		emailVerifiedAt: z.date(),
		role: z.enum([Role.USER, Role.ADMIN]),
	}),
});

export const UserAuthenticatedResponse = z.object({
	data: z.object({
		token: z.string(),
		user: z.object({
			username: z.string(),
			email: z.string(),
			role: z.enum([Role.USER, Role.ADMIN]),
		}),
	}),
});

export type UserData = z.infer<typeof SignUpSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type UserCreated = z.infer<typeof UserCreationResponse>;
