import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { getAdminToken } from "@/__tests__/helpers/auth.helper";
import { clearQuizzesWithChildren, populateQuizzes } from "@/__tests__/helpers/quiz.helper";
import { populateTopic, populateTopics } from "@/__tests__/helpers/topic.helpers";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import { QUIZ_MESSAGES, quizEndpoint } from "../quizRouter";
import type { Quiz } from "../quizSchema";

describe("Quiz API Endpoints", () => {
	describe("GET /quizzes", () => {
		it("should return 200 and with empty array", async () => {
			await clearQuizzesWithChildren();

			const response = await request(app).get(quizEndpoint);

			const body = response.body as ServiceResponse<{ data: [] }>;

			expect(response.status).toBe(StatusCodes.OK);

			expect(body.success).toBe(true);
			expect(body.message).toBe(QUIZ_MESSAGES.RETRIEVED);
			expect(body.statusCode).toBe(StatusCodes.OK);

			expect(body.responseObject.data).toEqual(expect.any(Array));
			expect(body.responseObject.data.length).toBe(0);
		});

		it("should return 200 and with all quizzes", async () => {
			const totalTopics = 10;

			await populateTopics(totalTopics);

			const response = await request(app).get(quizEndpoint);

			const body = response.body as ServiceResponse<{ data: Quiz[] }>;

			expect(response.status).toBe(StatusCodes.OK);

			expect(body.success).toBe(true);
			expect(body.message).toBe(QUIZ_MESSAGES.RETRIEVED);
			expect(body.statusCode).toBe(StatusCodes.OK);

			expect(body.responseObject.data).toEqual(expect.any(Array));
		});
	});

	describe.skip("GET /quizzes/slug", () => {
		it("should return 200 and a single quiz", async () => {
			const totalQuestions = 10;

			const { slug, id } = await populateTopic();

			await populateQuizzes(id, totalQuestions);

			const response = await request(app)
				.get(`${quizEndpoint}/${slug}`)
				.set("Authorization", `Bearer ${await getAdminToken()}`);

			expect(response.status).toBe(StatusCodes.OK);

			const responseBody = response.body as ServiceResponse<{ data: Quiz[] }>;

			expect(responseBody.success).toBe(true);
			expect(responseBody.message).toBe(QUIZ_MESSAGES.RETRIEVED);
			expect(responseBody.responseObject.data.at(0)?.questions.length).toBe(totalQuestions);
		});

		it("should return 404 when quiz does not exist", async () => {
			const response = await request(app)
				.get(`${quizEndpoint}/slug-unknown`)
				.set("Authorization", `Bearer ${await getAdminToken()}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.success).toBe(false);
		});
	});

	// describe("POST /quizzes", () => {
	// 	it("should return 201 and create a valid quiz", async () => {
	// 		const topic = await populateTopic();

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		const response = await request(app)
	// 			.post(quizEndpoint)
	// 			.set("Authorization", `Bearer ${await getAdminToken()}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.CREATED);

	// 		expect(response.body).toMatchObject({
	// 			success: true,
	// 			message: QUIZ_MESSAGES.CREATED,
	// 			statusCode: StatusCodes.CREATED,
	// 		});

	// 		const quiz = response.body.responseObject.data;

	// 		expect(quiz.id).toEqual(expect.any(Number));
	// 		expect(quiz.questions.length).toBe(payload.questions.length);

	// 		for (const question of quiz.questions) {
	// 			expect(question.options.length).toBeGreaterThanOrEqual(2);
	// 		}
	// 	});

	// 	it("should return 404 when topic does not exist", async () => {
	// 		const payload = createValidQuizPayload({
	// 			topicId: 999999,
	// 		});

	// 		const response = await request(app)
	// 			.post(quizzesEndpoint)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.NOT_FOUND);

	// 		expect(response.body).toMatchObject({
	// 			success: false,
	// 			message: QUIZ_MESSAGES.TOPIC_NOT_FOUND,
	// 		});
	// 	});

	// 	it("should return 400 when a question has no correct option", async () => {
	// 		const topic = await populateTopic();

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		payload.questions[0].options.forEach((option) => {
	// 			option.isCorrect = false;
	// 		});

	// 		const response = await request(app)
	// 			.post(quizzesEndpoint)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.BAD_REQUEST);

	// 		expect(response.body.success).toBe(false);
	// 	});

	// 	it("should return 400 when a question has multiple correct options", async () => {
	// 		const topic = await populateTopic();

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		payload.questions[0].options[0].isCorrect = true;
	// 		payload.questions[0].options[1].isCorrect = true;

	// 		const response = await request(app)
	// 			.post(quizzesEndpoint)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.BAD_REQUEST);

	// 		expect(response.body.success).toBe(false);
	// 	});

	// 	it("should return 404 when topic has been soft deleted", async () => {
	// 		const topic = await populateTopic();

	// 		await softDeleteTopic(topic.id);

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		const response = await request(app)
	// 			.post(quizzesEndpoint)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.NOT_FOUND);

	// 		expect(response.body.success).toBe(false);
	// 	});

	// 	it("should return 401 when user is not authenticated", async () => {
	// 		const topic = await populateTopic();

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		const response = await request(app).post(quizzesEndpoint).send(payload);

	// 		expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
	// 	});

	// 	it("should return 403 when authenticated user is not an admin", async () => {
	// 		const topic = await populateTopic();

	// 		const payload = createValidQuizPayload({
	// 			topicId: topic.id,
	// 		});

	// 		const response = await request(app)
	// 			.post(quizzesEndpoint)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.send(payload);

	// 		expect(response.status).toBe(StatusCodes.FORBIDDEN);
	// 	});
	// });
});
