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

	async getDashboard(userId: number) {
		const [stats, recentActivity, topicStats, topics] = await prisma.$transaction([
			prisma.quizAttempt.aggregate({
				where: {
					userId,
					deletedAt: null,
				},
				_count: true,
				_avg: {
					score: true,
				},
				_max: {
					score: true,
				},
				_min: {
					score: true,
				},
			}),
			prisma.quizAttempt.findMany({
				where: {
					userId,
					deletedAt: null,
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 5,
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
				orderBy: {
					topicId: "asc",
				},
				_count: {
					_all: true,
				},
				_max: {
					score: true,
				},
			}),
			prisma.topic.findMany({
				where: {
					deletedAt: null,
				},
				select: {
					id: true,
					name: true,
				},
			}),
		]);

		return {
			stats,
			recentActivity,
			topicStats,
			topics,
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

export type UserDashboardData = Awaited<ReturnType<UserRepository["getDashboard"]>>;
