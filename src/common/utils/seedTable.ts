import { prisma } from "@/lib/prisma";

// async function main() {
// 	await prisma.$connect();
// 	try {
// 		await prisma.questionOption.createMany({
// 			data: [
// 				{ text: "Total winnings", questionId: 1 },
// 				{ text: "Deposits made before the first bet", questionId: 1, isCorrect: true },
// 				{ text: "Number of bets placed", questionId: 1 },
// 				{ text: "Referral bonuses", questionId: 1 },
// 			],
// 			skipDuplicates: true,
// 		});
// 		console.log("Question options seeded successfully");
// 	} catch (error) {
// 		console.error("Failed to seed question options:", error);
// 		process.exit(1);
// 	} finally {
// 		await prisma.$disconnect();
// 	}
// }

// main();

const quizDetails = {
	timeLimitMs: 300,
	topicId: 1,
	passMark: 65,
	questions: [
		{
			text: "Who is eligible for the Fortebet Welcome Bonus?",
			options: [
				{ text: "Existing customers", isCorrect: false },
				{ text: "Only VIP users", isCorrect: false },
				{ text: "Newly registered users", isCorrect: true },
				{ text: "All users", isCorrect: false },
			],
		},
		{
			text: "What determines the size of the Welcome Bonus?",
			options: [
				{ text: "Total winnings", isCorrect: false },
				{ text: "Deposits made before the first bet", isCorrect: true },
				{ text: "Number of bets placed", isCorrect: false },
				{ text: "Referral bonuses", isCorrect: false },
			],
		},
		{
			text: "What is the minimum number of selections required for an eligible bet?",
			options: [
				{ text: "1", isCorrect: false },
				{ text: "2", isCorrect: false },
				{ text: "3", isCorrect: true },
				{ text: "5", isCorrect: false },
			],
		},
		{
			text: "What is the minimum total odds required for an eligible bet?",
			options: [
				{ text: "1.50", isCorrect: false },
				{ text: "2.00", isCorrect: false },
				{ text: "2.50", isCorrect: false },
				{ text: "3.00", isCorrect: true },
			],
		},
	],
};

async function createQuiz() {
	await prisma.$connect();

	try {
		await prisma.$transaction(async (tx) => {
			const topic = await tx.topic.create({
				data: {
					name: "Welcome bonus",
				},
			});

			const quiz = await tx.quiz.create({
				data: {
					passMark: 70,
					timeLimitMs: 60000,
					topic: { connect: { id: topic.id } },
				},
			});

			for (const question of quizDetails.questions) {
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

		console.log("Quiz seeded successfully");
	} catch (error) {
		console.error("Failed to seed quiz:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

createQuiz();
