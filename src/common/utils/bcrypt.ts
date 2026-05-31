import bcrypt from "bcrypt";
import { env } from "../utils/envConfig";

const SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = (password: string, hashedPassword: string): Promise<boolean> =>
	bcrypt.compare(password, hashedPassword);
