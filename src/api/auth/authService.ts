import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { hashPassword } from "@/common/utils/bcrypt";
import { authRepository } from "./authRepository";

type UserData = {
	username: string;
	email: string;
	password: string;
};

export class AuthService {
	createUser = async (userData: UserData) => {
		try {
			const { username, email, password } = userData;

			const existingUser = await authRepository.findByEmail(email);

			if (existingUser) {
				return ServiceResponse.failure("User already exists", null, StatusCodes.BAD_REQUEST);
			}

			const hashedPassword = await hashPassword(password);

			const user = await authRepository.create({
				username,
				email,
				hashedPassword,
			});

			return ServiceResponse.success("User created successfully", user, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				"User creation failed",
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	};

	// authenticateUser = async (username: string, password: string) => {
	// 	// In a real implementation, you would handle authentication logic here
	// 	return { username };
	// };
}

export const authService = new AuthService();
