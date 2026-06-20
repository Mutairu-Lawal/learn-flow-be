import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { QuizSchema } from "../quiz/quizSchema";

extendZodWithOpenApi(z);

export const TopicSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	quizzes: z.array(QuizSchema),
	description: z.string().nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const TopicResponseObjectSchema = z.object({
	data: z.array(TopicSchema),
});
