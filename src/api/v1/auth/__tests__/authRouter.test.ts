import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { createUser } from "@/__tests__/helpers/auth.helper";
import { generateRandomUser } from "@/__tests__/helpers/user.helper";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { app } from "@/server";
import { AUTH_MESSAGES } from "../authService";

const authEndpoint = `${env.API_PREFIX}/auth`;

describe("Auth Routes", () => {
	describe(`POST ${authEndpoint}/signup`, () => {
		it("returns 201 and should create a new user", async () => {
			const { email, username, password } = generateRandomUser();

			const res = await request(app).post(`${authEndpoint}/signup`).send({ email, password, username });

			expect(res.status).toBe(StatusCodes.CREATED);

			expect(res.body).toMatchObject({
				success: true,
				message: AUTH_MESSAGES.USER_CREATED,
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

		it("returns 400 and should fail if email/username or both already exist", async () => {
			const { email, username } = await createUser();

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

			const { register, expectedResponse } = faker.helpers.arrayElement(testCases);

			const res = await request(app).post(`${authEndpoint}/signup`).send(register);

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);

			expect(res.body).toEqual({
				success: false,
				message: AUTH_MESSAGES.USER_EXISTS,
				responseObject: expectedResponse,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		});

		it("returns 400 and should fail when required fields are missing", async () => {
			const res = await request(app).post(`${authEndpoint}/signup`).send({
				username: "nothing",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
			expect(res.body.responseObject).toBeNull();
		});

		it("returns 400 and should fail with invalid signup payload", async () => {
			const res = await request(app).post(`${authEndpoint}/signup`).send({
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

	describe(`POST ${authEndpoint}/login`, async () => {
		const expectInvalidCredentialsResponse = (response: request.Response) => {
			const result = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(result.success).toBe(false);
			expect(result.message).toContain("Invalid credentials");
			expect(result.responseObject).toBeNull();
		};

		it("returns 200 and token for authenticated user with email or username", async () => {
			const { email, password, username, role } = await createUser();

			const identifier = faker.helpers.arrayElement([email, username]);

			const res = await request(app).post(`${authEndpoint}/login`).send({
				identifier,
				password,
			});

			expect(res.status).toBe(StatusCodes.OK);

			expect(res.body).toEqual({
				success: true,
				message: expect.stringContaining("authenticated"),
				responseObject: {
					data: {
						token: expect.any(String),
						user: {
							username,
							email,
							role,
						},
					},
				},
				statusCode: StatusCodes.OK,
			});
		});

		it("returns 401 and should fail with invalid details", async () => {
			const { email, username } = generateRandomUser();

			const identifier = faker.helpers.arrayElement([email, username]);

			const response = await request(app).post(`${authEndpoint}/login`).send({
				identifier,
				password: "WrongPassword123!",
			});

			expectInvalidCredentialsResponse(response);
		});

		it("returns 400 and should fail when required login fields are missing", async () => {
			const { email } = await createUser();

			const res = await request(app).post(`${authEndpoint}/login`).send({
				identifier: email,
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
			expect(res.body.responseObject).toBeNull();
		});
	});

	describe(`POST ${authEndpoint}/forgot-password`, () => {
		it("returns 400 for required field and invalid emails", async () => {
			const payload = faker.helpers.arrayElement([{}, { email: "invalidEmil" }]);

			const res = await request(app).post(`${authEndpoint}/forgot-password`).send(payload);

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);

			expect(res.body).toMatchObject({
				success: false,
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});

			expect(["Invalid input: body.email: Required", "Invalid input: body.email: Invalid email"]).toContain(
				res.body.message,
			);
		});

		it("returns 200 and should request password reset for all valid emails", async () => {
			const { email } = generateRandomUser();

			const res = await request(app).post(`${authEndpoint}/forgot-password`).send({
				email,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.responseObject).toBeNull();
			expect(res.body.message).toContain("Password reset requested successfully");
		});
	});
});
