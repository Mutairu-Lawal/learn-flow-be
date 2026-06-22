import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { UserParamsSchema, UserResponseObjectSchema, UserSchema } from "@/api/v1/user/userSchema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

const bearerAuth = userRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "get",
	path: `${env.API_PREFIX}/users/me`,
	tags: ["User"],
	security: [{ [bearerAuth.name]: [] }],
	summary: "Get the currently authenticated user",
	responses: createApiResponse(UserResponseObjectSchema, "Current user retrieved", StatusCodes.CREATED),
});

userRegistry.registerPath({
	method: "delete",
	path: `${env.API_PREFIX}/users/{id}`,
	tags: ["User"],
	summary: "Delete a user by ID (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: UserParamsSchema,
	},

	responses: createApiResponse(z.null(), "No content", StatusCodes.NO_CONTENT),
});

// Routes
userRouter.get("/me", authenticate, userController.getCurrentUser);

userRouter.delete(
	"/:id",
	authenticate,
	isAdmin,
	validateRequest(z.object({ params: UserParamsSchema })),
	userController.deleteUser,
);
