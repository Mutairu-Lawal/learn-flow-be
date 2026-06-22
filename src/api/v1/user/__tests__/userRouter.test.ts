import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { AuthService } from "@/api/v1/auth/authService";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { generateToken } from "@/common/utils/jwt";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";
import { UserService } from "../userService";

const usersMeEndpoint = `${env.API_PREFIX}/users/me`;
const userByIdEndpoint = (id: number) => `${env.API_PREFIX}/users/${id}`;

describe("User API Endpoints", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
		vi.restoreAllMocks();
	});

	const expectUnauthorizedResponse = (response: request.Response, message: string) => {
		const result = response.body as ServiceResponse;

		expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
		expect(result.success).toBe(false);
		expect(result.message).toContain(message);
		expect(result.responseObject).toBeNull();
	};

	describe("GET /users/me", () => {
		it("returns 401 when authorization header is missing", async () => {
			const response = await request(app).get(usersMeEndpoint);

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 401 when token is invalid", async () => {
			const response = await request(app).get(usersMeEndpoint).set("Authorization", "Bearer invalid-token");

			expectUnauthorizedResponse(response, "Invalid or expired token");
		});

		it("returns 404 when token belongs to non-existent user", async () => {
			const token = generateToken({
				userId: 999999,
				role: Role.USER,
			});

			const response = await request(app).get(usersMeEndpoint).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.message).toContain("User not found");
		});

		it("returns 200 and authenticated user details", async () => {
			const user = await UserService.createUser();

			const token = AuthService.createToken(user);

			const response = await request(app).get(usersMeEndpoint).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.OK);

			expect(response.body).toMatchObject({
				success: true,
				responseObject: {
					data: {
						id: user.id,
						username: user.username,
						email: user.email,
						role: user.role,
					},
				},
			});
		});
	});

	describe("DELETE /users/:id", () => {
		it("returns 400 for invalid id format", async () => {
			const admin = await UserService.createUser(Role.ADMIN);

			const token = AuthService.createToken(admin);

			const response = await request(app)
				.delete(`${env.API_PREFIX}/users/invalid-id`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.message).toContain("Invalid input");
		});

		it("returns 401 when authorization header is missing", async () => {
			const response = await request(app).delete(userByIdEndpoint(1));

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 403 when authenticated user is not admin", async () => {
			const user = await UserService.createUser(Role.USER);

			const token = AuthService.createToken(user);

			const response = await request(app).delete(userByIdEndpoint(1)).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.FORBIDDEN);
			expect(response.body.message).toContain("You do not have permission");
		});

		it("returns 404 when target user does not exist", async () => {
			const admin = await UserService.createUser(Role.ADMIN);

			const token = AuthService.createToken(admin);

			const response = await request(app).delete(userByIdEndpoint(999999)).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.message).toContain("User not found");
		});

		it("returns 204 and deletes user successfully", async () => {
			const admin = await UserService.createUser(Role.ADMIN);

			const targetUser = await UserService.createUser(Role.USER);

			const token = AuthService.createToken(admin);

			const response = await request(app)
				.delete(userByIdEndpoint(targetUser.id))
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.NO_CONTENT);

			const deletedUser = await prisma.user.findUnique({
				where: {
					id: targetUser.id,
				},
			});

			expect(deletedUser?.deletedAt).not.toBeNull();
		});
	});
});
