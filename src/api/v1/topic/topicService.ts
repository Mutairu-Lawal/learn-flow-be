import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { commonIdSchema } from "@/common/utils/commonValidation";
import { findEntity, parseEntityId } from "@/common/utils/serviceHelpers";
import { logger } from "@/server";
import { topicRepository } from "./topicRepository";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

export class TopicService {
	async retrieveTopics() {
		try {
			const topics = await topicRepository.fetchAllTopics();

			return ServiceResponse.success("Topics retrieved successfully", { data: topics }, StatusCodes.OK);
		} catch (error) {
			logger.error({ error }, "Failed to retrieve topics");

			return ServiceResponse.failure("Unable to retrieve topics", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createTopic(topicData: CreateTopicInput) {
		try {
			const existing = await topicRepository.fetchTopicByName(topicData.name);

			if (existing) {
				return ServiceResponse.failure("Topic already exists", null, StatusCodes.BAD_REQUEST);
			}

			const topic = await topicRepository.createTopic(topicData);

			return ServiceResponse.success("Topic created successfully", { data: topic }, StatusCodes.CREATED);
		} catch (error) {
			logger.error({ error }, "Failed to create topic");

			return ServiceResponse.failure("Unable to create topic", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateTopic(id: string, data: UpdateTopicInput) {
		try {
			const parsedId = parseEntityId(id, commonIdSchema.shape.id);

			if (!parsedId) {
				return ServiceResponse.failure("Invalid topic ID", null, StatusCodes.BAD_REQUEST);
			}

			const topic = await findEntity(parsedId, topicRepository.fetchTopicById);

			if (!topic) {
				return ServiceResponse.failure("Topic not found", null, StatusCodes.NOT_FOUND);
			}

			const updated = await topicRepository.updateTopic(parsedId, data);

			return ServiceResponse.success("Topic updated successfully", { data: updated }, StatusCodes.OK);
		} catch (error) {
			logger.error({ error }, "Failed to update topic");

			return ServiceResponse.failure("Unable to update topic", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async deleteTopic(id: string) {
		try {
			const parsedId = parseEntityId(id, commonIdSchema.shape.id);

			if (!parsedId) {
				return ServiceResponse.failure("Invalid topic ID", null, StatusCodes.BAD_REQUEST);
			}

			const topic = await findEntity(parsedId, topicRepository.fetchTopicById);

			if (!topic) {
				return ServiceResponse.failure("Topic not found", null, StatusCodes.NOT_FOUND);
			}

			await topicRepository.softDelete(parsedId);

			return ServiceResponse.success("Topic deleted successfully", null, StatusCodes.OK);
		} catch (error) {
			logger.error({ error }, "Failed to delete topic");

			return ServiceResponse.failure("Unable to delete topic", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const topicService = new TopicService();
