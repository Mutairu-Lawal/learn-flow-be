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

	async getQuizDetails(id: number) {
		return prisma.quiz.findUnique({ where: { id }, include: { questions: { include: { options: true } } } });
	}

	async fetchRandomQuiz(topicId: number, skip = 0) {
		return prisma.quiz.findFirst({
			where: {
				topicId,
			},
			skip,
			include: {
				questions: {
					include: {
						options: {
							select: {
								id: true,
								text: true,
							},
						},
					},
				},
			},
		});
	}

	async getTotalQuizCount(topicId: number) {
		return prisma.quiz.count({
			where: {
				topicId,
			},
		});
	}

	async findAll() {
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

	async create(data: Prisma.QuizCreateInput) {
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
