import { Role } from "@prisma/client";
import { hashPassword } from "@/common/utils/bcrypt";
import { generateToken } from "@/common/utils/jwt";
import { prisma } from "@/lib/prisma";
import { generateRandomUser } from "./user.helper";

export async function getToken(role: Role = Role.USER) {
	const { username, email, password } = generateRandomUser();

	const user = await prisma.user.create({
		data: {
			username,
			email,
			passwordHash: await hashPassword(password),
			role,
		},
	});

	const token = generateToken({
		userId: user.id,
		role: user.role,
	});

	return token;
}

export async function createUser(role: Role = Role.USER) {
	const { username, email, password } = generateRandomUser();

	const user = await prisma.user.create({
		data: {
			username,
			email,
			passwordHash: await hashPassword(password),
			role,
		},
	});

	return { ...user, password };
}
