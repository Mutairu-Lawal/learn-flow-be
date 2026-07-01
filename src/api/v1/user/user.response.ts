import type { UserDashboardData } from "./userRepository";

export function formatUserDashboardResponse(data: UserDashboardData) {
	const topicMap = new Map(data.topics.map((topic) => [topic.id, topic.name]));

	const topicStats = data.topicStats.map((topic) => ({
		topicId: topic.topicId,
		topicName: topic.topicId == null ? null : (topicMap.get(topic.topicId) ?? null),

		totalAttempts: typeof topic._count === "object" ? (topic._count._all ?? 0) : 0,

		highestScore: topic._max?.score ?? 0,
	}));
	const { topics, ...rest } = data;

	return {
		...rest,
		stats: {
			...data.stats,
			_avg: {
				score: Math.round(data.stats._avg.score ?? 0),
			},
		},
		topicStats,
	};
}
