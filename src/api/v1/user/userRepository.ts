import { prisma } from "@/lib/prisma";

class UserRepository {
	async findByID(id: number) {
		return prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				emailVerifiedAt: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
		});
	}
	async softDelete(id: number) {
		return prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

export const userRepository = new UserRepository();
