import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

class QuizRepository {
	async fetchQuiz() {
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

	findAll() {
		return prisma.quiz.findMany({
			where: {
				deletedAt: null,
			},

			orderBy: {
				createdAt: "desc",
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
						},
					},
				},
			},
		});
	}

	// ! Remove Not in use
	// async createQuiz(quizData: CreateQuizInput) {
	// 	const { passMark, questions, timeLimitMs, topicId } = quizData;

	// 	return prisma.quiz.create({
	// 		data: {
	// 			passMark,
	// 			timeLimitMs,

	// 			topic: {
	// 				connect: {
	// 					id: topicId,
	// 				},
	// 			},

	// 			questions: {
	// 				create: questions.map((question) => ({
	// 					text: question.text,

	// 					options: {
	// 						create: question.options.map((option) => ({
	// 							text: option.text,
	// 							isCorrect: option.isCorrect ?? false,
	// 						})),
	// 					},
	// 				})),
	// 			},
	// 		},

	// 		include: {
	// 			questions: {
	// 				include: {
	// 					options: true,
	// 				},
	// 			},
	// 		},
	// 	});
	// }

	create(data: Prisma.QuizCreateInput) {
		return prisma.quiz.create({
			data,

			include: {
				_count: true,

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
