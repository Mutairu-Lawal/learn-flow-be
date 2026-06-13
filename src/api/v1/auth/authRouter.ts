import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Role } from "@prisma/client";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import { ForgotPasswordSchema, LoginSchema, SignUpSchema } from "./authSchema";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("SignUpRequest", SignUpSchema);
authRegistry.register("LoginRequest", LoginSchema);
authRegistry.register("ForgotPasswordRequest", ForgotPasswordSchema);

// OpenAPI path registrations
authRegistry.registerPath({
	method: "post",
	path: `${env.API_PREFIX}/auth/signup`,
	tags: ["Auth"],
	summary: "Create a new account",
	request: createRequestBody(SignUpSchema),
	responses: createApiResponse(
		z.object({
			id: z.number(),
			username: z.string(),
			email: z.string().email(),
		}),
		"User created successfully",
	),
});

authRegistry.registerPath({
	method: "post",
	path: `${env.API_PREFIX}/auth/login`,
	tags: ["Auth"],
	summary: "Authenticate a user",
	request: createRequestBody(LoginSchema),
	responses: createApiResponse(
		z.object({
			token: z.string(),
			role: z.enum([Role.USER, Role.ADMIN]),
		}),
		"Login successful",
	),
});

authRegistry.registerPath({
	method: "post",
	path: `${env.API_PREFIX}/auth/forgot-password`,
	tags: ["Auth"],
	summary: "Request password reset",
	request: createRequestBody(ForgotPasswordSchema),
	responses: createApiResponse(
		z.object({
			message: z.string(),
		}),
		"Password reset requested successfully",
	),
});

// Route handlers
authRouter.post(
	"/signup",
	validateRequest(
		z.object({
			body: SignUpSchema,
		}),
	),
	authController.signUp,
);

authRouter.post(
	"/login",
	validateRequest(
		z.object({
			body: LoginSchema,
		}),
	),
	authController.login,
);

authRouter.post(
	"/forgot-password",
	validateRequest(
		z.object({
			body: ForgotPasswordSchema,
		}),
	),
	authController.forgotPassword,
);
