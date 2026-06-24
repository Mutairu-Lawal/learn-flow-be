import type { Request, Response } from "express";
import type { ForgotPasswordData, LoginData, UserData } from "./authSchema";
import { authService } from "./authService";

class AuthController {
	signUp = async (req: Request<unknown, unknown, UserData>, res: Response) => {
		const serviceResponse = await authService.createUser(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	login = async (req: Request<unknown, unknown, LoginData>, res: Response) => {
		const serviceResponse = await authService.authenticateUser(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	forgotPassword = async (req: Request<unknown, unknown, ForgotPasswordData>, res: Response) => {
		const serviceResponse = await authService.requestPasswordReset(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
