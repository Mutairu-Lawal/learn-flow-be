import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../utils/envConfig";

export interface JwtPayload {
	userId: number;
	role: "USER" | "ADMIN";
}

export const generateToken = (payload: JwtPayload): string => {
	return jwt.sign(
		payload,
		env.JWT_SECRET as Secret,
		{
			expiresIn: payload.role === "ADMIN" ? env.ADMIN_JWT_EXPIRES_IN : env.JWT_EXPIRES_IN,
		} as SignOptions,
	);
};

export const verifyToken = (token: string): JwtPayload | null => {
	try {
		return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
	} catch {
		return null;
	}
};
