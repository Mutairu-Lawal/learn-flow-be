import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import z from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { topicController } from "./topicController";
import { CreateTopicSchema, TopicObjectSchema, TopicSchema, TopicsResponseObjectSchema } from "./topicSchema";

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
	responses: createApiResponse(TopicsResponseObjectSchema, "Successful"),
});

topicRegistry.registerPath({
	method: "post",
	path: `${env.API_PREFIX}/topics`,
	tags: ["Topic"],
	summary: "Create a new topic (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: createRequestBody(CreateTopicSchema),
	responses: createApiResponse(TopicObjectSchema, "Topic created successfully"),
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

topicRouter.post(
	"/",
	authenticate,
	isAdmin,
	validateRequest(z.object({ body: CreateTopicSchema })),
	topicController.createTopic,
);

// userRouter.delete(
// 	"/:id",
// 	authenticate,
// 	isAdmin,
// 	validateRequest(z.object({ params: UserParamsSchema })),
// 	userController.deleteUser,
// );
