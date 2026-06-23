import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { commonValidations } from "@/common/utils/commonValidation";
import { logger } from "@/server";
import { topicRepository } from "./topicRepository";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

export class TopicService {
	retrieveTopics = async () => {
		try {
			const topics = await topicRepository.fetchAllTopics();

			return ServiceResponse.success("Successful", { data: topics }, StatusCodes.OK);
		} catch (error) {
			logger.error({ err: error }, "Failed");
			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	createTopic = async (topicData: CreateTopicInput) => {
		try {
			const existing = await topicRepository.fetchTopicByName(topicData.name);

			if (existing) return ServiceResponse.failure("Topic already exists", null, StatusCodes.BAD_REQUEST);

			const topic = await topicRepository.createTopic(topicData);

			return ServiceResponse.success("Topic created successfully", { data: topic }, StatusCodes.CREATED);
		} catch (error) {
			logger.error({ err: error }, "Failed");
			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	updateTopic = async (id: string, updatedData: UpdateTopicInput) => {
		try {
			// Ensure at least one field is provided
			if (!updatedData.name && !updatedData.description) {
				return ServiceResponse.failure("No data to update", null, StatusCodes.BAD_REQUEST);
			}

			// Validate ID
			const parsed = commonValidations.id.safeParse(id);
			if (!parsed.success) {
				return ServiceResponse.failure("Invalid topic ID", null, StatusCodes.BAD_REQUEST);
			}
			const parsedId = parsed.data;

			// Check existence
			const topic = await topicRepository.fetchTopicById(parsedId);
			if (!topic || topic.deletedAt) {
				return ServiceResponse.failure("Topic not found", null, StatusCodes.NOT_FOUND);
			}

			// Update via repository
			const updatedTopic = await topicRepository.updateTopic(parsedId, updatedData);

			return ServiceResponse.success("Topic updated successfully", updatedTopic, StatusCodes.OK);
		} catch (error) {
			logger.error({ err: error }, "Failed to update topic");
			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	deleteTopic = async (id: string) => {
		try {
			// Validate ID
			const parsed = commonValidations.id.safeParse(id);
			if (!parsed.success) {
				return ServiceResponse.failure("Invalid topic ID", null, StatusCodes.BAD_REQUEST);
			}
			const parsedId = parsed.data;

			// Check existence
			const topic = await topicRepository.fetchTopicById(parsedId);
			if (!topic || topic.deletedAt) {
				return ServiceResponse.failure("Topic not found", null, StatusCodes.NOT_FOUND);
			}

			// Update via repository
			const deletedTopic = await topicRepository.softDelete(parsedId);

			return ServiceResponse.success("Topic deleted successfully", deletedTopic, StatusCodes.NO_CONTENT);
		} catch (error) {
			logger.error({ err: error }, "Failed to update topic");
			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}

export const topicService = new TopicService();
