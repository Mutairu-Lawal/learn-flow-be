import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ErrorServiceHandler } from "@/common/utils/errorHandler";
import { generateSessionToken, verifySessionToken } from "@/common/utils/jwt";
import { topicRepository } from "../topic/topicRepository";
import type { UserPayload } from "../user/userSchema";
import { quizMapper } from "./quiz.mapper";
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

			const sessionToken = generateSessionToken({
				quizId: quiz.at(0)?.id as number,
				timeLimit: quiz.at(0)?.timeLimitMs as number,
			});

			return ServiceResponse.success(QUIZ_MESSAGES.RETRIEVED, { sessionToken, data: quiz }, StatusCodes.OK);
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

	async submitAnswers(data: QuizSubmission, sessionId: string, user: UserPayload) {
		try {
			const decode = verifySessionToken(sessionId);

			if (!decode) {
				return ServiceResponse.failure("Invalid session", null, StatusCodes.BAD_REQUEST);
			}

			const { quizId } = decode;

			const quiz = await quizRepository.getQuizDetails(quizId);

			if (!quiz) {
				return ServiceResponse.failure(QUIZ_MESSAGES.NOT_FOUND, null, StatusCodes.BAD_REQUEST);
			}

			const { questions } = quiz;

			const validation = () => {
				const totalQuestions = questions.length;
				let correctAnswers = 0;
				let incorrectAnswers = 0;

				if (Object.keys(data.answers).length >= 1) {
					Object.entries(data.answers).forEach(([questionId, userAnswer]) => {
						const question = questions.find((q) => q.id === Number(questionId));

						if (!question) {
							return;
						}

						const correctAnswer = question.options.find((opt) => opt.isCorrect);

						if (!correctAnswer) {
							return;
						}

						if (Number(userAnswer) === correctAnswer.id) {
							correctAnswers += 1;
						} else {
							incorrectAnswers += 1;
						}
					});
				}

				return {
					correctAnswers,
					incorrectAnswers,
					totalQuestions,
					unansweredQuestions: totalQuestions - correctAnswers - incorrectAnswers,
					score: Math.floor((correctAnswers / totalQuestions) * 100),
				};
			};

			const result = validation();

			const formattedQuestions = questions.map((q) => ({
				...q,
				options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
			}));

			return ServiceResponse.success(
				QUIZ_MESSAGES.SUBMITTED,
				{
					...result,
					userId: user.userId,
					formattedQuestions,
					userOptions: data.answers,
				},
				StatusCodes.OK,
			);
		} catch (error) {
			return ErrorServiceHandler.handle(error, "submit answers", "Unable to submit answers");
		}
	}
}

export const quizService = new QuizService();
