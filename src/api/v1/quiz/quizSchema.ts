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
	sessionToken: z.string(),
	data: z.array(QuizSchema),
});

const QuestionOptionInputSchema = z.object({
	text: z.string().trim().min(1),
	isCorrect: z.boolean().optional().default(false),
});

const QuestionInputSchema = z.object({
	text: z.string().trim().min(1),
	options: z.array(QuestionOptionInputSchema).min(2, "A question must have at least two options"),
});

export const CreateQuizSchema = z
	.object({
		timeLimitMs: z.number().min(60_000),
		passMark: z.number().min(0).max(100),
		topicId: z.number().positive(),

		questions: z.array(QuestionInputSchema).min(1),
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

export const SubmissionSchema = z
	.object({
		sessionToken: z.string(),
		startedAt: z.string(),
		finishedAt: z.string(),
		answers: z.record(z.any()),
	})
	.openapi("Submission", {
		example: {
			sessionToken: "string",
			startedAt: new Date().toISOString(),
			finishedAt: new Date(Date.now() + 120_000).toISOString(),
			answers: {
				question1: "optionId",
				question2: "optionId",
			},
		},
	});

const FormattedResultQuestionSchema = z.object({
	id: z.number(),
	text: z.string(),
	options: z.array(
		z.object({
			id: z.number(),
			text: z.string(),
			isCorrect: z.boolean(),
		}),
	),
});

export const ResultSchema = z.object({
	data: z.object({
		topicName: z.string(),
		correct: z.number(),
		incorrect: z.number(),
		unattempted: z.number(),
		totalQuestions: z.number(),
		score: z.number(),
		passed: z.boolean(),
		userAnswers: z.record(z.any()),
		questions: z.array(FormattedResultQuestionSchema),
	}),
});

export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizSubmission = z.infer<typeof SubmissionSchema>;
