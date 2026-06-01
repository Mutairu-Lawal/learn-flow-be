import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import { LoginSchema, SignUpSchema } from "./authSchema";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("SignUpRequest", SignUpSchema);
authRegistry.register("LoginRequest", LoginSchema);

// OpenAPI path registrations
authRegistry.registerPath({
	method: "post",
	path: "/auth/signup",
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
	path: "/auth/login",
	tags: ["Auth"],
	summary: "Authenticate a user",
	request: createRequestBody(LoginSchema),
	responses: createApiResponse(
		z.object({
			token: z.string(),
		}),
		"Login successful",
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
