import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";

export const populateTopic = async () => {
	return await prisma.topic.create({
		data: {
			name: "topic created",
			description: "yeah we have a decription",
		},
	});
};
export const populateTopics = async (length = 10) => {
	const topics = Array.from({ length }).map(() => {
		return {
			name: faker.string.alpha({ length: { min: 5, max: 10 } }),
			description: faker.lorem.paragraphs(5),
		};
	});

	return await prisma.topic.createMany({
		data: topics,
	});
};
