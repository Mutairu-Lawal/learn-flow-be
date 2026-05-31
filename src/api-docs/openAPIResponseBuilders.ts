import { StatusCodes } from "http-status-codes";
import type { ZodTypeAny, z } from "zod";

import { ServiceResponseSchema } from "@/common/models/serviceResponse";

export function createApiResponse(schema: z.ZodTypeAny, description: string, statusCode = StatusCodes.OK) {
	return {
		[statusCode]: {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema),
				},
			},
		},
	};
}

export const createRequestBody = (schema: ZodTypeAny, contentType = "application/json", required = true) => ({
	body: {
		required,
		content: {
			[contentType]: {
				schema,
			},
		},
	},
});
