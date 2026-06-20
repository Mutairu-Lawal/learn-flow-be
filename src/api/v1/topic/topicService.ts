import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { topicRepository } from "./topicRepository";

export class TopicService {
	retrieveTopics = async () => {
		try {
			const topics = await topicRepository.fetchAllTopics();

			return ServiceResponse.success("", { topics }, StatusCodes.OK);
		} catch (error) {
			logger.error({ err: error }, "Failed to get all topic");
			return ServiceResponse.failure(
				"An error occurred while retrieving topic.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	};
}

export const topicService = new TopicService();
