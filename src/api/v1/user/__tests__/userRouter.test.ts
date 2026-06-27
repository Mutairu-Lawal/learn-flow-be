import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { populateUser } from "@/__tests__/helpers/auth.helper";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { generateToken } from "@/common/utils/jwt";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";
import { usersEndpoint } from "../userRouter";
import { USER_MESSAGES } from "../userService";

describe("User API Endpoints", () => {
	const expectUnauthorizedResponse = (response: request.Response, message: string) => {
		const result = response.body as ServiceResponse;

		expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
		expect(result.success).toBe(false);
		expect(result.message).toContain(message);
		expect(result.responseObject).toBeNull();
	};

	const me = `${usersEndpoint}/me`;

	describe("GET /users/me", () => {
		it("returns 401 when authorization header is missing", async () => {
			const response = await request(app).get(me);

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 401 when token is invalid", async () => {
			const response = await request(app).get(me).set("Authorization", "Bearer invalid-token");

			expectUnauthorizedResponse(response, "Invalid or expired token");
		});

		it("returns 404 when token belongs to non-existent user", async () => {
			const token = generateToken({
				userId: 999999,
				role: Role.USER,
			});

			const response = await request(app).get(me).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.message).toContain(USER_MESSAGES.USER_NOT_FOUND);
		});

		it("returns 200 and authenticated user details", async () => {
			const { id, username, email, role } = await populateUser();

			const token = generateToken({
				userId: id,
				role,
			});

			const response = await request(app).get(me).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.OK);

			expect(response.body).toMatchObject({
				success: true,
				responseObject: {
					data: {
						id,
						username,
						email,
						role,
					},
				},
			});
		});
	});

	describe("DELETE /users/:id", () => {
		it("returns 400 for invalid id format", async () => {
			const { id, role } = await populateUser(Role.ADMIN);

			const token = generateToken({
				userId: id,
				role,
			});

			const response = await request(app).delete(`${usersEndpoint}/invalid-id`).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.message).toContain("Invalid input");
		});

		it("returns 401 when authorization header is missing", async () => {
			const response = await request(app).delete(`${usersEndpoint}/2026`);

			expectUnauthorizedResponse(response, "Authorization header missing");
		});

		it("returns 403 when authenticated user is not admin", async () => {
			const { id, role } = await populateUser();

			const token = generateToken({
				userId: id,
				role,
			});

			const response = await request(app).delete(`${usersEndpoint}/2026`).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.FORBIDDEN);
			expect(response.body.message).toContain("You do not have permission");
		});

		it("returns 404 when target user does not exist", async () => {
			const admin = await populateUser("ADMIN");

			const token = generateToken({
				userId: admin.id,
				role: admin.role,
			});

			const response = await request(app).delete(`${usersEndpoint}/999999`).set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.message).toContain(USER_MESSAGES.USER_NOT_FOUND);
		});

		it("returns 204 and deletes user successfully", async () => {
			const admin = await populateUser("ADMIN");

			const targetUser = await populateUser("USER");

			const token = generateToken({
				userId: admin.id,
				role: admin.role,
			});

			const response = await request(app)
				.delete(`${usersEndpoint}/${targetUser.id}`)
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
