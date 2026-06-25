import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { commonIdSchema } from "@/common/utils/commonValidation";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { topicController } from "./topicController";
import { CreateTopicSchema, TopicSchema, TopicsResponseSchema, UpdateTopicSchema } from "./topicSchema";
import { TOPIC_MESSAGES } from "./topicService";

export const topicRegistry = new OpenAPIRegistry();
export const topicRouter: Router = express.Router();

export const topicsEndpoint = `${env.API_PREFIX}/topics`;

const bearerAuth = topicRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

topicRegistry.register("Topic", TopicSchema);

topicRegistry.registerPath({
	method: "get",
	path: `${topicsEndpoint}`,
	tags: ["Topic"],
	summary: "Get all available topics",
	responses: createApiResponse(TopicsResponseSchema, TOPIC_MESSAGES.RETRIEVED_ALL),
});

topicRegistry.registerPath({
	method: "post",
	path: `${topicsEndpoint}`,
	tags: ["Topic"],
	summary: "Create a new topic (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: createRequestBody(CreateTopicSchema),
	responses: createApiResponse(TopicSchema, TOPIC_MESSAGES.CREATED),
});

topicRegistry.registerPath({
	method: "put",
	path: `${topicsEndpoint}/{id}`,
	tags: ["Topic"],
	summary: "Update a topic (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: commonIdSchema,
		...createRequestBody(UpdateTopicSchema),
	},
	responses: createApiResponse(TopicSchema, TOPIC_MESSAGES.UPDATED),
});

topicRegistry.registerPath({
	method: "delete",
	path: `${topicsEndpoint}/{id}`,
	tags: ["Topic"],
	summary: "Delete a topic by ID (admin only)",
	security: [{ [bearerAuth.name]: [] }],
	request: {
		params: commonIdSchema,
	},
	responses: createApiResponse(z.null(), TOPIC_MESSAGES.DELETED),
});

// Routes
topicRouter.get("/", topicController.getTopics);

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
	validateRequest(
		z.object({
			params: commonIdSchema,
			body: UpdateTopicSchema,
		}),
	),
	topicController.updateTopic,
);

topicRouter.delete(
	"/:id",
	authenticate,
	isAdmin,
	validateRequest(z.object({ params: commonIdSchema })),
	topicController.deleteTopic,
);
