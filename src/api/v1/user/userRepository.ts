import { prisma } from "@/lib/prisma";

class UserRepository {
	async findById(id: number) {
		return prisma.user.findFirst({
			where: {
				id,
				deletedAt: null,
			},
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
			where: {
				id,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	}
}

export const userRepository = new UserRepository();
