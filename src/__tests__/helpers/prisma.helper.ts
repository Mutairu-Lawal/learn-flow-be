import { prisma } from "@/lib/prisma";

export async function cleanDatabase() {
	await prisma.topic.deleteMany();
	await prisma.quiz.deleteMany();
	await prisma.question.deleteMany();
	await prisma.user.deleteMany();
}
