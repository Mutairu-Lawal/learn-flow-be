import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { commonIdSchema } from "@/common/utils/commonValidation";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { findEntity, parseEntityId } from "@/common/utils/serviceHelpers";
import { topicRepository } from "./topicRepository";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

export class TopicService {
	async retrieveTopics() {
		try {
			const topics = await topicRepository.fetchAllTopics();
			return ServiceResponse.success("Topics retrieved successfully", { data: topics }, StatusCodes.OK);
		} catch (error) {
			return ErrorServiceHandler.handle(error, "retrieve topics", "Unable to retrieve topics");
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
			return ErrorServiceHandler.handle(error, "create topic", "Unable to create topic");
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
			return ErrorServiceHandler.handle(error, "update topic", "Unable to update topic");
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
			return ErrorServiceHandler.handle(error, "delete topic", "Unable to delete topic");
		}
	}
}

export const topicService = new TopicService();
