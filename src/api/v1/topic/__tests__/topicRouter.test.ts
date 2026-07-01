import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { getAdminToken } from "@/__tests__/helpers/auth.helper";
import { clearTopicsWithChildren, countTopics, populateTopic } from "@/__tests__/helpers/topic.helpers";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import { topicRepository } from "../topicRepository";
import { topicsEndpoint } from "../topicRouter";
import { TOPIC_MESSAGES } from "../topicService";

describe("Topic API Endpoints", () => {
	describe("GET /topics", () => {
		it("should return all topics with empty array", async () => {
			await clearTopicsWithChildren();

			const response = await request(app).get(topicsEndpoint);
			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject).toEqual({
				data: [],
			});
		});

		it("return 200 with array of topic data", async () => {
			const count = await countTopics();

			const response = await request(app).get(topicsEndpoint);

			const responseBody = response.body as ServiceResponse<{ data: unknown[] }>;

			expect(response.status).toBe(StatusCodes.OK);
			expect(responseBody.success).toBe(true);
			expect(responseBody.responseObject?.data.length).toBe(count);
		});
	});

	describe("POST /topics", () => {
		it("should return 401 for unauthorized and missing token", async () => {
			const response = await request(app)
				.post(topicsEndpoint)
				.send({
					name: faker.word.words(4),
				});

			expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
		});

		it("should return 400 bad request when payload is invalid", async () => {
			const payload = faker.helpers.arrayElement([{}, { name: "" }, { name: faker.string.alpha() }]);

			const response = await request(app)
				.post(topicsEndpoint)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send(payload);

			const resBody = response.body as ServiceResponse;

			expect(resBody.success).toBe(false);
			expect(resBody.responseObject).toBeNull();
			expect(resBody.message).toContain("Invalid input");
		});

		it.skip("return 201 and should create a topic", async () => {
			const payload = {
				name: faker.word.words(4),
				description: faker.lorem.paragraphs(5),
			};

			const response = await request(app)
				.post(topicsEndpoint)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send(payload);

			console.log(response.body);

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.CREATED);
			expect(responseBody).toEqual({
				success: true,
				message: TOPIC_MESSAGES.CREATED,
				responseObject: {
					data: {
						id: expect.any(Number),
						name: payload.name.toLowerCase(),
						description: payload.description,
						slug: expect.any(String),
						createdAt: expect.any(String),
						updatedAt: expect.any(String),
						deletedAt: null,
						_count: {
							quizzes: expect.any(Number),
						},
					},
				},
				statusCode: StatusCodes.CREATED,
			});
		});

		it("return 400 and should reject duplicate topic creation", async () => {
			const { name } = await populateTopic();

			const response = await request(app)
				.post(topicsEndpoint)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send({
					name,
					description: "Nah i'm good",
				});

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);

			expect(responseBody).toEqual({
				success: false,
				message: TOPIC_MESSAGES.ALREADY_EXISTS,
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		});
	});

	describe("PUT /topics/:id", () => {
		it("return 400 bad request for invalid id format and missing body fields", async () => {
			const response = await request(app)
				.put(`${topicsEndpoint}/invalid-id`)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send({
					name: "Updated Topic",
				});

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body).toEqual({
				success: false,
				message: "Invalid input: params.id: Expected number, received nan",
				responseObject: null,
				statusCode: 400,
			});
		});

		it("should return 200 and update an existing topic", async () => {
			const existingTopic = await populateTopic();

			const editedTopic = {
				name: faker.word.words(4),
				description: faker.lorem.paragraphs(5),
			};

			const response = await request(app)
				.put(`${topicsEndpoint}/${existingTopic.id}`)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send(editedTopic);

			console.log(response.body);

			expect(response.status).toBe(StatusCodes.OK);

			expect(response.body).toMatchObject({
				success: true,
				message: TOPIC_MESSAGES.UPDATED,
				statusCode: StatusCodes.OK,
				responseObject: {
					data: {
						id: existingTopic.id,
						name: editedTopic.name.toLowerCase(),
						description: editedTopic.description,
						deletedAt: null,
					},
				},
			});

			const updatedTopic = response.body.responseObject.data;

			expect(new Date(updatedTopic.updatedAt).getTime()).toBeGreaterThan(new Date(existingTopic.updatedAt).getTime());
		});

		it("should return 404 not found when topic id does not exist", async () => {
			const response = await request(app)
				.put(`${topicsEndpoint}/999999`)
				.set("Authorization", `Bearer ${await getAdminToken()}`)
				.send({
					name: "Updated Topic",
				});

			expect(response.status).toBe(StatusCodes.NOT_FOUND);

			expect(response.body).toMatchObject({
				success: false,
				message: TOPIC_MESSAGES.NOT_FOUND,
				statusCode: StatusCodes.NOT_FOUND,
				responseObject: null,
			});
		});
	});

	describe("DELETE /topics/:id", () => {
		it("return 400 bad request for invalid id format", async () => {
			const response = await request(app)
				.delete(`${topicsEndpoint}/invalid-id`)
				.set("Authorization", `Bearer ${await getAdminToken()}`);

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body).toEqual({
				success: false,
				message: "Invalid input: params.id: Expected number, received nan",
				responseObject: null,
				statusCode: 400,
			});
		});

		it("return 204 and delete an existing topic", async () => {
			const topic = await populateTopic();

			const response = await request(app)
				.delete(`${topicsEndpoint}/${topic.id}`)
				.set("Authorization", `Bearer ${await getAdminToken()}`);

			const responseBody = response.body as ServiceResponse;

			expect(response.status).toBe(StatusCodes.NO_CONTENT);
			expect(responseBody.message).toBeUndefined();

			const deletedTopic = await topicRepository.fetchTopicById(topic.id);

			expect(deletedTopic).toBeNull();
		});

		it("should return 404 not found when topic id does not exist", async () => {
			const response = await request(app)
				.delete(`${topicsEndpoint}/999999`)
				.set("Authorization", `Bearer ${await getAdminToken()}`);

			expect(response.status).toBe(StatusCodes.NOT_FOUND);

			expect(response.body).toMatchObject({
				success: false,
				message: TOPIC_MESSAGES.NOT_FOUND,
				statusCode: StatusCodes.NOT_FOUND,
				responseObject: null,
			});
		});
	});
});
