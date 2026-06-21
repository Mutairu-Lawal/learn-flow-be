import { prisma } from "@/lib/prisma";

class TopicRepository {
	async fetchAllTopics() {
		return prisma.topic.findMany();
	}

	async fetchTopicById(id: number) {
		return prisma.topic.findUnique({ where: { id } });
	}
}

export const topicRepository = new TopicRepository();
