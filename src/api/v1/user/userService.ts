import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { hashPassword } from "@/common/utils/bcrypt";
import { commonValidations } from "@/common/utils/commonValidation";
import { prisma } from "@/lib/prisma";
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

	deleteById = async (id: string) => {
		try {
			// Validate ID
			const parsed = commonValidations.id.safeParse(id);
			if (!parsed.success) {
				return ServiceResponse.failure("Invalid ID", null, StatusCodes.BAD_REQUEST);
			}
			const parsedId = parsed.data;

			const user = await userRepository.findByID(parsedId);

			if (!user || user.deletedAt) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const deletedUser = await userRepository.softDelete(parsedId);

			return ServiceResponse.success("User deleted successfully", { data: deletedUser }, StatusCodes.NO_CONTENT);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error deleting user ${id}:`, error.message);
			}
			return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	static generateRandomUser = () => ({
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		username: faker.internet.username(),
		email: faker.internet.email(),
		password: "securePassword123!",
	});

	static createUser = async (role: Role = Role.USER) => {
		const { username, email, password } = UserService.generateRandomUser();

		const user = await prisma.user.create({
			data: {
				username,
				email,
				passwordHash: await hashPassword(password),
				role,
			},
		});

		return { ...user, password };
	};
}

export const userService = new UserService();
