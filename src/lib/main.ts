import { Role } from "@prisma/client";
import { hashPassword } from "@/common/utils/bcrypt";
import { logger } from "@/server";
import { prisma } from "./prisma";

async function main() {
	await prisma.$connect();

	try {
		const hashPwd = await hashPassword("xxxxxxxxxx");

		const adminUser = await prisma.user.create({
			data: {
				username: "admin",
				email: "admin@learnflow.com",
				passwordHash: hashPwd,
				role: Role.ADMIN,
			},
		});

		logger.info(`Admin user created with ID: ${adminUser.id}`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error({ err: error }, "Failed to create admin user");
		}
		throw error; // rethrow so process.exit(1) runs
	} finally {
		await prisma.$disconnect();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
