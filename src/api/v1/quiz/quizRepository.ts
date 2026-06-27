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

	async fetchQuizById(id: number, skip = 0) {
		return prisma.quiz.findMany({
			where: {
				topicId: id,
			},
			skip,
			take: 1,
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
	async getTotalQuizCount(id: number) {
		return prisma.quiz.count({
			where: {
				topicId: id,
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
