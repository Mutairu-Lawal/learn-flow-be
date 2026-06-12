import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Role } from "@prisma/client";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
	id: z.number(),
	username: z.string(),
	email: z.string().email(),
	role: z.enum([Role.USER, Role.ADMIN]),
	email_verified_at: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const UserParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const UserResponseObjectSchema = z.object({
	user: UserSchema,
});
