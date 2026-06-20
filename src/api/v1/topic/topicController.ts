import type { Request, Response } from "express";
import { topicService } from "./topicService";

class TopicController {
	getAllTopics = async (_req: Request, res: Response) => {
		const serviceResponse = await topicService.retrieveTopics();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const topicController = new TopicController();
