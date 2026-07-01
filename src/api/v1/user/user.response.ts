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
	topicStats: (Prisma.PickEnumerable<Prisma.QuizAttemptGroupByOutputType, "topicId"[]> & {
		_count: number;
		_max: {
			score: number | null;
		};
	})[];
	topics: {
		id: number;
		name: string;
	}[];
};

export function formatUserDashboardResponse(data: Data) {
	const topicMap = new Map(data.topics.map((t) => [t.id, t.name]));

	const topicStats = data.topicStats.map((g) => ({
		...g,
		topicName: topicMap.get(g.topicId),
	}));

	const { topics, ...dataWithoutTopics } = data;

	return {
		...dataWithoutTopics,
		stats: { ...data.stats, _avg: { score: Math.round(data.stats._avg.score ?? 0) } },
		topicStats,
	};
}
