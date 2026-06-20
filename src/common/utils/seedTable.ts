import { prisma } from "@/lib/prisma";

async function main() {
	await prisma.$connect();
	try {
		await prisma.questionOption.createMany({
			data: [
				{ text: "Total winnings", questionId: 1 },
				{ text: "Deposits made before the first bet", questionId: 1, isCorrect: true },
				{ text: "Number of bets placed", questionId: 1 },
				{ text: "Referral bonuses", questionId: 1 },
			],
			skipDuplicates: true,
		});
		console.log("Question options seeded successfully");
	} catch (error) {
		console.error("Failed to seed question options:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
