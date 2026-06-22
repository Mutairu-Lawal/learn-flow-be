import type { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { comparePassword, hashPassword } from "@/common/utils/bcrypt";
import { generateToken } from "@/common/utils/jwt";
import { authRepository } from "./authRepository";
import type { ForgotPasswordData, LoginData, UserData } from "./authSchema";

export class AuthService {
	createUser = async (userData: UserData) => {
		try {
			const { username, email, password } = userData;

			const existingUsername = await authRepository.findByUsername(username);
			const existingEmail = await authRepository.findByEmail(email);

			if (existingEmail || existingUsername) {
				return ServiceResponse.failure(
					"User details already exists",
					{ email: !!existingEmail, username: !!existingUsername },
					StatusCodes.BAD_REQUEST,
				);
			}

			const hashedPassword = await hashPassword(password);

			const user = await authRepository.create({
				username,
				email,
				hashedPassword,
			});

			return ServiceResponse.success("User created successfully", { data: user }, StatusCodes.CREATED);
		} catch (error) {
			if (error instanceof Error) {
				console.error("User creation error:", error.message);
			}
			return ServiceResponse.failure("User creation failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
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

			const isMatching = await comparePassword(password, existingUser.passwordHash);

			if (!isMatching) {
				return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
			}

			const token = generateToken({
				userId: existingUser.id,
				role: existingUser.role,
			});

			const userResponse = {
				username: existingUser.username,
				email: existingUser.email,
				role: existingUser.role,
			};

			const responseData = {
				token,
				user: userResponse,
			};

			return ServiceResponse.success("User authenticated successfully", { data: responseData }, StatusCodes.OK);
		} catch (error) {
			if (error instanceof Error) {
				console.error("Authentication error:", error.message);
			}
			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	requestPasswordReset = async (data: ForgotPasswordData) => {
		try {
			const { email } = data;
			const existingUser = await authRepository.findByEmail(email);

			if (!existingUser) {
				return ServiceResponse.failure("Password reset requested successfully", null, StatusCodes.OK);
			}

			// Here you would typically generate a password reset token and send an email
			// For simplicity, we'll just return a success message

			return ServiceResponse.success("Password reset requested successfully", null, StatusCodes.OK);
		} catch (error) {
			if (error instanceof Error) {
				console.error("Password reset request error:", error.message);
			}
			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	static createToken = (user: { id: number; role: Role }) =>
		generateToken({
			userId: user.id,
			role: user.role,
		});
}

export const authService = new AuthService();
