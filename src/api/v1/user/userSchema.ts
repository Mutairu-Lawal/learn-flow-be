import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Role } from "@prisma/client";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
	id: z.number(),
	username: z.string(),
	email: z.string().email(),
	role: z.nativeEnum(Role),
	emailVerifiedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export const UserResponseObjectSchema = z.object({
	data: UserSchema,
});

export type UserPayload = {
	userId: number;
	role: Role;
};
