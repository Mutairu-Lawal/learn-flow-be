import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { hashPassword } from "@/common/utils/bcrypt";

export class AuthService {
	// Dependency injection of the AuthRepository
	// check if user already exists, hashpassword, save to database. Return a ServiceResponse with the created user or an error message.
	createUser = async (username: string, email: string, password: string) => {
		try {
			const hashedPassword = await hashPassword(password);

			// const user = await this.authRepository.create({
			// 	username,
			// 	email,
			// 	password_hash: hashedPassword,
			// });

			return ServiceResponse.success(
				"User created successfully",
				{ username, email, hashedPassword },
				StatusCodes.CREATED,
			);
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
