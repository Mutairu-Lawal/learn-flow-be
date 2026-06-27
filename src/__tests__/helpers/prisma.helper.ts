import { prisma } from "@/lib/prisma";

export async function cleanDatabase() {
	await prisma.question.deleteMany();
	await prisma.quiz.deleteMany();
	await prisma.topic.deleteMany();
	await prisma.user.deleteMany();
}
