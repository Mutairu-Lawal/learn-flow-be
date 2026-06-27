import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";

export const clearQuizzesWithChildren = async () => {
	await prisma.$transaction(async (tx) => {
		await tx.questionOption.deleteMany();
		await tx.question.deleteMany();
		await tx.quiz.deleteMany();
	});
};

function generateRandomQuestion() {
	const correctIndex = faker.number.int({ min: 0, max: 3 });

	const options = Array.from({ length: 4 }, (_, i) => ({
		text: faker.word.words({ count: { min: 2, max: 4 } }),
		isCorrect: i === correctIndex,
	}));

	return {
		text: faker.lorem.sentence(), // random question text
		options: faker.helpers.shuffle(options),
	};
}

function generateQuestionsArray(count = 5) {
	return Array.from({ length: count }, () => generateRandomQuestion());
}

export async function populateQuizzes(topicId: number, count = 5) {
	const questions = generateQuestionsArray(count);

	await prisma.$transaction(async (tx) => {
		const quiz = await tx.quiz.create({
			data: {
				passMark: 70,
				timeLimitMs: 60000,
				topic: { connect: { id: topicId } },
			},
		});

		for (const question of questions) {
			await tx.question.create({
				data: {
					text: question.text,
					quiz: { connect: { id: quiz.id } },
					options: {
						create: question.options.map((opt) => ({
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					},
				},
			});
		}
	});
}
