import { StatusCodes } from "http-status-codes";
import z from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { comparePassword, hashPassword } from "@/common/utils/bcrypt";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { generateToken } from "@/common/utils/jwt";
import { authRepository } from "./authRepository";
import type { ForgotPasswordData, LoginData, UserData } from "./authSchema";

export const AUTH_MESSAGES = {
	USER_CREATED: "User created successfully",
	USER_FAILED: "Unable to create user",
	INVALID_CREDENTIALS: "Invalid credentials",
	USER_EXISTS: "User already exists",
	LOGIN_SUCCESS: "User authenticated successfully",
	PASSWORD_RESET_SUCCESS: "Password reset requested successfully",
	INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export class AuthService {
	createUser = async (userData: UserData) => {
		try {
			const { username, email, password } = userData;

			const [existingUsername, existingEmail] = await Promise.all([
				authRepository.findByUsername(username),
				authRepository.findByEmail(email),
			]);

			if (existingUsername || existingEmail) {
				return ServiceResponse.failure(
					AUTH_MESSAGES.USER_EXISTS,
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

			return ServiceResponse.success(
				AUTH_MESSAGES.USER_CREATED,
				{
					data: user,
				},
				StatusCodes.CREATED,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, AUTH_MESSAGES.USER_CREATED);
		}
	};

	authenticateUser = async (userData: LoginData) => {
		try {
			const { identifier, password } = userData;

			const isEmail = z.string().email().trim().safeParse(identifier).success;

			const existingUser = isEmail
				? await authRepository.findByEmail(identifier)
				: await authRepository.findByUsername(identifier);

			if (!existingUser) {
				return ServiceResponse.failure(AUTH_MESSAGES.INVALID_CREDENTIALS, null, StatusCodes.UNAUTHORIZED);
			}

			const isPasswordValid = await comparePassword(password, existingUser.passwordHash);

			if (!isPasswordValid) {
				return ServiceResponse.failure(AUTH_MESSAGES.INVALID_CREDENTIALS, null, StatusCodes.UNAUTHORIZED);
			}

			const token = generateToken({
				userId: existingUser.id,
				role: existingUser.role,
			});

			return ServiceResponse.success(
				AUTH_MESSAGES.LOGIN_SUCCESS,
				{
					data: {
						token,
						user: {
							username: existingUser.username,
							email: existingUser.email,
							role: existingUser.role,
						},
					},
				},
				StatusCodes.OK,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, AUTH_MESSAGES.LOGIN_SUCCESS);
		}
	};

	requestPasswordReset = async (data: ForgotPasswordData) => {
		try {
			await authRepository.findByEmail(data.email);

			return ServiceResponse.success(AUTH_MESSAGES.PASSWORD_RESET_SUCCESS, null, StatusCodes.OK);
		} catch (error) {
			return ErrorServiceHandler.handle(error, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
		}
	};
}

export const authService = new AuthService();
