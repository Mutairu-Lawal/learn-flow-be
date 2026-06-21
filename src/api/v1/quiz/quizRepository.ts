import { prisma } from "@/lib/prisma";
import type { CreateQuizInput } from "./quizSchema";

class QuizRepository {
	async fetchAllQuiz() {
		return prisma.quiz.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				_count: true,
				questions: {
					where: {
						deletedAt: null,
					},
					include: {
						options: {
							where: {
								deletedAt: null,
							},
							select: {
								text: true,
								id: true,
								createdAt: true,
								deletedAt: true,
								updatedAt: true,
								questionId: true,
							},
						},
					},
				},
			},
		});
	}

	async createQuiz(quizData: CreateQuizInput) {
		const { passMark, questions, timeLimitMs, topicId } = quizData;

		return prisma.quiz.create({
			data: {
				passMark,
				timeLimitMs,

				topic: {
					connect: {
						id: topicId,
					},
				},

				questions: {
					create: questions.map((question) => ({
						text: question.text,

						options: {
							create: question.options.map((option) => ({
								text: option.text,
								isCorrect: option.isCorrect ?? false,
							})),
						},
					})),
				},
			},

			include: {
				questions: {
					include: {
						options: true,
					},
				},
			},
		});
	}
}

export const quizRepository = new QuizRepository();
