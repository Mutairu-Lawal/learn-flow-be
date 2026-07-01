import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import z from "zod";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
import { validateRequest } from "@/common/utils/httpHandlers";
import { quizController } from "./quizController";
import { CreateQuizSchema, QuizResponseObjectSchema, QuizSchema, ResultSchema, SubmissionSchema } from "./quizSchema";

export const quizRegistry = new OpenAPIRegistry();
export const quizRouter: Router = express.Router();

export const QUIZ_MESSAGES = {
	RETRIEVED: "Quizzes retrieved successfully",
	RETRIEVED_2: "Quizz retrieved successfully",
	SUBMITTED: "Answers submitted successfully",
	SUBMIT_FAILED: "Failed to submit answers",
	INVALID_SESSION: "Invalid session token",
	CREATED: "Quiz created successfully",
	ALREADY_SUBMITTED: "Session already submitted",
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
	method: "get",
	path: `${quizEndpoint}/{slug}`,
	tags: ["Quiz"],
	summary: "Get a quiz by slug",
	security: [{ [bearerAuth.name]: [] }],
	request: { params: z.object({ slug: z.string() }) },
	responses: createApiResponse(QuizResponseObjectSchema, QUIZ_MESSAGES.RETRIEVED_2),
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

quizRegistry.registerPath({
	method: "post",
	path: `${quizEndpoint}/submit`,
	tags: ["Quiz"],
	summary: "post answers",
	security: [{ [bearerAuth.name]: [] }],
	request: createRequestBody(SubmissionSchema),
	responses: createApiResponse(ResultSchema, QUIZ_MESSAGES.SUBMITTED),
});

// Routes
quizRouter.get("/", quizController.retrieveQuizzes);

quizRouter.get("/:slug", authenticate, quizController.retrieveQuiz);

quizRouter.post(
	"/",
	authenticate,
	isAdmin,
	validateRequest(z.object({ body: CreateQuizSchema })),
	quizController.create,
);

quizRouter.post(
	"/submit",
	authenticate,
	validateRequest(
		z.object({
			body: SubmissionSchema,
		}),
	),
	quizController.postAnswers,
);
