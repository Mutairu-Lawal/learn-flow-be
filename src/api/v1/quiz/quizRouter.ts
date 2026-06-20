import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { createApiResponse, createRequestBody } from "@/api-docs/openAPIResponseBuilders";
// import { authenticate, isAdmin } from "@/common/middleware/authHandler";
import { env } from "@/common/utils/envConfig";
import { quizController } from "./quizController";
import { CreateQuizSchema, QuizResponseObjectSchema, QuizSchema } from "./quizSchema";
// import { validateRequest } from "@/common/utils/httpHandlers";

export const quizRegistry = new OpenAPIRegistry();
export const quizRouter: Router = express.Router();

const bearerAuth = quizRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

quizRegistry.register("Quiz", QuizSchema);

quizRegistry.registerPath({
	method: "get",
	path: `${env.API_PREFIX}/quizzes`,
	tags: ["Quiz"],
	summary: "List all quizzes",
	responses: createApiResponse(QuizResponseObjectSchema, "Successful"),
});

quizRegistry.registerPath({
	method: "post",
	path: `${env.API_PREFIX}/quizzes`,
	tags: ["Quiz"],
	summary: "Create Quiz - admin only",
	security: [{ [bearerAuth.name]: [] }],
	request: createRequestBody(CreateQuizSchema),
	responses: createApiResponse(QuizSchema, "Successful"),
});

// Routes
quizRouter.get("/", quizController.retrieveQuiz);

// userRouter.delete(
// 	"/:id",
// 	authenticate,
// 	isAdmin,
// 	validateRequest(z.object({ params: UserParamsSchema })),
// 	userController.deleteUser,
// );
