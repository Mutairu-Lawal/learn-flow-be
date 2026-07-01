import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export const ErrorServiceHandler = {
	handle(error: unknown, operation: string, defaultMessage = "An unexpected error occurred") {
		// Log with context
		logger.error({ error }, `Error during ${operation}`);

		// If it's already a ServiceResponse (custom error thrown intentionally), return it
		if (error instanceof ServiceResponse) {
			return error;
		}

		// If it's a known validation error (e.g., Zod or Prisma)
		if (error instanceof Error) {
			const message = error.message.toLowerCase();

			if (message.includes("not found")) {
				return ServiceResponse.failure("Resource not found", null, StatusCodes.NOT_FOUND);
			}

			if (message.includes("invalid") || message.includes("validation")) {
				return ServiceResponse.failure("Invalid request data", { error: error.message }, StatusCodes.BAD_REQUEST);
			}
		}

		// Default: server error
		return ServiceResponse.failure(defaultMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
	},
};
