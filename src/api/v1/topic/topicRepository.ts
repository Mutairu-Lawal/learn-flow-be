import { prisma } from "@/lib/prisma";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";

class TopicRepository {
	async fetchAllTopics() {
		return prisma.topic.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				_count: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async fetchTopicById(id: number) {
		return prisma.topic.findUnique({ where: { id, deletedAt: null } });
	}

	async fetchTopicByName(name: string) {
		return prisma.topic.findFirst({
			where: { name, deletedAt: null },
		});
	}

	async createTopic(topic: CreateTopicInput) {
		const slug = slugify(topic.name);

		return prisma.topic.create({
			data: {
				name: topic.name.toLowerCase(),
				description: topic.description,
				slug,
			},
			include: {
				_count: true,
			},
		});
	}

	async updateTopic(id: number, updatedData: UpdateTopicInput) {
		return prisma.topic.update({
			where: { id },
			data: {
				...(updatedData.name && { name: updatedData.name }),
				...(updatedData.description && { description: updatedData.description }),
			},
			include: { _count: true },
		});
	}
}

export const topicRepository = new TopicRepository();

function slugify(input: string): string {
	return input
		.normalize("NFKD") // normalize accents
		.replace(/[\u0300-\u036f]/g, "") // remove diacritics
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
		.replace(/^-+|-+$/g, "") // trim hyphens
		.replace(/--+/g, "-"); // collapse multiple hyphens
}
