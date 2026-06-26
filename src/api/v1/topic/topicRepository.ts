import { slugify } from "@/common/utils/slugify";
import { prisma } from "@/lib/prisma";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

class TopicRepository {
	async fetchAllTopics() {
		return prisma.topic.findMany({
			where: {
				deletedAt: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async fetchTopicById(id: number) {
		return prisma.topic.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				quizzes: true,
			},
		});
	}

	async fetchTopicByName(name: string) {
		return prisma.topic.findFirst({
			where: {
				name: name.toLowerCase(),
				deletedAt: null,
			},
		});
	}

	async createTopic(topic: CreateTopicInput) {
		return prisma.topic.create({
			data: {
				name: topic.name.toLowerCase(),
				description: topic.description,
				slug: slugify(topic.name),
			},
			include: {
				_count: true,
			},
		});
	}

	async updateTopic(id: number, data: UpdateTopicInput) {
		return prisma.topic.update({
			where: { id },
			data: {
				...(data.name && {
					name: data.name.toLowerCase(),
					slug: slugify(data.name),
				}),
				...(data.description !== undefined && {
					description: data.description,
				}),
			},
			include: { _count: true },
		});
	}

	async softDelete(id: number) {
		return prisma.topic.update({
			where: {
				id,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	}
}

export const topicRepository = new TopicRepository();
