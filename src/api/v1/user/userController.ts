import type { Request, Response } from "express";
import { userService } from "@/api/v1/user/userService";
import type { UserPayload } from "./userSchema";

class UserController {
	getUserById = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);

		// Defensive: Return 400 for invalid ID param
		if (Number.isNaN(id)) {
			return res.status(400).send({
				success: false,
				message: "Invalid user ID",
				data: null,
				statusCode: 400,
			});
		}

		const serviceResponse = await userService.findById(id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	getCurrentUser = async (req: Request, res: Response) => {
		const { userId } = req.user as UserPayload;

		const serviceResponse = await userService.findById(userId);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	deleteUser = async (req: Request, res: Response) => {
		const serviceResponse = await userService.deleteById(req.params.id.toString());
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const userController = new UserController();
