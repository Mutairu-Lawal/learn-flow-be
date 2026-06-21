import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import { topicRepository } from "../topic/topicRepository";
import { quizRepository } from "./quizRepository";

import type { CreateQuizInput } from "./quizSchema";

export class QuizService {
	getAllQuizzes = async () => {
		try {
			const quizzes = await quizRepository.fetchAllQuiz();

			return ServiceResponse.success("Quizzes retrieved successfully", { data: quizzes }, StatusCodes.OK);
		} catch (error) {
			logger.error(
				{
					err: error,
				},
				"Failed to retrieve quizzes",
			);

			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};

	createQuiz = async (quizData: CreateQuizInput) => {
		try {
			const topic = await topicRepository.fetchTopicById(quizData.topicId);

			if (!topic) {
				return ServiceResponse.failure("Topic not found", null, StatusCodes.NOT_FOUND);
			}

			const quiz = await quizRepository.createQuiz(quizData);

			return ServiceResponse.success("Quiz created successfully", { data: quiz }, StatusCodes.CREATED);
		} catch (error) {
			logger.error(
				{
					err: error,
					topicId: quizData.topicId,
				},
				"Failed to create quiz",
			);

			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}

export const quizService = new QuizService();
