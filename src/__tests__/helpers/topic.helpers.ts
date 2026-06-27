import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";

export const populateTopic = async () => {
	return await prisma.topic.create({
		data: {
			name: faker.lorem.words(),
			description: faker.lorem.paragraphs(5),
		},
	});
};

export const populateTopics = async (length = 10) => {
	const topics = Array.from({ length }).map(() => {
		return {
			name: faker.word.words(),
			description: faker.lorem.paragraphs(5),
		};
	});

	return await prisma.topic.createMany({
		data: topics,
	});
};

export const getRandomTopic = async () => {
	const count = await prisma.topic.count();
	const randomIndex = faker.number.int({ min: 0, max: count - 1 });
	return await prisma.topic.findMany({
		skip: randomIndex,
		take: 1,
	});
};

export const countTopics = async () => {
	return await prisma.topic.count();
};

export const clearTopicsWithChildren = async () => {
	await prisma.$transaction(async (tx) => {
		await tx.questionOption.deleteMany();
		await tx.question.deleteMany();
		await tx.quiz.deleteMany();
		await tx.topic.deleteMany();
	});
};

export const fetchTopicById = async (id: number) => await prisma.topic.findUnique({ where: { id } });
