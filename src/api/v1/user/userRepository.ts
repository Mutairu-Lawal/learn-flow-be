import { prisma } from "@/lib/prisma";

class UserRepository {
	async findById(id: number) {
		return prisma.user.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				emailVerifiedAt: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
		});
	}

	async fetchUserAttempts(userId: number) {
		const [stats, recentActivity, topicStats] = await prisma.$transaction([
			prisma.quizAttempt.aggregate({
				where: {
					userId,
					deletedAt: null,
				},
				_count: true,
				_avg: { score: true },
				_max: { score: true },
				_min: { score: true },
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.quizAttempt.findMany({
				where: {
					userId,
					deletedAt: null,
				},
				take: 5,
				orderBy: { createdAt: "desc" },
				include: {
					topic: {
						select: {
							name: true,
						},
					},
				},
			}),
			prisma.quizAttempt.groupBy({
				by: ["topicId"],
				where: {
					userId,
					deletedAt: null,
				},
				_count: true,
				_max: { score: true },
			}),
		]);

		return {
			stats,
			recentActivity,
			topicStats,
		};
	}

	async softDelete(id: number) {
		return prisma.user.update({
			where: {
				id,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	}
}

export const userRepository = new UserRepository();
