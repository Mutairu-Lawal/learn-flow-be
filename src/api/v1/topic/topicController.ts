import type { Request, Response } from "express";
import type { CreateTopicInput, UpdateTopicInput } from "./topicSchema";
import { topicService } from "./topicService";

class TopicController {
	getTopics = async (_req: Request, res: Response) => {
		const serviceResponse = await topicService.getAllTopics();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	createTopic = async (req: Request<unknown, unknown, CreateTopicInput>, res: Response) => {
		const serviceResponse = await topicService.createTopic(req.body);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	updateTopic = async (req: Request<{ id: string }, unknown, UpdateTopicInput>, res: Response) => {
		const serviceResponse = await topicService.updateTopic(req.params.id, req.body);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	deleteTopic = async (req: Request<{ id: string }>, res: Response) => {
		const serviceResponse = await topicService.deleteTopic(req.params.id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const topicController = new TopicController();
