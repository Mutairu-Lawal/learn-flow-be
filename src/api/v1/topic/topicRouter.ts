import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { commonIdSchema } from "@/common/utils/commonValidation";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { topicController } from "./topicController";
import {
	CreateTopicSchema,
	TopicObjectSchema,
	TopicSchema,
	TopicsResponseObjectSchema,
	UpdateTopicSchema,
} from "./topicSchema";

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

topicRegistry.registerPath({
	method: "put",
	path: `${env.API_PREFIX}/topics/{id}`,
	tags: ["Topic"],
	summary: "Update a topic (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: commonIdSchema,
		...createRequestBody(UpdateTopicSchema),
	},
	responses: createApiResponse(TopicObjectSchema, "Topic updated successfully"),
});

topicRegistry.registerPath({
	method: "delete",
	path: `${env.API_PREFIX}/topics/{id}`,
	tags: ["Topic"],
	summary: "Delete a topic by ID (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: commonIdSchema,
	},
	responses: createApiResponse(z.null(), "Topic deleted successfully"),
});

// Routes
topicRouter.get("/", topicController.getAllTopics);

topicRouter.post(
	"/",
	authenticate,
	isAdmin,
	validateRequest(z.object({ body: CreateTopicSchema })),
	topicController.createTopic,
);

topicRouter.put(
	"/:id",
	authenticate,
	isAdmin,
	validateRequest(z.object({ body: UpdateTopicSchema })),
	topicController.updateTopic,
);

topicRouter.delete(
	"/:id",
	authenticate,
	isAdmin,
	validateRequest(z.object({ params: commonIdSchema })),
	topicController.deleteTopic,
);
