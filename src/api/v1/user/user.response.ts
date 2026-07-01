import type { Prisma } from "@prisma/client";

type Data = {
	stats: Prisma.GetQuizAttemptAggregateType<{
		where: {
			userId: number;
			deletedAt: null;
		};
		_count: true;
		_avg: {
			score: true;
		};
		_max: {
			score: true;
		};
		_min: {
			score: true;
		};
		orderBy: {
			createdAt: "desc";
		};
	}>;
	recentActivity: ({
		topic: {
			name: string;
		} | null;
	} & {
		id: number;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
		userId: number;
		score: number;
		totalQuestions: number;
		correctAnswers: number;
		incorrectAnswers: number;
		startedAt: Date;
		finishedAt: Date;
		quizId: number;
		topicId: number | null;
	})[];
};

export function formatUserDashboardResponse(data: Data) {
	return {
		...data,
		stats: { ...data.stats, _avg: { score: Math.floor(data.stats._avg.score ?? 0) } },
	};
}
