import { prisma } from "@/lib/prisma";

class QuizRepository {
	async fetchAllQuiz() {
		return prisma.quiz.findMany({
			include: {
				_count: true,
				questions: {
					include: {
						options: {
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
}

export const quizRepository = new QuizRepository();
