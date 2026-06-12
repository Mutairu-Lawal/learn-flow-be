import type { Request, Response } from "express";
import { userService } from "@/api/user/userService";

class UserController {
	/**
	 * Retrieve a user by their ID.
	 * Responds with the user data if found, or an error message if not.
	 */
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

	/**
	 * Get the currently authenticated user's details using the user ID from JWT.
	 * Assumes authentication middleware populates req.user.
	 */
	getCurrentUser = async (req: Request, res: Response) => {
		const userFromToken = req.user as { userId: number; role: string };

		const serviceResponse = await userService.findById(userFromToken.userId);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	deleteUser = async (req: Request, res: Response) => {
		const id = req.params.id as unknown as number; // already validated by Zod
		const serviceResponse = await userService.deleteById(id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const userController = new UserController();
