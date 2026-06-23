import type { Request, Response } from "express";
import type { CreateTopicInput } from "./topicSchema";
import { topicService } from "./topicService";

class TopicController {
	getAllTopics = async (_req: Request, res: Response) => {
		const serviceResponse = await topicService.retrieveTopics();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	createTopic = async (req: Request, res: Response) => {
		const serviceResponse = await topicService.createTopic(req.body as CreateTopicInput);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	updateTopic = async (req: Request, res: Response) => {
		const serviceResponse = await topicService.updateTopic(req.params.id.toString(), req.body);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	deleteTopic = async (req: Request, res: Response) => {
		const serviceResponse = await topicService.deleteTopic(req.params.id.toString());
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const topicController = new TopicController();
