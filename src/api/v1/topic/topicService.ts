import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { topicRepository } from "./topicRepository";
import type { CreateTopicInput } from "./topicSchema";

export class TopicService {
	retrieveTopics = async () => {
		try {
			const topics = await topicRepository.fetchAllTopics();

			//! Remove
			// const topicsSummary = topics.map((topic) => {
			// 	const firstQuiz = topic.quizzes?.[0];
			// 	const totalQuestions = firstQuiz?.questions?.length ?? 0;
			// 	const timeLimitMs = firstQuiz?.timeLimitMs ?? 0;
			// 	return {
			// 		id: topic.id,
			// 		name: topic.name,
			// 		description: topic.description,
			// 		slug: topic.slug,
			// 		totalQuestions,
			// 		timeLimitMs,
			// 	};
			// });

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
}

export const topicService = new TopicService();
