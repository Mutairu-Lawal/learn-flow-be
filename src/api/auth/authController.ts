import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { authService } from "./authService";

class AuthController {
	signUp = async (req: Request, res: Response) => {
		const { username, email, password } = req.body;

		const serviceResponse = await authService.createUser({ username, email, password });

		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	login = async (req: Request, res: Response) => {
		const { username, email } = req.body;
		const serviceResponse = ServiceResponse.success("message", { username, email }, StatusCodes.OK);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
