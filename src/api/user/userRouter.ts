import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { UserParamsSchema, UserResponseObjectSchema, UserSchema } from "@/api/user/userSchema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { checkAuthentication, checkAuthorization } from "@/common/middleware/authHandler";
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

const unauthorizedResponse = createApiResponse(z.null(), "Unauthorized", StatusCodes.UNAUTHORIZED);

const forbiddenResponse = createApiResponse(z.null(), "Forbidden", StatusCodes.FORBIDDEN);

const internalErrorResponse = createApiResponse(z.null(), "Internal server error", StatusCodes.INTERNAL_SERVER_ERROR);

userRegistry.registerPath({
	method: "get",
	path: "/users/me",
	tags: ["User"],
	security: [{ [bearerAuth.name]: [] }],
	summary: "Get the currently authenticated user",
	responses: {
		...createApiResponse(UserResponseObjectSchema, "Current user retrieved"),
		...unauthorizedResponse,
		...internalErrorResponse,
	},
});

userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	summary: "Delete a user by ID (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: UserParamsSchema,
	},
	responses: {
		...createApiResponse(z.null(), "User deleted successfully"),
		...unauthorizedResponse,
		...forbiddenResponse,
		...internalErrorResponse,
	},
});

// Routes
userRouter.get("/me", checkAuthentication, userController.getCurrentUser);

userRouter.delete(
	"/:id",
	checkAuthentication,
	checkAuthorization,
	validateRequest(z.object({ params: UserParamsSchema })),
	userController.deleteUser,
);
