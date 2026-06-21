import { StatusCodes } from "http-status-codes";
import request from "supertest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { app } from "@/server";

const quizzesEndpoint = `${env.API_PREFIX}/quizzes`;

describe.skip("Quiz API Endpoints", () => {
	describe("GET /quizzes", () => {
		it("returns all quiz ", async () => {
			const response = await request(app).get(quizzesEndpoint);
			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject).toHaveProperty("topics", expect.any(Array));
		});
	});
});
