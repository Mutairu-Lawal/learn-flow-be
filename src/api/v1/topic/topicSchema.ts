import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const TopicSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
	_count: z.object({ quizzes: z.number() }),
});

export const TopicsResponseObjectSchema = z.object({
	data: z.array(TopicSchema),
});

export const CreateTopicSchema = z
	.object({
		name: z.string().trim().min(3).max(100).toLowerCase(),
		description: z.string().trim().max(500).optional(),
	})
	.openapi("CreateTopicRequest");

export const UpdateTopicSchema = z
	.object({
		name: z.string().trim().min(3).max(100).optional(),
		description: z.string().trim().max(500).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, "At least one field must be provided")
	.openapi("UpdateTopicRequest");

export const TopicObjectSchema = z.object({
	data: TopicSchema,
});

// Type definitions

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
