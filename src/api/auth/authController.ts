import type { Request, Response } from "express";
import { authService } from "./authService";

class AuthController {
	signUp = async (req: Request, res: Response) => {
		const { username, email, password } = req.body;

		const serviceResponse = await authService.createUser({ username, email, password });

		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	login = async (req: Request, res: Response) => {
		const { identifier, password } = req.body;
		const serviceResponse = await authService.authenticateUser({ identifier, password });
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	forgotPassword = async (req: Request, res: Response) => {
		const { email } = req.body;
		const serviceResponse = await authService.requestPasswordReset(email);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
