import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
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

userRegistry.registerPath({
	method: "get",
	path: "/users/me",
	tags: ["User"],
	security: [{ [bearerAuth.name]: [] }],
	summary: "Get the currently authenticated user",
	responses: createApiResponse(UserResponseObjectSchema, "Current user retrieved"),
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
	responses: createApiResponse(z.null(), "User deleted successfully"),
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
