import type { Request, Response } from "express";
import type { ForgotPasswordData, LoginData, UserData } from "./authSchema";
import { authService } from "./authService";

class AuthController {
	signUp = async (req: Request, res: Response) => {
		const serviceResponse = await authService.createUser(req.body as UserData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	login = async (req: Request, res: Response) => {
		const serviceResponse = await authService.authenticateUser(req.body as LoginData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	forgotPassword = async (req: Request, res: Response) => {
		const serviceResponse = await authService.requestPasswordReset(req.body as ForgotPasswordData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
