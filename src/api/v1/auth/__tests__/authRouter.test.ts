import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";

const validSignupUser = {
	username: "testuser",
	email: "test@example.com",
	password: "Password123!",
};

const loginPayload = {
	identifier: "testuser",
	password: "Password123!",
};

describe("Auth Routes", () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
		vi.restoreAllMocks();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe(`POST ${env.API_PREFIX}/auth/signup`, () => {
		it("should create a new user", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/signup`).send(validSignupUser);
			const responseBody = res.body as ServiceResponse;

			expect(res.status).toBe(StatusCodes.CREATED);
			expect(res.body).toStrictEqual({
				success: true,
				message: "User created successfully",
				responseObject: {
					data: {
						id: expect.any(Number),
						username: validSignupUser.username,
						email: validSignupUser.email,
						createdAt: expect.any(String),
						updatedAt: expect.any(String),
						deletedAt: null,
						emailVerifiedAt: null,
						role: Role.USER,
					},
				},
				statusCode: StatusCodes.CREATED,
			});
			expect(responseBody.responseObject).toHaveProperty("data");
		});

		it("should fail if email/ username or both already exists", async () => {
			await request(app).post(`${env.API_PREFIX}/auth/signup`).send(validSignupUser);

			const testCases = [
				{
					register: {
						username: "anotheruser",
						email: validSignupUser.email,
						password: "Password123!",
					},
					expectedResponse: { email: true, username: false },
				},
				{
					register: {
						username: validSignupUser.username,
						email: "new@example.com",
						password: "Password123!",
					},
					expectedResponse: { email: false, username: true },
				},
				{
					register: {
						username: validSignupUser.username,
						email: validSignupUser.email,
						password: "Password123!",
					},
					expectedResponse: { email: true, username: true },
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
				username: "testuser",
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
			expect(
				["username", "email", "password", "Invalid input"].every((field) => res.body.message.includes(field)),
			).toBe(true);
		});
	});

	describe(`POST ${env.API_PREFIX}/auth/login`, () => {
		beforeEach(async () => {
			await request(app).post(`${env.API_PREFIX}/auth/signup`).send(validSignupUser);
		});

		it("should login user with email", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: loginPayload.identifier,
				password: validSignupUser.password,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.success).toBe(true);
			expect(res.body.responseObject).toStrictEqual({
				data: {
					token: expect.any(String),
					user: {
						username: validSignupUser.username,
						email: validSignupUser.email,
						role: Role.USER,
					},
				},
			});
		});

		it("should login user with username", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: validSignupUser.username,
				password: validSignupUser.password,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.success).toBe(true);
			expect(res.body.responseObject.data).toHaveProperty("token");
		});

		it("should fail with wrong password", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: validSignupUser.email,
				password: "WrongPassword",
			});

			expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid credentials");
		});

		it("should fail with unknown user credentials", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: "unknown@example.com",
				password: "Password123!",
			});

			expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid credentials");
		});

		it("should fail when required login fields are missing", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: validSignupUser.email,
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});

		it("should fail with invalid login payload", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/login`).send({
				identifier: "bad email",
				password: "short",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});
	});

	describe(`POST ${env.API_PREFIX}/auth/forgot-password`, () => {
		it("should request password reset for all valid emails", async () => {
			const res = await request(app).post(`${env.API_PREFIX}/auth/forgot-password`).send({
				email: validSignupUser.email,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.responseObject).toBeNull();
			expect(res.body.message).toContain("Password reset requested successfully");
		});
	});
});
