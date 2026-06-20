import { prisma } from "@/lib/prisma";

class QuizRepository {
	async fetchAllQuiz() {
		return prisma.quiz.findMany();
	}
}

export const quizRepository = new QuizRepository();
