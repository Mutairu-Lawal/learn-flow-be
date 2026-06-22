import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { userRepository } from "./userRepository";

export class UserService {
	findById = async (id: number) => {
		try {
			const user = await userRepository.findByID(id);

			if (!user || user.deletedAt) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("User found", { data: user }, StatusCodes.OK);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error getting user ${id}:`, error.message);
			}
			return ServiceResponse.failure(
				"An error occurred while retrieving user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	};

	deleteById = async (id: number) => {
		try {
			const user = await userRepository.findByID(id);

			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const deletedUser = await userRepository.softDelete(id);

			return ServiceResponse.success("User deleted successfully", { data: deletedUser }, StatusCodes.NO_CONTENT);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error deleting user ${id}:`, error.message);
			}
			return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}

export const userService = new UserService();
