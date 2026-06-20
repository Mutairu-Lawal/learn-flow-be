import { prisma } from "@/lib/prisma";

class TopicRepository {
	async fetchAllTopics(quizzes = false) {
		if (quizzes) {
			return prisma.topic.findMany({
				include: {
					quizzes: true,
				},
			});
		} else {
			return prisma.topic.findMany();
		}
	}
}

export const topicRepository = new TopicRepository();
