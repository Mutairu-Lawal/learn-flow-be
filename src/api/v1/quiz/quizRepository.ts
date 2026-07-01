import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { QuizScoreResult } from "./quiz.scorer";
import type { QuizSubmission } from "./quizSchema";

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

	async getSession(token: string) {
		return prisma.sessionToken.findUnique({ where: { token } });
	}

	async updateUserAttempt({
		resultData,
		userId,
		quizId,
		sessionToken,
		submissionData,
		topicId,
	}: {
		resultData: QuizScoreResult;
		userId: number;
		quizId: number;
		sessionToken: string;
		submissionData: QuizSubmission;
		topicId: number;
	}) {
		await prisma.$transaction(async (tx) => {
			const attempt = await tx.quizAttempt.create({
				data: {
					score: resultData.score,
					totalQuestions: resultData.totalQuestions,
					correctAnswers: resultData.correctAnswers,
					incorrectAnswers: resultData.incorrectAnswers,
					startedAt: submissionData.startedAt,
					finishedAt: submissionData.finishedAt,
					topicId,

					userId,
					quizId,
				},
			});

			await tx.sessionToken.create({
				data: {
					token: sessionToken,
					status: "submitted",
					quizAttemptId: attempt.id,
				},
			});
		});
	}
}

export const quizRepository = new QuizRepository();
