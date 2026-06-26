import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import z from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { quizController } from "./quizController";
import { CreateQuizSchema, QuizResponseObjectSchema, QuizSchema } from "./quizSchema";

export const quizRegistry = new OpenAPIRegistry();
export const quizRouter: Router = express.Router();

export const QUIZ_MESSAGES = {
	RETRIEVED: "Quizzes retrieved successfully",
	CREATED: "Quiz created successfully",

	NOT_FOUND: "Quiz not found",
	TOPIC_NOT_FOUND: "Topic not found",

	RETRIEVE_FAILED: "Failed to retrieve quizzes",
	CREATE_FAILED: "Failed to create quiz",
} as const;

export const quizEndpoint = `${env.API_PREFIX}/quizzes`;

const bearerAuth = quizRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

quizRegistry.register("Quiz", QuizSchema);

quizRegistry.registerPath({
	method: "get",
	path: `${quizEndpoint}`,
	tags: ["Quiz"],
	summary: "List all quizzes",
	responses: createApiResponse(QuizResponseObjectSchema, QUIZ_MESSAGES.RETRIEVED),
});

quizRegistry.registerPath({
	method: "post",
	path: `${quizEndpoint}`,
	tags: ["Quiz"],
	summary: "Create Quiz - admin only",
	security: [{ [bearerAuth.name]: [] }],
	request: createRequestBody(CreateQuizSchema),
	responses: createApiResponse(QuizSchema, QUIZ_MESSAGES.CREATED),
});

// Routes
quizRouter.get("/", quizController.retrieveQuiz);

quizRouter.post(
	"/",
	authenticate,
	isAdmin,
	validateRequest(z.object({ body: CreateQuizSchema })),
	quizController.create,
);
