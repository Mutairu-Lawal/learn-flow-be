import type { Request, Response } from "express";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import type { UserPayload } from "./userSchema";
import { userService } from "./userService";

class UserController {
	getCurrentUser = async (req: Request, res: Response) => {
		const serviceResponse = (await userService.getUser(req.user as UserPayload)) as ServiceResponse;
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	getUserDashboardData = async (req: Request, res: Response) => {
		const serviceResponse = (await userService.getUserDashboard(req.user as UserPayload)) as ServiceResponse;
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	deleteUser = async (req: Request<{ id: string }>, res: Response) => {
		const serviceResponse = (await userService.deleteById(req.params.id)) as ServiceResponse;
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const userController = new UserController();
