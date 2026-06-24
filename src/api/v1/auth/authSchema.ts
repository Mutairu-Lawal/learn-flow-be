import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Role } from "@prisma/client";
import { z } from "zod";

extendZodWithOpenApi(z);

export const PASSWORD_SCHEMA = z
	.string()
	.min(8, {
		message: "Password must be at least 8 characters long",
	})
	.max(128)
	.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/, {
		message:
			"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
	});

export const SignUpSchema = z
	.object({
		username: z.string().trim().toLowerCase().min(3).max(20),
		email: z.string().email().trim().toLowerCase(),
		password: PASSWORD_SCHEMA,
	})
	.openapi("SignUpRequest", {
		example: {
			username: "string",
			email: "user@example.com",
			password: "securePassword@123",
		},
	});

export const LoginSchema = z
	.object({
		identifier: z.string().trim().toLowerCase(),
		password: z.string(),
	})
	.openapi("LoginRequest");

export const ForgotPasswordSchema = z
	.object({
		email: z.string().email().trim().toLowerCase(),
	})
	.openapi("ForgotPasswordRequest");

export const UserCreationResponse = z.object({
	data: z.object({
		id: z.number(),
		username: z.string(),
		email: z.string(),
		role: z.nativeEnum(Role),
		createdAt: z.date(),
		updatedAt: z.date(),
		deletedAt: z.date().nullable(),
		emailVerifiedAt: z.date().nullable(),
	}),
});

export const UserAuthenticatedResponse = z.object({
	data: z.object({
		token: z.string(),
		user: z.object({
			username: z.string(),
			email: z.string(),
			role: z.nativeEnum(Role),
		}),
	}),
});

export type UserData = z.infer<typeof SignUpSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
