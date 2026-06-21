import { StatusCodes } from "http-status-codes";
import request from "supertest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { app } from "@/server";

const topicsEndpoint = `${env.API_PREFIX}/topics`;

describe.skip("Topic API Endpoints", () => {
	describe("GET /topics", () => {
		it("returns all topics ", async () => {
			const response = await request(app).get(topicsEndpoint);
			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject).toHaveProperty("topics", expect.any(Array));
		});
	});
});
