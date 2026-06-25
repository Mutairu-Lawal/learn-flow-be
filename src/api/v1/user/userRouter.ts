import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { commonIdSchema } from "@/common/utils/commonValidation";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { UserResponseObjectSchema, UserSchema } from "./userSchema";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

export const usersEndpoint = `${env.API_PREFIX}/users`;

const bearerAuth = userRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "get",
	path: `${usersEndpoint}/me`,
	tags: ["User"],
	summary: "Get authenticated user",
	security: [
		{
			[bearerAuth.name]: [],
		},
	],
	responses: createApiResponse(UserResponseObjectSchema, "User retrieved successfully", StatusCodes.OK),
});

userRegistry.registerPath({
	method: "delete",
	path: `${usersEndpoint}/{id}`,
	tags: ["User"],
	summary: "Soft delete user",
	security: [
		{
			[bearerAuth.name]: [],
		},
	],
	request: {
		params: commonIdSchema,
	},
	responses: createApiResponse(z.null(), "User deleted successfully", StatusCodes.OK),
});

userRouter.get("/me", authenticate, userController.getCurrentUser);

userRouter.delete(
	"/:id",
	authenticate,
	isAdmin,
	validateRequest(
		z.object({
			params: commonIdSchema,
		}),
	),
	userController.deleteUser,
);
