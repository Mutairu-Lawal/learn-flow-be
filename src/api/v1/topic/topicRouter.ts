import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
// import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
// import { validateRequest } from "@/common/utils/httpHandlers";
import { topicController } from "./topicController";
import { TopicResponseObjectSchema, TopicSchema } from "./topicSchema";

export const topicRegistry = new OpenAPIRegistry();
export const topicRouter: Router = express.Router();

const bearerAuth = topicRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

topicRegistry.register("Topic", TopicSchema);

topicRegistry.registerPath({
	method: "get",
	path: `${env.API_PREFIX}/topics`,
	tags: ["Topic"],
	summary: "Get all available topics",
	responses: createApiResponse(TopicResponseObjectSchema, "Successful"),
});

// userRegistry.registerPath({
// 	method: "delete",
// 	path: `${env.API_PREFIX}/users/{id}`,
// 	tags: ["User"],
// 	summary: "Delete a user by ID (admin only)",
// 	security: [{ [bearerAuth.name]: [] }],
// 	request: {
// 		params: UserParamsSchema,
// 	},
// 	responses: createApiResponse(z.null(), "User deleted successfully"),
// });

// Routes
topicRouter.get("/", topicController.getAllTopics);

// userRouter.delete(
// 	"/:id",
// 	authenticate,
// 	isAdmin,
// 	validateRequest(z.object({ params: UserParamsSchema })),
// 	userController.deleteUser,
// );
