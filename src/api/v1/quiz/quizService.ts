import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { topicRepository } from "../topic/topicRepository";
import { quizMapper } from "./quiz.mapper";
import { quizRepository } from "./quizRepository";
import { QUIZ_MESSAGES } from "./quizRouter";
import type { CreateQuizInput } from "./quizSchema";

export class QuizService {
	async getAllQuizzes() {
		try {
			const quizzes = await quizRepository.findAll();

			return ServiceResponse.success(QUIZ_MESSAGES.RETRIEVED, { data: quizzes }, StatusCodes.OK);
		} catch (error) {
			return ErrorServiceHandler.handle(error, QUIZ_MESSAGES.RETRIEVED, QUIZ_MESSAGES.RETRIEVE_FAILED);
		}
	}

	async createQuiz(data: CreateQuizInput) {
		try {
			const topic = await topicRepository.fetchTopicById(data.topicId);

			if (!topic) {
				return ServiceResponse.failure(QUIZ_MESSAGES.TOPIC_NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const quiz = await quizRepository.create(quizMapper(data));

			return ServiceResponse.success(
				QUIZ_MESSAGES.CREATED,
				{
					quiz,
				},
				StatusCodes.CREATED,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, QUIZ_MESSAGES.CREATED, QUIZ_MESSAGES.CREATE_FAILED);
		}
	}
}

export const quizService = new QuizService();
