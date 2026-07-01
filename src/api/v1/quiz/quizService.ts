import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { generateSessionToken, verifySessionToken } from "@/common/utils/jwt";
import { topicRepository } from "../topic/topicRepository";
import type { UserPayload } from "../user/userSchema";
import { quizMapper } from "./quiz.mapper";
import { formatQuestions } from "./quiz.response";
import { calculate } from "./quiz.scorer";
import { quizRepository } from "./quizRepository";
import { QUIZ_MESSAGES } from "./quizRouter";
import type { CreateQuizInput, QuizSubmission } from "./quizSchema";

export class QuizService {
	async getAllQuizzes() {
		try {
			const quizzes = await quizRepository.findAll();

			return ServiceResponse.success(QUIZ_MESSAGES.RETRIEVED, { data: quizzes }, StatusCodes.OK);
		} catch (error) {
			return ErrorServiceHandler.handle(error, QUIZ_MESSAGES.RETRIEVED, QUIZ_MESSAGES.RETRIEVE_FAILED);
		}
	}

	async getQuiz(slug: string) {
		try {
			const topic = await topicRepository.fetchTopicBySlugName(slug);

			if (!topic) {
				return ServiceResponse.failure(QUIZ_MESSAGES.TOPIC_NOT_FOUND, null, StatusCodes.BAD_REQUEST);
			}

			const count = await quizRepository.getTotalQuizCount(topic.id);

			if (count === 0) {
				return ServiceResponse.failure(QUIZ_MESSAGES.NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const randomIndex = Math.floor(Math.random() * count);

			const quiz = await quizRepository.fetchRandomQuiz(topic.id, randomIndex);

			if (!quiz) {
				return ServiceResponse.failure(QUIZ_MESSAGES.NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const sessionToken = generateSessionToken({
				quizId: quiz.id,
				timeLimit: quiz.timeLimitMs,
			});

			return ServiceResponse.success(
				QUIZ_MESSAGES.RETRIEVED,
				{
					sessionToken,
					data: quiz,
				},
				StatusCodes.OK,
			);
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

			return ServiceResponse.success(QUIZ_MESSAGES.CREATED, { quiz }, StatusCodes.CREATED);
		} catch (error) {
			return ErrorServiceHandler.handle(error, QUIZ_MESSAGES.CREATED, QUIZ_MESSAGES.CREATE_FAILED);
		}
	}

	async submitAnswers(data: QuizSubmission, user: UserPayload) {
		try {
			const { sessionToken } = data;

			const session = verifySessionToken(sessionToken);

			if (!session) {
				return ServiceResponse.failure(QUIZ_MESSAGES.INVALID_SESSION, null, StatusCodes.BAD_REQUEST);
			}

			const sessionStatus = await quizRepository.getSession(sessionToken);

			if (sessionStatus?.status === "submitted") {
				return ServiceResponse.failure(QUIZ_MESSAGES.ALREADY_SUBMITTED, null, StatusCodes.CONFLICT);
			}

			const quiz = await quizRepository.getQuizDetails(session.quizId);

			if (!quiz) {
				return ServiceResponse.failure(QUIZ_MESSAGES.NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const topic = await topicRepository.fetchTopicById(quiz.topicId);

			if (!topic) {
				return ServiceResponse.failure(QUIZ_MESSAGES.TOPIC_NOT_FOUND, null, StatusCodes.NOT_FOUND);
			}

			const result = calculate(quiz, data);

			await quizRepository.updateUserAttempt({
				resultData: result,
				userId: user.userId,
				quizId: quiz.id,
				sessionToken,
				submissionData: data,
				topicId: topic.id,
			});

			return ServiceResponse.success(
				QUIZ_MESSAGES.SUBMITTED,
				{
					data: {
						topicName: topic.name,
						...result,
						questions: formatQuestions(quiz.questions),
						userAnswers: data.answers,
					},
				},
				StatusCodes.OK,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, QUIZ_MESSAGES.SUBMITTED, QUIZ_MESSAGES.SUBMIT_FAILED);
		}
	}
}

export const quizService = new QuizService();
