import { StatusCodes } from "http-status-codes";
import request from "supertest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { generateToken } from "@/common/utils/jwt";
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
	describe("GET /users/me", () => {
		it("returns 401 when the authorization header is missing", async () => {
			const response = await request(app).get(usersMeEndpoint);

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 401 when the bearer token is invalid", async () => {
			const response = await request(app).get(usersMeEndpoint).set("Authorization", "Bearer invalid-token");

			expectUnauthorizedResponse(response, "Invalid or expired token");
		});
	});

	describe("DELETE /users/:id", () => {
		it("returns 400 for invalid ID format when authenticated", async () => {
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
	});
});
