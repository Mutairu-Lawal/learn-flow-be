import { prisma } from "@/lib/prisma";

type CreateUserData = {
	username: string;
	email: string;
	hashedPassword: string;
};

export class AuthRepository {
	async create(data: CreateUserData) {
		return prisma.user.create({
			data: {
				username: data.username,
				email: data.email,
				password_hash: data.hashedPassword,
			},
			select: {
				id: true,
				username: true,
				email: true,
				createdAt: true,
			},
		});
	}
}

export const authRepository = new AuthRepository();
