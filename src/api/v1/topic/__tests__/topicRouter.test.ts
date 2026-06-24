import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { getToken } from "@/__tests__/helpers/auth.helper";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { app } from "@/server";

const topicsEndpoint = `${env.API_PREFIX}/topics`;

describe("Topic API Endpoints", () => {
	describe("GET /topics", () => {
		it("should return all topics", async () => {
			const response = await request(app).get(topicsEndpoint);

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject).toHaveProperty("data", expect.any(Array));
		});
	});

	describe("POST /topics", () => {
		it("should return unauthorized when token is missing", async () => {
			const response = await request(app).post(topicsEndpoint).send({
				name: "NodeJS",
			});

			expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
		});

		it("should return bad request when payload is invalid", async () => {
			const response = await request(app).post(topicsEndpoint).set("Authorization", "Bearer invalid-token").send({
				name: "",
			});

			expect([StatusCodes.BAD_REQUEST, StatusCodes.UNAUTHORIZED]).toContain(response.status);
		});

		it("should create a topic", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app).post(topicsEndpoint).set("Authorization", `Bearer ${adminToken}`).send({
				name: "NodeJS",
				description: "Backend runtime",
			});

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.CREATED);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject).toHaveProperty("data");
		});

		it.skip("should reject duplicate topic creation", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app).post(topicsEndpoint).set("Authorization", `Bearer ${adminToken}`).send({
				name: "NodeJS",
			});

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		});
	});

	describe("PUT /topics/:id", () => {
		it("should return bad request for invalid id", async () => {
			const response = await request(app).put(`${topicsEndpoint}/invalid-id`).send({
				name: "Updated Topic",
			});

			expect([StatusCodes.BAD_REQUEST, StatusCodes.UNAUTHORIZED]).toContain(response.status);
		});

		it.skip("should update an existing topic", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app).put(`${topicsEndpoint}/1`).set("Authorization", `Bearer ${adminToken}`).send({
				name: "Updated Topic",
			});

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
		});

		it("should return not found when topic does not exist", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app)
				.put(`${topicsEndpoint}/999999`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					name: "Updated Topic",
				});

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
		});

		it("should reject empty update payload", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app)
				.put(`${topicsEndpoint}/1`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({});

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		});
	});

	describe("DELETE /topics/:id", () => {
		it("should return bad request for invalid id", async () => {
			const response = await request(app).delete(`${topicsEndpoint}/invalid-id`);

			expect([StatusCodes.BAD_REQUEST, StatusCodes.UNAUTHORIZED]).toContain(response.status);
		});

		it.skip("should delete an existing topic", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app).delete(`${topicsEndpoint}/1`).set("Authorization", `Bearer ${adminToken}`);

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
		});

		it("should return not found when topic does not exist", async () => {
			const adminToken = await getToken(Role.ADMIN);

			const response = await request(app)
				.delete(`${topicsEndpoint}/999999`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
		});
	});
});
