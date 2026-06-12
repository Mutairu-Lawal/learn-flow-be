import type { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { userRepository } from "./userRepository";

type SafeUser = Omit<User, "password_hash">;

export class UserService {
	findById = async (id: number) => {
		try {
			const user = (await userRepository.findByID(id)) as User | null;

			if (!user || user.deletedAt) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("User found", { user: user as SafeUser }, StatusCodes.OK);
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
			const user = (await userRepository.findByID(id)) as User | null;

			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			await userRepository.softDelete(id);

			return ServiceResponse.success("User deleted successfully", null);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error deleting user ${id}:`, error.message);
			}
			return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}

export const userService = new UserService();
