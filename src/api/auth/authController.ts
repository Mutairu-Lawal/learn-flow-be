import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";

class AuthController {
	signUp = async (req: Request, res: Response) => {
		// In a real implementation, you would handle user creation logic here
		const { username, email } = req.body;
		const serviceResponse = ServiceResponse.success("message", { username, email }, StatusCodes.OK);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	login = async (req: Request, res: Response) => {
		// In a real implementation, you would handle authentication logic here
		const { username, email } = req.body;
		const serviceResponse = ServiceResponse.success("message", { username, email }, StatusCodes.OK);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
