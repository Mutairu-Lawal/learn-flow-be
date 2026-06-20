import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const QuestionOptionSchema = z.object({
	id: z.number(),
	text: z.string(),
	questionId: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

const QuestionSchema = z.object({
	id: z.number(),
	isActive: z.boolean(),
	text: z.string(),
	options: z.array(QuestionOptionSchema),
	quizId: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const QuizSchema = z.object({
	id: z.number(),
	timeLimitMs: z.number(),
	passMark: z.number().max(100),
	topicId: z.number(),
	questions: z.array(QuestionSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const QuizResponseObjectSchema = z.object({
	data: z.array(QuizSchema),
});

export const CreateQuizSchema = z
	.object({
		timeLimitMs: z.number().min(60000),
		passMark: z.number().min(0).max(100),
		topicId: z.number(),
		questions: z.array(
			z.object({
				text: z.string(),
				options: z.array(
					z.object({
						text: z.string(),
						isCorrect: z.boolean(),
					}),
				),
			}),
		),
	})
	.openapi("CreateQuizRequest", {
		description: "Schema for creating a new quiz",
		example: {
			passMark: 50,
			timeLimitMs: 60000,
			topicId: 1,
			questions: [
				{
					text: "What is the capital of France?",
					options: [
						{ text: "London", isCorrect: false },
						{ text: "Paris", isCorrect: true },
						{ text: "Berlin", isCorrect: false },
						{ text: "Rome", isCorrect: false },
					],
				},
			],
		},
	});
