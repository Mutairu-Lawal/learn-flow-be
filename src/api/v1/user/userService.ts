import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { userRepository } from "./userRepository";
import type { UserPayload } from "./userSchema";

export const USER_MESSAGES = {
	USER_FOUND: "User retrieved successfully",
	USER_DELETED: "User deleted successfully",
	USER_NOT_FOUND: "User not found",
	USER_ALREADY_EXISTS: "User already exists",
	INVALID_ID: "Invalid user ID",
	INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export class UserService {
	async getUser(payload: UserPayload) {
		try {
			const { userId } = payload;

			const user = await userRepository.findById(userId);

			if (!user || user.deletedAt) {
				return ServiceResponse.failure(USER_MESSAGES.USER_NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success(
				USER_MESSAGES.USER_FOUND,
				{
					data: user,
				},
				StatusCodes.OK,
			);
		} catch (error) {
			ErrorServiceHandler.handle(error, "get user", "Unable to get user");
		}
	}

	async deleteById(id: string) {
		try {
			const userId = Number(id);

			const user = await userRepository.findById(userId);

			if (!user || user.deletedAt) {
				return ServiceResponse.failure(USER_MESSAGES.USER_NOT_FOUND, { user: userId }, StatusCodes.NOT_FOUND);
			}

			await userRepository.softDelete(userId);

			return ServiceResponse.success(USER_MESSAGES.USER_DELETED, null, StatusCodes.NO_CONTENT);
		} catch (error) {
			ErrorServiceHandler.handle(error, "delete user", "Unable to delete user");
		}
	}
}

export const userService = new UserService();
