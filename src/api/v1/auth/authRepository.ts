import { prisma } from "@/lib/prisma";

type CreateUserData = {
	username: string;
	email: string;
	hashedPassword: string;
};

class AuthRepository {
	async create(data: CreateUserData) {
		return prisma.user.create({
			data: {
				username: data.username,
				email: data.email,
				passwordHash: data.hashedPassword,
			},
			select: {
				id: true,
				username: true,
				email: true,
				createdAt: true,
			},
		});
	}
	async findByEmail(email: string) {
		return prisma.user.findUnique({
			where: {
				email,
			},
		});
	}
	async findByUsername(username: string) {
		return prisma.user.findUnique({
			where: {
				username,
			},
		});
	}
	async findByEmailOrUsername(email: string, username: string) {
		return prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});
	}
}

export const authRepository = new AuthRepository();
