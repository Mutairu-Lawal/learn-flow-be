import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const TopicSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const CreateTopicSchema = z.object({
	name: z.string().trim().min(2).max(100),
	description: z.string().trim().max(500).optional(),
});

export const UpdateTopicSchema = CreateTopicSchema.partial().refine((data) => Object.keys(data).length > 0, {
	message: "At least one field must be provided",
});

export const TopicsResponseSchema = z.object({
	data: z.array(TopicSchema),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
