import { StatusCodes } from "http-status-codes";
import request from "supertest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { hashPassword } from "@/common/utils/bcrypt";
import { env } from "@/common/utils/envConfig";
import { generateToken } from "@/common/utils/jwt";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";

const usersMeEndpoint = `${env.API_PREFIX}/users/me`;
const userByIdEndpoint = (id: string | number) => `${env.API_PREFIX}/users/${id}`;

const expectUnauthorizedResponse = (response: request.Response, expectedMessage: string) => {
	const result = response.body as ServiceResponse;

	expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
	expect(result.success).toBeFalsy();
	expect(result.message).toContain(expectedMessage);
	expect(result.responseObject).toBeNull();
};

describe("User API Endpoints", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});
	describe("GET /users/me", () => {
		it("returns 401 when the authorization header is missing", async () => {
			const response = await request(app).get(usersMeEndpoint);

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 401 when the bearer token is invalid", async () => {
			const response = await request(app).get(usersMeEndpoint).set("Authorization", "Bearer invalid-token");

			expectUnauthorizedResponse(response, "Invalid or expired token");
		});

		it("returns user details when the bearer token is valid", async () => {
			// create helper for this
			const user = await prisma.user.create({
				data: {
					email: "randomEmail@xample.com",
					passwordHash: await hashPassword("10stringPassword"),
					username: "dummyUser",
				},
			});
			const token = generateToken({ role: user.role, userId: user.id });
			const response = await request(app).get(usersMeEndpoint).set("Authorization", `Bearer ${token}`);
			const result = response.body as ServiceResponse;

			expect(response.statusCode).toBe(StatusCodes.OK);
			expect(result.responseObject).toHaveProperty(
				"data",
				expect.objectContaining({
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				}),
			);
		});
	});

	describe("DELETE /users/:id", () => {
		it("returns 400 for invalid ID format", async () => {
			const validAdminToken = generateToken({ userId: 1, role: "ADMIN" });
			const response = await request(app)
				.delete(userByIdEndpoint("abc"))
				.set("Authorization", `Bearer ${validAdminToken}`);

			const result = response.body as ServiceResponse;

			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(result.success).toBeFalsy();
			expect(result.message).toContain("Invalid input");
			expect(result.responseObject).toBeNull();
		});

		it("returns 401 when the authorization header is missing", async () => {
			const response = await request(app).delete(userByIdEndpoint("401"));

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 403 when the bearer token isn't valid admin token", async () => {
			const token = generateToken({ role: "USER", userId: 419 });
			const response = await request(app).delete(userByIdEndpoint("403")).set("Authorization", `Bearer ${token}`);

			const result = response.body as ServiceResponse;

			expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
			expect(result.success).toBeFalsy();
			expect(result.message).toContain("You do not have permission to access this resource");
			expect(result.responseObject).toBeNull();
		});

		it("returns 204 for when all details are valid", async () => {
			const validAdminToken = generateToken({ userId: 1, role: "ADMIN" });

			const user = await prisma.user.create({
				data: {
					email: "randomEmailDelete@xample.com",
					passwordHash: await hashPassword("10stringPassword"),
					username: "dummyUserDelete",
				},
			});

			const response = await request(app)
				.delete(userByIdEndpoint(user.id))
				.set("Authorization", `Bearer ${validAdminToken}`);

			expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
		});
	});
});
