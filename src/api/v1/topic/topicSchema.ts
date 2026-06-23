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
		name: z.string().min(1),
		description: z.string().optional(),
	})
	.openapi("CreateTopicRequest", { description: "Schema for creating a topic" });

export const UpdateTopicSchema = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
	})
	.openapi("UpdateTopicRequest", { description: "Schema for updating a topic" });

export const TopicObjectSchema = z.object({
	data: TopicSchema,
});

// Type definitions

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
