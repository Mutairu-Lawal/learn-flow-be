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
	passMark: z.number().min(0).max(100),
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
		timeLimitMs: z.number().min(60_000),
		passMark: z.number().min(0).max(100),
		topicId: z.number().positive(),

		questions: z
			.array(
				z.object({
					text: z.string().trim().min(1),

					options: z
						.array(
							z.object({
								text: z.string().trim().min(1),
								isCorrect: z.boolean().optional().default(false),
							}),
						)
						.min(2, "A question must have at least 2 options"),
				}),
			)
			.min(1, "A quiz must contain at least one question"),
	})
	.superRefine((data, ctx) => {
		data.questions.forEach((question, questionIndex) => {
			const correctAnswers = question.options.filter((opt) => opt.isCorrect);

			if (correctAnswers.length !== 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Each question must have at least one correct answer",
					path: ["questions", questionIndex, "options"],
				});
			}
		});
	})
	.openapi("CreateQuizRequest", {
		description: "Schema for creating a new quiz",
	});

export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
