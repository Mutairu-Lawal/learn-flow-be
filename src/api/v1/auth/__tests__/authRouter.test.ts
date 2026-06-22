import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

import { UserService } from "@/api/v1/user/userService";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { hashPassword } from "@/common/utils/bcrypt";
import { env } from "@/common/utils/envConfig";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";

describe("Auth Routes", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
		vi.restoreAllMocks();
	});

	describe(`POST ${env.API_PREFIX}/auth/signup`, () => {
		it("should create a new user", async () => {
			const { email, username, password } = UserService.generateRandomUser();

			const res = await request(app).post(`${env.API_PREFIX}/auth/signup`).send({ email, password, username });

			expect(res.status).toBe(StatusCodes.CREATED);

			expect(res.body).toMatchObject({
				success: true,
				message: "User created successfully",
				responseObject: {
					data: {
						id: expect.any(Number),
						username,
						email,
						role: Role.USER,
						createdAt: expect.any(String),
						updatedAt: expect.any(String),
						deletedAt: null,
						emailVerifiedAt: null,
					},
				},
				statusCode: StatusCodes.CREATED,
			});
		});

		it("should fail if email, username or both already exist", async () => {
			const { email, username, password } = UserService.generateRandomUser();

			await prisma.user.create({
				data: {
					username,
					email,
					passwordHash: await hashPassword(password),
				},
			});

			const testCases = [
				{
					register: {
						username: "newusername",
						email,
						password: "Password123!",
					},
					expectedResponse: {
						email: true,
						username: false,
					},
				},
				{
					register: {
						username,
						email: "new@example.com",
						password: "Password123!",
					},
					expectedResponse: {
						email: false,
						username: true,
					},
				},
				{
					register: {
						username,
						email,
						password: "Password123!",
					},
					expectedResponse: {
						email: true,
						username: true,
					},
				},
			];

			for (const { register, expectedResponse } of testCases) {
				const res = await request(app).post(`${env.API_PREFIX}/auth/signup`).send(register);

				expect(res.status).toBe(StatusCodes.BAD_REQUEST);
				expect(res.body.success).toBe(false);
				expect(res.body.message).toContain("exists");
				expect(res.body.responseObject).toEqual(expectedResponse);
			}
		});

		it("should fail when required fields are missing", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/signup`).send({
				username: "nothing",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});

		it("should fail with invalid signup payload", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/signup`).send({
				username: "ab",
				email: "not-an-email",
				password: "123",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.responseObject).toBeNull();
			expect(res.body.message).toContain("Invalid input");
		});
	});

	describe(`POST ${env.API_PREFIX}/auth/login`, () => {
		const { email, username, password } = UserService.generateRandomUser();

		beforeEach(async () => {
			await prisma.user.create({
				data: {
					username,
					email,
					passwordHash: await hashPassword(password),
				},
			});
		});

		const expectInvalidCredentialsResponse = (response: request.Response) => {
			const result = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(result.success).toBe(false);
			expect(result.message).toContain("Invalid credentials");
			expect(result.responseObject).toBeNull();
		};

		it("should login user with email", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: email,
				password,
			});

			expect(res.status).toBe(StatusCodes.OK);

			expect(res.body).toMatchObject({
				success: true,
				responseObject: {
					data: {
						token: expect.any(String),
						user: {
							username,
							email,
							role: Role.USER,
						},
					},
				},
			});
		});

		it("should login user with username", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: username,
				password,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.success).toBe(true);
			expect(res.body.responseObject.data.token).toEqual(expect.any(String));
		});

		it("should fail with wrong password", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: email,
				password: "WrongPassword123!",
			});

			expectInvalidCredentialsResponse(res);
		});

		it("should fail with unknown user credentials", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: "unknown",
				password,
			});

			expectInvalidCredentialsResponse(res);
		});

		it("should fail when required login fields are missing", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: email,
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});
	});

	describe(`POST ${env.API_PREFIX}/auth/forgot-password`, () => {
		it("should request password reset for all valid emails", async () => {
			const { email } = UserService.generateRandomUser();

			const res = await request(app).post(`${env.API_PREFIX}/auth/forgot-password`).send({
				email,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.responseObject).toBeNull();
			expect(res.body.message).toContain("Password reset requested successfully");
		});
	});
});
