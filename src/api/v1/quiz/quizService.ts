import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { quizRepository } from "./quizRepository";

export class QuizService {
	getAllQuizzes = async () => {
		try {
			const quizzes = await quizRepository.fetchAllQuiz();

			return ServiceResponse.success("Successful", { data: quizzes }, StatusCodes.OK);
		} catch (error) {
			logger.error({ err: error }, "Failed");
			return ServiceResponse.failure("An error occurred.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	};
}

export const quizService = new QuizService();
