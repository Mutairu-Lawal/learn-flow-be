import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { z } from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { comparePassword, hashPassword } from "@/common/utils/bcrypt";
import { generateToken } from "@/common/utils/jwt";
import { authRepository } from "./authRepository";

type UserData = {
	username: string;
	email: string;
	password: string;
};

type LoginData = {
	identifier: string;
	password: string;
};

export class AuthService {
	createUser = async (userData: UserData) => {
		try {
			const { username, email, password } = userData;

			const existingUser = await authRepository.findByEmailOrUsername(email, username);

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

	authenticateUser = async (userData: LoginData) => {
		try {
			const { identifier, password } = userData;

			const isEmail = z.string().email().safeParse(identifier).success;

			const existingUser = isEmail
				? await authRepository.findByEmail(identifier)
				: await authRepository.findByUsername(identifier);

			if (!existingUser) {
				return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
			}

			const isMatching = await comparePassword(password, existingUser.password_hash);

			if (!isMatching) {
				return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
			}

			const token = generateToken({
				userId: existingUser.id,
				role: existingUser.role,
			});

			return ServiceResponse.success("User authenticated successfully", { token }, StatusCodes.OK);
		} catch (error) {
			return ServiceResponse.failure(
				"User authentication failed",
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	};
}

export const authService = new AuthService();
