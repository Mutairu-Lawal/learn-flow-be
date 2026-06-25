import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { topicRepository } from "./topicRepository";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

export const TOPIC_MESSAGES = {
	CREATED: "Topic created successfully",
	UPDATED: "Topic updated successfully",
	DELETED: "Topic deleted successfully",
	RETRIEVED: "Topic retrieved successfully",
	RETRIEVED_ALL: "Topics retrieved successfully",

	NOT_FOUND: "Topic not found",
	ALREADY_EXISTS: "Topic already exists",
	INVALID_ID: "Invalid topic ID",

	CREATE_FAILED: "Failed to create topic",
	UPDATE_FAILED: "Failed to update topic",
	DELETE_FAILED: "Failed to delete topic",
	RETRIEVE_FAILED: "Failed to retrieve topic",
} as const;

export class TopicService {
	private async getTopic(id: number) {
		return topicRepository.fetchTopicById(id);
	}

	async getAllTopics() {
		try {
			const topics = await topicRepository.fetchAllTopics();

			return ServiceResponse.success(
				TOPIC_MESSAGES.RETRIEVED_ALL,
				{
					data: topics,
				},
				StatusCodes.OK,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, TOPIC_MESSAGES.RETRIEVED_ALL, TOPIC_MESSAGES.RETRIEVE_FAILED);
		}
	}

	async createTopic(data: CreateTopicInput) {
		try {
			const existing = await topicRepository.fetchTopicByName(data.name);

			if (existing) {
				return ServiceResponse.failure(TOPIC_MESSAGES.ALREADY_EXISTS, null, StatusCodes.BAD_REQUEST);
			}

			const topic = await topicRepository.createTopic(data);

			return ServiceResponse.success(
				TOPIC_MESSAGES.CREATED,
				{
					data: topic,
				},
				StatusCodes.CREATED,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, TOPIC_MESSAGES.CREATED, TOPIC_MESSAGES.CREATE_FAILED);
		}
	}

	async updateTopic(id: string, data: UpdateTopicInput) {
		try {
			const parsedId = Number(id);

			if (!parsedId) {
				return ServiceResponse.failure(TOPIC_MESSAGES.INVALID_ID, null, StatusCodes.BAD_REQUEST);
			}

			const topic = await this.getTopic(parsedId);

			if (!topic) {
				return ServiceResponse.failure(TOPIC_MESSAGES.NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const updated = await topicRepository.updateTopic(parsedId, data);

			return ServiceResponse.success(
				TOPIC_MESSAGES.UPDATED,
				{
					data: updated,
				},
				StatusCodes.OK,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, TOPIC_MESSAGES.UPDATED, TOPIC_MESSAGES.UPDATE_FAILED);
		}
	}

	async deleteTopic(id: string) {
		try {
			const parsedId = Number(id);

			if (!parsedId) {
				return ServiceResponse.failure(TOPIC_MESSAGES.INVALID_ID, null, StatusCodes.BAD_REQUEST);
			}

			const topic = await this.getTopic(parsedId);

			if (!topic) {
				return ServiceResponse.failure(TOPIC_MESSAGES.NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			await topicRepository.softDelete(parsedId);

			return ServiceResponse.success(TOPIC_MESSAGES.DELETED, null, StatusCodes.NO_CONTENT);
		} catch (error) {
			return ErrorServiceHandler.handle(error, TOPIC_MESSAGES.DELETED, TOPIC_MESSAGES.DELETE_FAILED);
		}
	}
}

export const topicService = new TopicService();
