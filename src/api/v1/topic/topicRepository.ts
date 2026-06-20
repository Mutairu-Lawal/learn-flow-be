import { prisma } from "@/lib/prisma";

class TopicRepository {
	async fetchAllTopics() {
		return prisma.topic.findMany();
	}
}

export const topicRepository = new TopicRepository();
